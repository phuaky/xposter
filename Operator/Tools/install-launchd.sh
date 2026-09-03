#!/usr/bin/env bash
# Schedules the Operator cycle on macOS with launchd. Run once by hand first:
#   bun run Operator/Tools/operator.ts run MorningFire
# Then: bash Operator/Tools/install-launchd.sh        (install)
#       bash Operator/Tools/install-launchd.sh remove (uninstall)
set -euo pipefail

SKILL_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUN="$(command -v bun)"
AGENTS="$HOME/Library/LaunchAgents"
LOGDIR="$SKILL_ROOT/runs"
mkdir -p "$AGENTS" "$LOGDIR"

job() { # label hour minute [weekday] cmd...
  local label="$1" hour="$2" minute="$3" weekday="$4"; shift 4
  local plist="$AGENTS/$label.plist"
  local args=""
  for a in "$@"; do args+="    <string>$a</string>\n"; done
  local cal="<key>Hour</key><integer>$hour</integer><key>Minute</key><integer>$minute</integer>"
  [ "$weekday" != "-" ] && cal+="<key>Weekday</key><integer>$weekday</integer>"
  printf '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0"><dict>\n  <key>Label</key><string>%s</string>\n  <key>ProgramArguments</key><array>\n%b  </array>\n  <key>WorkingDirectory</key><string>%s</string>\n  <key>StartCalendarInterval</key><dict>%s</dict>\n  <key>StandardOutPath</key><string>%s/%s.log</string>\n  <key>StandardErrorPath</key><string>%s/%s.log</string>\n  <key>EnvironmentVariables</key><dict><key>PATH</key><string>%s/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string></dict>\n</dict></plist>\n' \
    "$label" "$args" "$SKILL_ROOT" "$cal" "$LOGDIR" "$label" "$LOGDIR" "$label" "$HOME" > "$plist"
  launchctl bootout "gui/$(id -u)" "$plist" 2>/dev/null || true
  launchctl bootstrap "gui/$(id -u)" "$plist"
  echo "installed $label"
}

if [ "${1:-}" = "remove" ]; then
  for l in com.operator.morning com.operator.replies-1300 com.operator.replies-1800 com.operator.verdict com.operator.weekly; do
    launchctl bootout "gui/$(id -u)" "$AGENTS/$l.plist" 2>/dev/null || true
    rm -f "$AGENTS/$l.plist"; echo "removed $l"
  done
  exit 0
fi

OP="$SKILL_ROOT/Tools/operator.ts"
job com.operator.morning      7 30 - "$BUN" "$OP" run MorningFire
job com.operator.replies-1300 13 0 - "$BUN" "$OP" run ReplyWatch
job com.operator.replies-1800 18 0 - "$BUN" "$OP" run ReplyWatch
job com.operator.verdict      21 0 - "$BUN" "$OP" verdict
job com.operator.weekly       9  0 0 "$BUN" "$OP" run WeeklyDirection
echo "Operator cycle installed. Logs: $LOGDIR"
