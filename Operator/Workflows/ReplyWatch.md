# ReplyWatch Workflow

**Trigger:** 13:00 and 18:00 daily (scheduled), "any replies", "reply watch"

## Purpose

Turn every inbound reply into the next send within the same half day. A reply that waits overnight decays. The founder's own ledger shows a warm thread dying after 77 days of silence and a S$5,000 scope going silent after a requested hold; both were reply-timing failures, not product failures.

## Step 1: Pull inbound

Read the configured inbound sources (mailbox scan output, WhatsApp bridge export, account logs). For each new inbound since the last run, identify the account. Unknown sender with a business shape becomes a new account dossier per the repo rules; everything else is skipped.

## Step 2: Classify

| Reply shape | Next send |
|---|---|
| Question about intent or credentials | Answer honestly in two sentences, restate the one ask |
| Interest, asks for time | Propose two slots inside 48 hours, one line, calendar link if one exists |
| Asks for the artifact you offered | Send the artifact now, with the priced next step named |
| Hold, "let me review internally" | Log the hold with their stated date. One nudge the day after that date, never before |
| No | Log closed-lost with their words verbatim. Thank them in one line. No counter |
| Silence past stated cadence | Not a reply. Handled by MorningFire rank 2 |

## Step 3: Draft, verify, page

Same rules as MorningFire steps 3 to 5. Replies never mention a price the offer file does not state. If the reply moves the deal to scoping, the next send names the deposit and the acceptance test the buyer writes, not us.

## Step 4: Surface

Telegram, under 8 lines, one entry per reply: who, what they said in under 12 words, what the drafted next send asks. Page link. Append to the account log in the repo's grammar with `approval_required: true` and the draft path as evidence.

## Gotchas

- Never answer a reply with a document. Two sentences and one ask.
- A warm reply is the highest-value event in the system. It outranks every build, every research pass, and every harness fix in the same session.
- Do not reclassify silence as a reply. Only new words from the counterparty change a deal's stage.
