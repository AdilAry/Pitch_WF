# Example: Patch This First (template test, 2026-11-03)

A small finished project, made to test the template end to end. It was built in about 2 hours for a **mock** challenge (section 3 of `../broadband/challenges.md`, "Patch this first" for small organisations). **It's not affiliated with or endorsed by Traficom, NCSC-FI, CISA or FIRST**, and the challenge and its criteria are invented.

**What it is:** a Streamlit app where a small office pastes its software list and gets the three things to patch first, in Finnish or English. It matches the list against the CISA Known Exploited Vulnerabilities catalog (CC0 1.0) and ranks by ransomware use and FIRST EPSS scores (attribution requested). The full project, with its code and both git histories, is archived in `Documents\GitHub\Archive\2026-11_template_test_patch\`.

## Why it's here as well as `broadband/`
- **Built on the current workflow:** production V3 and videogen V4, so its `CLAUDE.md` and `PROGRESS.md` show the first-question check, the judge pass, the hand-over to the video repo and a final judge pass of the repo, deck and video. Broadband predates all of these.
- **A different kind of app:** a pasted list with ranked cards, not a map.
- **A short video:** 40 s target, 60 s maximum, 5 scenes, one desktop clip with `"frame": "none"` and a `crop`, and the app's name in single quotes so the voice says it as a name.

## Files

| File | What it shows |
|---|---|
| `CLAUDE.md` | Production's `CLAUDE.md` filled in for a small, timed project. |
| `PROGRESS.md` | The handover file: milestone timings, first-question check, judge pass 1, judge pass 2 on the finished submission (scores before and after), decisions, AI-use log. |
| `data/README.md` | Sources, licences and processing written down, as `CLAUDE.md` §7 asks. |
| `pitch/` | `facts.md`, `writeup.md`, `live.md` and `scenes.json`, after the `docs/PITCH.md` §4 rerun. |
| `deck/` | `deck.json`, its screenshot and the built `pitch.pptx`. |
| `video/` | The video repo's filled `CLAUDE.md`, its `PROGRESS.md`, the final `scenes.json` and `video.mp4` (47.3 s). |

## How to use it
- **For structure only.** Never copy its facts, numbers or rules into another project.
- **Known faults, kept as they were** (judge pass 2 in `PROGRESS.md`): no `README.md` was written; an end-of-life rule tells a supported product to "replace it"; the top results all show "99,9 %", so their order isn't visible; the Finnish wasn't read by a native speaker; the video never states the problem; a "Running get_ai()." spinner shows on screen; slide 5's credit line touches the page number. Several of these became template fixes (production V4, videogen V5).
- **Template version:** where its files differ from the current template, the current template wins.
- **Not copied into new projects:** the template's setup copies only `production/` and `videogen/`.
