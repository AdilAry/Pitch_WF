# TEMPLATE: making a new video with this engine

Goal: finished `scenes.json` + screen recordings → `out/video.mp4` (1920×1080, 30 fps).
Everything runs locally in PowerShell from this folder. Close other apps before rendering.

## 0. One-time setup (new laptop or fresh clone)

```bash
npm install
npx remotion browser ensure
```
The second command downloads the browser Remotion renders with, so the first render doesn't need the internet. The font ships with the project, so previews and renders work offline after this. Generating the ElevenLabs voice still needs the internet.
- Copy `.env.example` to `.env` and fill in `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID`.
- The API key needs the **Text to Speech** permission (elevenlabs.io → Developers → API Keys). Without it you get HTTP 401 `missing_permissions`.
- On the free plan, use one of ElevenLabs’ default (premade) voices; Voice Library voices need a paid plan or credits. With a paid plan, any voice works. ElevenLabs says Default voices expire on December 31, 2026, and are only available to accounts created before March 2026, so check what your account offers.
- Listing voices through the API also needs the `voices_read` permission. Otherwise, copy a voice ID from My Voices on the website.

## 1. Start a new video

1. Replace `scenes.json` with the new one (written by the app repo's Claude from `SCENES_FORMAT.md`).
2. Move the previous video's files out (e.g. into a `backup/` folder) so nothing from it is reused:
   - `public/audio/*` and `public/timing/*` (the voice), `public/clips/*` (old recordings).
   - Move, don't delete: audio and clips are not in git, so deleted ones can't be restored.
3. Check it:
   ```bash
   npm run check
   ```
   Fix every `ERROR`. Expected at this point: `clip file not found` (not recorded yet) and `no voice yet` warnings.

## 2. Record the app clips

The only step that grows with the video: one recording per clip scene (about a minute each, plus retakes), and the crop measured once.

**Clips show everything on screen, not only what the voice says.** Before recording, read the app's visible text and numbers: they must match the facts, and generated sentences must say what you mean. Crop out personal details such as profile pictures and account badges. Record only after the app is frozen; if the app changes, record again.

The setup below is for phone apps. For a desktop app (e.g. side-by-side panels), record a maximised browser instead, use `"frame": "none"`, and share one `crop` across all clips.

**Before the voice, set only `crop`.** `trimStart`, `trimEnd` and `speed` depend on the voice's timing, so they wait until the voice is final (§3, then the visuals step in `CLAUDE.md`); set earlier, they have to be redone.

Recording setup (same every time):
1. Open the app in **Edge**, press **F12** (DevTools), then **Ctrl+Shift+M** (device toolbar) and pick **iPhone 12 Pro**. Zoom so the whole phone screen is visible.
2. Record the Edge window with the **Xbox Game Bar** (open with **Win+G**; **Win+Alt+R** starts/stops recording). Files land in `Videos\Captures`.
3. One short recording per clip scene (10–20 s). Move slowly, pause on what the narration talks about, keep the mouse still when not clicking.
4. Copy each file to `public/clips/` and rename it to the `src` name in `scenes.json` (short, no spaces, e.g. `c1_home.mp4`).

Cut away the DevTools and browser bars (once per recording; the position stays the same if you don't move/resize the window, so one measurement usually fits all clips):
```bash
npm run crop -- clips/c1_home.mp4
```
This saves `out/c1_home-frame.png`. Open it in Paint, hover over the **top-left** and **bottom-right** corner of the phone screen and note the pixel numbers shown at the bottom left. Then:
```bash
npm run crop -- clips/c1_home.mp4 712 180 1102 1024
```
Paste the printed `"crop": {...}` into that clip's `visual` in `scenes.json`. The phone frame in the video automatically takes the shape of the cropped area.

Run `npm run check` again: no errors left. Leave `trimStart` (seconds to skip at the start), `trimEnd` and `speed` (e.g. 1.25) until the voice is final: they make the clip fit the scene's spoken length.

## 2b. Filming a physical device (hardware projects)

Screen recordings don't show a board or a robot arm. Film it with the phone instead:
1. Phone in **landscape** (the video is 16:9), on a stand or propped up, never hand-held. Plain background, light from the side or front, no window behind the device.
2. One take per clip scene, 10–20 s, with the action the narration describes (button press, arm moving, display changing). Start recording 2 s before the action.
3. Film at the hotel or a quiet corner, not on the busy floor (people walking through the shot).
4. Copy to `public/clips/` with the `src` name from `scenes.json`. Phone videos are often 60 fps or HEVC: if Studio won't play one, re-export it as H.264 30 fps (e.g. in ClipChamp).
5. In `scenes.json` use `"frame": "none"` for camera footage. `crop` works the same way as for screen recordings if the device is small in the frame.

## 3. Voice

Try one scene first, listen to `public/audio/s01.mp3`:
```bash
npm run voice -- --only s01
```
Choosing a voice: listen to the free samples on the website, then test on the scene with the most numbers. Pace varies a lot between voices (about 125 to 180 words per minute for the same script), so recheck the total length with `npm run check` after a voice is final.

Then everything (unchanged scenes are skipped and cost nothing):
```bash
npm run voice
```
- It prints the characters sent (= credits used). One full pass of a 75–90 s narration is about 1,000–1,300 characters
- Speech start/end are measured automatically; silence and cut-off sounds at the ends of each file are not played.
- Re-do one scene: `npm run voice -- --only s08 --force`.
- After editing narration: just run `npm run voice` again (only edited scenes are regenerated). `npm run check` warns if you forget.

### 3b. Backup: your own voice instead of ElevenLabs

Use this when ElevenLabs is unavailable (no credits, no internet, a voice you don't like), for all scenes or only some.

1. Record each scene's narration **word for word** as its own file, e.g. with the Windows **Voice Recorder** app (called Sound Recorder on Windows 11) (files go to `Documents\Sound recordings`). Quiet room, steady distance to the mic; half a second of silence at the start and end is fine (it's trimmed automatically).
2. Save them as `recordings/<scene id>.<ext>` in this folder, e.g. `recordings/s01.m4a`, `recordings/s02.m4a` (`.m4a`, `.wav`, `.mp3` all work).
3. Run:
   ```bash
   npm run timing:whisper
   ```
   The first run downloads the speech recogniser (Whisper, ~150 MB, into `whisper.cpp/`); after that it works offline and costs nothing. Per scene it prints e.g. `volume +31 dB, speech 1.45-5.01 s, 7/7 words placed (2 recognised exactly)`:
   - **volume**: quiet recordings are boosted automatically to about the ElevenLabs level.
   - **placed / recognised exactly**: with an accent Whisper misspells words ("sun's" for "Sense"); that's fine as long as all words are *placed*. If the take doesn't match the narration (wrong scene, skipped sentence), it prints a WARNING with what it heard: record that scene again.
4. Preview as usual. Your recordings play instead of the ElevenLabs audio; cues and captions follow your timing.

- Re-record a scene: overwrite its file and run `npm run timing:whisper` again (unchanged recordings are skipped). `--only s03` limits it to one scene.
- Mixing is fine: scenes without a recording keep their ElevenLabs voice. But voices that sound very different side by side are distracting; ideally use one or the other for the whole video.
- `npm run voice` never replaces your recordings. To go back to ElevenLabs for a scene: `npm run voice -- --only s03 --force`.
- Timing accuracy: tested against exact word times (including a noisy `.m4a` with a second of silence before the speech), words land within ~0.05 s, worst 0.19 s. If a scene still feels off: `npm run timing:whisper -- --only s03 --model small.en --force` (bigger download, slower).

## 4. Preview and fix

```bash
npm run preview
```
- **Video** = the whole film. **Scene** = one scene; change `sceneId` in the Props panel on the right.
- After running `npm run voice` again, reload the Studio page.
- To see exactly when each animation fires:
  ```bash
  npm run check -- --cues
  ```
  Then jump to that frame in Studio.

## 5. Render

Close other apps, then:
```bash
npm run render
```
Output: `out/video.mp4`. A 72 s video takes about 2 minutes on this laptop, so re-rendering after a small fix is cheap.

After changing the engine itself, run `npm run regress`. It renders `examples/sense-coach/` in a temporary folder and compares it with the reference video, without touching your files.

## Common fixes

| Problem | Fix |
|---|---|
| `npm run voice`: HTTP 401 `missing_permissions` | Give the API key the Text to Speech permission on elevenlabs.io. |
| `npm run voice`: voice refused | That voice isn't available on your plan; pick another voice ID in `.env`. |
| A word is mispronounced (names, brands like "VILPE") | Don't fight it: reword the narration, keep the name on screen only. Then `npm run voice`. |
| `timing:whisper`: few words recognised | Re-record that scene reading the narration exactly; check the mic level. |
| One scene has odd intonation/pitch | `npm run voice -- --only sXX --force` for a new take. If it persists, add `"voiceContext": false` to that scene (generates it without the neighbouring scenes' text) and run `npm run voice`. |
| Pause between two scenes feels too short/long | Add `"padSeconds": 0.8` (seconds of pause after that scene) to the scene; default is `meta.padSeconds` (0.3). No new voice needed, just reload Studio. |
| `check`: cue word "…" is not in the narration | The `atWord` must be a word that is spoken in that scene (punctuation and case don't matter). Use `occurrence` for the 2nd/3rd match. |
| `check`: scene only N s long | Merge it with a neighbour or add to it. Don't stretch it with a long pause. |
| `check`: screen stays empty | Add an element that appears during the first sentence. |
| `check`: theme warning | Adjust the named colours in `scenes.json`, then look at it in preview. |
| `check`: narration changed since the voice was made | Run `npm run voice`. Until then the scene keeps the old voice's length, so it can look cut off. |
| Clips no longer match the words after a voice change | Reset `trimStart` and `speed`: find the word times in `public/timing/<scene id>.json`. |
| `check`: narration contains digits | Write numbers as words ("fifty-one"); visuals show digits. |
| Clip shows DevTools / browser bars | Add a `crop` (step 2). |
| Clip ends before the scene ends | Fine: its last frame stays. To fill the scene, lower `speed` or record longer. |
| Clip is cut before it finishes | Raise `speed`, raise `trimStart`, or set `trimEnd`. |
| Captions break into a 1-word second line | Harmless. Shorter sentences in the narration give nicer caption pages. |
| Studio: "Scene not found" | The `sceneId` in the Props panel doesn't exist in `scenes.json`. |
| First render: `Failed to launch the browser process` | The project folder's path may be too long for Windows: move the project to a shorter path. |
| Render is slow / laptop freezes | Close other apps; keep `--concurrency=2` (already in `npm run render`). |
| A file you just fixed is back to an old version | Your editor saved an old copy over it: reload the file in the editor before editing. |
| Voice cuts/pauses ~0.4 s into a scene (in Studio preview) | Voice-over lives in its own <Sequence> layer in Video.tsx (SceneAudio). Don’t move it back into SceneView, and don’t bring back TransitionSeries: it remounts scenes, which also makes clips flash. |