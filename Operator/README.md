# Operator

A Claude Code skill that sits in the founder's prompt seat and keeps the send loop going without him. Built from a four-month audit of the founder's own prompts, memory notes, doctrine, and deal logs.

- `SKILL.md` describes the cycle and the routing.
- `Workflows/` are the prompts: MorningFire, ReplyWatch, Verdict, WeeklyDirection, and PromptGate (how every human prompt is classified and, when needed, refused).
- `Reference/Gates.md` restates the founder's standing orders as binary checks.
- `Reference/PromptLibrary.md` holds the prompt shapes that worked, extracted from history.
- `Reference/Mandate.md` is the one bounded autonomy contract, off by default.
- `Tools/operator.ts` reads account dossiers and drafts, builds the queue, runs a workflow through `claude -p`, keeps the ledger, and posts to Telegram.
- `Tools/telegram.ts` posts plain text to the founder's Telegram (token and chat id from env or `~/.claude/.env`).
- `Tools/install-launchd.sh` schedules the cycle on macOS.

This directory is template-only. Private specifics (deal names, prices, paths, the signed mandate) live in `config.json` and in the founder's private repos, never here.

Run once by hand before scheduling:

```bash
cp Operator/config.example.json Operator/config.json   # edit paths
bun run Operator/Tools/operator.ts queue
bun run Operator/Tools/operator.ts run MorningFire
bash Operator/Tools/install-launchd.sh
```
