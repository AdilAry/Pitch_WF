# Guide: making the presentation materials

From `Templates\project_pitch\README.md` (3 Nov 2026), rewritten on 20 Nov for the kit. What changed: "Prod" is
now the project itself, made with the short-loop workflow; its rules live in AGENTS.md instead of a long
`CLAUDE.md`; the trigger phrase is `/present`; the judge passes are the workflow's `/judge` and `/judge final`.
The deck and video steps are unchanged. "Vid" is the project's copy of `videogen/`.

Works for any project that needs showcase material: hackathon, portfolio piece, work prototype, talk.

---
## At home, once per machine

Needs Git, Node.js and Python (tested with Node 24 and Python 3.12). Do this at home: it needs a good connection.

1. Install the workflow, then the kit (README, "Setup").
2. In the kit: `npm install` in `videogen/` and in `template/deck/`. Ignore the audit warnings in `deck/` and
   don't run `npm audit fix --force`: it makes breaking changes, and the builder only reads your own files. In
   `videogen/`, also run `npx remotion browser ensure`, so the first render doesn't download a browser at the
   venue.
3. Choose the voice before the event: in `videogen/`, fill `.env` from `.env.example` (`ELEVENLABS_API_KEY`,
   `ELEVENLABS_VOICE_ID`), run `npm run voice` on the template's test script (47 words, about 280 credits),
   listen, and run `npm run check`, which prints the seconds of voice. Words per minute = 47 ÷ seconds × 60.
   Note the voice's name and that rate in `videogen/CLAUDE.md`.
4. Optional, the voice backup without ElevenLabs: record one scene into `recordings/s01.m4a`, then
   `npm run timing:whisper`. The first run downloads Whisper (~150 MB) into `whisper.cpp/`.

## Per project

1. Make the project with the workflow. In it, type `/entry`.
2. Make Vid: copy the kit's `videogen/` next to the project (not inside it), then `git init -b main` and
   commit the untouched copy at once (`git add -A`, `git commit -m "Template copy"`): the chats commit only the
   files they touch. Before that commit you may delete the example's media from the copy
   (`examples/sense-coach/out/`, `public/audio/`, `public/clips/`, 16 MB): `npm run regress` is run in the kit.
   `npm install`, fill `.env`, and put Vid's path in "Video repo" in the project's AGENTS.md.
3. Fill the brackets `/entry` listed. Then work as usual.
4. Check the setup: `npm run check` in Vid, and `npm run build` in `deck/`. Warnings about missing voice or
   screenshots are normal at this point.

---
## Generating the materials

Stack: Claude Code, ElevenLabs (voice), Remotion (video), pptxgenjs (deck), ClipChamp as a backup editor.

Before:
1. The app is made, the workflow's judge pass (`/judge` in a fresh session) is done and you have picked the
   fixes, and the app is frozen.
2. **Folder access:** the project's chat needs to reach Vid's folder, and the Vid chat needs the project's.
   Allow it when Claude asks, or add the folder to the session (`claude --add-dir <path>`).

Then, in a fresh session in the project: `/present`. It reads `docs/PITCH.md` and writes, from the same facts:
`pitch/facts.md`, `pitch/scenes.json`, `deck/deck.json`, `pitch/writeup.md`, `pitch/live.md`, the README if
there is none, the hand-over to Vid, and the lists of clips to record and screenshots to take. Skip what the
project doesn't need: `/present no video`. The README has its own trigger, "write the README".

### Deck
1. Take the screenshots from the list and save them in `deck/shots/`.
2. In `deck/`: `npm run build` → `pitch.pptx`. Read the WARN lines (missing screenshots, unknown icons).
3. Import `pitch.pptx` into Google Slides for touch-ups, then download it as PDF. Offline fallback: export the
   PDF with LibreOffice (see `deck/README.md`).

Changes to the deck content are made in the project's chat.

### Video (in the Vid chat)
0. Record the screen clips of the app into `public/clips/`. For hardware, film the device with the phone
   instead (`TEMPLATE.md` §2b). Vid's `scenes.json` is the master from here on.
1. `npm run check`: validates `scenes.json` (cue words exist, files exist). Crop clips with `npm run crop`.
2. `npm run voice`: sends each scene's narration to ElevenLabs and saves `public/audio/sXX.mp3` and
   `public/timing/sXX.json` (word-by-word timings).
3. Listen. To redo a scene: `npm run voice -- --only s03 --force`, then `npm run check` again: it reports the
   real length and any scene that's too short. Backup without ElevenLabs: record the scenes into
   `recordings/`, then `npm run timing:whisper`.
4. The Vid chat wires the scenes: visuals, cues synced to the timings, captions and clips.
5. `npm run preview`: check it in Remotion Studio and ask the Vid chat to fix anything off.
6. `npm run render` → `out/video.mp4`.
7. Upload to YouTube (unlisted) and Google Drive; test the links in a private window. Copy Vid's `scenes.json`
   back over the project's `pitch/scenes.json` as an exact file copy. In the project's chat, give it the video
   link and have it rerun `docs/PITCH.md` §4. Then `/judge final` in a fresh session (the one the Freeze section
   names; run it once, here): the kit's "At /judge also (final)" steps review the deck PDF, one still per scene
   and the narration, and for a competition every item of the hand-in.

**After changing the video engine itself:** `npm run regress` in the kit's `videogen/`. It renders the example
in a temporary folder and compares it with the reference; your files aren't touched.

---
## Tool notes

`docs/tools/` holds short notes on tools, each written from the official docs. `/entry` copies one into a
project only when the project uses that tool. Vid keeps its own copies of `remotion.md` and `eleven_labs.md` in
`videogen/docs/`: update the copy when the kit's note changes. Who I am and my machines are in the workflow's
user-level file, not here.

To write a new note, paste this into a chat, with the tool's name in place of "placeholder":

"
Read the official docs provided at placeholder. Write placeholder.md, max 2 pages, with these sections:

* What it is
* Setup (Windows)
* Key concepts
* Minimal working example
* Common pitfalls
* Links.

Only use facts from those pages; cite the URL for each section and the date fetched. Mark anything you couldn't confirm as UNVERIFIED
"

Then make a minimal test project using the note.

**`SCENES_FORMAT.md`:** the master copy is `videogen/SCENES_FORMAT.md`, because it changes with the video
engine and the writing rules. Edit it there, then copy it to `template/docs/SCENES_FORMAT.md`.

---
## Changing the kit

Open the chat in the kit's folder; its AGENTS.md has the rules. Keep it generic: no project's facts go in
`template/` or `videogen/`. Test a change in a copy, never in the kit. The last full test
of the old template (3 Nov 2026) is archived in `Archive\2026-11_template_test_patch\`, with its snag list in
`Big_Hackathon\since_ai\proposals\dryrun_and_template_results\SNAGS.md` ("Passed" lists tests A–D). Repeat them
after larger changes.
