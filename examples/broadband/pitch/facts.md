# Facts: everything the video, deck, write-up, talk and README may say

Every number and claim has a source. If it isn't here, it doesn't get said.

## What it is
| Claim | Source |
|---|---|
| Name: Broadband Gap Finder | `app.py` |
| Tagline: "Find the slow broadband, and know how sure you are." | Wording chosen for these materials; describes `app.py` |
| One line: a map tool that ranks 1 km squares in Varsinais-Suomi where people live with slow fixed broadband, so sales teams can choose fixed-wireless campaign areas without guessing from municipal averages. | `CLAUDE.md` §5, adjusted to the shipped tiers |
| Audience: DNA's regional sales managers and network planners, as described by the mock challenge. No real user has tried it. | `CLAUDE.md` §1 |
| Context: dry run on 2026-11-02 for Since AI 2026, using the mock DNA challenge "Broadband gap finder". Not made with, used by or endorsed by DNA. | `CLAUDE.md` §1 |
| Problem as stated by the challenge: campaign areas come from coarse municipal statistics, villages are hidden inside averages, and there is no shared, explainable list. | `CLAUDE.md` §3 |
| Fixed wireless means a home router on the mobile network. | `CLAUDE.md` §3 |
| Users want to click an area and read why it's listed, in one sentence with real numbers. They want no black-box scores, and thin data shown honestly, not hidden. | `CLAUDE.md` §3 |

## Data
| Claim | Source |
|---|---|
| Speed data: Speedtest by Ookla open data, 2026 Q3, CC BY-NC-SA 4.0 | `data/processed/meta.json`, `data/README.md` |
| Population: Statistics Finland 1 km population grid, 2025 edition, CC BY 4.0. Exact reference date not confirmed. | `meta.json`, `PROGRESS.md` |
| 7,791 inhabited squares, 491,224 residents, 27 municipalities | `meta.json`, `PROGRESS.md` |
| 26,993 fixed tests in the download box, of which 19,886 fall in the region's inhabited squares | `meta.json` |
| Speed tests don't say which operator was tested. They show what people in an area experience, not any operator's coverage. | `meta.json` |

## Rules (in `core/rules.py`; the builder's own choices, not confirmed with the mentor)
| Claim | Source |
|---|---|
| Slow fixed: under 30 Mbit/s | `core/rules.py`, `tests/test_rules.py` |
| Strong mobile nearby: at least 100 Mbit/s from at least 10 tests, in a 3 × 3 km area | `core/rules.py`, `core/grid.py` |
| Thin data: under 10 fixed tests | `core/rules.py` |
| No fixed tests means "No data", never "slow" | `core/rules.py`, `PROGRESS.md` |
| Score = residents × gap, gap = (30 − fixed speed) / 30, kept between 0 and 1. Used only to sort. | `core/rules.py`, `app.py` |
| Fixed speed is a test-weighted average of tile averages. Ookla gives no per-test medians. | `CLAUDE.md` §4, `core/grid.py` |

## Results (2026 Q3, current thresholds)
| Label | Squares | Residents |
|---|---:|---:|
| Strong FWA candidate | 2 | 22 |
| Candidate, mobile unproven | 9 | 129 |
| Thin data | 1,025 | 64,491 |
| Not a gap | 409 | 356,843 |
| No data | 6,346 | 69,739 |

Source: `meta.json`.

| Claim | Source |
|---|---|
| Shortlist of 20 squares, 1,379 residents in total | `meta.json` (14 + 105 + 1,260) |
| 1 passes every rule (14 residents), 4 have unproven mobile (105), 15 are slow but rest on thin data (1,260) | `meta.json` |
| The 15 thin squares have a median of 1 fixed test. They are leads to check, not findings. | `rules.shortlist` on `cells.parquet`, `app.py` |
| Rank 1: Naantali, 14 residents, fixed 16.9 Mbit/s from 220 tests, mobile nearby 111.1 Mbit/s from 16 tests | `broadband_gap_shortlist.csv`, `reasons.json` |
| Rank 1's tests may not come only from its residents (visitors, repeat testers). Same caution for rank 17: 0.1 Mbit/s from 3 tests. | `PROGRESS.md` |
| With stricter or looser rules the shortlist changes: for example, slow below 50 Mbit/s with a 5-test minimum over 4 pooled quarters gives 20 strong squares (the limit), 789 residents. | `PROGRESS.md`, `out/sensitivity.txt` |

## Privacy
| Claim | Source |
|---|---|
| Squares under 10 residents never enter the shortlist or export, and their residents and speeds are not shown. They keep their colour on the map. That's 4,560 of 7,791 squares. | `app.py`, `core/rules.py`, `PROGRESS.md` |
| Only aggregated squares; no addresses, no household data. | `CLAUDE.md` §4, `data/README.md` |

## AI
| Claim | Source |
|---|---|
| Gemini (`gemini-3.5-flash-lite`) only rewords one square's computed facts into a sentence. It gets no place name, cell id or coordinates. | `core/explain.py`, `tests/test_explain.py` |
| Code checks every AI sentence; a failed one is replaced by a standard sentence. The rules decide every label and rank. | `core/explain.py`, `tests/test_explain.py` |
| 20 of 20 shortlist sentences are saved in advance. The deployed app has no key and runs in demo mode. | `reasons.json`, checked on the deployed app on 2026-11-02 |
| The video's voice-over was generated with ElevenLabs. | `../videogen/PROGRESS.md` |

## Product and checks
| Claim | Source |
|---|---|
| Map, card, top-20 table, one-click CSV with attribution and operator note, "How the ranking works" panel | `app.py`, `core/export.py` |
| 77 automated tests pass | `python -m pytest -q tests`, 2026-11-02 |
| Adil checked the deployed app on desktop (Edge) and on a phone (Chrome) | `PROGRESS.md` |
| Time log: first milestone started 13:57, polish ended 16:18 on 2026-11-02, with breaks for testing | `PROGRESS.md` |

## Limits (say them)
- Speed tests are sparse: most squares have few or no tests.
- Thresholds and tiers are not confirmed with the mentor.
- No capacity modelling, no operator-specific data, one region, one quarter.
- Ookla's licence is non-commercial: fine for this rehearsal, and real commercial use would need checking.
- The CSV has not been checked in Excel with Finnish settings. A Finnish-format version didn't work in Adil's test and was removed.
- The map needs WebGL: it didn't load in LibreWolf. With browser graphics acceleration off, it clips while scrolling.

## Links
- Demo: https://broadband-gap-finder.streamlit.app/
- Repo: https://github.com/AdilAry/production
- Video: to be added
