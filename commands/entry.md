---
description: Add the Pitch_WF presentation kit to an existing short-loop project - the Presentation section, the plan lines, the pitch card, PITCH.md and the deck builder
argument-hint: optional, e.g. "no video" or "deck only"
---
Add the presentation kit to this project. Note from me: $ARGUMENTS

The kit's folder is in the environment variable `PITCH_WF`. If it isn't set, or has no `template/` folder,
stop and tell me to run the kit's installer. Never guess the path.

1. Check that this is a short-loop project: AGENTS.md, PROGRESS.md and docs/plan.md exist. If not, stop and
   tell me to make the project with the workflow first.
2. If AGENTS.md already has a "Presentation" section, stop: the kit is already in. Tell me what differs from
   the kit's current `template/AGENTS.presentation.md`, and change nothing.
3. Propose, in at most 6 bullets, what you will add (the list below, minus what my note leaves out), and wait
   for my OK. Change no file before it.
4. After my OK:
   - AGENTS.md: add the "Presentation" section from `$PITCH_WF/template/AGENTS.presentation.md` after the
     "Competition" section, or after "Scope" if there is none. Add its read-when rows to the existing
     "Read only when needed" table, not as a table of their own. If "Competition" has a "Look" line, replace
     its colour part with "from the style guide; see Presentation", so the colours live in one place. Keep AGENTS.md under ~120 lines; if it would
     go over, tell me which lines you would move to docs/ instead.
   - docs/plan.md: add each block of `$PITCH_WF/template/plan.presentation.md` where its comment says. Skip a
     block whose target section the plan doesn't have.
   - Copy into docs/: `pitch_card.md`, `PITCH.md`, `DECK_FORMAT.md`, `SCENES_FORMAT.md` from
     `$PITCH_WF/template/docs/`, and the kit's `style/` folder as `docs/style/`. Put the project's name in.
   - Copy `$PITCH_WF/template/deck/` to `deck/`, unless my note says there is no deck. Leave out its
     `example/` folder.
   - Add the lines of `$PITCH_WF/template/gitignore.presentation` that `.gitignore` doesn't have yet.
5. Run the bracket check of the workflow (WORKFLOW.md §2) on AGENTS.md and docs/plan.md and list what is left
   to fill.
6. Tell me how to make the video repo, unless my note says there is no video: copy `$PITCH_WF/videogen/` next
   to this project (not inside it), then `git init -b main`, `npm install`, and fill its CLAUDE.md. Then put its
   path in "Video repo".
7. Check `git status`, then commit the added files with the message "Add the Pitch_WF kit". Reply with the
   files changed and the brackets left to fill.
