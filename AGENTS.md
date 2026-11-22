# Pitch_WF kit: instructions for agents working on THIS repo

This repo is a kit on top of the owner's short-loop workflow, not a project. Projects are made with the
workflow, outside this folder, and `/entry` adds the kit to them. Do not start an agent for project work
inside this folder: it would load this file too.

## Layout
- **The short-loop workflow is an external dependency**, found through `$WORKFLOW_DIR`. The kit uses only the
  WORKFLOW.md §8 list; the README names the contract date it was written against. A change to how sessions
  work belongs in the workflow repo first. Never copy or restate the workflow's files here.
- **The kit holds the competition work and the showing of the result.** Since the contract of 22 November 2026
  the workflow has no competition material: budget, official score, hand-in, first-question check, submission
  dry run, freeze and AI log are this kit's (`template/AGENTS.competition.md`, `template/plan.competition.md`,
  `template/docs/ai_log.md`). Their review steps go under "At /judge also"; never patch `/judge` for them.
- `commands/<name>.md`: the kit's commands, in the workflow's command format (frontmatter `description` and
  optional `argument-hint`, body uses `$ARGUMENTS`). Keep them agent-neutral: say "AGENTS.md", keep the
  frontmatter valid YAML (no `: ` inside a description), and do not write an at-sign directly before a file
  name or an exclamation mark before a backtick in a body.
- `template/`: what `/entry` adds to a project. Square brackets only as fill-in markers (WORKFLOW.md §2).
- `videogen/`: the Remotion project. Its own `CLAUDE.md` holds its rules.
- `style/`: the owner's style guide. Change it only when the owner asks; it is refined after each event.

## Checks
- Before calling a change done: the bracket check on `template/` finds only fill-in markers, and every path a
  command names exists in this repo.
- `npm run check` in `videogen/` and `npm run build` in `template/deck/` (once those are moved in).
