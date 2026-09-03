#!/usr/bin/env bun
/**
 * Operator runner
 *
 * Reads pipeline state from account dossiers (accounts/<company>/LOG.md, append-only,
 * newest entry = current state), unsent drafts on disk, and the Operator ledger.
 * Builds the day's queue, runs a workflow through `claude -p`, and posts the result
 * to Telegram. No dashboards, no derived state files: the ledger is one text file.
 *
 * Usage:
 *   bun run Operator/Tools/operator.ts queue              print queue.json
 *   bun run Operator/Tools/operator.ts asks               print the ASKS counter
 *   bun run Operator/Tools/operator.ts run <Workflow>     MorningFire | ReplyWatch | WeeklyDirection
 *   bun run Operator/Tools/operator.ts verdict            deterministic daily verdict line (no model)
 *   bun run Operator/Tools/operator.ts fired <account> <channel> [note]   record a human-fired send
 *
 * Config: Operator/config.json (copy Operator/config.example.json). Paths may use ~.
 */

import { existsSync, readFileSync, readdirSync, statSync, mkdirSync, appendFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve, dirname, basename } from "node:path";

// ----------------------------------------------------------------------------
// Config
// ----------------------------------------------------------------------------

interface Mandate {
  signed_by: string; signed_on: string; class: string; offer_version: string;
  daily_cap: number; recall_minutes: number; sender: string; review_on: string;
}

interface Config {
  accounts_dir: string;
  offer_file: string;
  offer_version: string;
  drafts_globs: string[];
  ledger_file: string;
  runs_dir: string;
  telegram_cmd: string[] | null;
  claude_bin: string;
  claude_flags: string[];
  models: Record<string, string>;
  send_stale_hours: number;
  live_stages: string[];
  asks_target: number;
  mandate: Mandate | null;
}

const HERE = dirname(new URL(import.meta.url).pathname);
const SKILL_ROOT = resolve(HERE, "..");

function expand(p: string): string {
  return p.startsWith("~") ? join(homedir(), p.slice(1)) : p;
}

function loadConfig(): Config {
  const path = join(SKILL_ROOT, "config.json");
  if (!existsSync(path)) {
    console.error(`operator: missing ${path}. Copy config.example.json to config.json and set the paths.`);
    process.exit(2);
  }
  const raw = JSON.parse(readFileSync(path, "utf8")) as Config;
  raw.accounts_dir = expand(raw.accounts_dir);
  raw.offer_file = expand(raw.offer_file);
  raw.ledger_file = expand(raw.ledger_file);
  raw.runs_dir = expand(raw.runs_dir);
  raw.drafts_globs = (raw.drafts_globs ?? []).map(expand);
  raw.live_stages = raw.live_stages ?? ["replied", "scoping", "proposed"];
  raw.send_stale_hours = raw.send_stale_hours ?? 24;
  raw.asks_target = raw.asks_target ?? 30;
  raw.claude_bin = raw.claude_bin ?? "claude";
  raw.claude_flags = raw.claude_flags ?? ["--print", "--output-format", "text"];
  raw.models = raw.models ?? {};
  return raw;
}

// ----------------------------------------------------------------------------
// LOG.md parsing (grammar: "## <ISO ts> — <event>" then "key: value" lines)
// ----------------------------------------------------------------------------

interface LogEntry {
  ts: string; event: string; fields: Record<string, string>; account: string;
}

const HEADING = /^##\s+(\S+)\s+(?:—|-|–)\s+(.+?)\s*$/;

export function parseLog(text: string, account: string): LogEntry[] {
  const entries: LogEntry[] = [];
  let cur: LogEntry | null = null;
  for (const line of text.split("\n")) {
    const h = line.match(HEADING);
    if (h && /^\d{4}-\d{2}-\d{2}/.test(h[1])) {
      cur = { ts: h[1], event: h[2].trim(), fields: {}, account };
      entries.push(cur);
      continue;
    }
    if (!cur) continue;
    const f = line.match(/^([a-z_]+):\s*(.*)$/);
    if (f) cur.fields[f[1]] = f[2].trim();
  }
  return entries;
}

function hoursSince(iso: string, now = Date.now()): number {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return Number.POSITIVE_INFINITY;
  return Math.round(((now - t) / 36e5) * 10) / 10;
}

// ----------------------------------------------------------------------------
// Queue
// ----------------------------------------------------------------------------

interface QueueItem {
  account: string; stage: string; next_move: string; event: string; ts: string;
  age_hours: number; waiting_on: "us" | "them" | "unclear"; overdue_hold: boolean;
  summary: string; rank: number; evidence?: string;
}

interface Draft { path: string; account: string | null; age_hours: number; referenced_by_sent_entry: boolean; }

interface WarmLead { account: string; kind: "referral-ask-due" | "interview-pivot"; last_event: string; ts: string; age_hours: number; summary: string; }

interface Queue {
  generated_at: string;
  asks: { fired: number; target: number; by_version: Record<string, number> };
  live: QueueItem[];
  warm: WarmLead[];
  unsent_drafts: Draft[];
  last_verdict: string | null;
  mandate_on: boolean;
}

const SEND_VERBS = /^(send|reply|draft|propose|nudge|ping|answer|approve|chase|follow|deliver|confirm|book|schedule|run|inspect)/i;
const WAIT_VERBS = /^(await|hold|wait|watch)/i;

function loadAllLogs(cfg: Config): LogEntry[] {
  if (!existsSync(cfg.accounts_dir)) return [];
  const out: LogEntry[] = [];
  for (const name of readdirSync(cfg.accounts_dir)) {
    const p = join(cfg.accounts_dir, name, "LOG.md");
    if (!existsSync(p)) continue;
    out.push(...parseLog(readFileSync(p, "utf8"), name));
  }
  return out;
}

function countAsks(entries: LogEntry[], cfg: Config) {
  const byVersion: Record<string, Set<string>> = {};
  for (const e of entries) {
    const isOutbound = /^(send|outbound)/i.test(e.event) || e.event === "fired-by-operator";
    const v = e.fields["offer_version"];
    if (!isOutbound || !v) continue;
    (byVersion[v] ??= new Set()).add(e.account);
  }
  const by: Record<string, number> = {};
  for (const [k, s] of Object.entries(byVersion)) by[k] = s.size;
  return { fired: by[cfg.offer_version] ?? 0, target: cfg.asks_target, by_version: by };
}

function liveItems(entries: LogEntry[], cfg: Config, now: number): QueueItem[] {
  const newest = new Map<string, LogEntry>();
  for (const e of entries) {
    const prev = newest.get(e.account);
    if (!prev || Date.parse(e.ts) >= Date.parse(prev.ts)) newest.set(e.account, e);
  }
  const items: QueueItem[] = [];
  for (const e of newest.values()) {
    const stage = e.fields["stage_after"] ?? "";
    if (!cfg.live_stages.includes(stage)) continue;
    const move = e.fields["next_permitted_move"] ?? "";
    const age = hoursSince(e.ts, now);
    let waiting: QueueItem["waiting_on"] = "unclear";
    if (SEND_VERBS.test(move)) waiting = "us";
    else if (WAIT_VERBS.test(move)) waiting = "them";
    const dateInMove = move.match(/(\d{4}-\d{2}-\d{2})/);
    const overdue = !!dateInMove && Date.parse(dateInMove[1] + "T23:59:59+08:00") < now;
    let rank = 4;
    if (waiting === "us") rank = 1;
    else if (overdue || (waiting === "them" && age > 24 * 7)) rank = 2;
    else if (waiting === "them") rank = 5;
    items.push({
      account: e.account, stage, next_move: move, event: e.event, ts: e.ts, age_hours: age,
      waiting_on: waiting, overdue_hold: overdue, summary: e.fields["summary"] ?? "", rank,
      evidence: e.fields["evidence"],
    });
  }
  return items.sort((a, b) => a.rank - b.rank || b.age_hours - a.age_hours);
}

function findDrafts(cfg: Config, entries: LogEntry[], now: number): Draft[] {
  const sentEvidence = new Set<string>();
  for (const e of entries) {
    if (/^(send|outbound)/i.test(e.event) || e.event === "fired-by-operator") {
      for (const k of ["evidence", "source"]) if (e.fields[k]) sentEvidence.add(basename(e.fields[k]));
    }
  }
  const drafts: Draft[] = [];
  for (const pattern of cfg.drafts_globs) {
    const root = pattern.includes("*") ? pattern.slice(0, pattern.indexOf("*")).replace(/\/[^/]*$/, "") : dirname(pattern);
    if (!existsSync(root)) continue;
    const glob = new Bun.Glob(pattern.startsWith(root) ? pattern.slice(root.length + 1) : pattern);
    for (const rel of glob.scanSync({ cwd: root, onlyFiles: true })) {
      const p = join(root, rel);
      const st = statSync(p);
      const acct = rel.split("/")[0] || null;
      drafts.push({
        path: p, account: acct, age_hours: Math.round(((now - st.mtimeMs) / 36e5) * 10) / 10,
        referenced_by_sent_entry: sentEvidence.has(basename(p)),
      });
    }
  }
  return drafts.filter(d => !d.referenced_by_sent_entry).sort((a, b) => b.age_hours - a.age_hours);
}

function lastVerdict(cfg: Config): string | null {
  if (!existsSync(cfg.ledger_file)) return null;
  const lines = readFileSync(cfg.ledger_file, "utf8").trim().split("\n").filter(l => / verdict: /.test(l));
  return lines.length ? lines[lines.length - 1] : null;
}

// Past payers with no referral ask on record, and job-application threads that reached a human
// (interview, recruiter reply) with no vendor pivot proposed. These are the two send classes with
// the best reply evidence in the founder's own ledger.
function warmLeads(entries: LogEntry[], cfg: Config, now: number): WarmLead[] {
  const byAccount = new Map<string, LogEntry[]>();
  for (const e of entries) (byAccount.get(e.account) ?? byAccount.set(e.account, []).get(e.account)!).push(e);
  const out: WarmLead[] = [];
  for (const [account, list] of byAccount) {
    list.sort((a, b) => Date.parse(a.ts) - Date.parse(b.ts));
    const newest = list[list.length - 1];
    const stage = newest.fields["stage_after"] ?? "";
    const text = (e: LogEntry) => `${e.event} ${e.fields["summary"] ?? ""} ${e.fields["next_permitted_move"] ?? ""}`.toLowerCase();
    const paid = list.some(e => /^payment/i.test(e.event) || stage === "won");
    const referralAsked = list.some(e => /referral/.test(text(e)));
    if (paid && !referralAsked) out.push({ account, kind: "referral-ask-due", last_event: newest.event, ts: newest.ts, age_hours: hoursSince(newest.ts, now), summary: newest.fields["summary"] ?? "" });
    const reachedHuman = list.some(e => /(interview|recruiter|hiring manager|call)/.test(text(e)));
    const pivoted = list.some(e => /(pivot|scope|proposal|proposed)/.test(text(e))) || ["scoping", "proposed", "won", "delivering"].includes(stage);
    if (reachedHuman && !pivoted && !["dormant", "closed-lost"].includes(stage)) out.push({ account, kind: "interview-pivot", last_event: newest.event, ts: newest.ts, age_hours: hoursSince(newest.ts, now), summary: newest.fields["summary"] ?? "" });
  }
  return out.sort((a, b) => b.age_hours - a.age_hours);
}

export function buildQueue(cfg: Config, now = Date.now()): Queue {
  const entries = loadAllLogs(cfg);
  return {
    generated_at: new Date(now).toISOString(),
    asks: countAsks(entries, cfg),
    live: liveItems(entries, cfg, now),
    warm: warmLeads(entries, cfg, now),
    unsent_drafts: findDrafts(cfg, entries, now),
    last_verdict: lastVerdict(cfg),
    mandate_on: !!cfg.mandate?.signed_on,
  };
}

// ----------------------------------------------------------------------------
// Ledger + Telegram
// ----------------------------------------------------------------------------

function todayIso(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Singapore" });
}

function ledgerAppend(cfg: Config, line: string) {
  mkdirSync(dirname(cfg.ledger_file), { recursive: true });
  appendFileSync(cfg.ledger_file, line.trimEnd() + "\n");
}

async function telegram(cfg: Config, text: string) {
  if (!cfg.telegram_cmd || cfg.telegram_cmd.length === 0) return; // caller prints
  const proc = Bun.spawn(cfg.telegram_cmd, { stdin: "pipe", stdout: "inherit", stderr: "inherit" });
  proc.stdin.write(text);
  proc.stdin.end();
  await proc.exited;
}

// ----------------------------------------------------------------------------
// run <Workflow>
// ----------------------------------------------------------------------------

async function runWorkflow(cfg: Config, name: string) {
  const wfPath = join(SKILL_ROOT, "Workflows", `${name}.md`);
  if (!existsSync(wfPath)) { console.error(`operator: no workflow ${name}`); process.exit(2); }
  const queue = buildQueue(cfg);
  const offer = existsSync(cfg.offer_file) ? readFileSync(cfg.offer_file, "utf8").split("\n").slice(0, 220).join("\n") : "(offer file missing)";
  const gates = readFileSync(join(SKILL_ROOT, "Reference", "Gates.md"), "utf8");
  const library = readFileSync(join(SKILL_ROOT, "Reference", "PromptLibrary.md"), "utf8");
  mkdirSync(cfg.runs_dir, { recursive: true });
  const stamp = `${todayIso()}-${name}`;
  const firePagePath = join(cfg.runs_dir, `${stamp}-firepage.html`);

  const prompt = [
    `You are the Operator. Run the ${name} workflow below exactly. You are not in a chat; nobody answers questions. Make every decision yourself and state it as a fact.`,
    `Today (Singapore): ${todayIso()}. Offer version tag: ${cfg.offer_version}. Mandate: ${queue.mandate_on ? "ON (see class limits in Gates)" : "OFF (human fires everything)"}.`,
    `Write any fire page to this exact path: ${firePagePath}`,
    `End your output with a section that starts with the line TELEGRAM: followed by the plain-text message (no markdown, under 12 lines) and nothing after it.`,
    `\n# WORKFLOW\n${readFileSync(wfPath, "utf8")}`,
    `\n# GATES\n${gates}`,
    `\n# PROMPT LIBRARY (shapes to reuse)\n${library}`,
    `\n# OFFER FILE (first 220 lines; the only source of price and copy)\n${offer}`,
    `\n# QUEUE (queue.json)\n${JSON.stringify(queue, null, 1)}`,
  ].join("\n");

  const env = { ...process.env } as Record<string, string | undefined>;
  delete env.ANTHROPIC_API_KEY;      // keep subscription billing (founder rule)
  delete env.ANTHROPIC_AUTH_TOKEN;
  const model = cfg.models[name] ?? "opus";
  const args = [cfg.claude_bin, ...cfg.claude_flags, "--model", model];
  const proc = Bun.spawn(args, { stdin: "pipe", stdout: "pipe", stderr: "pipe", env });
  proc.stdin.write(prompt);
  proc.stdin.end();
  const [out, err] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()]);
  const code = await proc.exited;

  const runFile = join(cfg.runs_dir, `${stamp}.md`);
  writeFileSync(runFile, out + (err ? `\n\n[stderr]\n${err}` : ""));
  if (code !== 0) {
    ledgerAppend(cfg, `${todayIso()} ${name} FAILED exit ${code}: ${err.split("\n")[0] ?? ""}`);
    await telegram(cfg, `OPERATOR ${name} failed (exit ${code}). See ${runFile}`);
    process.exit(code);
  }
  const idx = out.lastIndexOf("TELEGRAM:");
  const msg = idx >= 0 ? out.slice(idx + "TELEGRAM:".length).trim() : out.split("\n").slice(0, 12).join("\n");
  ledgerAppend(cfg, `${todayIso()} ${name} ran. asks ${queue.asks.fired}/${queue.asks.target}. live ${queue.live.length}. warm ${queue.warm.length}. drafts ${queue.unsent_drafts.length}. run ${basename(runFile)}`);
  await telegram(cfg, msg);
  console.log(msg);
}

// ----------------------------------------------------------------------------
// verdict (deterministic)
// ----------------------------------------------------------------------------

async function verdict(cfg: Config) {
  const today = todayIso();
  const entries = loadAllLogs(cfg).filter(e => e.ts.startsWith(today));
  const fired = entries.filter(e => /^(send|outbound)/i.test(e.event) || e.event === "fired-by-operator");
  const asks = fired.filter(e => e.fields["offer_version"] === cfg.offer_version).length;
  const replies = entries.filter(e => /^inbound/i.test(e.event)).length;
  const meetings = entries.filter(e => /(meeting|call)/i.test(e.event)).length;
  const paid = entries.filter(e => /^payment/i.test(e.event)).map(e => e.fields["summary"] ?? "paid").join("; ") || "0";
  const q = buildQueue(cfg);
  const unfired = q.unsent_drafts.filter(d => d.age_hours >= cfg.send_stale_hours).map(d => `${d.account ?? basename(d.path)}(${Math.round(d.age_hours / 24)}d)`);
  let line = `${today} verdict: fired ${fired.length} (asks ${asks}) replies ${replies} meetings ${meetings} paid ${paid}. ASKS ${q.asks.fired}/${q.asks.target}. Unfired: ${unfired.length ? unfired.join(", ") : "none"}.`;
  if (fired.length === 0 && q.unsent_drafts.length > 0) line += `\nToday sent 0 with ${q.unsent_drafts.length} drafts on disk. That is the loop.`;
  ledgerAppend(cfg, line);
  await telegram(cfg, line);
  console.log(line);
}

// ----------------------------------------------------------------------------
// fired <account> <channel> [note]  (human confirmation of a send)
// ----------------------------------------------------------------------------

function fired(cfg: Config, account: string, channel: string, note: string) {
  const line = `${new Date().toISOString()} fired ${account} ${channel} offer_version=${cfg.offer_version} ${note}`.trim();
  ledgerAppend(cfg, line);
  console.log(line);
  console.log(`Now append the LOG.md entry in accounts/${account}/ (event outbound-${channel}, offer_version: ${cfg.offer_version}).`);
}

// ----------------------------------------------------------------------------
// main
// ----------------------------------------------------------------------------

if (import.meta.main) {
  const [cmd, ...rest] = process.argv.slice(2);
  const cfg = loadConfig();
  switch (cmd) {
    case "queue": console.log(JSON.stringify(buildQueue(cfg), null, 2)); break;
    case "asks": { const q = buildQueue(cfg); console.log(`ASKS ${q.asks.fired}/${q.asks.target}`, q.asks.by_version); break; }
    case "run": await runWorkflow(cfg, rest[0] ?? "MorningFire"); break;
    case "verdict": await verdict(cfg); break;
    case "fired": fired(cfg, rest[0] ?? "", rest[1] ?? "", rest.slice(2).join(" ")); break;
    default:
      console.log("usage: operator.ts queue | asks | run <Workflow> | verdict | fired <account> <channel> [note]");
      process.exit(cmd ? 2 : 0);
  }
}
