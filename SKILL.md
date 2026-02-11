---
name: XPoster
description: Transform raw ideas into polished X posts. USE WHEN tweet, X post, Twitter, draft post, publish, social media, process input, score tweet, check quality, generate image, update algorithm.
---

# XPoster

Autonomous agent for processing raw ideas into engagement-optimized X posts.

**CRITICAL: NO THREADS.** Only single medium-form posts (40-280 words).

## Quick Start

1. Clone this repo into `~/.claude/skills/XPoster/`
2. Copy `config.yaml.example` to `config.yaml` and edit
3. Run the Setup workflow: `"setup xposter"`
4. Start drafting: `"/post"` or `"draft: your idea here"`

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **Setup** | "setup xposter", "configure xposter" | `Workflows/Setup.md` |
| **Draft** | "/post", "/capture", "draft:", "tweet about", "post about", "turn this into a post" | `Workflows/Draft.md` |
| **BatchProcess** | "process input", "scan input", "batch process" | `Workflows/BatchProcess.md` |
| **Validate** | "validate", "score", "quality check" | `Workflows/Validate.md` |
| **Organize** | "organize", "move to ready/drafts" | `Workflows/Organize.md` |
| **Schedule** | "schedule", "queue for posting" | `Workflows/Schedule.md` |
| **GenerateVisual** | "generate image", "add visual" | `Workflows/GenerateVisual.md` |
| **UpdateAlgorithm** | "update algorithm", "fetch nikita" | `Workflows/UpdateAlgorithm.md` |

## Tools

```bash
# Score a post inline
bun run Tools/ScoreTweet.ts "Your tweet"

# Score from a JSON file
bun run Tools/ScoreTweet.ts --file path/to/tweet.json
```

## MCP Integration

Posting requires the X MCP server (`@anthropic/mcp-x-server` or equivalent):

```javascript
mcp__x-server__create_tweet({ text: "content" })
mcp__x-server__reply_to_tweet({ tweet_id: "id", text: "reply" })
```

## Reference Documentation

- Content & scoring rules: `Reference/ContentRules.md`
- X algorithm knowledge: `Reference/XAlgorithm.md`
- Post templates: `Reference/TweetFormats.md`
- Account setup: `Reference/AccountStructure.md`

## Examples

**Example 1: Draft from conversation**
```
User: "/post"
-> Invokes Draft workflow (conversation source)
-> Mines conversation for postable moments
-> Scores, iterates, returns ready draft
```

**Example 2: Draft from idea**
```
User: "draft: spent 3 hours debugging with Claude, switched to GPT and fixed it in 2 min"
-> Invokes Draft workflow (inline source)
-> Optimizes, scores, returns ready tweet
```

**Example 3: Batch processing**
```
User: "process input for myaccount"
-> Invokes BatchProcess workflow
-> Scans INPUT folder, analyzes each item
-> Scores all drafts, saves to OUTPUT/drafts/
```
