# GenerateVisual Workflow

**Trigger:** "generate image", "add visual", "create image for tweet", "make screenshot"

## Purpose

Generate tweet visuals using an image generation tool.

**This workflow is optional.** It requires `image_generation_command` to be set in `config.yaml`. If not configured, posts can still be published without images (though images boost engagement 2-3x).

## Usage

```
"generate image for this tweet"
"add visual to the draft"
"create a screenshot-style image for this"
"make a comparison image"
```

## Steps

### 1. Get Tweet Content

Either:
- Use the most recent draft from Draft workflow
- User provides tweet text directly
- Reference a tweet ID from OUTPUT folder

### 2. Classify Visual Type

Analyze tweet to determine best visual style:

| Tweet Pattern | Visual Type | Art Style |
|---------------|-------------|-----------|
| "X vs Y", comparison | `comparison` | Side-by-side split screen |
| Numbers, percentages, stats | `stat-card` | Stats card with illustration |
| Code, terminal, debugging | `code-insight` | Dark terminal aesthetic |
| Opinion, take, quote | `editorial` | Charcoal sketch style |
| Tool recommendation | `product` | Clean product showcase |

### 3. Generate Art Prompt

Based on visual type, construct prompt:

**Comparison:**
```
Split-screen comparison image. Left side: [Tool A] with [characteristics].
Right side: [Tool B] with [characteristics].
Dark background, clean modern design.
Annotation arrows highlighting key differences.
Professional tech blog quality.
```

**Stat Card:**
```
Statistics card illustration. Large bold text: "[STAT]".
Subtitle: "[context]".
Hand-drawn style illustration of [relevant imagery].
Warm editorial colors. Professional infographic quality.
```

**Code Insight:**
```
Dark terminal screenshot aesthetic. Black background #0D1117.
Showing: [code concept or output].
Syntax highlighting in muted colors.
Subtle annotation pointing to key insight.
Developer blog header quality.
```

**Editorial:**
```
Editorial charcoal sketch illustration.
Subject: [person/concept doing action].
Warm sepia tones. Hand-drawn aesthetic.
Professional blog header quality.
Evokes: [emotion/concept from tweet].
```

### 4. Execute Image Generation

If `image_generation_command` is set in config.yaml, run it with the prompt.

Example (if using an Art skill):
```bash
{image_generation_command} \
  --prompt "[generated prompt]" \
  --size 2K \
  --aspect-ratio 16:9 \
  --output {image_output_dir}/xposter-[timestamp].png
```

If no image generation is configured:
```
Image generation is not configured.

To enable it, set image_generation_command in config.yaml.
Example tools: DALL-E CLI, Stable Diffusion, Midjourney API, etc.

You can still post the tweet without an image.
```

### 5. Preview and Confirm

```
IMAGE GENERATED

Location: {image_output_dir}/xposter-2026-01-17-001.png
Size: 2K (16:9)
Style: [visual type]

Preview the image, then:
- "looks good" -> Ready to attach to tweet
- "try again with [changes]" -> Regenerate
- "different style" -> Switch visual type
```

### 6. Attach to Tweet (Optional)

If user confirms, update tweet JSON:

```json
{
  "visual_content": {
    "path": "{image_output_dir}/xposter-2026-01-17-001.png",
    "type": "comparison",
    "generated": true,
    "timestamp": "2026-01-17T15:30:00Z"
  }
}
```

## Visual Type Examples

### Comparison
**Tweet:** "Claude vs GPT for debugging - Claude explains better, GPT fixes faster"
**Visual:** Split screen with Claude logo left, GPT logo right, key traits listed

### Stat Card
**Tweet:** "78% of developers now use AI daily"
**Visual:** Large "78%" with developer illustration, warm colors

### Code Insight
**Tweet:** "The bug was a single missing await"
**Visual:** Dark terminal showing the fix, arrow pointing to await

### Editorial
**Tweet:** "The best AI developers aren't prompt engineers - they're context architects"
**Visual:** Sketch of developer building/architecting, thoughtful pose

## Tips

- 16:9 works best for X timeline (shows full in feed)
- Keep text in images minimal (AI text rendering can be imperfect)
- Dark themes stand out in timeline
- Stats with illustrations get 2-3x more engagement
