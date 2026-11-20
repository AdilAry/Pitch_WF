# Facts we can state (Patch This First)

Every number and claim in the video, deck, write-up, live talk and README comes from this list. Data as of **2026-11-03**: CISA KEV catalog version **2026.10.30** (released 2026-10-30), EPSS scores dated **2026-11-02**. If the data is refreshed, re-run the checks and update this file first.

## Headline (answer to the sponsor's first question)
> "If a 12-person office pastes its software list, does it get the right three things to fix this week, and can someone with no security background act on them?"

**Answer: mostly yes.** For an invented 12-person office list, all 3 "fix this week" items are on CISA's list of flaws attackers already use, and each has at least one flaw used in ransomware: the FortiGate firewall first, then Windows 11 and Windows 10. Each card says what to do ("install the vendor's latest update") with the vendor's link and why, in Finnish or English.
**Caveats, always stated with it:**
- Windows 11 and Windows 10 are two cards with the same 203 flaws, so this week is really **2 distinct actions** (firewall update, Windows update).
- The tool does **not** check versions: it says "this product has known exploited flaws; check that you have the fixed version", never "you are vulnerable".
- 3 of the 16 programs could not be matched; they are shown as "not matched", with the note that this does not mean safe.
- Windows 10 is past Microsoft's end of support (Microsoft's own date, to check on their site before quoting it); the app still says "install the latest update", because KEV doesn't carry support dates.

| # | Fact | Source |
|---|---|---|
| H1 | Sample list: 16 programs, 13 matched, 3 not matched (Zoom, Synology NAS, HP LaserJet printer) | `out/freeze_check.txt`, `data/samples/office_12.txt` |
| H2 | Sample top 3: 1. Fortinet FortiGate 60F firewall (15 flaws), 2. Windows 11 Pro (203), 3. Windows 10 Pro (203); all three ransomware-linked, forecast shown as 99.9 % | `out/freeze_check.txt`, app |
| H3 | Newest KEV additions behind the top 3: 27.7.2026 (FortiGate), 13.10.2026 (Windows) | `out/freeze_check.txt` |
| H4 | 9 of the 13 matched sample items have a ransomware-linked flaw | `out/freeze_check.txt` |
| H5 | The sample list is invented, labelled as such in the file and in the app | `data/samples/office_12.txt` |

## The challenge brief's own example
| # | Fact | Source |
|---|---|---|
| B1 | Typed as the brief writes it, on one line: "Windows 10, Office 2019, a Fortinet VPN, WordPress 6.2" → 4 items, 4 matched | `out/freeze_check.txt`, app (checked 2026-11-03) |
| B2 | Its top 3: Fortinet VPN (15 flaws), Windows 10 (203), Office 2019 (30), all ransomware-linked; WordPress 6.2 (3 flaws, forecast 95.7 %) is "after that" | same |
| B3 | Before the post-freeze fix the same line gave 1 card and "every line was recognised" while the Fortinet VPN matched nothing | `PROGRESS.md` judge pass |

## Data
| # | Fact | Source |
|---|---|---|
| D1 | CISA KEV catalog 2026.10.30: 1,766 entries from 291 vendors | `data/raw/kev.json` |
| D2 | 361 KEV entries are marked "Known" ransomware use; 313 were added in the last 12 months (since 2025-11-03) | `data/raw/kev.json` |
| D3 | 1,670 of 1,766 entries can be matched by the rules (the rest are "Multiple Products" or vendor-only names) | `PROGRESS.md` M1 |
| D4 | EPSS scores for 1,765 of the 1,766 KEV CVEs, dated 2026-11-02; 0 entries dropped for a missing CVE id or an EPSS outside 0–1 | `data/processed/epss.json`, `PROGRESS.md` M1 |
| D5 | 1,329 of the 1,765 scored KEV CVEs (75 %) have an EPSS of 10 % or more, so the "high attack forecast" label alone separates little | `data/processed/epss.json` |
| D6 | Licences: CISA KEV CC0 1.0 (credited, "CISA does not endorse this tool"); EPSS from FIRST.org, free to use, attribution requested | `data/README.md`, app credits |
| D7 | No API keys are needed for the data; both sources are free | CLAUDE.md §4 |

## Ranking rule (one sentence)
| # | Fact | Source |
|---|---|---|
| R1 | Only programs with a flaw on CISA's exploited list are listed; order: any flaw used in ransomware first, then the highest EPSS (forecast chance of attacks somewhere in the world in the next 30 days), then the newest addition to the list | `core/rules.py`, app panel "How the order is decided" |
| R2 | Top 3 = "this week"; the rest are "after that"; one card per line the user pasted | `core/rules.py` (`TOP_N = 3`) |
| R3 | EPSS shown as a percentage with one decimal, rounded down (never "100 %"), never called a risk score | `core/explain.py` |
| R4 | Near-ties: in the sample, items 1–5 all show "99.9 %" (items 6–7: 99.8 %, 99.7 %); the order of 1–5 comes from EPSS differences in the 3rd–5th decimal, which the user can't see | `out/freeze_check.txt` |

## Matching
| # | Fact | Source |
|---|---|---|
| M1 | A line matches when the KEV entry's vendor and product words both appear in it, or a distinctive 2+-word product name alone; common short forms are expanded (ms → microsoft, Fortinet VPN → FortiOS, log4j → Log4j2 …) | `core/match.py` |
| M2 | Pasted lines are split on commas, semicolons and tabs outside brackets ("Microsoft 365 (Outlook, Teams)" stays one) | `core/match.py`, `tests/test_match.py` |
| M3 | Probe of 54 messy product names: 37 match after the post-freeze fix (26 before, one of them false: Notepad → Notepad++) | `out/freeze_check.txt`, `out/judge_match_probe.txt` |
| M4 | Still not matched in the probe, among others: FortiClient VPN, Teams, Word, Android phones, Ubuntu, Zyxel and D-Link routers (KEV has entries for some of these vendors under other names) | `out/freeze_check.txt` |
| M5 | Versions are not checked | `core/match.py` docstring, app text |

## Privacy and AI
| # | Fact | Source |
|---|---|---|
| P1 | The pasted list is processed in memory only: not saved, not logged, not sent anywhere | `core/match.py`, app intro text |
| P2 | EPSS is downloaded for all KEV CVEs (about 13 s, once a day), not only matched ones, so FIRST and the committed cache learn nothing about the list | `PROGRESS.md` key decisions |
| P3 | The AI (Google Gemini, `gemini-3.5-flash-lite`) gets four public facts per card (flaw count, ransomware yes/no, forecast %, newest date), not the list and not even the product name | `core/explain.py` |
| P4 | Every AI text is checked: exactly 2 sentences, no number that isn't in the facts, no "vulnerable" / "risk" / "you are", ransomware only when true, right language; failures fall back to a template sentence | `core/explain.py`, `tests/test_ai.py` |
| P5 | Only the top 3 cards call the AI; the app works without any key (template text, and 4 cached Gemini texts for the sample list, labelled "cached example text", each read by a person; 1 Finnish text was regenerated after a grammar error) | `data/processed/sample_texts.json`, `PROGRESS.md` M3 |
| P6 | The key lives only in `.env` (gitignored) | `.gitignore`, `PROGRESS.md` judge pass |

## Build and quality
| # | Fact | Source |
|---|---|---|
| Q1 | 47 automated tests pass (matching, ranking, text, AI checker, download fallbacks) | `python -m pytest -q`, 2026-11-03 |
| Q2 | Finnish (default) and English, switchable | `app.py` |
| Q3 | Runs locally: Python 3.12 + Streamlit; checked at 375 px phone width; not yet opened on a real phone | `PROGRESS.md` |
| Q4 | If the KEV download fails, the last saved copy is used and the app shows its version and date; if EPSS is down, ranking uses KEV fields only | `core/fetch.py`, `tests/test_fetch.py` |
| Q5 | Built solo in a 2-hour template dry run on 2026-11-03 (milestones M0–M4 + judge pass, 16:14–17:13, plus post-freeze matching fixes) | `PROGRESS.md` status table |
| Q6 | Product video: 46.8 s (target 40 s, max 60 s), 1920×1080, rendered locally with Remotion from `pitch/scenes.json`, ElevenLabs voice-over; not published in this test run, so no link | `../videogen/PROGRESS.md`, `../videogen/out/video.mp4` |

## Known limits (state when relevant)
| # | Limit | Source |
|---|---|---|
| L1 | Live Gemini calls take ~20–30 s; with the 20 s timeout, other lists often get the template text | `PROGRESS.md` broken/open |
| L2 | Only products on CISA's exploited list; no NVD/CVSS lookup for others (next step) | CLAUDE.md §4 |
| L3 | Finnish text is written by Claude and Gemini, not read by a native speaker | `PROGRESS.md` |
| L4 | No hosted demo, no repo link yet; video rendered but not published (test run, no link) | `PROGRESS.md` open items |

## Never claim
- "You are vulnerable", "your risk", "safe" for unmatched items, any user or customer, any price or revenue, CISA or Traficom endorsement, real-phone testing.
