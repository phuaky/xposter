# Mandate: Operator may fire one class of send

This file is a contract between the founder and the Operator. It is OFF until the founder copies the signed block into `config.json` under `mandate`. Without it, the Operator drafts and packages and the human fires, per the founder's standing rule that outbound messages are human-released.

## Why a mandate exists

The founder's own register records the regret rate on every send that actually fired as zero, and records four accountability resets that produced documents and no sends. The cheapest, most reversible class of send, a first-touch priced ask to a qualified stranger, is the class that most reliably does not fire. Removing the human from exactly that class, and no other, is the smallest change that could move ASKS.

## The mandated class (all conditions must hold)

1. The recipient is a company with no prior human conversation with the founder. No reply, no call, no meeting on record.
2. The recipient passed the kill test with all three answers YES, with evidence paths recorded in its dossier.
3. The message is the approved offer, price verbatim from the offer file, with the offer version tag recorded on send.
4. The contact route is company-published (a named person's published business email or a company form), not a scraped personal address, not a patient-facing or customer-facing line.
5. The draft passed the voice and verification gates and was written by the Operator from the dossier, not copied from a retired offer cohort.
6. The daily cap has not been reached.
7. The sender identity is the configured business identity, with deliverability gates open at send time.

## Caps and recall

- Cap: `mandate.daily_cap` sends per day (suggested 3). Hard stop.
- Recall: each mandated send is queued for `mandate.recall_minutes` (suggested 30) and posted to Telegram before it fires. A reply of `stop <company>` in that window cancels it. Silence fires it.
- Every mandated send is logged as `fired-by-operator` with date, channel, recipient route, offer version, and the dossier path.
- The mandate suspends itself if two consecutive days produce a bounce rate above 20%, if a recipient asks not to be contacted, or if the offer file changes. It resumes only by re-signing.

## What the mandate never covers

Replies. Chases. Follow-ups. Anything to a person who has spoken to the founder. Anything with a deposit, scope, contract, or acceptance test. Anything to friends, family, existing customers, or a company with an open job application from the founder. Applications of any kind.

## Signature block (copy into config.json when signed)

```json
"mandate": {
  "signed_by": "<name>",
  "signed_on": "<YYYY-MM-DD>",
  "class": "first-touch-priced-ask-qualified-stranger",
  "offer_version": "<tag from the offer file>",
  "daily_cap": 3,
  "recall_minutes": 30,
  "sender": "<business email or channel id>",
  "review_on": "<YYYY-MM-DD, at most 30 days out>"
}
```

Unsigned, the block is absent and the Operator never fires anything.
