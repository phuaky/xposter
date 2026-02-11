# Setup Workflow

**Trigger:** "setup xposter", "configure xposter", first-time setup

## Purpose

Interactive first-run setup. Creates config, account folders, and verifies dependencies.

## Step 1: Check Prerequisites

Verify:
- [ ] `bun` is installed (`bun --version`)
- [ ] X MCP server is available (check for `mcp__x-server__create_tweet`)

Report status:
```
XPoster Setup
─────────────────
✅ Bun: v1.x.x
✅ X MCP Server: connected
⚠️ Image generation: not configured (optional)
```

If Bun is missing, direct user to https://bun.sh

## Step 2: Create Config

Check if `config.yaml` exists in the skill directory. If not:

1. Copy `config.yaml.example` to `config.yaml`
2. Ask user for accounts directory (default: `~/x-poster-accounts`)
3. Update `accounts_dir` in config

## Step 3: Create First Account

Ask user:
1. Account name (folder name, e.g., "myhandle")
2. X handle (e.g., "@myhandle")
3. Expertise domain (e.g., "AI tools", "web development")

Then create:
```bash
mkdir -p {accounts_dir}/{name}/{INPUT,OUTPUT/{drafts,ready,scheduled,posted},KNOWLEDGE}
```

Generate `ACCOUNT.md` from the template in `Reference/AccountStructure.md`, filled with user's answers.

## Step 4: Verify ScoreTweet

Run a quick test:
```bash
bun run Tools/ScoreTweet.ts "been thinking about how AI tools are changing my workflow lately. spent 3 hours yesterday building something that would've taken me a week. still figuring out the best approach though - anyone else experimenting with this?"
```

Should return score >= 70 with all gates passing.

## Step 5: Report

```
✅ XPOSTER SETUP COMPLETE
──────────────────────────
📁 Accounts: {accounts_dir}
👤 Account: {name} (@{handle})
🔧 Scoring: verified ✅
📝 MCP: {status}

Next steps:
1. Add raw ideas to {accounts_dir}/{name}/INPUT/
2. Run "/post" or "draft: your idea" to create posts
3. Run "process input" to batch-process ideas
4. Run "update algorithm" to fetch latest X tips
```

## Optional: Image Generation

If user wants image generation:
1. Ask which tool they use (Art skill, DALL-E CLI, etc.)
2. Set `image_generation_command` in config.yaml
3. Set `image_output_dir` if not ~/Downloads
