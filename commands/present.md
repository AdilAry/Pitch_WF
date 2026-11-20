---
description: Write the presentation materials (facts, video script, deck, write-up, live script, README) from docs/PITCH.md in one go - after the freeze, in a fresh session
argument-hint: optional, what to skip, e.g. "no video" or "README only"
---
Write the presentation materials. Note from me: $ARGUMENTS

1. If AGENTS.md has no "Presentation" section, stop and tell me to run /entry first.
2. If the project has a "Competition" section and PROGRESS.md doesn't say the app is frozen, ask me whether to
   go on. The materials describe the app as it is; a later change makes them wrong.
3. Read docs/PITCH.md in full, then docs/pitch_card.md, then the inputs PITCH.md §1 lists. Read
   docs/DECK_FORMAT.md and docs/SCENES_FORMAT.md only for the material you are writing.
4. If the strongest true claim is weak, stop and tell me before writing (PITCH.md §2, "Headline").
5. Write what PITCH.md §2 lists, minus what my note skips, in that order, from the same facts.
6. Do the checks of PITCH.md §4 and report them: what passed, what didn't, what you couldn't check.
7. Reply with the lists I need: the screen clips to record and the screenshots to take, then the deck and
   video steps (build the deck in `deck/`; in the video repo: `npm run check`, `npm run voice`, preview,
   render). Then tell me to type /wrap.
