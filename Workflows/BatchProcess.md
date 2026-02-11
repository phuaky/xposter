# BatchProcess Workflow

**Trigger:** "process input", "scan input", "batch process"

## Purpose

Process multiple items from an account's INPUT folder into scored X post drafts.

## Step 1: Detect Source

| User Says | Source | Location |
|---|---|---|
| "process input for {account}" | Named account | `{accounts_dir}/{account}/INPUT/*.md` |
| "process input" | Default account | `{accounts_dir}/{default_account}/INPUT/*.md` |
| "batch process" | All accounts | Check all account INPUT folders |

If no account specified and no default set, ask user which account.

## Step 2: Load Items

### From INPUT (`.md` files)

- Parse YAML frontmatter (topic, priority, target_date, tags)
- Extract raw content body
- Skip files with existing OUTPUT counterparts
- **Required:** Non-empty content body

## Step 3: Process Each Item

For each item, run through this pipeline:

### 3A: Analyze

1. **Identify main topic** — core subject, expertise domain
2. **Extract key insight** — what's surprising or valuable?
3. **Check originality** — search OUTPUT folders for similar content, flag duplicates

### 3B: Cross-Reference

Quick check against:
- `Reference/ContentRules.md` — avoid AI patterns, scoring criteria
- `Reference/XAlgorithm.md` — platform algorithm rules
- `AlgorithmUpdates/` — any recent insights (if folder exists)

### 3C: Transform

1. **Select template** from `Reference/TweetFormats.md`
2. **Apply structure** — hook, body, discussion prompt. Target: 40-75 words, 1-2 paragraphs.
3. **Plan visual** — suggest screenshot or image

## Step 4: Score + Revise (TDD Loop)

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

**If iteration 3 still fails:** Save with status "needs-review" and include failure notes.

## Step 5: Save Results

**Save location:** `{accounts_dir}/{account}/OUTPUT/drafts/`

**Format:**
```json
{
  "id": "{account}_{topic}_{date}_{seq}",
  "content": "[post text]",
  "type": "single",
  "metadata": {
    "source": "input",
    "source_file": "[original file path]",
    "quality_score": 85,
    "iterations": 1,
    "created_date": "YYYY-MM-DD",
    "status": "draft",
    "screenshot_suggestion": "[visual]",
    "hook_pattern": "[pattern]"
  }
}
```

## Step 6: Report

```
BATCH RESULTS
──────────────────────────────
│ Source    │ INPUT                 │
│ Account  │ {account}             │
│ Processed│ X items               │
│ Drafted  │ X posts saved         │
│ Skipped  │ X (duplicates/empty)  │
│ Failed   │ X (needs review)      │
──────────────────────────────

DRAFTS SAVED:
1. "[topic]" - Score: 84/100 (1 iteration)
2. "[topic]" - Score: 76/100 (2 iterations)

Review drafts at: {accounts_dir}/{account}/OUTPUT/drafts/
Say "generate image" to create visuals for any draft
```
