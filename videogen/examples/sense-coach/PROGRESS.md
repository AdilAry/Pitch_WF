# PROGRESS

## 2026-10-15 · M1: setup + data-driven skeleton

**Done**
- Remotion 4.0.535 blank TypeScript project (`create-video --blank`) set up in this folder; CLAUDE.md and scenes.json kept as they were.
- npm scripts: `preview` (Studio), `render`, `check`, `lint`. (`voice` comes in M2.)
- `.gitignore`, `.env.example`, `docs/remotion.md` (confirmed API notes + sources).
- `src/scenes.ts` loads scenes.json (Studio reloads when you save it); `src/types.ts` describes the format.
- `src/theme.ts`: colours from scenes.json `theme`, Inter font, sizes (titles 120 px, body 48 px).
- `src/timing.ts`: scene length = `estSeconds + padSeconds`; `frameOfWord(sceneId, word, occurrence)` **estimates** word times from the word's position in the narration (M3 swaps in real ElevenLabs timings, same function).
- `src/cues.ts`: resolves `atWord` / `occurrence` / `atFraction` / `offsetSeconds` to frames; `show`, `hide`, `highlight`, `fadeOut` helpers; unknown actions warn once, never crash.
- Visuals: `title`, `cards`, `counters`. Every other type shows a labelled placeholder listing its cues (they light up at their frame).
- Compositions: `Video` (all scenes, 84 s at estimated lengths) and `Scene` (one scene; set `sceneId` in the Props panel).
- `scripts/check-scenes.ts`: unknown visual types, cue words not in narration (incl. wrong `occurrence`), missing clip/image/music files, duplicate/invalid ids, bad `atFraction`, zoom without target, digits in narration (warning).

**Verified**
- `npm run lint` (eslint + tsc) clean.
- `npm run check` → 1 expected error: `public/clips/c1_home.mp4` not recorded yet.
- Stills rendered for s01, s03, placeholder scenes, and counters (tested by temporarily switching s05 to counters; scenes.json restored).
- Studio loads `Video` (01:24) and `Scene` with no console errors.

**Failed / notes**
- `docs/laptop.md` and `docs/elevenlabs.md` don't exist yet (no `docs/` folder was in the repo). elevenlabs.md is written in M2.
- Added `@types/node` (dev, types only) so TypeScript understands `fs`/`path` in scripts/.
- npm 11 blocked esbuild's postinstall script; tsx works without it.

**Next: M2 (voice)**: `scripts/voice.ts` + `docs/elevenlabs.md`, test on s01 and s05 first. Needs `.env` with your ElevenLabs key + voice id, and `dotenv`.

## 2026-10-21 · between M1 and M2

**Done**
- Your screen recording (home screen, 11.5 s, 1920×1032 @ 30 fps) moved from the repo root to `public/clips/c1_home.mp4` and used for **s04** (its narration matches the screen; s01 stays the title card). `npm run check` now passes: 0 errors.
- Restored `.env.example` (empty template, kept for reuse at Junction); your `.env` is untouched and ignored by git.
- Committed your changes: CLAUDE.md "how to test" rule, `dotenv` dependency, `docs/laptop.md`.

**Notes for M4 (clip visual)**
- Crop off Edge's tab bar + address bar: page content starts at y ≈ 100 px. The app column sits at roughly x 685–1225, which fits the `phone` frame s04 asks for.
- Clip after `trimStart 0.5` at `speed 1.25` lasts ~8.8 s, but s04 is ~10 s: hold the last frame (or slow down) when the clip is shorter than the scene.
- The recording has an audio track; clips are muted anyway.

**Next: M2 (voice)**.

## 2026-10-21 · M2: voice (in progress)

**Done**
- CLAUDE.md: spelling fixes and M5 list formatting (content unchanged).
- `docs/elevenlabs.md`: request/response format confirmed from the official API reference (with-timestamps endpoint, `xi-api-key`, `previous_text`/`next_text`, character `alignment`).
- `scripts/voice.ts` + `npm run voice` (`--only s01,s05`, `--force`): mp3 → `public/audio/`, word timings → `public/timing/`, hash cache, prints characters sent, clear errors for missing `.env`/empty keys/unknown ids/HTTP errors. Key never printed.
- `TimingFile` type added to `src/types.ts` (used in M3).

**Failed**
- First real call (s01) → HTTP 401 `missing_permissions`: the API key doesn't have the **Text to Speech** permission. Nothing was generated, so no credits were spent.

**Next**
- Adil: give the key Text to Speech access (or create a new key with it), then `npm run voice -- --only s01,s05` and listen.
- Then all scenes, then M3.

## 2026-10-21 · M2: voice (continued)

**Done**
- API key permission fixed and voice ID changed by Adil (the earlier voice isn't available on the free plan).
- s01 + s05 generated and checked: words group correctly, `durationSeconds` matches ffprobe within 0.03 s.
- Narration edits after listening: s01 no longer introduces Adil by name; s05 says "real data" instead of "VILPE's real data" (TTS mispronounces VILPE). Both regenerated (263 chars).
- Timing JSON files committed (public/timing/); mp3s stay ignored.

**Open**
- "VILPE" is still spoken in s02 (twice), s06 and s07. Decide: reword or keep, before generating all scenes.

**Next**: all scenes (`npm run voice`), then M3.
- Spoken "VILPE" removed from s02, s06, s07 ("Smart sensors…", "the manufacturer"); on-screen VILPE text unchanged.
- **All 8 scenes generated** (810 chars this run; s01/s05 cached). Speech total 73.3 s → ~75.7 s with padding (target 75–90 s).
- M4 note update: s04 audio is 7.1 s, so the clip (~8.8 s after trim + 1.25× speed) is now *longer* than the scene; it will simply be cut at the scene end (or raise `speed`).

**M2 done.** Next: M3 (durations from timing files, word cues, captions).

## 2026-10-21 · M3: sync + captions

**Done**
- `src/timing.ts`: `loadTimings()` fetches `public/timing/<id>.json` (and checks the mp3 exists) in `calculateMetadata`; timings travel to the compositions as a prop. Scene length = `durationSeconds + padSeconds`; scenes without a timing file still use `estSeconds`.
- `frameOfWord(sceneId, word, occurrence)` now uses the real word start times; captions and all cues go through `sceneWords()`.
- Voice-over plays per scene (`<Audio>` from `@remotion/media`, added at 4.0.535, a Remotion package).
- `src/Captions.tsx`: 1–2 line pages (break at sentence end or ~64 chars), bottom centre, current word in accent; off when `meta.captions` is false. Visuals get a 220 px strip kept free at the bottom so captions never cover footers.
- `npm run check` now also warns when a timing file is missing/outdated (narration edited after `npm run voice`) or its mp3 is missing; `npm run check -- --cues` lists the exact second/frame every cue fires.
- `Scene` composition: default props are now a plain literal so Studio can save an edited `sceneId`.

**Verified**
- lint + tsc clean; `npm run check` 0/0; total video ≈ 75.7 s.
- Cue table: all 26 cues resolve to their word (e.g. s03 card 0 at "roof" 3.60 s / frame 108).
- Stills: s01 title + caption with "building," highlighted at frame 60; s03 card 0 shown at frame 125 with caption "Is my roof OK?".
- Test render of frames 0–150 (13.6 s incl. bundling): mp4 has an audio stream with speech in s01, a short gap, then s02 starting.
- Studio: captions visible, audio tracks in the timeline, no console errors.

**Next: M4** (remaining visuals, clip trim/crop/zoom, transitions, full render).

## 2026-10-21 · M3 fixes after Adil's listening test (Studio)

**Problems reported**: long, awkward gaps between scenes; a cut "s"-like noise at ~16 s, ~46 s and ~1:10.

**Cause (measured in the mp3s)**
- Gaps: each file ends with 0.2–0.9 s of silence, + 0.3 s pad → ~1.3 s between scenes.
- Noises: s02, s05 and s07 end with a 10–60 ms fragment after ~150 ms of silence, cut off mid-sound. It's the start of the *next* scene's text bleeding in (we send `next_text` for flow). The noise times match exactly the ends of s02 (16.65 s), s05 (46.65 s) and s07 (71.1 s) in the old timeline.

**Fix**
- `scripts/speech-bounds.ts`: decodes the mp3 with Remotion's bundled ffmpeg, finds the real speech (10 ms loudness windows), drops a <120 ms fragment at either edge, keeps 50 ms before / 120 ms after the speech.
- `npm run voice` stores `audioStart`/`audioEnd` in each timing file (word times stay in file time). Existing files were updated for free (cache hit → re-measured); `--retrim` re-measures on demand.
- Remotion plays only that part (`trimBefore` + `durationInFrames`, 2-frame fade in / 3-frame fade out); words shift into scene time; scene length = speech + `padSeconds`.

**Verified**
- Full soundtrack render (wav, 24 s to render): no short bursts anywhere; pauses at scene changes ≈ 0.45 s, the same as pauses between sentences inside a scene.
- Video is now 70.6 s (was 75.7 s). Slightly under the 75–90 s target; raise `meta.padSeconds` in scenes.json if you want more breathing room (each +0.1 s adds 0.8 s in total).

**Next**: Adil listens in Studio; then M4.

## 2026-10-21 · pacing tweaks after second listening test

- New optional per-scene `"padSeconds"` (overrides `meta.padSeconds`; validated by check). s01 (intro) and s07 (before the outro) use 0.8 s → measured pauses 0.92 s and 0.95 s; other scene changes stay ≈ 0.46 s.
- s08 regenerated (`--force`, 59 chars) because "your building, explained" had a strange pitch. Old take kept as `public/audio/s08.previous.mp3` for comparison (gitignored; delete when done).
- Video length 71.8 s (shorter than target is fine per Adil).

**Next**: Adil checks the new s08 take; then M4.
- s08 take 2 still had the odd pitch. New optional per-scene `"voiceContext": false` (skips `previous_text`/`next_text`; only enters the hash when false, so other scenes stay cached). s08 regenerated with it (take 3, 59 chars). Take 2 kept as `public/audio/s08.take2.mp3`.
- s08 take 3 approved by Adil.

## 2026-10-21 · M4: all visuals + clips + transitions

**Done**
- New visuals: `chart` (line draws itself; `questionMark`, `seasonBand`, `phoneIcon`), `dotmap` (grid + counters + highlighted dots with label cards), `pipeline` (boxes/arrows light up, `badge`), `twoColumns` (`left`/`right`/`footer`, items appear one by one), `bigStat`, `image`, `clip`. No placeholders left in this video.
- `clip`: `<Video>` from `@remotion/media`, muted, `trimStart`/`trimEnd`/`speed`, `frame: phone|browser|none`, `zoom` cues (smooth 0.6 s). New `crop` prop (fractions of each side); s04 uses it to cut off Edge's tab/address bar and keep the app column. Remotion's own crop props only hide pixels, so `Cropped.tsx` reads the media size and does a proper "cover" crop.
- Transitions: 0.4 s crossfade (`@remotion/transitions`, added at 4.0.535). Each scene is extended by the transition length, so voice timing and the tuned pauses are unchanged; the old caption disappears when the next scene starts (no overlapping captions).
- `check-scenes` validates `crop`.

**Verified**
- lint + tsc clean; `npm run check` 0/0.
- Stills of every scene (s02 chart, s04 phone clip before/after zoom, s05 dotmap, s06 pipeline, s07 columns, mid-transition s01→s02).
- **`npm run render` → `out/video.mp4`: 1 min 51 s render time** (2144 frames, concurrency 2, 8 GB laptop), 1920×1080 30 fps H.264 + AAC, 71.5 s, 8.1 MB.

**Notes**
- dotmap highlight positions are not in the data, so each highlight id gets a fixed pseudo-random dot.
- The s04 recording runs ~8.8 s (after trim + 1.25×) but the scene is ~7.6 s, so its end is cut; fine for this video.

**Next: M5** (TEMPLATE.md + SCENES_FORMAT.md), then the timed run.

## 2026-10-21 · M5: template + writer's guide

**Done**
- `TEMPLATE.md`: one-time setup, new video → check → record clips → crop → voice → preview → render, measured step times (render 1 min 51 s for 71.5 s), and a common-fixes table built from the real problems in this practice (401 permission, mispronounced names, odd pitch, gaps, cut noises, browser bars, editor overwrites…).
- `SCENES_FORMAT.md`: standalone guide for the writer (format, narration rules incl. ~140 wpm and no hard-to-pronounce names, cue rules, all 10 visual types with props/targets/mini examples, a complete 4-scene example, checklist ending with "the video repo runs `npm run check` on it"). The example passes `check-scenes` with 0 errors.
- Recording setup from Adil: Edge DevTools device mode (iPhone 12 Pro) recorded with Xbox Game Bar. To support it:
  - `npm run crop -- clips/x.mp4` saves a still frame to measure on; `npm run crop -- clips/x.mp4 L T R B` prints the `"crop"` to paste.
  - The phone frame now takes the shape of the (cropped) content, so tall iPhone 12 Pro recordings (0.46 wide:tall) aren't cut. Also fixed: the bezel padding made the phone screen 36 px bigger than the area the content was fitted to.
- `chart` got an optional `bandLabel` (text on the highlighted band; default "season").

**Verified**: lint + tsc clean; `npm run check` 0/0; s04 still with the new phone sizing; crop helper both steps + bad input.

**Next**: Adil's timed run with a new recording made the new way (fill in the "not measured yet" rows of TEMPLATE.md).

## 2026-10-21 · TEMPLATE.md trimmed

- Per Adil: time limits are flexible, so the timing table, the "under 3 hours" goal and the per-section time guesses were removed from TEMPLATE.md. Kept as plain facts: render ≈ 2 min for a 72 s video; recording clips is the only step that grows with the video.
- Section 1 now says to *move* the previous video's audio/clips to a backup folder instead of deleting them (they aren't in git).
- CLAUDE.md unchanged (project-only file).

## 2026-10-21 · M6: own voice as a backup (Whisper)

**Done**
- `npm run timing:whisper` (`scripts/timing-whisper.ts`): takes `recordings/<id>.(m4a|wav|mp3…)`, converts it to `public/audio/<id>.wav`, transcribes it locally with Whisper (`@remotion/install-whisper-cpp` 4.0.535, whisper.cpp 1.5.5 Windows binary, model `base.en`), aligns Whisper's words to the narration (diff-style; misheard words keep their time, missing ones are interpolated), measures speech start/end, and writes the same timing JSON as `npm run voice` (+ `audioFile`, `wordsMatched`). Flags `--only`, `--force`, `--model`. Unchanged recordings are skipped (hash of file + narration).
- Engine plays `audioFile` from the timing file (ElevenLabs mp3 or own wav); `check-scenes` checks that file and gives the right "redo" hint per source.
- `npm run voice` never overwrites an own-voice scene unless `--force`.
- `recordings/` and `whisper.cpp/` are gitignored. TEMPLATE.md section 3b + a common-fix row; Whisper notes in docs/remotion.md.

**Verified** (ElevenLabs s05 used as a stand-in recording, then restored)
- First run incl. one-time downloads (148 MB model): 44 s. 35/37 words recognised; word starts within median 0.09 s / max 0.23 s of ElevenLabs' exact times; speech bounds identical.
- `npm run voice -- --only s05` skipped it (0 characters); `npm run check` 0/0; rendered s05 audio plays the wav for the whole scene.
- Not yet tried with a real microphone recording.

**Next**: Adil records one scene with his own voice to try it.
- Follow-up test (Adil can't record at night): simulated a phone recording (s01 audio + room noise, 1 s silence before, saved as `.m4a`).
  - Found: with silence before the speech, Whisper put words up to 1 s too early. Fixed: Whisper now gets only the speech part (offset added back), word starts use `t_dtw` − 0.12 s (measured bias).
  - Result: `.m4a` works, noise ignored by trimming, 7/7 words, word starts median 0.05 s / max 0.19 s off (s01 and s05). Misread take (wrong audio for s03): 3/19 words → warning with what Whisper heard.
  - All test files removed; s01/s03/s05 restored to ElevenLabs.

## 2026-10-21 · M6: first real own-voice recording (s01)

- Adil's Voice Recorder take (`Documents\Sound recordings\Recording.m4a`, copied to `recordings/s01.m4a`) was very quiet (peak −31.7 dBFS) → Whisper understood 1/7 words and the trimming cut off "explained".
- Fixes: `timing:whisper` boosts quiet recordings (peak to 90 %, max +32 dB; here +31 dB) after measuring speech bounds; `speech-bounds.ts` uses a threshold relative to the file's peak for quiet files (ElevenLabs files unchanged); the warning now checks that all words were placed and the word count fits (accents no longer trigger it; a wrong take still does).
- Result: 7/7 words placed, word starts line up with the loudness envelope (pause before "your" at 3.19 s), speech 1.45–5.01 s, voice level −21.0 vs ElevenLabs −20.1 dBFS.
- s01 currently uses Adil's voice; its timing file is NOT committed until he decides (revert: `git checkout -- public/timing/s01.json`, the ElevenLabs mp3 is still there).
- Adil previewed s01 with his voice and chose ElevenLabs: restored `public/timing/s01.json` from git (free, the mp3 was still there), removed `public/audio/s01.wav` and the `recordings/` copy (original stays in Documents\Sound recordings). Own-voice path stays available as the backup.

## 2026-10-21 · Removed Sense Coach specifics from src/ and scripts/

- `chart`: the "?" and phone icon used to appear in *every* chart unless hidden; now they (and the band) appear only when a cue targets them. Band text no longer defaults to "season" (s02 now sets `"bandLabel": "season"`); neutral target `"band"` added, `"seasonBand"` still works.
- `dotmap`: grid no longer appears with "counter #1" (a rule built around "51 sensors"); new `"grid"` show target (s05 now cues it on "fifty-one").
- All fixed colours are theme defaults, overridable in scenes.json `theme`: `panel`, `panelBorder`, `captionBg`, `deviceBezel`, `deviceScreen`, `browserBar` (window dots stay fixed).
- Scene preview: an unknown `sceneId` (default "s01") shows the first scene instead of an error.
- Comments with project examples made neutral. SCENES_FORMAT.md updated.
- Verified: lint + check 0/0; 10 reference frames across all scenes byte-identical before/after; s02 chart without cues shows no extras; `npm run render` OK (71.5 s, 2 min 20 s render).

## 2026-10-21 · Cut at scene starts

- Adil heard a lag/cut between scenes. Measured the rendered audio at every scene change: endings fade out cleanly, but the first 33 ms of every scene were muted — the 2-frame voice fade-in (volume is set per frame, so frame 0 = silent). s02 ("Smart…") and s08 ("Sense…") start their "S" at the very first sample of the ElevenLabs file, so their first sound was swallowed and then jumped in.
- Fix: no fade-in (fade-out kept; it only touches silence). Re-rendered: every scene now starts with its real first sound.
- Studio: scenes (incl. audio) are premounted 2 s ahead (remotion.config), and no stall at a scene change could be measured in the embedded browser; if Studio playback still lags on the laptop, compare with out/video.mp4.
- Note: s02/s08 files themselves begin mid-"S" (no lead-in from ElevenLabs).
