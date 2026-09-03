# MorningFire Workflow

**Trigger:** 07:30 daily (scheduled), "morning fire", "fire pack", "what should I send today"

## Purpose

Produce today's fire pack: the one to three sends that leave the building today, fully drafted and verified, with nothing left for the human except the send itself. Runs without a human in the seat. Output is a Telegram message and one fire page.

## Inputs

- `queue.json` from `bun run Operator/Tools/operator.ts queue` (the runner injects it): live accounts with a due `next_permitted_move`, unsent drafts on disk, the ASKS counter, yesterday's verdict.
- The current offer file (price, copy, offer version tag). Never a second source.
- `Reference/Gates.md`.

## Step 1: Rank the queue

Order by evidence of reply, highest first. The founder's own ledger (four months, 78 dossiers) says where replies come from: every buyer who engaged in 2026 came from a job interview, an inbound, a warm introduction, or an unpriced value-first touch. Thirteen cold priced emails got zero replies. Seventy-one cold emails of any kind got zero replies. The queue follows the evidence, not the plan.

1. A live deal waiting on us (stage replied, scoping, or proposed, and `next_permitted_move` is a send). The oldest first.
2. A live deal past its own stated nudge date or offer validity date. One closed-lost ping ("did this die? a clean no helps me"), then formal-dead. Never a second.
3. A referral ask to a past payer or a delighted contact: "who are two people this would matter to?" It has fired zero times across six paid deliveries, it costs nothing, and the founder's register mandates it at handover. Friends refer; they are never asked to buy.
4. An interview-to-vendor pivot: any job-application thread that reached a human (interview, recruiter reply, hiring manager) gets the fixed-price engagement proposed in the founder's words. This is the motion that produced the only priced proposal a buyer ever engaged with.
5. An unsent priced ask that already exists as a draft on disk. Age over 24 hours means it fires today as drafted or is killed with one logged line. It is not re-reviewed.
6. A new cold priced ask from the demand bench, only to complete the founder's own thirty-ask experiment, and labelled in the Telegram line as the low-signal lane. Never ahead of 1 to 5.

Cap the pack at three sends. Three is a fire pack. Four is a to-do list, and to-do lists do not fire.

## Step 2: Run the kill test on every candidate

Before drafting, ask in order. First NO stops that candidate and logs why.

- Existing spend: do they already pay money, not their own time, for this task?
- Exogenous demand: does the work arrive whether or not our tool exists?
- Accountability: is a named person on the hook for this task by a date?

A candidate that fails is not softened into an unpriced touch. It is parked with the failing question written down.

## Step 3: Pre-pay verification

For every name, number, date, link, and attachment in a send: verify once against its source, stamp `verified <date> <source>`. Anything that cannot be verified now is cut from the draft. This is the only verification pass this send will ever get.

## Step 4: Draft in the founder's voice

- Chat channels: four sentences or fewer, casual. Email: eight or fewer.
- The ask is one sentence a person can answer yes or no.
- Price stated exactly as the offer file states it. An unpriced first touch does not count as an ASK.
- No AI tells. No em dashes. No "hope you're doing well". No numbered lists.
- If a finalized draft already exists on disk, use it verbatim. Improving finalized copy is the re-litigation loop wearing the Operator's face.

## Step 5: Build the fire page

One page, all sends. Per send: header with the verification stamp and a ten-minute time box; a one-click CTA that opens the channel; a facts table with copy buttons; the draft collapsed with copy-without-opening; rules for this send (scope frozen, nothing new promised); a finish checklist of six or fewer items only the human can do, ending with "tell the Operator: fired".

The page contains zero questions, zero options, zero "review" language. Decisions were made while building it.

## Step 6: Surface and log

Telegram, plain text, under 12 lines:

```
FIRE PACK <date>. <n> sends, ~10 min.
1. <company> <channel> <ask in 6 words> [age <d>d]
2. ...
ASKS <n>/30. Yesterday: <fired count> fired, <replies> replies.
Page: <link>
```

Append one line per send to the ledger: date, company, channel, offer version, status `ready`.

If the mandate in `Reference/Mandate.md` is ON in config and a send is in the mandated class, fire it through the configured sender instead of surfacing it, log it as `fired-by-operator`, and include it in the Telegram line with a recall window.

## Step 7: The red line

If yesterday's fire pack has any send still `ready` at run time, the first line of today's Telegram is:

```
RED: <company> <ask> has been ready for <n> days. Barrier: <one sentence>. Today's step: <one mechanical step under 15 minutes>.
```

Do not rebuild the page. Shrink the step.

## Examples

**Example 1: live deal past its hold date**
```
Queue: <company> proposed, hold requested <date>, offer validity ended <date>, 14 days silent.
-> Rank 2. One closed-lost ping, drafted in voice, two sentences, no forward ask.
-> Fire page section: "did this die? a clean no helps me plan the month."
```

**Example 2: drafts sitting on disk**
```
Queue: 4 priced-ask drafts, adversarially reviewed 11 days ago, none sent.
-> Rank 5. Oldest three go on today's page verbatim. No review. Fourth is tomorrow's.
-> Telegram: "3 sends, ~10 min. ASKS 1/30 (cold lane: 0 replies on 13, low signal)."
```

**Example 3: a past payer with no referral ask**
```
Queue: sam-reed won, paid Jun 23, no referral-ask event in LOG.
-> Rank 3. Two-sentence WhatsApp: the scope just sent to an accounting firm, and "who are two people this would matter to?"
-> No pitch. No price. The referral is the ask.
```
