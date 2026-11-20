# CLAUDE.md: Broadband Gap Finder video

## Goal
Make a **90 s target, 120 s maximum, 1920×1080, 30 fps** product video for **Broadband Gap Finder** from `scenes.json`, using the existing video engine in this repo: ElevenLabs voice-over, visuals synced to the spoken words, screen recordings, captions, rendered with Remotion. **No manual video editor.**

Time budget: **3 hours** from finished `scenes.json` to mp4. If it runs over, tell me what's left and what you'd cut.

## About me
- Adil, embedded systems engineer. Comfortable with Python and C, newer to React/TypeScript: keep changes simple, tell me exactly what to run.
- Everything runs **locally**: Windows, PowerShell, Lenovo Legion Y540, i5-9300H, 16 GB RAM, GTX 1650. Render with `--concurrency=2` (the default in `npm run render`); try `npx remotion render Video out/video.mp4 --concurrency=4` only if renders are too slow.

## Project context
- What it is: a map tool that ranks 1 km squares in Varsinais-Suomi where people live with slow fixed broadband but mobile may be fast nearby, so that DNA's sales team can pick next quarter's 5G fixed-wireless campaign areas without guessing from municipal averages. Built as a dry run for Since AI 2026, on the mock DNA challenge "Broadband gap finder".
- For whom: DNA's regional sales managers (choosing campaign areas) and network planners (checking how the mobile network performs in an area).
- Key facts/numbers allowed in the video (see also `scenes.json`):
  - Data: Speedtest by Ookla open data, 2026 Q3; Statistics Finland 1 km population grid, 2025 edition. 7,791 inhabited squares, 491,224 residents, 27 municipalities.
  - Labels (squares): Strong FWA candidate 2, Candidate, mobile unproven 9, Thin data 1,025, Not a gap 409, No data 6,346.
  - Rules: slow fixed is under 30 Mbit/s; strong mobile nearby is at least 100 Mbit/s from at least 10 tests, in a 3 × 3 km area; under 10 fixed tests is thin data. Score = residents × gap, used only to sort. These thresholds are the builder's own choices.
  - Shortlist of 20: 1 passes every rule, 4 have unproven mobile, 15 are slow but rest on thin data (leads to check, not findings). 1,379 residents in total. Rank 1: Naantali, 14 residents, fixed 16.9 Mbit/s from 220 tests, mobile nearby 111.1 Mbit/s from 16 tests.
  - AI: Gemini only rewords the computed facts of one square; code checks the numbers; the rules decide every label and rank.
  - Privacy: squares under 10 residents never enter the shortlist or export, and their residents and speeds are not shown.
- Must be stated or kept true in the video:
  - Speed tests don't say which operator was tested: they show what people in an area experience, not DNA's or any operator's coverage. Never claim coverage.
  - Show the attribution: "Speedtest® by Ookla® open data, CC BY-NC-SA 4.0" and "Statistics Finland, 1 km population grid, CC BY 4.0".
  - Don't use the challenge's example card numbers (they're the mentor's, not ours), and don't say DNA uses or endorses this tool.
- Theme: app colours are pink `#DC016F`, plum `#792A59`, text `#180D0A`, on white. Map squares: strong candidates are red.
- Links: demo https://broadband-gap-finder.streamlit.app/ · repo https://github.com/AdilAry/production
- **Use only facts from `scenes.json` and this section. Never invent numbers or claims.**

## The engine (already built: read `TEMPLATE.md` and `SCENES_FORMAT.md` first)
- `scenes.json` → content: narration, visual type, word cues per scene. `examples/sense-coach/` is a complete working example.
- `npm run check` → validates scenes.json (unknown visuals, cue words not in narration, missing files).
- Voice:
  - ElevenLabs: `npm run voice` → `public/audio/`, `public/timing/` (cached; `--only s03`, `--force`).
  - Own voice (backup, per scene): I save `recordings/<scene id>.m4a|wav|mp3`; `npm run timing:whisper` → word timings aligned to the narration, volume boosted automatically. Scenes with a recording use it; scenes without keep ElevenLabs. `npm run voice` never overwrites recordings.
- Clips: `npm run crop -- clips/<file>.mp4 [x1 y1 x2 y2]` → `crop` values for scenes.json.
- `npm run preview` → Remotion Studio. `npm run render` → `out/video.mp4`.
- API notes: `docs/remotion.md`, `docs/eleven_labs.md`; this laptop: `docs/laptop.md`. They are copies of the files in the production repo's `docs/`.
- **`SCENES_FORMAT.md` is edited here** (when the engine or the writing rules change). After changing it, copy it to the production repo's `docs/SCENES_FORMAT.md`, which the production chat uses to write `scenes.json`.
- **`scenes.json` here is the master once it's copied in.** Script changes happen here; after the render, copy it back as an exact file copy to the production repo's `pitch/scenes.json`.
- Visual types, cue actions and the scenes.json format are documented in `TEMPLATE.md` and `src/visuals/`. Reuse them; add a new visual type only if a scene truly needs one, and add it the same way (props from scenes.json, frame-driven animation, cues via `frameOfWord`).

## Steps for this video (stop after each, tell me how to check it)
Start a fresh chat before step 3, with `PROGRESS.md` updated first. Steps 1–2 are too small to need their own chats.
1. **Check:** read `scenes.json`, run `npm run check`, fix format problems. Flag (don't silently change) narration that's too long for the target length (~140 words/min), numbers not written as words, or claims not backed by the project context.
2. **Voice:** ElevenLabs: I run `npm run voice` (key is in `.env`). Own voice: I record into `recordings/`, then run `npm run timing:whisper`; any WARNING means re-record that scene. I listen; single scenes are redone with `--only` if needed. New voice: test it on the hardest scene first. After the voice is final, recheck the total length (target 90 s, maximum 120 s) and flag any scene under 5 s; clip timing is set after this, and redone if the voice changes.
3. **Visuals:** wire every scene to its visual + cues; add screen clips from `public/clips/` with trim/speed/zoom. Camera footage of a physical device (hardware projects) uses `"frame": "none"`, see `TEMPLATE.md` §2b. Theme from `scenes.json` ("theme": colours of the project/company).
4. **Preview pass:** list anything off (cue not landing, text overflow, clip too short) and fix it.
5. **Render:** `npm run render`; report duration and render time.

## Rules
- Animations frame-driven only (`useCurrentFrame`, `interpolate`, `spring`); no CSS animations or timers.
- Design: one font, body ≥ 48 px, titles ≥ 96 px, calm motion (0.3–0.6 s), transitions ≤ 0.4 s, no music unless asked.
- No secrets anywhere except `.env`; never print it. `.env`, `out/`, `public/audio/`, `public/clips/`, `recordings/`, `whisper.cpp/` stay out of git.
- Don't add libraries without asking. Don't refactor the engine while a video is due: smallest change that works. Engine improvements go in their own session, with `examples/sense-coach/` re-rendered afterwards as the regression check.
- **Look, don't dump:** never print whole files or long logs (render, whisper) into the chat; save long output to `out/` and show the end of it.
- **Chat replies:** answer first, then what to run. No preamble, no recap of the diff, no closing offers.
- On errors: exact error + smallest fix. Commit after each step. Note what you did in PROGRESS.md.