# How to write deck.json (writer's guide)

`deck.json` is the only input for a pitch-deck builder. From it, `npm run build` (in the deck folder) makes a 16:9 `pitch.pptx` in a fixed navy/teal style, with speaker notes. The person imports it into Google Slides for touch-ups and exports a PDF for the submission. Your job: an honest 8–11 slide story of the project, using **the same facts and numbers as `scenes.json`**.

## 1. The file

```json
{
  "meta": { "title": "Leak Watch", "author": "Adil Arystanbek", "output": "pitch.pptx" },
  "slides": [ ...one object per slide, in order... ]
}
```
Optional top-level `"colors": { "teal": "7B2CBF", "navy": "1A1A2E" }` restyles the whole deck (hex without `#`); set it from the style guide's palette and the accent colours in AGENTS.md "Presentation". Keys: `navy` (dark background), `teal` (accent), `ice` (light cards), `amber` (attention), `green`, `red`, `ink` (body text), `muted`, `line`.

Every slide has `type`, `title` (not on `title`/`close`), and optional `notes` (what the person says on this slide, 1–3 sentences).

## 2. Slide types

| type | Use for | Fields |
|---|---|---|
| `title` | First slide (dark) | `icon`, `title`, `subtitle`, `footer`, `image` (optional; a tall phone-shaped slot that overlaps long titles, so leave it out for desktop apps) |
| `cards` | Problem; 2–4 side-by-side points | `cards[] {icon, title, text, tone}`, `footnote` |
| `list` | Who it's for, features | `items[] {icon, title, text, tone}` (2–4) |
| `statement` | The idea in one sentence (dark) | `sentence`, `chips[]` (≤ 3 short questions/phrases), `image` (optional) |
| `demo` | Data + demo moments | `image`, `heading`, `subheading`, `stats[] {value, label}` (≤ 3), `moments[] {title, text, tone}` (≤ 4), `caption` (optional; small line at the bottom, e.g. data credits). The default `image` slot is tall and phone-shaped; for a desktop screenshot crop it roughly square and add `imageLarge: true` (≤ 3 moments) |
| `pipeline` | How it works | `steps[] {title, text}` (3–4), `highlight` (index of the key step, 0 = first), `callout {bold, text}` |
| `results` | Validation table + big number | `table {header[], rows[][], colW[]}` (≤ 6 rows, 3–4 columns), `bigStat {value, label, insight}` |
| `business` | Value / business model | `cards[] {icon, title, text}` (3; the middle one is highlighted), `image`, `takeaway` |
| `pilot` | How the company can test it | `pilot[]` (2–3 bullets), `image` (optional), `hypotheses[] {title, measure}` (≤ 4) |
| `twoColumns` | Honest limits / next steps | `left {heading, items[]}`, `right {heading, items[]}` (≤ 4 items each) |
| `close` | Last slide (dark), usually "Q&A" | same fields as `title` |

- **icon**: a Font Awesome name from react-icons, e.g. `FaBolt`, `FaRobot`, `FaMicrochip`, `FaLeaf`, `FaShieldAlt`, `FaUser`, `FaIndustry`, `FaEuroSign`, `FaHandshake`, `FaCommentDots`, `FaTools`, `FaBuilding`. Unknown names become a plain circle.
- **tone**: `teal` (default), `amber` (attention/problem), `green` (OK), `red`, `navy`.
- **image**: a path relative to the deck folder, e.g. `"shots/home.png"`. Leave the field out for a slide without a screenshot; a path whose file doesn't exist yet becomes a labelled placeholder box.
- `results.table.colW`: column widths in inches, summing to about 5.9.

## 3. Writing rules

1. **Only true facts** from the project, its data and results. Never invent numbers, users, customers, prices or quotes. Assumptions are labelled as assumptions.
2. **Short text.** Titles ≤ 8 words; card/list titles ≤ 5 words; body texts ≤ 20 words. Text that's too long is shrunk to fit and becomes hard to read.
3. **Digits are fine here** (unlike `scenes.json` narration). Use the same numbers as the video.
4. **Usual order:** title → problem (`cards`) → who it's for (`list`) → idea (`statement`) → demo (`demo`) → how it works (`pipeline`) → results (`results`) → business (`business`) → pilot (`pilot`) → limits/next (`twoColumns`) → `close` (Q&A). Drop slides that don't fit the project rather than padding them, but keep `business` if `docs/PITCH.md` requires it.
5. **notes** = what to say, in plain spoken sentences; the live talk (its length is in `docs/PITCH.md`) uses title, problem, idea, demo, results, business and close.
6. List the screenshots the person must take (file name → what to capture) after the JSON.

## 4. Minimal example

```json
{
  "meta": { "title": "Leak Watch", "author": "Adil Arystanbek", "output": "pitch.pptx" },
  "slides": [
    { "type": "title", "icon": "FaTint", "title": "Leak Watch", "subtitle": "Your roof, in plain words.",
      "footer": "Junction 2026 · Example challenge · Adil Ary", "image": "shots/home.png",
      "notes": "Hi, I'm Adil. Leak Watch turns roof sensor data into plain answers." },
    { "type": "cards", "title": "The data is there. The understanding isn't",
      "cards": [
        { "icon": "FaCommentDots", "title": "Owners can't read graphs", "text": "A rising line could be a leak or just the season." },
        { "icon": "FaEuroSign", "tone": "amber", "title": "Support calls cost money", "text": "Every unclear graph becomes a phone call." } ],
      "notes": "Two problems the company told us about." },
    { "type": "results", "title": "Tested on real data",
      "table": { "header": ["Case", "Result", "Sure"], "colW": [2.4, 2.6, 0.9],
                 "rows": [["Whole roof, summer", "Seasonal change", "91 %"], ["Sensor A", "Sensor check", "91 %"]] },
      "bigStat": { "value": "0", "label": "standard alarms in one year", "insight": "Yet two real issues were found." },
      "notes": "Zero alarms, but the app still found real issues." },
    { "type": "close", "icon": "FaTint", "title": "Q&A", "subtitle": "Leak Watch: your roof, in plain words.",
      "footer": "Adil Ary · github.com/… · demo link", "notes": "Thank you. Questions?" }
  ]
}
```
Screenshots to take: `shots/home.png`: the app's home screen with the status line visible.

## 5. Checklist before you hand it over

- [ ] Valid JSON (no comments, no trailing commas).
- [ ] Every number matches `scenes.json` and the project's real results; nothing invented.
- [ ] 8–11 slides, each with `notes`; text short (rules above).
- [ ] Every `image` path is under `shots/`, and you listed what to capture for each.
- [ ] The person runs `npm run build` in the deck folder and reads its WARN lines.
