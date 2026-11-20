# Progress: Broadband Gap Finder video

## Status
- **All steps done; Adil accepted the video on 2026-11-02.** `out/video.mp4`: 104.7 s, 1920×1080, 30 fps, rendered in 186 s. 9 scenes. Adil also keeps a copy of the earlier plum-background version.
- **Regression check passed (2026-11-02):** `examples/sense-coach/`, rendered with the changed engine in a temporary copy, is byte-identical to its reference (same SHA-256, 2,144 frames). Deliberately breaking the copy changed the output, so the check did use the new code. The example's cards were already equal in height, and it doesn't use `marker` or a wrapped footer.
- **Instructions updated (2026-11-02):** `SCENES_FORMAT.md` (one header for both repos, 120 s maximum, scene length, first-sentence rule, desktop recording, light theme, figures never rounded), `CLAUDE.md` and `TEMPLATE.md`, after review by the production chat. The guide is copied to production. `Templates` is deliberately untouched.
- **Still open:** in the production repo, `docs/SCENES_FORMAT.md` is copied but not committed, and `pitch/scenes.json` is older than the `scenes.json` here.
- **Length:** 104.7 s with the final voice, over the 90 s in `CLAUDE.md`. Adil decided to keep it: the real maximum is 120 s.

## Flags from step 1
- Nothing is too long, and no narration has digits.
- All claims trace to `pitch/facts.md` in the production repo.
- `frame` is `"browser"`, not the format guide's `"phone"`: the demo is the map and card side by side, and a phone view stacks the card below the map, off-screen.
- The narration says "south-west Finland" because "Varsinais-Suomi" may be mispronounced. The name shows in the recorded app.
- `theme` uses plum `#792A59` and pink `#F5409A`, sampled from Adil's dna.fi screenshot, with the guide's default amber for `warn`. Pink on plum is about 3:1 contrast: check it in preview.

## Clips to record (save in `public/clips/`)
Use a maximised browser with graphics acceleration on and the app at https://broadband-gap-finder.streamlit.app/. Open it first so it wakes up. Leave the mouse still at the start of each clip, since `trimStart` skips 0.5 s.

| File | Scene | Screen and actions | About |
|---|---|---|---|
| `c1_map.mp4` | s04 | Scroll so the legend and whole map are in view. Slowly hover a teal square, then a purple one, so the tooltips show. | 10 s |
| `c2_click.mp4` | s05 | Start with another square on the card: click a purple ring first, before recording. Then click the big red ring west of Turku and hold still on the Naantali card. | 17 s |
| `c3_export.mp4` | s07 | Scroll down to the shortlist, pause on the table, then click "Download shortlist (CSV)". | 7 s |

Then check them with `npm run check`, and get crop values with `npm run crop -- clips/<file>.mp4`.

## Voice
```powershell
npm run voice
```
The ElevenLabs key goes in `.env`. Listen and redo single scenes with `--only`.

## Log
- 2026-11-02: script copied in and checked; clip list written.
- 2026-11-02: step 3. All clips use `"frame": "none"` and one crop (no browser bars, Streamlit badge or profile picture), which also makes them larger than the `"browser"` frame. Timing per clip:
  - `c1_map`: `speed` 2.5, so the "thin data" tooltip lands on those words.
  - `c2_click`: `trimStart` 8.5, `speed` 4.5. The app takes about 5 s to answer the click, so this hides the wait; the card changes on "residents" and the last frame holds.
  - `c3_export`: `trimStart` 12.6; the click lands on "exports". Added a zoom to the button.
- 2026-11-02: changes beyond the script. s09 "Not claimed" had ✓ marks, which read as claims: added an optional `marker` to `twoColumns` (✕ here). Attribution footer split into two lines (`\n`, wider footer). s02 "Too coarse" is now "Too coarse to target", so the cards match in height. s10: URL appears on "know", `padSeconds` 1.5, fade at 90%, because it was only visible for 0.4 s. `SCENES_FORMAT.md` updated and copied to the production repo (not committed there). `examples/sense-coach/` not re-rendered.
- 2026-11-02: step 4, Adil's first preview notes.
  - Flashes on clip scenes: `Video.tsx` no longer uses TransitionSeries, which remounted scenes at each crossfade. It now uses plain `Sequence`s with an opacity fade and `premountFor`. A full render showed no one-frame flashes (frame-difference check). Studio playback passed only an element check on one transition, so Adil still has to confirm it by eye.
  - s03: added a "Fixed wireless" card for the 5.5 s that had nothing on screen; cards in a row now share one height.
  - s07: `padSeconds` 1.7, `trimStart` 12.2, because it felt cut off.
  - s08: "Public data" lights first, "Rules" on "decide", because it seemed to start from the middle.
- 2026-11-02: s07 and s08 fused into a new s07 over `c3_export`, after Adil found both too short (the id s08 is gone; s09 and s10 keep theirs). The script now differs from the production repo's `pitch/scenes.json`. The pipeline visual and its "AI never decides the rank" badge are gone. 
- 2026-11-02: Adil picked a new voice ID and regenerated all scenes. It runs at about 125 words/min (target 140), so the video is now 104.7 s, over the 90 s goal; Adil hasn't decided what to do about that. Clips retimed: `c1_map` `speed` 1.75; `c2_click` `trimStart` 8.5, `speed` 3; `c3_export` `trimStart` 7, `speed` 0.6, with the click on "exports". `out/video.mp4` rendered in 196 s. Adil keeps this length: the real maximum is 120 s, and 90 s was a safety margin.
- 2026-11-02: theme changed from a plum background to off-white `#F6F3F5` with white panels, DNA pink `#DC016F` as accent only, plum `#792A59` for the attribution, text `#180D0A`. Adil found the solid plum heavy. Near-black was compared and rejected: the white app clips would jump out against it, and dark backgrounds wash out on a venue projector. Not tested on a real projector.
- Known and left alone: the s10 caption breaks as "you are. Thanks for watching.", because the first sentence is longer than one caption page. Fixing it means rewording the narration and a new voice take.
