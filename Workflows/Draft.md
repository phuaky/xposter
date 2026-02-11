# Draft Workflow

**Trigger:** `/post`, `/capture`, `draft:`, `tweet about`, `post about`, "turn this into a post"

## Purpose

Create ONE post interactively from any source: your current conversation, a typed idea, or a specific file.

## Step 1: Detect Input Source

| User Says | Source | Action |
|---|---|---|
| `/post`, `/capture`, "turn this into a post" | Current conversation | Mine conversation for postable moment (Step 2A) |
| `draft: [idea]`, `tweet about [topic]` | Inline text | Use the idea directly (Step 2B) |
| `draft from [file path]` | Specific file | Read and extract content (Step 2B) |

## Step 2A: Mine Conversation (if source = conversation)

Scan the current conversation for postable patterns:

| Pattern | Signal Words | Example |
|---------|--------------|---------|
| **Struggles** | "hit limit", "took forever", "stuck on" | "hit my limit twice today" |
| **Discoveries** | "just found", "realized", "figured out" | "just discovered /compact" |
| **Specific Numbers** | times, counts, days, %, $ | "Day 3", "4 projects", "10 mins" |
| **Tool Comparisons** | "vs", "switched from", "tried both" | "Claude vs Codex" |
| **Genuine Reactions** | "insane", "wild", "can't believe" | "claude code is insane" |
| **Irony/Humor** | contradictions, self-deprecation | "rationing AI while building AI" |

Extract: what happened, specific details, your reaction, relatable angle.

## Step 2B: Parse Idea (if source = inline text or file)

- Strip trigger prefix ("draft:", "tweet about", etc.)
- Identify: main topic, key insight, potential hook

## Step 3: Cross-Reference

Quick check against:
- `Reference/ContentRules.md` — avoid AI patterns, scoring criteria
- `Reference/XAlgorithm.md` — platform algorithm rules
- `AlgorithmUpdates/` — any recent insights (if folder exists)

## Step 4: Transform

1. **Select hook pattern:**

| Pattern | When to Use | Template |
|---------|-------------|----------|
| **Day Count** | Ongoing experience | "Day X of [situation]. [observation]" |
| **The Result** | Something worked/failed | "how my [X] built with claude code runs" |
| **Raw Take** | Genuine excitement | "claude code is [emotion] man..." |
| **Question** | Seeking validation | "Anyone else out there [doing X]?" |
| **Limit Hit** | Resource constraints | "Hit [limit]. Here's what I learned." |
| **Comparison** | Tool switching | "Instead of [X], try [Y]" |

2. **Apply template** from `Reference/TweetFormats.md`. Target: 40-75 words, 1-2 paragraphs.
3. **End with discussion prompt** — open question, incomplete thought, or specific ask.
4. **Plan visual** — suggest a screenshot or image.

## Step 5: Score + Revise (TDD Loop)

```bash
bun run Tools/ScoreTweet.ts "[draft]"
```

**Must pass:** Quality >= 70, Human authenticity >= 3, Engagement >= 3.0

**If FAIL -> auto-revise with targeted feedback (max 3 attempts):**

| Failed Criterion | Feedback to Apply |
|---|---|
| Quality < 70 | Strengthen hook, add specific detail, sharpen contrast |
| Human auth < 3 | Start mid-thought, show uncertainty, add contractions |
| Engagement < 3.0 | Make ending more provocative, ask about their specific experience |
| Word count < 40 | Expand middle section with concrete detail |
| Word count > 280 | Cut to essential moment only |
| AI phrases found | Replace with human alternative (uncertainty, contractions, specifics) |

**If iteration 3 still fails:** Show draft with notes, let user decide.

## Step 6: Present

```
DRAFT:
[optimized tweet text]

SCORE: 85/100
- Word count: 52
- Discussion starter: yes
- Human authenticity: 5/10

SCREENSHOT: [specific visual suggestion]
HOOK: [pattern name] -- [why it fits]

IMPROVEMENTS (if any):
- [suggestion]

Say "generate image" to create a visual
Say "save" to save to drafts
Say "post it" to schedule/publish
```

## Step 7: Act on Response

| User Says | Action |
|---|---|
| "save" | Save to `OUTPUT/drafts/` as JSON |
| "post it" | Route to Schedule workflow |
| "generate image" | Route to GenerateVisual workflow |
| Edits the draft | Re-score the edited version |

## Save Format

```json
{
  "id": "{account}_{topic}_{date}_{seq}",
  "content": "[post text]",
  "type": "single",
  "metadata": {
    "source": "draft",
    "quality_score": 85,
    "iterations": 1,
    "created_date": "YYYY-MM-DD",
    "status": "draft",
    "screenshot_suggestion": "[visual]",
    "hook_pattern": "[pattern]"
  }
}
```

## Examples

### Example 1: From Conversation (`/post`)

**Context:** You just spent 2 hours debugging, Claude fixed it in 10 seconds.

```
DRAFT:
claude code is something else man

2 hours debugging. gave up. described the bug to claude in one sentence.

fixed in 10 seconds.

the gap between "trying to code" and "describing what you want" is wild

SCORE: 82/100
SCREENSHOT: Before/after of the fix
HOOK: Raw Take -- genuine reaction moment
```

### Example 2: From Typed Idea (`draft:`)

**Input:** `draft: spent 3 hours debugging with Claude, switched to GPT and it found the issue in 2 min`

```
DRAFT:
spent 3 hours with Claude trying to fix a weird auth bug. nothing worked.

switched to GPT on a whim - found the issue in 2 minutes. different models see different patterns.

still figuring out when to switch vs when to push through. anyone else have a rule for this?

SCORE: 87/100
SCREENSHOT: Side-by-side terminals
HOOK: Comparison -- tool switching moment
```
