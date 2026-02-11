# Account Structure

XPoster supports multiple X accounts with distinct voices.

**Account data lives OUTSIDE the skill directory** — configured in `config.yaml`.

---

## Directory Structure

```
~/x-poster-accounts/              # Default location (configurable)
├── myaccount/
│   ├── ACCOUNT.md                # Voice, handle, positioning
│   ├── INPUT/                    # Raw ideas (.md files)
│   ├── OUTPUT/
│   │   ├── drafts/               # Score <70, needs revision
│   │   ├── ready/                # Finalized, awaiting schedule
│   │   ├── scheduled/            # Queued with posting time
│   │   └── posted/               # Archive after publishing
│   └── KNOWLEDGE/                # Account-specific expertise
└── anotheraccount/
    └── (same structure)
```

---

## ACCOUNT.md Template

```yaml
---
name: account-name
handle: "@handle"
---

# Account Identity

**Expertise Domain:** What you're the expert on
**Positioning:** Your unique angle or tagline
**Catchphrase:** Optional memorable phrase

## Voice & Tone

- Write like you're talking to a friend who [domain]
- Share real experiences, including failures
- Natural conversational flow
- Say what actually happened

## Target Audience

- Primary: Who reads your posts
- Secondary: Who might discover you
- Tone preferences: Technical? Casual? Both?

## Content Types

1. Type A (40%)
2. Type B (30%)
3. Type C (20%)
4. Type D (10%)
```

---

## INPUT File Format

Raw ideas go in `INPUT/` as `.md` files:

```yaml
---
topic: "Main topic or theme"
priority: high | medium | low
target_date: "YYYY-MM-DD"
tags: ["tag1", "tag2"]
---

Your raw idea content here...

Can be rough notes, links, observations, etc.
The skill will transform this into a polished post.
```

---

## OUTPUT File Format

Processed tweets become JSON in `OUTPUT/`:

```json
{
  "id": "unique_id_YYYY_MM_DD_NNN",
  "account": "myaccount",
  "status": "ready",
  "content": {
    "text": "tweet content here",
    "word_count": 45,
    "character_count": 250
  },
  "quality_metrics": {
    "quality_score": 85,
    "engagement_potential": 4.2,
    "human_authenticity_score": 5
  },
  "source_file": "INPUT/idea-name.md",
  "created_at": "2026-01-17T09:00:00Z"
}
```

---

## Account Detection

When processing:

1. Check if account specified: `"process input for myaccount"`
2. If not, check `default_account` in `config.yaml`
3. If still ambiguous, ask user which account

---

## Setting Up New Account

Run `"setup xposter"` to create accounts interactively, or manually:

```bash
# Create account structure
mkdir -p ~/x-poster-accounts/myaccount/{INPUT,OUTPUT/{drafts,ready,scheduled,posted},KNOWLEDGE}

# Create ACCOUNT.md
touch ~/x-poster-accounts/myaccount/ACCOUNT.md
```

Then edit `ACCOUNT.md` with your account details.

---

## File Status Tracking

| Status | Location | Description |
|--------|----------|-------------|
| pending | INPUT/ | New idea detected |
| draft | OUTPUT/drafts/ | Score <70, needs work |
| ready | OUTPUT/ready/ | Finalized, awaiting post |
| scheduled | OUTPUT/scheduled/ | Queued with time |
| posted | OUTPUT/posted/ | Published archive |
