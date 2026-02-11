# UpdateAlgorithm Workflow

**Trigger:** "update algorithm", "fetch nikita", "refresh algorithm tips", "get latest X tips"

## Purpose

Fetch latest algorithm insights from @nikitabier and other X strategy sources.

## Usage

```
"update algorithm tips"
"fetch nikita's latest advice"
"refresh X algorithm knowledge"
```

## Steps

### 1. Search for Latest Insights

Use WebSearch to find recent algorithm content:

```
Query: "@nikitabier algorithm 2026 OR X strategy OR timeline OR engagement"
```

Additional queries if needed:
- `"nikita bier X tips site:x.com"`
- `"X algorithm update 2026"`
- `"twitter engagement strategy 2026"`

### 2. Extract Key Insights

From search results, extract:

**Strategic principles:**
- New algorithm changes
- Content format recommendations
- Engagement optimization tips
- What's working now vs before

**Format each insight as:**
```markdown
### [Insight Title]
> "[Direct quote if available]"

**Implication:** [How this affects XPoster strategy]
**Source:** [URL or @handle + date]
```

### 3. Validate Insights

Check against existing knowledge:
- Is this genuinely new?
- Does it contradict or update existing advice?
- Is the source credible?

**Skip duplicates. Only add novel insights.**

### 4. Save to Updates Folder

Create dated file:
```
AlgorithmUpdates/YYYY-MM-DD_insights.md
```

**File format:**
```markdown
# Algorithm Insights - YYYY-MM-DD

Fetched: [timestamp]
Sources: [list of URLs/handles]

---

## New Insights

### 1. [Insight Title]
[content]

### 2. [Insight Title]
[content]

---

## Updates to Existing Guidance

### [Topic that changed]
- **Before:** [old advice]
- **Now:** [new advice]
- **Why:** [explanation]
```

### 5. Report to User

```
ALGORITHM KNOWLEDGE UPDATED

Date: 2026-01-17
Sources searched: 5
New insights found: 3

Key Updates:

1. [Insight 1 title]
   [Brief summary]

2. [Insight 2 title]
   [Brief summary]

3. [Insight 3 title]
   [Brief summary]

Saved to: AlgorithmUpdates/YYYY-MM-DD_insights.md
```

## Frequency

**Recommended:** Weekly or before major posting sprints

## Error Handling

**If no new insights found:**
```
No new algorithm insights found.

Last update: [date of most recent file in AlgorithmUpdates/]

Your knowledge base is current. Check again in a few days.
```

**If search fails:**
```
Could not fetch algorithm updates.

Try:
1. Check internet connection
2. Try again in a few minutes
3. Manually search @nikitabier on X
```

## Integration with Other Workflows

- **Draft.md & BatchProcess.md:** Read AlgorithmUpdates/ for latest insights in Cross-Reference step
- **Validate.md:** Uses updated algorithm rules for scoring
