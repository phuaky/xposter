# Schedule Workflow

**Trigger:** "schedule", "queue for posting"

Applies to content in `OUTPUT/ready/`

## Purpose

Analyze optimal posting times and manage posting queue.

## Steps

### 1. Optimal Posting Times (EST)

| Slot | Time | Notes |
|------|------|-------|
| Primary | 9:00 AM | Highest engagement |
| Secondary | 2:00 PM | Afternoon boost |
| Tertiary | 7:00 PM | Evening scroll |

**Days:** Tue-Thu > Mon/Fri > Weekend

### 2. Check Cadence
- Ensure daily posting goal met
- Avoid multiple posts within 2 hours
- Space topic clusters across days

### 3. Avoid Content Clustering

Rotate content pillars:
- 40% Technical insights
- 30% Tool comparisons
- 20% Personal journey
- 10% Industry observations

### 4. Prioritize Queue

Order by:
1. `target_posting_date` (if specified)
2. `priority` (high -> medium -> low)
3. `created_date` (FIFO)

### 5. Assign Posting Slot

Update JSON:
```json
{
  "status": "scheduled",
  "scheduled_time": "2025-01-17T09:00:00-05:00",
  "posting_slot": "morning_primary"
}
```

### 6. Move to Scheduled
```bash
mv OUTPUT/ready/{id}.json OUTPUT/scheduled/{id}.json
```

## Posting Execution

### Pre-Post Checklist
- [ ] Visual content ready
- [ ] No recent duplicate topics
- [ ] MCP connection verified
- [ ] Character count <= 280

### Execute Post
```javascript
mcp__x-server__create_tweet({ text: content.text })
```

### Post-Post Actions
1. Move: `scheduled/` -> `posted/`
2. Update status:
```json
{
  "status": "posted",
  "posted_at": "2025-01-17T09:00:23-05:00",
  "post_id": "twitter_post_id"
}
```

## Rate Limits

**Free tier:** 500 posts/month

Track usage, warn when approaching limit.

## Queue Commands

| Command | Action |
|---------|--------|
| "show queue" | List scheduled |
| "reschedule {id}" | Change time |
| "unschedule {id}" | Move to ready/ |
| "post now {id}" | Immediate post |

## Recovery

**If posting fails:**
1. Log error
2. Keep in scheduled/ with error status
3. Retry: 1min, 5min, 15min
4. After 3 failures -> drafts/ with error note
