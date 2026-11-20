# CLAUDE.md: Broadband Gap Finder

## 1. The situation
- **Project:** a map of Varsinais-Suomi that finds 1 km squares where many people live but fixed broadband is slow, ranks them as 5G fixed-wireless (FWA) candidates, and explains each pick. **Why it exists:** dry run (2026-11-02) for Since AI 2026, using the mock DNA challenge "Broadband gap finder". It's practice for the real pick and build, so the process and timings matter as much as the app.
- **Who it's for:** DNA's regional sales managers (choosing next quarter's campaign areas) and network planners (checking whether an area's mobile network already performs well). It's judged on the challenge criteria:
  1. Soundness of the ranking: population, test counts and speeds combined sensibly, low-sample areas flagged.
  2. Clarity of the map and the per-area explanation.
  3. Actionability: an exportable shortlist sales can use next week.
  4. Data handling: correct licence attribution, no attempt to infer individuals.
- **Team:** Adil (solo). **Build time:** 8 h.

## 2. About me
- Adil, embedded systems engineer (ESP32, KiCad), comfortable with Python and C, newer to web frontends. Explain non-obvious code briefly; tell me exactly what to run.
- **New to GIS:** explain coordinate systems (WGS84 vs EPSG:3067), spatial joins and tile maths briefly when they come up. Judges will ask me how the ranking works, so I must be able to explain every step.
- Windows laptop, PowerShell, 16 GB RAM, GTX 1650 with 4 GB VRAM (`docs/laptop.md`). Apps run locally; anything that needs a real GPU (model training, large local models) goes to a cloud GPU (Verda / Modal / free Kaggle or Colab notebooks). This project needs no GPU.
- Second machine for demos and budget-hardware tests: ThinkPad T480s, Linux Mint, CPU only, 8 GB RAM (`docs/testing_laptop.md`). Commands there are **bash**, not PowerShell (`source .venv/bin/activate`); give both versions when a step runs on it.

## 3. The problem
- **Who has the problem:** DNA's sales managers and network planners. Outside the big cities many households still have slow fixed broadband, and 5G fixed-wireless (a home router on the mobile network) could replace it quickly.
- **Pain points:**
  - Campaign areas are chosen from coarse municipal statistics, so villages with real demand are hidden inside municipal averages.
  - There's no shared, explainable list of where to market FWA next quarter.
  - Planners can't quickly see whether an area's mobile network already performs well enough for more FWA homes.
- **What they want / don't want:** click an area and read why it's on the list, in one sentence with real numbers. A top-20 shortlist they can export and use next week. No black-box scores; thin data shown honestly, not hidden.
- **Constraints:**
  - Public data only. Speed-test tiles don't say which operator was tested, so they show **what people in an area experience**, not DNA's coverage. Every screen and export must say this.
  - Ookla data is **CC BY-NC-SA 4.0 (non-commercial)**. Fine for this rehearsal; at a real event, check it against the challenge's IP terms.
  - No attempt to identify households or individuals (see §4 privacy rules).
  - English UI. Finnish place names as given in the data.

## 4. The data
- **Sources** (all free, no keys):
  - **Speedtest by Ookla open data:** quarterly performance tiles, fixed and mobile, Parquet, public S3 bucket `s3://ookla-open-data/` (also over HTTPS at `https://ookla-open-data.s3.amazonaws.com/`). Tiles are zoom-16 web-mercator squares, about 610 m at the equator and **about 300 m wide at Turku's latitude**. Expected columns: `quadkey`, `tile` (WKT polygon), `avg_d_kbps`, `avg_u_kbps`, `avg_lat_ms`, `tests`, `devices`. **Check the real file listing and schema at the start of M1** and use the newest quarter that has both fixed and mobile files.
  - **Statistics Finland population grid, 1 km × 1 km:** WFS at `https://geo.stat.fi/geoserver/vaestoruutu/wfs`, EPSG:3067 (ETRS-TM35FIN), residents per inhabited cell plus age groups, CC BY 4.0. Use the newest `vaki…_1km` layer listed in GetCapabilities and check its field names before using them.
  - **Statistics Finland 1 km grid municipality key:** maps each grid cell to a municipality (CSV/XLSX). Varsinais-Suomi is region code 02. If the key has no region column, map municipalities to the region with Statistics Finland's municipality–region classification.
- **Processing pipeline** (in `core/`, run once and save outputs to `data/processed/`):
  1. Read only Ookla rows in a bounding box around Varsinais-Suomi (about 21.0–23.8 °E, 59.7–61.1 °N), filtering in DuckDB while reading, never downloading the whole country.
  2. Convert tile centroids to EPSG:3067 and assign each tile to the 1 km cell its centroid falls in.
  3. Keep only cells inside Varsinais-Suomi, using the municipality key.
  4. Join to the population grid on the cell id.
- **Rules / thresholds** (in `core/rules.py` as named constants; all are my choices, shown in the app, and to be confirmed with the mentor):
  - Units: Ookla speeds are kbit/s, so divide by 1000 to get Mbit/s.
  - **Cell fixed download** = test-weighted mean of tile `avg_d_kbps` (Σ avg × tests / Σ tests). Also store the median of tile averages, labelled exactly that way. Ookla gives no per-test medians, so never call it "median download".
  - **Fixed tests** = sum of `tests` from fixed tiles in the cell.
  - **Nearby mobile download** = test-weighted mean of mobile tiles in the cell and its 8 neighbours (3 × 3 km), with its own test count.
  - **Slow fixed:** fixed download < `SLOW_FIXED_MBPS = 30`.
  - **Strong mobile nearby:** mobile download ≥ `STRONG_MOBILE_MBPS = 100` with ≥ `MIN_MOBILE_TESTS = 10`.
  - **Thin data:** fixed tests < `MIN_FIXED_TESTS = 10`. Thin cells are flagged and shown in a separate colour, never silently dropped.
  - **No fixed tests at all:** shown as "no data", not as "slow".
  - **Score** = residents × gap, where gap = (SLOW_FIXED_MBPS − fixed) / SLOW_FIXED_MBPS, clipped to 0–1. It's used only to sort candidates. Labels:
    - **Strong FWA candidate:** slow fixed, strong mobile nearby, enough tests.
    - **Candidate, mobile unproven:** slow fixed, mobile below threshold or thin.
    - **Thin data:** too few fixed tests to judge.
    - **Not a gap:** fixed at or above threshold.
- **Privacy rules:**
  - Work only with aggregated cells.
  - No cell with fewer than `MIN_RESIDENTS = 10` residents appears in the shortlist or the export (my rule, to avoid pointing at single households).
  - No addresses, no reverse geocoding to buildings.
  - Ookla `devices` is used only as a count, never to describe people.
- **Attribution** (app footer, export header, README): "Speedtest® by Ookla® open data, CC BY-NC-SA 4.0" and "Statistics Finland, 1 km population grid, CC BY 4.0", with the data quarter and reference year.
- `data/raw/` is **never committed** (large downloads). The processed Varsinais-Suomi files in `data/processed/` are small aggregates and can be committed, with `data/README.md` stating the source, licence and processing.

## 5. The concept
- **One sentence:** A map tool that ranks 1 km areas in Varsinais-Suomi where many people live with slow fixed broadband but fast mobile nearby, so that DNA's sales team can pick next quarter's fixed-wireless campaign areas without guessing from municipal averages.
- **The 3 questions it answers for the user:**
  1. Where are the most residents living with slow fixed broadband?
  2. Which of those areas already have strong mobile performance nearby, and so are ready for fixed-wireless?
  3. How sure are we: how many tests is each answer based on?
- **The "wow" moment for the demo:** click a red square on the Varsinais-Suomi map and read a card like "412 residents, fixed download 18 Mbit/s from 37 tests, mobile download 140 Mbit/s nearby: strong fixed-wireless candidate", with **real numbers from the data** (the example numbers are the mentor's, not ours). Then export the top 20 with one click.
- **MVP:**
  - Map of Varsinais-Suomi with 1 km cells coloured by label (strong candidate / candidate / thin data / not a gap).
  - A card for the selected cell: residents, fixed speed and tests, nearby mobile speed and tests, label, and the one-sentence reason.
  - Top-20 table of strong candidates with municipality, sortable.
  - CSV export of the shortlist, with columns sales can use: rank, municipality, cell id, centre coordinates (WGS84), residents, fixed Mbit/s, fixed tests, mobile Mbit/s, mobile tests, label, reason, plus the attribution and the "not operator-specific" note in the header.
  - A visible "How the ranking works" panel listing the thresholds from §4.
- **Not doing (explicitly):** login, operator-specific coverage claims, real cell-capacity modelling, other regions, time trends across quarters, predicting individual households, a native app, Finnish UI.

## 6. Stack (defaults, change only with a reason)
- Python 3.12 + **Streamlit** (mobile-first layout), pandas, Plotly; FastAPI only if a separate API is needed.
- **Approved extra libraries for this project:** `duckdb` (reads Parquet over HTTPS with filtering), `geopandas` + `shapely` + `pyproj` (coordinates and spatial joins), `pydeck` (map; use `st.pydeck_chart` with `on_select` for clicking a cell). If map clicking fails, the fallback is selecting a cell from the top-20 table, so the card still works.
- AI: Gemini API (`GEMINI_API_KEY`, `google-genai` SDK, Interactions API, notes in `docs/gemini.md`), because this is a dry run. AI only turns the computed facts of one cell into the plain-language reason sentence; it receives only those numbers and labels. **Rules and real data come first; never let the AI invent facts.** A template sentence is the default and always available; Gemini text is the improvement.
- Hardware: none.
- Deploy: Streamlit Community Cloud from GitHub, as early as possible (milestone 0). The deployed app reads `data/processed/` only, never the raw downloads.
- **Demo mode:** the app must work without API keys (cached/precomputed answers, clearly labelled) so anyone I send the link to can use it; live AI calls limited per visitor. Cache Gemini sentences for the top 20 in `data/processed/reasons.json`. Hosted apps can go to sleep: open the deployed URL before showing it to anyone.

## 7. Secrets and data rules
- Keys only in `.env` (loaded with python-dotenv) and in the deployment's secrets settings. Never in code, logs, screenshots, chat, slides or recordings. Never print them.
- `.env`, `data/raw/`, `out/` and large media are in `.gitignore`. Check `git status` before every commit.
- Set spending limits on every API key.

## 8. Milestones (stop after each, tell me how to check it, update `PROGRESS.md`, commit)
**Time budget:** 8 h of building, split as shown below. At the start and end of each milestone, run `Get-Date` and log the time in `PROGRESS.md`. If a milestone reaches its budget, stop and tell me what's left and what you'd cut; I decide whether to continue. The budget is a guide, not a deadline.
- **M0: skeleton + deploy (10%, ~50 min).** Repo structure, `requirements.txt`, `.env.example`, `LICENSE` (MIT for the code; data licences stated separately in `data/README.md`). Confirm the Ookla listing and the population WFS respond. A page that loads one small sample (for example, the Varsinais-Suomi resident total from the grid) and shows one number; deployed and reachable on a phone.
- **M1: data + rules (20%, ~1 h 35 min).** The pipeline from §4 writes `data/processed/cells.parquet`, and the rules from §4 are in `core/rules.py`. Tests in `tests/` check on hand-made cases:
  - kbit/s to Mbit/s
  - the test-weighted mean
  - centroid-to-cell assignment
  - each label
  - the thin-data flag
  - the `MIN_RESIDENTS` exclusion

  Print a summary only (cell counts per label, total residents covered), never the data.
- **M2: core feature (35%, ~2 h 50 min).** Map, cell card, top-20 table, CSV export and the "How the ranking works" panel from §5, visible on the home screen in plain language.
- **M3: AI layer (15%, ~1 h 10 min).** Gemini reason sentences from fixed facts, cached for the top 20, template fallback, demo mode with no key. 3 euro API key spending limit for testing purposes.
- **M4: polish (20%, ~1 h 35 min).** The demo moment (the red-square click), mobile layout, wording without jargon, error states (no data, thin data, map not clickable), attribution in footer and export.
- **FREEZE, when the budget is used up or I say so:** after this only bug fixes. Then §10.

## 9. Working rules
- **One milestone per chat.** Before stopping, update `PROGRESS.md` so a fresh chat can continue from it alone. I start a new chat for the next milestone.
- **After each milestone:** Tell me what to do to test the outcome AND the expected output that I can compare to.
- `git pull` before starting a session; small commits with clear messages.
- Run the tests and the app before every commit. Deploy after every milestone.
- Prefer boring, working code over clever code. No new libraries without asking, beyond those approved in §6.
- If something about the problem is unclear, ask me instead of guessing.
- **Look, don't dump:** inspect data with `head`, `df.info()`, `df.describe()`, `value_counts()`. Never print whole files or long logs into the chat; save long output to `out/` and show the summary.
- **Chat replies:** answer first, then what to run. No preamble, no recap of the diff, no closing offers. Keep the brief code explanations from §2. Files (code, README, `pitch/`) follow their own rules, not this one.
- **Never invent numbers, users or results**, anywhere: app text, commits, docs. The mentor's example card numbers are not ours; never put them in the app, pitch or video.
- Keep `PROGRESS.md`: what's done, what's broken, what's next, key decisions (including any threshold changes and why) and how to run the app (I read it after breaks, which may be days or weeks), plus an **AI-use log** (tool → what it did), which the README and write-up need at the end.

## 10. Presentation materials and README
Only when I say **"freeze, write the presentation materials"** or **"write the README"**: read `docs/PITCH.md` in full first and follow it exactly. Don't read it before then.

## 11. File structure
```
app.py              Streamlit entry point (pages/ if needed)
core/               fetch.py (Ookla + grid download), grid.py (tile-to-cell join), rules.py, explain.py (template + Gemini), export.py; no UI code
tests/              tests for rules and data
data/               raw/ (gitignored), processed/ (committed aggregates), README.md (sources, licences, processing)
docs/               PITCH.md, SCENES_FORMAT.md, DECK_FORMAT.md, API notes, laptop.md, testing_laptop.md (committed)
pitch/              facts.md, scenes.json, writeup.md, live.md (after freeze)
deck/               build.js, deck.json, shots/ (screenshots, committed)
out/                summaries and long output (gitignored)
.env.example  requirements.txt  README.md  PROGRESS.md  LICENSE
```
