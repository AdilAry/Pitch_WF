# Pitch deck template

One command turns `deck.json` (the content) into `pitch.pptx` (the slides), in the Sense Coach style: navy and teal, 16:9, with speaker notes.

```
deck/
  build.js            the builder (don't need to touch)
  deck.json           BLANK template with [placeholders]; fill this at the event
  shots/              put screenshots here (create the folder)
  example/            the Sense Coach deck rebuilt with this template
    deck.json
    shots/
```

## Setup (once, now)
1. Install Node.js 18+ (you already have it from Remotion).
2. In this folder: `npm install`
3. Test: `npm run example`, which builds `example/Sense_Coach.pptx`. Open it to check.

## At the event (≈ 15 min)
1. Take screenshots of the app and save them in `shots/` (names used in deck.json: `feature.png`, `demo.png`, `report.png`; change as you like).
2. Fill `deck.json`: `/present` does this from `docs/PITCH.md` and `docs/DECK_FORMAT.md`, replacing every [placeholder].
3. `npm run build` → `pitch.pptx`. Read the WARN lines: missing screenshots become labelled grey boxes, unknown icons become circles.
4. Upload `pitch.pptx` to Google Slides (File → Import slides, or open it from Drive) for final touches, then download as PDF for the submission.
   - Offline fallback (no Google Slides needed): LibreOffice is installed, so `& "C:\Program Files\LibreOffice\program\soffice.exe" --headless --convert-to pdf pitch.pptx` writes `pitch.pdf` next to it. Check it page by page: LibreOffice shrinks long text to fit, Google Slides may not.

## Slide types
Every slide has `type`, `title` (except title/close) and optional `notes`. You can add, remove or reorder slides freely.

| type | Use for | Fields |
|---|---|---|
| `title` / `close` | First / last slide (dark) | `icon`, `title`, `subtitle`, `footer`, `image` (optional) |
| `cards` | Problem, 2–4 side-by-side points | `cards[] {icon, title, text, tone}`, `footnote` |
| `list` | Who it's for, features | `items[] {icon, title, text, tone}` (2–4) |
| `statement` | The idea in one sentence (dark) | `sentence`, `chips[]` (≤3), `image` (optional) |
| `demo` | Data + demo moments | `image`, `heading`, `subheading`, `stats[] {value, label}` (≤3), `moments[] {title, text, tone}` (≤4), `caption`, `imageLarge` (desktop screenshot; ≤3 moments) |
| `pipeline` | How it works | `steps[] {title, text}` (3–4), `highlight` (index, 0 = first), `callout {bold, text}` |
| `results` | Validation table + big number | `table {header[], rows[][], colW[]}`, `bigStat {value, label, insight}` |
| `business` | Value / business model | `cards[] {icon, title, text}` (3, middle highlighted), `image`, `takeaway` |
| `pilot` | How the company can test it | `pilot[]` (bullets), `image` (optional), `hypotheses[] {title, measure}` (≤4) |
| `twoColumns` | Limits / next steps | `left {heading, items[]}`, `right {heading, items[]}` |

- **Icons:** Font Awesome names from react-icons, e.g. `FaBolt`, `FaRobot`, `FaMicrochip`, `FaLeaf`, `FaShieldAlt`. Browse: https://react-icons.github.io/react-icons/icons/fa/
- **Tones:** `teal` (default), `amber` (attention), `green` (ok), `red`, `navy`.
- **Colours:** add `"colors": { "teal": "7B2CBF" }` at the top level to restyle the whole deck (e.g. to match a company's brand).
- **Images:** leave `"image"` out to get a slide without a screenshot; a path that doesn't exist yet gives a placeholder box.
- **Text too long?** Boxes shrink text to fit, but short is better: aim for ≤ 20 words per field.

## Tips
- Fill the deck **after the feature freeze**, when screenshots won't change.
- Keep it to 8–11 slides; `docs/DECK_FORMAT.md` lists the slides the live talk uses.
- Set the deck's and video's colours from the same values, so they look like one project.
