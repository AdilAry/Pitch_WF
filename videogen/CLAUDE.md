# CLAUDE.md: [PROJECT NAME] video

## Goal
Make a [90 s] target, [120 s] maximum, 1920×1080, 30 fps product video for [PROJECT NAME] from `scenes.json`, using the existing video engine in this repo: ElevenLabs voice-over, visuals synced to the spoken words, screen recordings, captions, rendered with Remotion. **No manual video editor.**

Time budget: [3 hours] from finished `scenes.json` to mp4. If it runs over, tell me what's left and what you'd cut.

## About me
- Adil, embedded systems engineer. Comfortable with Python and C, newer to React/TypeScript: keep changes simple, tell me exactly what to run.
- Everything runs **locally**: Windows, PowerShell, Lenovo Legion Y540, i5-9300H, 16 GB RAM, GTX 1650. Render with `--concurrency=2` (the default in `npm run render`); try `npx remotion render Video out/video.mp4 --concurrency=4` only if renders are too slow.

## Project context
- What it is: [one sentence]
- For whom: [users]
- Key facts/numbers allowed in the video: [list, or "see scenes.json"]
- Must be stated or kept true: [limits, caveats, required attribution, things never to claim]
- Theme: [the app's colour values, unchanged]
- Links: demo [URL] · repo [URL]
- Project repo: [its path, e.g. `../project`]. If a chat can't reach it, ask me for access.
- Voice: [ID name], [measured] words/min.
- **Use only facts from `scenes.json` and this section. Never invent numbers or claims.**

## The engine (already built: read `TEMPLATE.md` and `SCENES_FORMAT.md` first)
- `scenes.json` → content: narration, visual type, word cues per scene. `examples/sense-coach/` is a complete working example.
- `npm run check` → validates scenes.json (unknown visuals, cue words not in narration, missing files, scenes under 5 s, empty screens, hard-to-read colours, total length).
- Voice:
  - ElevenLabs: `npm run voice` → `public/audio/`, `public/timing/` (cached; `--only s03`, `--force`).
  - Own voice (backup, per scene): I save `recordings/<scene id>.m4a|wav|mp3`; `npm run timing:whisper` → word timings aligned to the narration, volume boosted automatically. Scenes with a recording use it; scenes without keep ElevenLabs. `npm run voice` never overwrites recordings.
- Clips: `npm run crop -- clips/<file>.mp4 [x1 y1 x2 y2]` → `crop` values for scenes.json.
- `npm run preview` → Remotion Studio. `npm run render` → `out/video.mp4`.
- API notes: `docs/remotion.md`, `docs/eleven_labs.md`; this laptop: `docs/laptop.md`. They are copies of the files in the Pitch_WF kit's `docs/tools/`.
- **`SCENES_FORMAT.md` is edited here** (when the engine or the writing rules change). After changing it, copy it to the project repo's `docs/SCENES_FORMAT.md`, which `/present` uses to write `scenes.json`.
- **`scenes.json` here is the master once it's copied in.** Script changes happen here; after the render, copy it back as an exact file copy to the project repo's `pitch/scenes.json`.
- Visual types, cue actions and the scenes.json format are documented in `TEMPLATE.md` and `src/visuals/`. Reuse them; add a new visual type only if a scene truly needs one, and add it the same way (props from scenes.json, frame-driven animation, cues via `frameOfWord`).

## Steps for this video (stop after each, tell me how to check it)
Start a fresh chat before step 3, with `PROGRESS.md` updated first. Steps 1–2 are too small to need their own chats.
1. **Check:** read `scenes.json`, run `npm run check`, fix format problems. Flag (don't silently change) narration that's too long for the target length (at the voice's measured words/min, or ~140 if not measured), numbers not written as words, or claims not backed by the project context. Also flag an opening that doesn't answer the audience's first question or never names the problem, and a name made of everyday words that isn't in single quotes (`SCENES_FORMAT.md` rules 5 and 8).
2. **Voice:** ElevenLabs: I run `npm run voice` (key is in `.env`). Own voice: I record into `recordings/`, then run `npm run timing:whisper`; any WARNING means re-record that scene. I listen; single scenes are redone with `--only` if needed. New voice: test it on the hardest scene first. After the voice is final, recheck the total length against the target and maximum, and flag any scene under 5 s. Before the voice is final, a clip gets only its `crop`: `trimStart` and `speed` wait for step 3, and are redone if the voice changes.
3. **Visuals:** wire every scene to its visual + cues; add screen clips from `public/clips/` with trim/speed/zoom. Camera footage of a physical device (hardware projects) uses `"frame": "none"`, see `TEMPLATE.md` §2b. Theme from `scenes.json` ("theme": colours of the project/company). Read the text visible in each clip against the project context, and flag anything wrong or awkward; don't assume the clip is fine because the narration is.
4. **Preview pass:** list anything off (cue not landing, text overflow, clip too short) and fix it.
5. **Render:** `npm run render`; report duration and render time.

## Rules
- Animations frame-driven only (`useCurrentFrame`, `interpolate`, `spring`); no CSS animations or timers.
- Design: one font, body ≥ 48 px, titles ≥ 96 px, calm motion (0.3–0.6 s), transitions ≤ 0.4 s, no music unless asked.
- No secrets anywhere except `.env`; never print it. `.env`, `out/`, `public/audio/`, `public/clips/`, `recordings/`, `whisper.cpp/` stay out of git.
- Don't add libraries without asking. Don't refactor the engine while a video is due: smallest change that works. Engine improvements go in their own session, with `npm run regress` afterwards as the regression check.
- **Look, don't dump:** never print whole files or long logs (render, whisper) into the chat; save long output to `out/` and show the end of it.
- **Chat replies:** answer first, then what to run. No preamble, no recap of the diff, no closing offers.
- **One branch:** commit directly to `main`. No other branches unless I ask.
- On errors: exact error + smallest fix. Commit after each step. Note what you did in PROGRESS.md.