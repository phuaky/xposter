# ScoreTweet.ts

Deterministic quality scoring for X posts. Evaluates quality score, human authenticity, engagement potential, and platform compliance.

## Usage

```bash
# Score inline text
bun run Tools/ScoreTweet.ts "Your tweet text here"

# Score from JSON file
bun run Tools/ScoreTweet.ts --file path/to/tweet.json
```

## Flags

| Flag | Description |
|------|-------------|
| `--file <path>` | Read tweet from JSON file (expects `.content.text` or `.text` field) |
| *(no flag)* | Score text provided as argument |
| *(no args)* | Show help/usage |

## Output

Returns four assessments:

| Assessment | Threshold | Description |
|------------|-----------|-------------|
| **Quality Score** | >= 70/100 | Base 50 + additions - deductions |
| **Human Authenticity** | >= 3/10 elements | Detects human writing patterns |
| **Engagement Potential** | >= 3.0/5.0 | Predicts quotes, bookmarks, replies, reposts, dwell time |
| **Platform Compliance** | All pass | Word count, sentence count, no links, no ALL CAPS, no threads |

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | All gates passed |
| `1` | One or more gates failed |

## Scoring Details

See `Reference/ContentRules.md` for the full scoring breakdown (additions, deductions, human patterns, AI patterns to avoid).

## Programmatic Usage

```typescript
import { scoreTweet } from './ScoreTweet.ts';

const result = scoreTweet("your tweet text");
console.log(result.total);        // 85
console.log(result.passed);       // true
console.log(result.humanAuthenticity.elements); // ['mid-thought start', ...]
```
