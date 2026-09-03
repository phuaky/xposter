# Gates

The Operator's rules are the founder's rules, restated as checks a script or a model can run. Each gate names its origin so the Operator can quote the rule and its date instead of re-deriving it. Fill the dates from your own standing-orders file at setup.

## Before any build

| Gate | Check | On fail |
|---|---|---|
| Named buyer | One real person has committed time, money, or reputation, and wrote their own "done" | Lab work only, bounded to a four-hour window |
| Pending send | No live account has a due send older than 24 hours | Fire or kill the send first |
| Swap | No approved, unfired commitment exists that this build would replace | Fire or bury the original, same sitting |
| Metric freeze | The build adds no dashboard, tracker, counter, or scoreboard | Decline, quote the freeze date |
| Self-scoped build over one day | Written red-team plus a named human witness plus 48 hours | Wait |

## Before any send

| Gate | Check | On fail |
|---|---|---|
| Kill test 1 | Existing spend: they pay money for this task today | Park, log the failing question |
| Kill test 2 | Exogenous demand: the work arrives without our tool | Park |
| Kill test 3 | Accountability: a named person on the hook by a date | Park |
| Price present | The send states the current offer price verbatim | Not an ASK. Add the price or reclassify as a give |
| Verified once | Every fact stamped with date and source | Cut the unverified fact |
| Voice | Under the channel's sentence cap, no AI tells, no em dashes, one yes/no ask | Rewrite |
| Channel continuity | Replies stay on the channel and account where the thread lives | Fix the channel |
| Not a friend | The recipient is a stranger or structurally warm, not a friend paying out of goodwill | Not an ASK |

## Timing rules

| Rule | Check | On fail |
|---|---|---|
| Send within 24h | A drafted send to a live contact fires within 24 hours as drafted, or is killed with one logged line | Red line in MorningFire. Rescoping is not sending |
| One chase | Silence past stated cadence gets exactly one closed-lost ping, then formal-dead | Reopen only on inbound |
| Silence is noise | Below thirty asks, zero replies carries zero information | No conclusions, no pivot |
| Hold respected | A counterparty's stated review date is respected to the day, then one nudge | Wait |
| Verify once | Audits run once per artifact. Rendering it the way the recipient opens it is uncapped | Refuse the repeat audit |

## Money rules

| Rule | Check |
|---|---|
| Price is read, not derived | The offer file is the only source. Projects at or above the floor, retainers at or above the monthly floor, no friend rate |
| Commitment before build | Deposit, or a structured trial with a named conversion date and a client-written acceptance test |
| Verbal offers are $0 | Until a deposit or signature exists |
| Stranger money is the score | Warm money is logged separately, forever |

## Who fires

| Class of send | Who |
|---|---|
| Warm reply, chase, anything with a name, scope, or deposit attached | Human, always |
| First-touch priced ask to a qualified stranger, approved offer verbatim | Human by default. Operator only under a signed mandate (Reference/Mandate.md) |
| Job or portal applications | Whatever the founder's separate rule says. Not this skill's business |
