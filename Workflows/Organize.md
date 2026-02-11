# Organize Workflow

**Trigger:** "organize", "move to ready/drafts", follows Validate

## Purpose

Generate IDs, create metadata files, route to output folders.

## Steps

### 1. Generate Unique ID

Format: `{topic_slug}_{YYYY}_{MM}_{DD}_{NNN}`

Example: `ai_debugging_gauntlet_2025_01_16_001`

- `topic_slug`: Lowercase, underscores, max 30 chars
- `YYYY_MM_DD`: Creation date
- `NNN`: Sequential number (001, 002...)

### 2. Determine Destination

| Result | Destination |
|--------|-------------|
| All gates passed | `OUTPUT/ready/` |
| Any gate failed | `OUTPUT/drafts/` |

### 3. Create JSON File

```json
{
  "id": "ai_debugging_gauntlet_2025_01_16_001",
  "account": "myaccount",
  "status": "ready",
  "created_date": "2025-01-16",

  "content": {
    "text": "The actual tweet...",
    "type": "single_post",
    "character_count": 268,
    "word_count": 52
  },

  "quality_metrics": {
    "quality_score": 85,
    "engagement_potential": 4.0,
    "human_authenticity_score": 5
  },

  "metadata": {
    "topic": "AI debugging",
    "tags": ["ai", "debugging"],
    "original_input": "INPUT/idea.md"
  }
}
```

### 4. Add Improvement Notes (if drafts/)

```json
{
  "improvement_notes": {
    "failed_gates": ["quality_score"],
    "current_score": 65,
    "required_score": 70,
    "suggestions": [
      "Add personal experience (+10)",
      "Include specific details (+5)"
    ]
  }
}
```

### 5. Status Values

| Status | Meaning |
|--------|---------|
| pending | Scanned, not processed |
| processing | Currently transforming |
| draft | Failed quality, needs revision |
| ready | Passed, awaiting schedule |
| scheduled | Queued with time |
| posted | Published |
| error | Failed, needs attention |

### 6. File Naming

Save as: `{id}.json`

Location:
- `OUTPUT/ready/` for passed
- `OUTPUT/drafts/` for needs revision

## Next Workflow
-> `Schedule.md` (only for ready/ content)
