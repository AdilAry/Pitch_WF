<!-- Master copy is SCENES_FORMAT.md in the video repo. Edit it there and copy it to the project's docs/SCENES_FORMAT.md (and to the kit's template/docs/). Each repo's CLAUDE.md gives the other's path. -->
# How to write scenes.json (writer's guide)

`scenes.json` is the only input for an automatic product-video engine. From it the engine
makes an AI voice-over, animations that start exactly on spoken words, captions and screen
recordings, and renders a 1920×1080, 30 fps video. You write the file; a person records the
screen clips and runs the engine. Your job: a clear, honest story of the app: 60–90 s as written,
120 s at most once voiced, unless the project sets another limit (`meta.targetSeconds`, `meta.maxSeconds`). The real length depends on the voice, so it is rechecked after the voice is chosen.

---

## 1. The file at a glance

```json
{
  "meta":  { "title": "My App", "fps": 30, "width": 1920, "height": 1080, "captions": true, "padSeconds": 0.3 },
  "voice": { "modelId": "eleven_multilingual_v2", "settings": { "stability": 0.5, "similarity_boost": 0.75, "style": 0.0 } },
  "theme": { "bg": "#0F2A3D", "accent": "#1B998B", "text": "#FFFFFF", "warn": "#F2A541" },
  "scenes": [ ...one object per scene, played in this order... ]
}
```

| Field | Meaning |
|---|---|
| `meta.title` | Name of the video (not shown on screen). |
| `meta.fps`, `width`, `height` | Keep `30`, `1920`, `1080`. |
| `meta.captions` | `true` = captions at the bottom (recommended). |
| `meta.padSeconds` | Pause after every scene, in seconds. `0.3` sounds natural. |
| `meta.targetSeconds`, `meta.maxSeconds` | Optional length goals checked by `npm run check`. Defaults: `90`, `120`. |
| `voice` | Keep as shown unless told otherwise. |
| `theme` | Colours (hex or `rgba(...)`): `bg` background, `accent` highlights, `text`, `warn` (warnings, problems). Optional; defaults are the values above. Extras: `panel`, `panelBorder` (cards/boxes), `captionBg` (box behind captions), which a light background needs because their defaults are made for dark ones; `deviceBezel`, `deviceScreen`, `browserBar` (clip/image frames). If the project has an app, use its colour values unchanged. If the app's screens are light, prefer a light background with the brand colour as `accent`: white clips jump out against a dark one. |

### A scene

```json
{
  "id": "s03",
  "narration": "Sense Coach answers three questions in plain words.",
  "estSeconds": 4,
  "visual": { "type": "cards", "items": [ ... ] },
  "cues": [ { "atWord": "three", "action": "show", "target": 0 } ]
}
```

| Field | Required | Meaning |
|---|---|---|
| `id` | yes | Unique, letters/digits/`-`/`_` only. Use `s01`, `s02`, … |
| `narration` | yes | **Exactly** what the voice says. See narration rules. |
| `estSeconds` | yes | Your estimate of the spoken length: words ÷ 2.3 (≈ 140 words per minute). Used only until the real voice exists. |
| `padSeconds` | no | Pause after this scene; overrides `meta.padSeconds`. Use `0.8` on the intro and on the scene just before the outro, so the video "breathes" there. |
| `voiceContext` | no | Leave out. (`false` is a fix the person may add if a scene's voice sounds odd.) |
| `visual` | yes | What is on screen: one of the visual types below. |
| `cues` | no | When things on screen appear or change, tied to spoken words. |

---

## 2. Narration rules

1. **Numbers as words** in `narration` ("fifty-one", "zero", "sixty-two"). The visuals show digits. No digits in narration at all. Long figures take time to say, so put few in each sentence and leave the rest to the screen; never round a figure to shorten it.
2. **Short sentences**, one idea each. 8–15 words per sentence is ideal; captions show one sentence at a time.
3. **≈ 140 words per minute.** Total length 60–90 s → about 140–210 words for the whole video; voices differ, so a script this size can run from about 70 to 105 s. One scene = one point, at least 5 s and usually up to 15 s, rechecked once the voice exists (a 3 s scene feels cut off). Merge a shorter point into its neighbour.
4. **Only true facts** from the app, its data and its docs. Never invent numbers, users, results or quotes.
5. **Avoid words the voice may mispronounce**: brand names, acronyms, product codes, unusual names. Say "the manufacturer", "the sensor", "the app" instead and show the exact name on screen.
   A name made of everyday words can be heard as a phrase or an order ("Leak Watch names three things" sounds like a command to watch). Put it in single quotes in the narration: `The app 'Leak Watch' names three things.` In testing, the quotes fixed it; "the app" in front without them did not. The engine ignores the quotes for cues, so cue on `Leak` or `Watch` as usual. Listen to the intro scene first.
6. Write for the ear: plain words, active voice, no brackets, no lists, no URLs or e-mail addresses spoken (put them on screen).
7. Every word you want to use as a cue must appear in that scene's narration.
8. **Open with the audience's first question and the strongest number you can honestly claim.** Name the problem in one sentence before the answer or together with it, even in a short video that drops the problem scene: an answer to an unstated problem doesn't land. Limits and caveats must stay in the script, but a video that is only caveats reads as "found nothing". Say what someone can do with the result.
9. A typical story: intro (name + one-line promise) → the problem → what the app does → a demo clip or two → proof (real numbers) → how it works → business model / who pays → outro (name + promise again, where to find it).

---

## 3. Cues: timing animations to words

```json
"cues": [
  { "atWord": "zero", "action": "show", "target": 2 },
  { "atWord": "fan", "occurrence": 2, "action": "highlight", "target": "fan2", "offsetSeconds": -0.2 },
  { "atFraction": 0.85, "action": "fadeOut" }
]
```

| Field | Meaning |
|---|---|
| `atWord` | Fires when this word starts being spoken. Case and punctuation are ignored ("roof" matches "Roof," and "roof?"). Hyphenated words count as one word: use `"fifty-one"`. |
| `occurrence` | Which match of `atWord` (1 = first, default). |
| `atFraction` | Instead of a word: a point in the scene, 0–1 (0.5 = halfway). Use only when no word fits. |
| `offsetSeconds` | Shift the cue, e.g. `-0.2` to start slightly before the word. |
| `action` | `show`, `hide`, `highlight`, `zoom`, `fadeOut`. |
| `target` | What it acts on: an item number (starting at **0**), a named element, or for `zoom` an object `{ "scale": 1.2, "x": 0.5, "y": 0.3 }`. |

Rules that apply to every visual:
- An element **with** a `show` cue is hidden until that cue. An element **without** one appears when the scene starts.
- `hide` removes an element again; `fadeOut` (no target) fades the whole scene out.
- `highlight` lights an element up and it stays lit.
- `zoom`: `scale` 1 = no zoom (1.1–1.3 is plenty); `x`, `y` = the point to zoom into, as fractions of the picture (0,0 top-left; 1,1 bottom-right). Each zoom moves smoothly from the previous one.
- Animations take about half a second, so cue the word slightly before you want the element fully visible.
- Never leave the screen empty while the voice talks: the first element must appear on a word in the scene's first sentence (an opener of up to about 5 words may come first). Add an element for that sentence if needed.
- In a `pipeline`, light the steps in order, starting with the first; otherwise the scene seems to start in the middle.

---

## 4. Visual types

Text sizes are large (video), so keep on-screen text **short**: titles ≤ 4 words, card/list items ≤ 5 words, labels ≤ 8 words.

### `title`: title card
Props: `title`, `subtitle` (optional), `footer` (optional, small, bottom).
Targets: `"title"`, `"subtitle"`, `"footer"` (`show`).
```json
{ "type": "title", "title": "Sense Coach", "subtitle": "Your building, explained.", "footer": "Junction 2026" }
```

### `cards`: 2–4 cards side by side
Props: `items` = list of `{ "title", "text" }` (`text` may be `""`).
Targets: card number `0`, `1`, … (`show`, `highlight`).
```json
{ "type": "cards", "items": [ { "title": "Is my roof OK?", "text": "" }, { "title": "What should I do?", "text": "" } ] }
```

### `counters`: numbers that count up
Props: `items` = list of `{ "value": number, "label", "suffix" (optional, e.g. "%") }`. 1–4 items.
Targets: item number (`show`; the number counts up from 0 when shown).
```json
{ "type": "counters", "items": [ { "value": 51, "label": "sensors" }, { "value": 0, "label": "leak alarms" } ] }
```

### `bigStat`: one huge number
Props: `value` (number counts up; text is shown as is), `label`, `insight` (optional sentence).
Targets: `"value"`, `"label"`, `"insight"` (`show`).
```json
{ "type": "bigStat", "value": 37302, "label": "readings checked", "insight": "One year of real roof data." }
```

### `chart`: line or bar chart that draws itself
Props: `kind` (`"line"` or `"bar"`), `points` (list of numbers), `label` (title above, optional), `bandLabel` (text on the band, optional, e.g. `"season"`).
Targets: `"line"` (`show` = start drawing). Optional extras that appear **only if a cue targets them**: `"band"` (`highlight`: shaded band over the part where values climb, with `bandLabel`), `"questionMark"` (`show`: big "?" at the last point), `"phoneIcon"` (`show`: phone/call icon).
```json
{ "type": "chart", "kind": "line", "points": [42, 43, 45, 48, 55, 63, 71], "label": "Roof humidity %", "bandLabel": "season" }
```

### `dotmap`: grid of dots, some highlighted
Props: `count` (dots), `columns`, `counters` (optional, same as counters items; shown above the grid), `highlights` = list of `{ "id", "label" }` (a dot lights up and a label card appears).
Targets: counter number (`show`), `"grid"` (`show`; without a grid cue the grid is there from the start), highlight `id` (`highlight`).
```json
{ "type": "dotmap", "count": 51, "columns": 10,
  "counters": [ { "value": 51, "label": "sensors" } ],
  "highlights": [ { "id": "s1", "label": "One sensor jumps 62 points" } ] }
```

### `pipeline`: boxes joined by arrows
Props: `steps` = list of `{ "title", "text" }` (2–4 steps), `badge` (optional pill below).
Targets: step number (`highlight` lights the step; if any step has a highlight cue, the others start dimmed), `"badge"` (`show`).
```json
{ "type": "pipeline", "steps": [ { "title": "Rules", "text": "Exact checks" }, { "title": "AI", "text": "Plain words" } ], "badge": "Not sure → keep watching" }
```

### `twoColumns`: two lists side by side
Props: `left` and `right` = `{ "heading", "items": [ ... ], "marker" (optional, sign before each item; default "✓", use "✕" for a "not" list) }` (right is the highlighted one), `footer` (optional; `\n` starts a new line).
Targets: `"left"`, `"right"`, `"footer"` (`show`); list items follow their column one by one.
```json
{ "type": "twoColumns", "left": { "heading": "Free", "items": ["Status", "Alerts"] },
  "right": { "heading": "Pro", "items": ["Reports", "Expert review"] }, "footer": "Recurring revenue" }
```

### `clip`: screen recording of the app
Props: `src` (file name under `clips/`, e.g. `"clips/c1_home.mp4"`), `frame` (`"phone"`, `"browser"` or `"none"`), `trimStart` (seconds skipped at the start), `trimEnd` (optional), `speed` (1 = normal, 1.25 = faster). The person adds `crop` after recording; you don't need to.
Targets: none; use `zoom` cues to zoom into parts of the screen.
The clip is muted (the voice-over plays). Choose the recording by the app:
- **Phone app or phone-first layout:** a phone-sized browser view (iPhone 12 Pro, portrait), with `"frame": "phone"`. The examples in this guide use this case.
- **Desktop app** (e.g. side-by-side panels, which a phone view pushes off-screen): a maximised browser, with `"frame": "none"` and one `crop` shared by all clips. The `"browser"` frame makes clips smaller, so don't use it for detailed screens. Keep browser graphics acceleration on.

Clip timing (`trimStart`, `trimEnd`, `speed`) is set after the final voice exists; before that a clip gets only its `crop`. Don't try to fix the timing in the script.
```json
{ "type": "clip", "src": "clips/c1_home.mp4", "frame": "phone", "trimStart": 0.5, "speed": 1.25 }
```
For each clip, tell the person what to record (screen, actions, roughly how long), e.g. in a short list after the JSON.

### `image`: screenshot
Props: `src` (e.g. `"images/map.png"`), `frame` (`"phone"`, `"browser"`, `"none"`).
Targets: none; `zoom` cues work like on clips.
```json
{ "type": "image", "src": "images/map.png", "frame": "phone" }
```

---

## 5. Complete small example (4 scenes, ≈ 25 s)

```json
{
  "meta": { "title": "Leak Watch", "fps": 30, "width": 1920, "height": 1080, "captions": true, "padSeconds": 0.3 },
  "voice": { "modelId": "eleven_multilingual_v2", "settings": { "stability": 0.5, "similarity_boost": 0.75, "style": 0.0 } },
  "theme": { "bg": "#0F2A3D", "accent": "#1B998B", "text": "#FFFFFF", "warn": "#F2A541" },
  "scenes": [
    {
      "id": "s01",
      "narration": "This is 'Leak Watch': your roof, in plain words.",
      "estSeconds": 4, "padSeconds": 0.8,
      "visual": { "type": "title", "title": "Leak Watch", "subtitle": "Your roof, in plain words." },
      "cues": [ { "atWord": "roof", "action": "show", "target": "subtitle" } ]
    },
    {
      "id": "s02",
      "narration": "We checked one year of data from fifty-one sensors. The standard alarms fired zero times.",
      "estSeconds": 7,
      "visual": { "type": "counters", "items": [ { "value": 51, "label": "sensors" }, { "value": 0, "label": "alarms" } ] },
      "cues": [ { "atWord": "fifty-one", "action": "show", "target": 0 },
                { "atWord": "zero", "action": "show", "target": 1 } ]
    },
    {
      "id": "s03",
      "narration": "Open the app and you see one line: all normal, and what to do next.",
      "estSeconds": 6, "padSeconds": 0.8,
      "visual": { "type": "clip", "src": "clips/c1_home.mp4", "frame": "phone", "trimStart": 0.5 },
      "cues": [ { "atWord": "line", "action": "zoom", "target": { "scale": 1.15, "x": 0.5, "y": 0.3 } } ]
    },
    {
      "id": "s04",
      "narration": "'Leak Watch': your roof, in plain words. Thanks for watching.",
      "estSeconds": 5,
      "visual": { "type": "title", "title": "Leak Watch", "subtitle": "Your roof, in plain words.", "footer": "leakwatch.example.com" },
      "cues": [ { "atWord": "Thanks", "action": "show", "target": "footer" },
                { "atFraction": 0.85, "action": "fadeOut" } ]
    }
  ]
}
```
Clips to record: `c1_home.mp4`: open the app's home screen, wait 2 s, scroll slowly to "What to do" (≈ 10 s).

---

## 6. Checklist before you hand it over

- [ ] Valid JSON (no comments, no trailing commas), ids `s01`, `s02`, … unique and in order.
- [ ] Every fact and number comes from the app or its data; nothing invented.
- [ ] Narration has no digits; numbers are words. Short sentences.
- [ ] No hard-to-pronounce names, codes or acronyms in narration (they're on screen instead). A name made of everyday words is in single quotes.
- [ ] Total words ÷ 2.3 ≈ total seconds, between 60 and 90 (default limit for the voiced video: 120 s). `estSeconds` filled in for every scene, each at least 5 s.
- [ ] Every scene shows something during its first sentence.
- [ ] The opening names the problem in one sentence and answers the audience's first question. Everything the clips will show on screen (tables, labels, generated sentences) is something you are willing to defend.
- [ ] Each scene has exactly one `visual` with a known `type` and the props listed above; on-screen text is short.
- [ ] Every `atWord` appears in that scene's narration (check `occurrence` for repeated words); item numbers start at 0.
- [ ] The intro and the scene before the outro have `"padSeconds": 0.8`; the outro ends with a `fadeOut` cue.
- [ ] Each `clip`/`image` has a `src` under `clips/` or `images/`, and you listed what to record for every clip.
- [ ] The video repo runs `npm run check` on it.
