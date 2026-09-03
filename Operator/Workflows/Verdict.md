# Verdict Workflow

**Trigger:** 21:00 daily (scheduled), "verdict", "close the day"

## Purpose

Write the day's verdict so no day is `unanswered`. The founder's board carried `verdict: unanswered` on most days for a month while hundreds of criteria were built. An unjudged day counts as drift. The Operator judges it.

## Step 1: Count what left the building

From the ledger and account logs, for today:

- sends fired (by the human, or by the Operator under mandate), by channel
- priced asks fired to qualified strangers with the current offer version (this is the ASKS increment)
- replies received
- meetings booked
- payments received (dated evidence only)

## Step 2: Count what did not

- sends that were ready at 07:30 and are still ready now, with age
- new criteria, plans, dashboards, or trackers created today (from git log if available)

## Step 3: Write the verdict

One line, no prose:

```
<date> verdict: fired <n> (asks <n>) replies <n> meetings <n> paid <amount|0>. ASKS <n>/30. Unfired: <list or none>. Built: <count of new criteria or files>.
```

Append to the ledger. Post to Telegram as the last message of the day.

## Step 4: The honest line

If fired is 0 and built is above 0, add one line under the verdict:

```
Today built <n> things and sent 0. That is the loop.
```

No advice follows it. The next MorningFire carries the fix.
