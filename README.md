# Pitch_WF: presentation materials for a short-loop project

**Draft, 20 Nov 2026: skeleton written, the Templates files copied in. Not tested, not installed anywhere.**

An add-on to the short-loop workflow. It gives a project what it needs to be shown: a pitch card written at M0,
the presentation materials written in one go after the freeze (facts, video script, deck, write-up, live script,
README), the deck builder, the Remotion video project, and a style of my own that carries from one project to
the next.

The workflow does the rest, competitions included: the `Competition` section (budget, official score,
first-question check, submission dry run, freeze) is the workflow's own. This kit adds only what is about
showing the result. A hackathon uses both; a portfolio piece or a talk may use the kit without the
`Competition` section.

## Built on the short-loop workflow

A separate repository, which this kit doesn't copy. The kit uses only what the workflow's WORKFLOW.md §8,
"Building a kit on this workflow", lists, and finds the workflow through `WORKFLOW_DIR`.

**Written against the contract of 21 November 2026** (Workflow branch `pitch_chat`, the first with "At /judge also"). On an older workflow the
skim test and the deck and video checks don't run, because `/judge` doesn't read that field.

## What's in it

| Path | What | State |
|---|---|---|
| `commands/entry.md` | `/entry`: adds the kit to an existing workflow project | drafted |
| `commands/present.md` | `/present`: writes the presentation materials from `docs/PITCH.md` | drafted |
| `template/AGENTS.presentation.md` | the `Presentation` section `/entry` adds to a project's AGENTS.md, with its read-when rows | drafted |
| `template/plan.presentation.md` | the lines and sections `/entry` adds to a project's `docs/plan.md` | drafted |
| `template/docs/pitch_card.md` | the pitch card | drafted |
| `template/docs/PITCH.md` | what `/present` follows; the 15 Nov copy, with its `CLAUDE.md §` references changed to AGENTS.md sections | drafted |
| `template/docs/DECK_FORMAT.md`, `SCENES_FORMAT.md` | the deck and video script formats | copied; one reference changed in each |
| `template/deck/` | the pptxgenjs deck builder | copied (production V5); one line of its README changed |
| `template/gitignore.presentation` | the lines `/entry` adds to a project's `.gitignore` | drafted |
| `videogen/` | the Remotion video project, copied per project as its own repo | copied (videogen V5, tracked files only, no `.env`); its CLAUDE.md now says "project repo" and `/present` |
| `style/` | my style guide and its video primitives | empty: written after the practice remake (`TODO.md` item 4) |
| `docs/GUIDE.md` | how to make the materials: setup, `/present`, deck, video, tool notes | rewritten from `Templates\project_pitch\README.md` |
| `docs/tools/` | tool notes copied into a project only when it uses the tool | copied unchanged. `laptop.md` and `testing_laptop.md` repeat the user-level file. Kept until you decide. Board notes live in Embed_WF (`hardware/boards/`) |
| `examples/` | finished projects, reference only, never copied | copied (25 MB). They use the old `CLAUDE.md` layout |
| `scripts/install.ps1`, `install.sh` | install the kit's commands; set `PITCH_WF` | drafted |

`Templates\project_pitch\production\CLAUDE.md` does not move: the workflow's AGENTS.md and this kit's section
replace it.

## Setup

Install the workflow first (its WORKFLOW.md §3 sets `WORKFLOW_DIR`), then the kit.

Windows (PowerShell, from this folder):
```powershell
powershell -ExecutionPolicy Bypass -File scripts\install.ps1
```

Linux:
```bash
bash scripts/install.sh
```

At home, before an event, once per machine: `npm install` in `videogen/` and in `template/deck/`, then
`npx remotion browser ensure` in `videogen/`, so nothing downloads at the venue. The voice choice and the
whisper backup are as in today's `Templates\README.md`, steps 5 and 6.

## Per project

1. Make the project with the workflow (`new-project.sh`, or the PowerShell steps of its §3).
2. In it, start the agent and type `/entry`. It adds the `Presentation` section, the plan lines and the docs,
   copies the deck builder, and tells you how to make the video repo next to the project.
3. Fill the brackets it added, then work as usual: `/start` ... `/wrap`.
4. After the freeze: `/present`. Then the deck and video steps it lists.

## Decided

- The engine's regression reference (`videogen/examples/sense-coach/out/video.mp4` and the example's
  `public/audio`, `public/clips`, 16 MB) is committed with the kit (Adil, 20 Nov), so `npm run regress` works
  on a fresh clone. The template had kept it out of git.

## Not decided yet

- Whether `videogen/` stays a separate repo per project (as today) or becomes a folder inside the project.
- The style guide's format: it follows the pattern of Gamedev_WF's `/style-guide` (references first, then
  rules, palette, motion, what the style is not) unless the practice remake shows a better one.
