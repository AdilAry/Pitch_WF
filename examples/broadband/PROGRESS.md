# Progress

## Status
- **M0:** done and closed; Adil confirmed the page works (2026-11-02). Repo: https://github.com/AdilAry/production.
- **M1:** pipeline, rules and tests done. Only 1 shortlist cell passes the strict rules, so the shortlist is filled in tiers. See "Shortlist decision".
- **M2:** map, cell card, shortlist table, CSV export and ranking panel done and checked locally in a browser. Adil confirmed it works (2026-11-02).
- **M3:** Gemini sentences, number check, saved shortlist sentences, demo mode and call limits done and checked locally, with and without a key. Adil tested locally and confirmed it works (2026-11-02). Adil also downloaded the plain CSV from the app, and its contents were read and checked.
- **M4:** done and closed; Adil tested the deployed app on desktop and phone and confirmed it (2026-11-02). See "M4 checks".
- **FREEZE:** 2026-11-02 16:30, on Adil's word after the final view of the app. Bug fixes only from here.
- **Materials:** `README.md`, `pitch/` and `deck/deck.json` written from `pitch/facts.md`. `pitch/scenes.json` copied to the video repo.
- **Deck:** screenshots are cropped and `deck/pitch.pptx` is built with them (not committed; originals in `out/shots_raw/`).
- **Video:** finished and accepted by Adil (2026-11-02): `../videogen/out/video.mp4`, 104.7 s, 9 scenes, ElevenLabs voice. `pitch/scenes.json` is an exact copy of the final script. See `../videogen/PROGRESS.md`.
- **Next:** Adil uploads the video and gives the link, which replaces "to be added" in `README.md`, `pitch/writeup.md` and `pitch/facts.md`.

## Time log
| Milestone | Start | End | Note |
|---|---|---|---|
| M0 | 2026-11-02 13:57 | 2026-11-02 14:03 | Everything except the deploy, which Adil does by hand |
| M1 | 2026-11-02 14:28 | 2026-11-02 14:35 | Build done; tiers added after Adil's decision |
| M2 | 2026-11-02 14:46 | 2026-11-02 14:55 | Build and browser checks; deploy is Adil's step |
| M3 | 2026-11-02 15:03 | 2026-11-02 15:11 | Build and checks; spending limit and Streamlit secret are Adil's steps |
| M4 | 2026-11-02 15:28 | 2026-11-02 16:18 | Includes Adil's test rounds and the three map fixes; first build ended 15:39 |

## Shortlist decision (Adil, 2026-11-02)
**Keep the thresholds and fill the shortlist in tiers** (`rules.shortlist`). This replaces "top 20 of strong candidates" in CLAUDE.md §5:
1. Tier 1, strong candidate.
2. Tier 2, mobile unproven.
3. Tier 3, slow but thin data, with strong mobile nearby first.

Each tier sorts by score. The M2 table and export must show `tier_name`, and tier 3 needs its test count in plain sight. Still to confirm with the mentor.

The evidence behind the decision follows. Real result for 2026 Q3, current thresholds (7 791 cells, 491 224 residents):

| Label | Cells | Residents |
|---|---:|---:|
| Strong FWA candidate | 2 | 22 |
| Candidate, mobile unproven | 9 | 129 |
| Thin data | 1 025 | 64 491 |
| Not a gap | 409 | 356 843 |
| No data | 6 346 | 69 739 |

The shortlist has 1 cell (14 residents), because the other strong cell has under 10 residents. This is the data, not a download fault: the box holds 23 000 to 30 000 fixed tests in each of the last 5 quarters, so a typical cell has very few tests.

Shortlist size if rules change (cells with at least 10 residents; full run saved locally in `out/sensitivity.txt`):

| Change | Shortlist cells | Their residents |
|---|---:|---:|
| Current rules | 1 | 14 |
| Fixed and mobile minimum 5 tests | 4 | 162 |
| Slow below 50 Mbit/s | 3 | 229 |
| Slow below 50, minimum 5 tests | 8 | 606 |
| Pool the last 4 quarters | 3 | 88 |
| 4 quarters, slow below 50 | 10 | 247 |
| 4 quarters, minimum 5 tests | 8 | 291 |
| 4 quarters, slow below 50, minimum 5 tests | 20 (limit; 33 strong before the resident rule) | 789 |

Other slow cells with at least 10 residents, 2026 Q3: 4 unproven (105 residents) and 66 thin (2 639 residents, median 1 fixed test, 10 of them with strong mobile nearby). No threshold has been changed.

## Done
- Skeleton: `app.py`, `core/fetch.py`, `tests/test_m0.py`, `requirements.txt`, `.env.example`, `LICENSE`, `data/README.md`.
- `python -m core.fetch` writes `data/processed/sample.json`. The page shows that file's number and reads nothing else.
- Checked result: 491 224 residents, 7 791 inhabited cells, 27 municipalities, in Varsinais-Suomi.
- 4 tests pass. The page was opened locally and shows the number.
- M2: `app.py` (map, card, table, how it works), `core/explain.py` (template reason), `core/export.py` (CSV), `grid.cell_polygons`. 50 tests pass.
- Checked in a browser: clicking map squares updates the card, a table row zooms the map to its square (also after sorting), "Show whole region" resets, and the page stacks at phone width. The CSV contents were checked from `export.shortlist_csv`; the download buttons were not clicked and neither file was opened in Excel.
- M3: `core/explain.py` (Gemini, `check_sentence`, saved sentences), `data/processed/reasons.json` (20 of 20 shortlist sentences), export column `reason_written_by`, `tests/test_explain.py`. 72 tests pass.
- M3 checks: the card shows the saved sentence in the browser. A scripted run of the app (Streamlit's AppTest) showed no errors without a key (demo caption, no AI button) and a live "Reword with AI" click with the key. The button was not clicked by hand in the browser.
- M4: `app.py` (map controls, phone layout, red ring, card box, thin-data warning, error states, plainer wording), `core/explain.py` (`ask_gemini`, prompt, `CAUSAL_WORDS`), `reasons.json` regenerated (20 of 20). 76 tests pass.

## M4 checks
- **Browser, desktop:** the wheel over the map now scrolls the page and leaves the map alone. Clicking an orange ring updates the card. "Show whole region" returns after a drag. The table's download icon is hidden; its other icons stay.
- **Browser, phone size (375 px, emulated):** the whole region fits with no sideways scroll, and a table row moves the map and card and shows a message.
- **Scripted run (AppTest):** no-data, thin, under-10-residents, failed call, failed number check and missing data files all show the right text with no errors. The failed AI cases used a fake Gemini reply.
- **Not checked:** the deployed app, a real phone, the download buttons in M4, and Excel. Pinch zoom was not tried.

- **Adil's M4 test (2026-11-02):** first load is normal size on the deployed app. Both CSVs downloaded and read: same 20 rows, header lines present. Excel not reported. The map's bottom edge still retracted when scrolling on desktop, local and deployed, but not on a phone, and the deployed app faded grey on map use. Both were then worked on, see below.

## Broken / open
- **Pre-freeze, not done:** thresholds and tiers not confirmed with the mentor; grid reference date not confirmed. The plain CSV was not opened in Excel by Claude; with Finnish settings Excel may put it in one column (known Excel behaviour, not tried), and then Data > From Text/CSV with comma as separator reads it.
- **Map retracts while scrolling only with browser graphics acceleration off.** Adil's test in Edge on the deployed app: with acceleration on, the problem disappeared. With it off, the picture is cut off while scrolling, then flashes and snaps back thanks to `opacity: 0.999` in `PAGE_STYLE`. Not an app fault to fix further. **The demo machine is the Legion (Adil, 2026-11-02), not the T480s:** keep graphics acceleration on in its browser.
- **LibreWolf doesn't show the map (Adil).** Probably because it turns WebGL off by default (from memory, not checked). The caption points to the shortlist table, which still drives the card. Not tested in LibreWolf. Demo in Edge or Chrome.
- **First-load map fault:** seen once more in M4, on the first load after a server start in the preview pane (map drawn at the wrong size). The page now sends a resize signal 4 times after load, and the one first load tried after that was correct. One try doesn't prove the fix, and a resize signal sent to an already correct page showed no effect. Check the first load on the deployed app. Giving the map a new widget key caused the same fault every time, so don't do that (see "Key decisions").
- On a slow connection the base map appears some seconds after the coloured squares (about 10 s in the preview pane). It arrives on its own.
- Streamlit Cloud deploys from `master`; work is committed on `main`. Copy it across with `git push origin main:master`.
- `gh` is not installed. `git push` did work from Claude Code's shell during M2.
- Grid reference date not confirmed: the WFS title only says 2025, and the Statistics Finland pages refused the script. The attribution says "2025 edition" until someone checks it.
- **Gemini free plan:** Adil's key is on the free plan, so there is no spending limit to set unless billing is added (then 3 euro). Recommended: keep `GEMINI_API_KEY` out of the Streamlit secrets, so the deployed app runs in demo mode. Free-plan rate limits apply, and the Gemini terms may require the paid plan for apps offered to EEA users (from memory, not checked).
- **Mentor question:** rank 1 has 220 fixed tests for 14 residents, and rank 17 averages 0.1 Mbit/s from 3 tests. Both are real data values, but the tests may not come only from residents (visitors, a few devices testing repeatedly). Be ready to explain them.
- Rerunning `python -m core.explain` replaces every saved sentence, and any that fail 3 times use the template, so check the printed count before committing.

## Data facts
- **Ookla:** newest quarter with both types is **2026 Q3**, files `parquet/performance/type={fixed,mobile}/year=2026/quarter=3/2026-07-01_performance_{fixed,mobile}_tiles.parquet` (about 365 MB and 190 MB). `tile_x`, `tile_y` are the tile centre, confirmed against the polygon and rounded to 4 decimals. The region's filtered files are about 0.1 MB each.
- **Population grid:** newest layer is `vaestoruutu:vaki2025_1km`. `grd_id` is `1kmN<north km>E<east km, 4 digits>`, and `xkoord`, `ykoord` are the lower-left corner in EPSG:3067 (matches all 96 904 cells). `vaesto` is never hidden (minimum 1). `-1` in the sex and age fields means hidden, and those fields are not used.
- **`cells.parquet` for M2:** one row per cell. Columns: `cell_id`, `cell_e`, `cell_n` (km), `municipality_code`, `municipality`, `residents`, `fixed_mbps`, `fixed_median_of_tile_averages_mbps`, `fixed_tests`, `mobile_mbps`, `mobile_tests`, `lon`, `lat` (centre, WGS84), `is_thin`, `label`, `score`. `meta.json` holds the quarter and attribution text. `rules.shortlist()` applies the `MIN_RESIDENTS` rule.

## Key decisions
- **Deployed app has no Gemini key** (Adil, 2026-11-02). `GEMINI_API_KEY` was in the Streamlit secrets during M4; the deployed app was then checked and runs in demo mode.
- **Video length: target 90 s, maximum 120 s** (Adil, 2026-11-02). The final video is 104.7 s and was kept, not cut to 90 s.
- **The video repo's `scenes.json` is the master once copied in.** It is copied back over `pitch/scenes.json` after the render; `docs/PITCH.md` now says so. The video repo also owns `SCENES_FORMAT.md`.
- **Numbers hidden for squares under 10 residents** (Adil, 2026-11-02; goes beyond CLAUDE.md §4, which covers the shortlist and export). The card and tooltip say "Fewer than 10", and the card shows no speeds, test counts or AI button (4 560 of 7 791 cells). The exact count isn't sent to the browser's map data either. The square keeps its colour, so its label stays visible. `cells.parquet` is unchanged and still holds the numbers.
- **DNA accent colours** (Adil's request): pink `#DC016F`, plum `#792A59`, text `#180D0A`, sampled from Adil's dna.fi screenshot, in `.streamlit/config.toml` and the title band. Colours only: no DNA logo or name in the title, and the app is always light. Map label colours stay, so strong candidates remain red squares, as in CLAUDE.md.
- **Streamlit's grey fade during reruns is off** through CSS on `data-stale`. Checked locally: elements were marked stale for 26 frames during a map click and stayed at full opacity. The rerun itself is no faster, so the card may lag a moment on a slow host.
- **Thin conclusion reworded** to "too few fixed tests to judge: check locally...", and `check_sentence` rejects a second "so", because the CSV sentences read "so ... so ...".
- **Scroll wheel no longer zooms the map.** It caused the "retracting" map: the wheel zoomed out instead of scrolling the page (confirmed in the browser). The map's + and − buttons and double-click still zoom.
- **Phones are detected from the browser's user agent** ("Mobi"), on the server, for a lower zoom and a shorter map. A narrow desktop window doesn't count as a phone, so it can still cut off the region's sides.
- **The table's download icon is hidden with CSS,** matched on its label `Download as CSV`, because Streamlit has no setting for it. A Streamlit upgrade could rename the label, so recheck it after any version change.
- **"Show whole region" changes the view by a tiny amount each time,** because Streamlit moves the map only for view values that changed.
- **AI sentences may not use causal words** (`CAUSAL_WORDS`: "leading", "because", "meaning" and similar), so they can't claim that one number causes another.
- **The top candidate gets a larger red ring,** and only tier 1 of the shortlist does. The other strong square (under 10 residents) stays without a ring.
- **Gemini model is `gemini-3.5-flash-lite`,** confirmed in the key's model list, called through the Interactions API. It gets only one cell's numbers, label and conclusion: no cell id, municipality or coordinates.
- **`check_sentence` guards every AI sentence.** One sentence; only the cell's numbers and the thresholds; facts in a fixed order so numbers can't swap; the conclusion word kept; no operator, coverage or household words. Any failure shows the template. It can't judge meaning beyond that.
- **Saved sentences store their facts.** If the data changes, the old sentence is ignored and the template is shown.
- **Live AI only by button, on squares with no saved sentence.** Limits: 5 calls per visitor, 200 in total until the app restarts. A reload resets the visitor count, so the total is the real budget guard. No-data squares never call Gemini.
- **The CSV uses the saved AI sentence and says so** in the added `reason_written_by` column.
- **Layer ids change after each map click.** Streamlit fades the whole map after a click and offers no setting to stop it. It forgets the click when the layer's id disappears, so `build_map` puts `map_version` in the ids. A new widget key also clears the fade, but it distorted the map.
- **Shortlisted squares get a ring** that keeps its size on screen, because a 1 km square is only a few pixels at region zoom. Squares under 10 residents get no ring.
- **Map click keeps the view; table click zooms in** to the square.
- **The page opens with rank 1 on the card,** so it is never empty.
- **One CSV button.** The Finnish Excel export was removed (Adil, 2026-11-02): in Adil's test it didn't work and was badly formatted, and the brief never asked for it.
- **Download box widened to 21.0-24.0 °E, 59.65-61.15 °N.** The region reaches 23.91 °E and 61.10 °N, so the planned 23.8 °E would have cut off eastern cells. `check_bbox_covers` raises an error if a cell or its neighbours leave the box.
- **"No data" is a fifth label**, as §4 requires. Order of checks: no tests, thin, not a gap, strong, unproven. A fast cell with few tests is still "Thin data".
- **Mobile neighbours** include uninhabited cells and cells in other regions. Tiles in uninhabited cells count for mobile only.
- **`fixed_tests_in_cells` is lower than `fixed_tests_in_box`** (19 886 of 26 993) because tests in uninhabited cells and outside the region are left out.
- **Cells under 10 residents stay in `cells.parquet` and on the map.** §4 excludes them from the shortlist and export only.
- **Municipality key not downloaded:** the grid's own `kunta` field gives each cell's municipality. The region comes from the Statistics Finland municipality-to-region correspondence (2025 edition). The code raises an error if a municipality code is missing from it. All codes matched.
- **AI provider is Gemini, not Claude** (Adil's decision, 2026-11-02, because this is a dry run). The AI role is unchanged: it only rewords computed facts, and the template sentence stays the default.
- `pytest` is in `requirements.txt` because §8 requires tests, though §6 does not list it.
- HTTP uses the standard library (`urllib`), so no extra library is needed.

## How to run
```powershell
.\.venv\Scripts\Activate.ps1
python -m pytest -q tests
streamlit run app.py
```
Rebuild the data (about 1 minute, needs internet):
```powershell
python -m core.fetch
python -m core.grid
```
Regenerate the saved AI sentences (needs `GEMINI_API_KEY` in `.env`):
```powershell
python -m core.explain
```

On the T480s (bash):
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
streamlit run app.py
```

## AI-use log
- Claude Code (Opus 5.5): wrote the M0 skeleton, checked the data sources and their schemas, ran the tests.
- Claude Code (Opus 5.5): wrote the M1 pipeline, rules and tests, ran them on the real data, measured how thresholds change the shortlist.
- Claude Code (Opus 5.5): wrote the M2 app, reason template, export and tests, and checked the page in a browser.
- Claude Code (Opus 5.5): wrote the M3 Gemini layer, number check, demo mode and tests.
- Claude Code (Opus 5.5): did the M4 polish, tested the map faults and phone layout in a browser, and scripted the error-state checks.
- Claude Code (Opus 5.5): wrote the README, `pitch/` materials, the video script and the slides.
- Claude Code (Opus 5.5), in the video repo: adjusted the video engine, revised the script, timed the screen clips and rendered the video.
- ElevenLabs: generated the video's voice-over.
- Gemini (`gemini-3.5-flash-lite`): reworded the computed facts into the shortlist's reason sentences, saved in `reasons.json`, and live sentences in the app.
