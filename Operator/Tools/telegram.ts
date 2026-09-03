#!/usr/bin/env bun
/**
 * Send stdin (or a file) as a plain-text Telegram message to the founder.
 * Credentials: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID from the environment,
 * else from ~/.claude/.env. Plain text on purpose: a failed markdown parse is
 * worse than an unstyled message.
 *
 * Usage:  echo "msg" | bun Operator/Tools/telegram.ts     |     bun Operator/Tools/telegram.ts file.txt
 */
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

function fromDotEnv(key: string): string | undefined {
  try {
    for (const line of readFileSync(join(homedir(), ".claude/.env"), "utf8").split("\n")) {
      const m = line.match(new RegExp(`^\\s*(?:export\\s+)?${key}\\s*=\\s*(.+?)\\s*$`));
      if (m) return m[1].replace(/^["']|["']$/g, "");
    }
  } catch {}
  return undefined;
}

const token = process.env.TELEGRAM_BOT_TOKEN ?? fromDotEnv("TELEGRAM_BOT_TOKEN");
const chat = process.env.TELEGRAM_CHAT_ID ?? fromDotEnv("TELEGRAM_CHAT_ID");
const base = process.env.TELEGRAM_API_BASE ?? "https://api.telegram.org";
if (!token || !chat) { console.error("telegram: missing TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID"); process.exit(2); }

const file = process.argv[2];
const text = (file ? readFileSync(file, "utf8") : await Bun.stdin.text()).trim();
if (!text) { console.error("telegram: empty message"); process.exit(2); }

const MAX = 4000;
const chunks: string[] = [];
let buf = "";
for (const para of text.split(/\n{2,}/)) {
  const next = buf ? `${buf}\n\n${para}` : para;
  if (next.length > MAX) { if (buf) chunks.push(buf); buf = para.slice(0, MAX); } else buf = next;
}
if (buf) chunks.push(buf);

for (const chunk of chunks) {
  const res = await fetch(`${base}/bot${token}/sendMessage`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chat, text: chunk, disable_web_page_preview: true }),
  });
  if (!res.ok) { console.error(`telegram: ${res.status} ${await res.text()}`); process.exit(1); }
}
console.log(`telegram: sent ${chunks.length} message(s)`);
