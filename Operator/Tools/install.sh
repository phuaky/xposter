#!/usr/bin/env bash
# One-paste installer for the founder's Mac.
#   bash <(curl -fsSL https://raw.githubusercontent.com/phuaky/xposter/claude/session-qup6cr/Operator/Tools/install.sh)
# or, from a local clone:  bash Operator/Tools/install.sh
#
# What it does, in order, stopping on the first failure:
#   1. clones or updates the xposter repo (branch claude/session-qup6cr) into ~/Code/xposter
#   2. links the skill into ~/.claude/skills/Operator
#   3. writes Operator/config.json for THIS machine (paths below) unless one exists
#   4. runs the deterministic queue against your real account logs and prints it
#   5. runs MorningFire once by hand (claude -p) so you see day 1 before anything is scheduled
#   6. asks before installing the launchd cycle
set -euo pipefail

REPO_URL="https://github.com/phuaky/xposter"
BRANCH="claude/session-qup6cr"
DEST="$HOME/Code/xposter"
BIZ="$HOME/Code/aug-workflowlab-sg"
FH="$HOME/Code/founder-home"

say() { printf '\n\033[1m%s\033[0m\n' "$*"; }
need() { command -v "$1" >/dev/null 2>&1 || { echo "missing: $1"; exit 2; }; }
need git; need bun; need claude

say "1/6 repo"
if [ -d "$DEST/.git" ]; then git -C "$DEST" fetch -q origin "$BRANCH" && git -C "$DEST" checkout -q "$BRANCH" && git -C "$DEST" pull -q --ff-only origin "$BRANCH"
else mkdir -p "$(dirname "$DEST")" && git clone -q --branch "$BRANCH" "$REPO_URL" "$DEST"; fi
echo "at $DEST ($(git -C "$DEST" rev-parse --short HEAD))"

say "2/6 skill link"
mkdir -p "$HOME/.claude/skills"
[ -e "$HOME/.claude/skills/Operator" ] || ln -s "$DEST/Operator" "$HOME/.claude/skills/Operator"
echo "~/.claude/skills/Operator -> $DEST/Operator"

say "3/6 config"
CFG="$DEST/Operator/config.json"
if [ ! -f "$CFG" ]; then
  [ -d "$BIZ/accounts" ] || { echo "expected $BIZ/accounts (WorkflowLab dossiers). Edit BIZ= in this script."; exit 2; }
  cat > "$CFG" <<JSON
{
  "accounts_dir": "$BIZ/accounts",
  "offer_file": "$BIZ/offers/OFFER.md",
  "offer_version": "workflowlab-diagnostic-v1",
  "drafts_globs": [
    "$BIZ/accounts/*/working/drafts/*.json",
    "$BIZ/accounts/*/working/drafts/*.md",
    "$FH/outreach/2026-08-23-diagnostic-drafts-*.md"
  ],
  "ledger_file": "$BIZ/founder/OPERATOR-LEDGER.md",
  "runs_dir": "$BIZ/founder/operator-runs",
  "telegram_cmd": ["bun", "$DEST/Operator/Tools/telegram.ts"],
  "claude_bin": "claude",
  "claude_flags": ["--print", "--output-format", "text", "--allowedTools", "Read,Write,Glob,Grep,Bash(bun *)"],
  "models": { "MorningFire": "opus", "ReplyWatch": "sonnet", "WeeklyDirection": "opus" },
  "send_stale_hours": 24,
  "live_stages": ["replied", "scoping", "proposed"],
  "asks_target": 30,
  "mandate": null
}
JSON
  echo "wrote $CFG"
else echo "kept existing $CFG"; fi

say "4/6 queue (deterministic, no model)"
cd "$DEST" && bun run Operator/Tools/operator.ts asks && bun run Operator/Tools/operator.ts queue | head -80

say "5/6 day 1 by hand"
echo "Running MorningFire once through claude -p (your subscription, no API key). This writes the fire page to $BIZ/founder/operator-runs/ and posts to Telegram if TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID are in env or ~/.claude/.env."
if ! bun run Operator/Tools/operator.ts run MorningFire; then
  echo
  echo "MorningFire failed. If the error mentions a security hook or 'blocked by hook', your PAI hooks refused the headless prompt."
  echo "Fix: add \"--setting-sources\", \"\" to claude_flags in $CFG and rerun:  bun run Operator/Tools/operator.ts run MorningFire"
  exit 1
fi

say "6/6 schedule"
read -r -p "Install the launchd cycle (07:30 fire, 13:00/18:00 replies, 21:00 verdict, Sun 09:00 direction)? [y/N] " yn
case "$yn" in y|Y) bash "$DEST/Operator/Tools/install-launchd.sh";; *) echo "skipped. Later: bash $DEST/Operator/Tools/install-launchd.sh";; esac

say "done"
echo "Fire page: open the newest file in $BIZ/founder/operator-runs/"
echo "After each send:  bun run Operator/Tools/operator.ts fired <account> <channel> \"note\"   then append the LOG.md entry with offer_version."
