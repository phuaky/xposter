# XPoster

A Claude Code skill that transforms raw ideas into engagement-optimized X posts.

**No threads. No AI slop. Just medium-form posts that sound like a real person.**

## What It Does

- **4-gate quality scoring** — Every post passes through Quality Score, Human Authenticity, Engagement Potential, and Platform Compliance checks before it's ready
- **Anti-AI detection** — 19 pattern checks catch "let's dive in" and other AI tells. Your posts sound like you, not ChatGPT
- **X algorithm optimization** — Built on the open-sourced X/Phoenix algorithm (Jan 2026). Optimizes for replies (75x multiplier), dwell time, and discussion
- **Idea-to-post pipeline** — Drop raw ideas in a folder, batch process them into scored drafts, schedule and publish
- **Multi-account support** — Different voices, tones, and audiences per account

## Install

```bash
# Clone into your Claude Code skills directory
git clone https://github.com/phuaky/xposter.git ~/.claude/skills/XPoster

# Run setup
# In Claude Code, type: "setup xposter"
```

### Requirements

- [Claude Code](https://claude.ai/claude-code)
- [Bun](https://bun.sh) (for the scoring tool)
- X MCP server (for publishing — optional, you can draft without it)

## Quick Start

```
# Draft from an idea
> draft: spent 3 hours debugging with Claude, switched to GPT and fixed it in 2 min

# Draft from your current conversation
> /post

# Batch process all ideas in your INPUT folder
> process input for myaccount

# Score an existing draft
> bun run Tools/ScoreTweet.ts "your tweet text"

# Update algorithm knowledge
> update algorithm tips
```

## How Scoring Works

Every post is scored on 4 gates:

| Gate | Threshold | What It Checks |
|------|-----------|----------------|
| **Quality Score** | >= 70/100 | Word count, discussion starter, personal experience, natural voice, formatting |
| **Human Authenticity** | >= 3/10 | Mid-thought starts, uncertainty, contractions, emotion, specific details |
| **Engagement Potential** | >= 3.0/5.0 | Predicted quotes, bookmarks, replies, reposts, dwell time |
| **Platform Compliance** | All pass | 40-280 words, no threads, no links, no ALL CAPS |

Posts that fail get actionable feedback and auto-revision (up to 3 attempts).

## Folder Structure

```
~/x-poster-accounts/          # Your account data (configurable)
└── myaccount/
    ├── ACCOUNT.md             # Voice, handle, audience
    ├── INPUT/                 # Raw ideas (.md files)
    ├── OUTPUT/
    │   ├── drafts/            # Needs work
    │   ├── ready/             # Passed all gates
    │   ├── scheduled/         # Queued with time
    │   └── posted/            # Archive
    └── KNOWLEDGE/             # Account-specific context
```

## Workflows

| Command | What It Does |
|---------|-------------|
| `setup xposter` | First-time setup — config, accounts, verification |
| `/post` or `draft: [idea]` | Create a single post interactively |
| `process input` | Batch process all ideas in INPUT folder |
| `validate` | Score and check a post |
| `organize` | Route posts to ready/drafts folders |
| `schedule` | Queue posts for optimal times |
| `generate image` | Create a visual for a post (optional) |
| `update algorithm` | Fetch latest X algorithm tips |

## Configuration

Copy `config.yaml.example` to `config.yaml`:

```yaml
accounts_dir: ~/x-poster-accounts
default_account: myaccount
image_generation_command: ""  # optional
scoring:
  min_quality_score: 70
  min_human_authenticity: 3
  min_engagement_average: 3.0
  min_word_count: 40
  max_word_count: 280
```

## Algorithm Knowledge

XPoster ships with current X algorithm knowledge (Phoenix/Grok era, Jan 2026):

- Reply to your own comments = **75x** multiplier (highest ROI)
- Getting replies = **13.5-27x** (design every post for this)
- Reports = **-369x** (1 report destroys ~738 likes of goodwill)
- Medium-form single posts outperform threads
- Timing optimization is obsolete — quality matters more

Run `update algorithm` periodically to fetch the latest insights.

## Operator (new)

`Operator/` is a second skill in this repo: an autonomous prompt-writer that sits in the founder's seat and keeps the send loop going (morning fire pack, reply watch, evening verdict, weekly direction), gating every human prompt through the founder's own standing orders. It is template-only; private specifics live in `Operator/config.json` (gitignored). See `Operator/README.md`.

## License

MIT
