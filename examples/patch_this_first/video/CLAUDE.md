# CLAUDE.md: Patch This First video

## Goal
Make a 40 s target, 60 s maximum, 1920×1080, 30 fps product video for Patch This First from `scenes.json`, using the existing video engine in this repo: ElevenLabs voice-over, visuals synced to the spoken words, screen recordings, captions, rendered with Remotion. **No manual video editor.**

Time budget: 3 hours (template default; Adil may shorten it) from finished `scenes.json` to mp4. If it runs over, tell me what's left and what you'd cut.

## About me
- Adil, embedded systems engineer. Comfortable with Python and C, newer to React/TypeScript: keep changes simple, tell me exactly what to run.
- Everything runs **locally**: Windows, PowerShell, Lenovo Legion Y540, i5-9300H, 16 GB RAM, GTX 1650. Render with `--concurrency=2` (the default in `npm run render`); try `npx remotion render Video out/video.mp4 --concurrency=4` only if renders are too slow.

## Project context
- What it is: a local web app that matches a pasted software list against the programs attackers are already exploiting (CISA KEV), so a small organisation's part-time IT person knows the three things to patch this week, in Finnish or English.
- For whom: the office manager or teacher who does the IT on the side (no security vocabulary, ~30 min a month); judged by Traficom NCSC-FI mentors (mock challenge, template test 2026-11-03).
- Key facts/numbers allowed in the video: see `scenes.json`; the full list is `../production/pitch/facts.md` (KEV 2026.10.30, EPSS 2026-11-02). Sample list (invented 12-person office): 16 programs, 13 matched, 3 not matched; top 3 = FortiGate firewall, Windows 11, Windows 10, each with a flaw used in ransomware; Windows 11 and 10 share 203 flaws, so 2 distinct updates.
- Must be stated or kept true: the sample list is invented; 2 distinct updates, not 3; versions are not checked; unmatched programs are never called safe; the AI sees only four public facts, never the list. Credit on screen: "CISA KEV 2026.10.30 (CC0 1.0)" and "EPSS by FIRST.org, 2026-11-02"; no CISA logo, no wording that implies CISA or Traficom endorsement. Never claim "you are vulnerable", "risk", users, customers, prices, or real-phone testing.
- Theme: light. Background `#FFFFFF`, text `#1B1F24`, accent `#0B5CAD`, warning `#C0392B` (as in `scenes.json`). Not Traficom's branding.
- Links: demo: none (runs locally, `streamlit run app.py`) · repo: to be added
- Production repo: `../production`. If a chat can't reach it, ask me for access.
- Voice: Daniel (onwK4e9ZLuTAKqWW03F9), 127 words/min.
- **Use only facts from `scenes.json` and this section. Never invent numbers or claims.**

## The engine (already built: read `TEMPLATE.md` and `SCENES_FORMAT.md` first)
- `scenes.json` → content: narration, visual type, word cues per scene. `examples/sense-coach/` is a complete working example.
- `npm run check` → validates scenes.json (unknown visuals, cue words not in narration, missing files, scenes under 5 s, empty screens, hard-to-read colours, total length).
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
1. **Check:** read `scenes.json`, run `npm run check`, fix format problems. Flag (don't silently change) narration that's too long for the target length (at the voice's measured words/min, or ~140 if not measured), numbers not written as words, or claims not backed by the project context. Also flag an opening that doesn't answer the audience's first question.
2. **Voice:** ElevenLabs: I run `npm run voice` (key is in `.env`). Own voice: I record into `recordings/`, then run `npm run timing:whisper`; any WARNING means re-record that scene. I listen; single scenes are redone with `--only` if needed. New voice: test it on the hardest scene first. After the voice is final, recheck the total length against the target and maximum, and flag any scene under 5 s; clip timing is set after this, and redone if the voice changes.
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