# Validate Workflow

**Trigger:** "validate", "score", "quality check", follows BatchProcess

## Purpose

Apply quality gates. Only high-quality content proceeds.

## Steps

### 1. Run Quality Score

```bash
bun run Tools/ScoreTweet.ts "tweet text"
```

**Scoring criteria defined in `Reference/ContentRules.md`.** Read it for the full breakdown.

**Minimum: 70/100**

### 2. Check Human Authenticity

Need 3+ human elements. See `Reference/ContentRules.md` -> Human Authenticity Score for the full checklist.

### 3. Calculate Engagement Potential

Rate 1-5 each: quotes, bookmarks, replies, reposts, dwell time.

**Minimum average: 3.0/5.0**

### 4. Verify Platform Compliance

See `Reference/ContentRules.md` -> Platform Compliance for the full checklist.

### 5. Account Voice Check

- Matches defined voice/tone?
- Appropriate for audience?
- Consistent with positioning?

## Decision Gate

**PASS -> ready/:**
- Quality >= 70
- Human authenticity >= 3
- Engagement >= 3.0
- Platform compliant

**FAIL -> drafts/:**
- Include improvement notes
- Flag which criteria failed

## Next Workflow
-> `Organize.md`
