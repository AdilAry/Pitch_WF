# PROGRESS: Patch This First

Template dry run, 2026-11-03. Spec: `CLAUDE.md`. One milestone per chat.

## Status
| Milestone | Budget | Start | End | State |
|---|---|---|---|---|
| M0 skeleton | ~6 min | 16:14 | 16:17 | done |
| M1 data + rules | ~18 min | 16:18 | 16:27 | done |
| M2 core feature | ~30 min | 16:29 | 16:36 | done |
| First-question check | 10 min | 16:39 | 16:41 | done: answer is "partly" |
| M3 AI layer | ~12 min | 16:43 | 17:03 | done (16:48 code, 16:50–17:03 live texts after Adil added the key; over budget by ~8 min) |
| M4 polish | ~24 min | 17:05 | 17:06 | done (clock as reported by `Get-Date`) |
| Judge pass + fixes | ~30 min | 17:09 | 17:13 (review only) | review done; issues 1–2 fixed after freeze |
| Freeze: fixes 1–2 + presentation materials | — | 17:15 | 17:22 | done |
| Video (in `../videogen`) | — | — | — | rendered: `../videogen/out/video.mp4`, 46.8 s; not published (test run) |
| Judge pass 2 (repo, deck, video) | — | ~18:20 | 18:28 | review only, nothing fixed |

## How to run
Windows (PowerShell), from the repo folder:
```powershell
py -3.12 -m venv .venv          # first time only
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt  # first time only
streamlit run app.py
```
Linux (T480s, bash):
```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
streamlit run app.py
```
Phone: open the "Network URL" Streamlit prints (same Wi-Fi). Windows may ask to allow Python through the firewall the first time.

## Done
- **M0:** repo structure (`core/`, `tests/`, `data/{raw,processed,samples}`), `requirements.txt` (pinned), `.env.example` (only `GEMINI_API_KEY`, optional), MIT `LICENSE`, `data/README.md`, Streamlit theme in `.streamlit/config.toml` (§5 colours).
  - `core/fetch.py`: downloads the CISA KEV catalog to `data/raw/kev.json` (checked for `catalogVersion` + `vulnerabilities`, atomic write); if the download fails, it falls back to the last saved file and the app shows a warning.
  - `app.py`: shows the KEV entry count and catalog version with the CC0 credit. Cached for 6 h.
  - Checked on 2026-11-03: catalog version 2026.10.30, released 2026-10-30, 1,766 entries (matches its `count` field), file 1.47 MB. App renders on localhost and at a 375 px phone width; `/_stcore/health` answers "ok" on the Network URL from this laptop. Not yet opened on a real phone. Fallback tested by pointing the URL at an invalid host: it loads the cached copy.

- **M1:** matching, ranking, EPSS, tests, sample list.
  - `core/fetch.py`: `clean_kev` (drops entries without a `cveID`; 0 dropped on 2026-11-03), `load_epss` (EPSS for **all** KEV CVEs in batches of 100, ~13 s, cached in `data/processed/epss.json` once per day; old cache or "no scores" if the API is down), `clean_epss` (drops values outside 0–1; 0 dropped). 1,765 of 1,766 KEV CVEs have a score, dated 2026-11-02.
  - `core/match.py`: rule from §4 plus: product names split on "and" / "," / "&" ("Firefox and Thunderbird"); bracketed short forms count ("(NAS)", "(HP)"); Chromium/Chrome components → Chrome, Win32k/Windows components → Windows; "Core"/"Desktop" = the vendor's main product (WordPress Core, TeamViewer Desktop); a product that only repeats the vendor ("Microsoft"/"Microsoft") is ignored unless the vendor has one product (7-Zip); vendor hints for lines that omit the vendor ("Windows 11" → Microsoft); "Multiple Products" never matches. Product-alone matches need 2+ words, not all generic ("Exchange Server" yes, "Media Server" no). Input capped at 200 lines × 200 chars. 1,670 of 1,766 KEV entries are matchable.
  - `core/rules.py`: `TOP_N = 3`, `HIGH_EPSS = 0.10`, ordering ransomware → max EPSS → latest `dateAdded` (stable sorts); within an item the lead CVE is chosen by the same rule. `vendor_links` takes advisory URLs from `notes`, skipping NVD and CISA directive links.
  - `data/samples/office_12.txt`: invented 12-person office list (16 lines), labelled as invented.
  - Tests: 27 in `tests/test_match.py` and `tests/test_rules.py`, all pass.
  - App page now also shows the EPSS credit with score date and count.
  - **Sample check (2026-11-03, KEV 2026.10.30):** 13 of 16 lines match. Not matched: Zoom, Synology NAS, HP LaserJet printer (none are in KEV). Current top 3: Fortinet FortiGate 60F firewall, Windows 11 Pro, Windows 10 Pro. Full output in `out/m1_sample_check.txt` (regenerate with the snippet in "Next").

- **M2:** the MVP home screen from §5, in Finnish (default) and English.
  - `app.py`: FI/EN switch, text box + "Use sample list" + "Show what to patch", top-3 cards (product line, red "Used in ransomware" and blue "High attack forecast" badges, what to do, vendor links shown by site name, "the tool does not check versions", why, first 5 CVE ids + "show all", CISA's original instruction in an expander), "After that" list, "Not matched" list with "does not mean safe", "How the order is decided" panel, data credits with dates and "CISA does not endorse this tool". Warnings for KEV/EPSS fallbacks are translated. User lines are escaped (tested with `<b>Notepad</b> *bold*`: shown literally).
  - `core/explain.py`: template sentences in FI/EN (no AI yet). EPSS shown as "forecast chance … somewhere in the world in the next 30 days", rounded **down** to one decimal (0.99999 → 99.9 %, never "100 %"), Finnish decimal comma and D.M.YYYY dates. KEV `requiredAction` (44 wordings) is sorted into: update ("Install the vendor's latest update", plus "if there is no fix yet, stop using it" when CISA says discontinue), end-of-life ("replace it or stop using it"), or other (shows CISA's text). Vendor links: lead CVE's first, then the newest CVEs', max 2; old CVEs often have only an NVD link, so newer advisories fill in.
  - Tests: 31 pass (4 new in `tests/test_explain.py`).
  - **Office-manager read of the sample top 3 (KEV 2026.10.30, EPSS 2026-11-02):** 1. Fortinet FortiGate 60F firewall (15 flaws, ransomware, 99.9 %, newest 27.7.2026, links to fortiguard), 2. Windows 11 Pro, 3. Windows 10 Pro (each 203 flaws, ransomware, 99.9 %, newest 13.10.2026, links to msrc.microsoft.com). Each says "install the latest update", which is a real, current action; the newest-flaw dates (2026) show they are current even though the lead CVEs are from 2018/2021. Order is sensible: the internet-facing firewall first. Weak spot: 2 of 3 cards are Windows with identical reasons (see Broken / open). Output in `out/m2_sample_check.txt`.
  - Checked in the browser at desktop and 375 px width: no horizontal scroll, no console errors; sample list, nothing-matched list (`Zoom`, `Synology NAS`) and the How panel render in both languages.

- **First-question check** (sponsor's view, KEV 2026.10.30, EPSS 2026-11-02, sample `office_12.txt`, app clicked through in Finnish). Full ranked list with per-item fields in `out/firstq_ranked.txt`.
  - **Answer to §1's question: partly.** The top 3 are KEV-listed, ransomware-linked, each with a plain "install the latest update", a vendor link and a one-sentence rule, so yes on "attackers are using it" and "can act". But:
    1. **Only 2 distinct actions.** Cards 2 and 3 (Windows 11 Pro, Windows 10 Pro) have the same 203 CVEs, the same text and the same links.
    2. **The rule barely separates the list.** Items 1–9 all have a ransomware-linked CVE and max EPSS 87–100 %; the order of 1–7 comes from EPSS differences in the 3rd–4th decimal (1.0000, 0.9998, 0.9994, 0.9981 …), which the UI shows as the same "99,9 %". A judge asking "why Windows above Office?" gets an answer the user can't see.
    3. **Windows 10's action may be wrong.** Microsoft ended Windows 10 support on 14.10.2025, so for "Windows 10 Pro (2 old laptops)" "install the latest update" may not be possible without paid extended updates; the real action could be "replace or upgrade". KEV doesn't carry this, so the app can't know it. (Support dates to verify on Microsoft's site before using them in the app.)
    4. **Fresh, internet-facing items rank low.** WordPress website (public site, newest KEV flaw 25.9.2026, EPSS 95.7 %) is 11th and Chrome (7 KEV additions in the last 12 months) is 10th, because neither has a ransomware flag. The top-3 lead CVEs are from 2018 and 2021; the "newest flaw" dates (27.7.2026, 13.10.2026) are what show they're current.
    5. Wording: "Attackers are already using 203 known flaws in this product" reads as if all 203 hit this copy now; "have been used" would match the data better. Fix in M3 text.
  - Non-issues seen: unmatched list (Zoom, Synology NAS, HP LaserJet) is visible with "does not mean safe"; data credits and dates present; FortiGate first is easy to defend (internet-facing firewall, ransomware).

- **M3:** AI layer per §6, with the templates as the default.
  - `core/explain.py`: `facts()` gives Gemini **four public facts only** (flaw count, ransomware yes/no, EPSS % as shown, newest date), not the inventory line and not even the product name. `prompt()` asks for two plain sentences in FI or EN with fixed rules (numbers exactly as given, "this program", never vulnerable/risk/hacked, no ransomware unless true). `check_ai_text()` rejects text that isn't exactly 2 sentences, has markup or links, uses a banned word (vulnerable, risk, "you are", hacked, guarantee … and Finnish equivalents), contains any number not in the facts, drops the flaw count or the EPSS %, mentions ransomware when the flag is false (or omits it when true), or is in the wrong language. Rejected or failed calls (timeout 20 s) fall back to the template; only the error type is logged, never the key.
  - Model `gemini-3.5-flash-lite` via the Interactions API (`client.interactions.create`), overridable with `GEMINI_MODEL` in `.env`. SDK `google-genai==2.34.0` added to `requirements.txt` (allowed by §9).
  - Demo cache: `python -m core.explain build` asks Gemini for the sample's top 3 in FI and EN (6 calls) and writes `data/processed/sample_texts.json` with model, date, KEV version and EPSS date. Entries are keyed by their facts and **re-checked on load**, so a stale or edited entry is ignored.
  - App: for each top-3 card, cached text → live Gemini (only with a key; the top-3 calls run in parallel behind a spinner, successes kept in memory per fact set until restart, failures retried next run) → template. AI text is labelled "Written by AI (Gemini) …" or "Cached example text …", with the template facts in a "The facts behind this text" expander. Cards 4+ never call the AI.
  - Template wording fix (first-question finding 5): "203 known flaws in this product have already been used in real attacks" / "203 tunnettua tietoturva-aukkoa tässä ohjelmassa on jo käytetty todellisissa hyökkäyksissä".
  - Tests: 37 pass (6 new in `tests/test_ai.py`, with a fake client: no inventory in the prompt, good FI/EN texts pass, a wrong number / "you are vulnerable" / missing EPSS / 3 sentences / wrong language / wrong ransomware claim are rejected, fallback on no key / timeout / bad text, cache re-checked on load).
  - Checked in the browser: with no key the cards show the template text with the new wording. The cached-text path was checked with a temporary hand-written test entry (labelled TESTI, deleted afterwards, never committed): text, label and facts expander render on cards 2 and 3 (same facts), card 1 stays on the template.

- **M4:** polish and error states.
  - Streamlit "Deploy" button hidden (`[client] toolbarMode = "minimal"` in `.streamlit/config.toml`).
  - Summary line above the cards: "13 of the 16 programs on your list have known flaws that attackers have used." / "Luettelosi 16 ohjelmasta 13 sisältää tunnettuja aukkoja, joita hyökkääjät ovat käyttäneet." Not shown when nothing matched.
  - Loading message is now translated (one spinner for the KEV + EPSS download) instead of fixed English.
  - KEV download fails → warning now gives the saved copy's version **and publish date** and says newer flaws are missing. A damaged saved copy (bad JSON, no `catalogVersion`) now shows the "could not load" error instead of crashing (`core/fetch.py`).
  - Vendor links to the same site are numbered ("msrc.microsoft.com (1) · (2)") instead of showing the same name twice.
  - Tests: 42 pass (4 new in `tests/test_fetch.py`: offline → saved copy; offline with no / damaged / incomplete copy → clean error).
  - Checked in the browser at 375 px: sample list in FI and EN, no horizontal scroll, no console errors, Deploy button gone. Empty input shows the hint; nothing-matched and EPSS-down messages unchanged since M2 (nothing-matched was checked in M2; EPSS-down only by code path). The KEV-fallback warning was tested by unit test only, not in the browser (the app caches the download for 6 h).

- **Judge pass** (2026-11-03, fresh chat, review only, nothing fixed). Read first: Traficom brief (section 3 of `Templates/project_pitch/examples/broadband/challenges.md`) and the "Judging" section of `Big_Hackathon/hackathon/SINCE_AI_2026.md` (Traficom judges with its 4 criteria; the event guide adds relevance/value, technical quality, feasibility, how well the team explains its system, responsible data handling; finalists come from a quick side-by-side participant vote). Evidence: 42 tests pass; app run on port 8505 with the sample list (FI) and with the mentor's own example typed as the brief writes it; 55 messy product names probed against KEV 2026.10.30 (`out/judge_match_probe.txt`); repo, caches, `.gitignore` and git history read.
  - **Sponsor's question, answered as the judge.** Sample list: *mostly yes*: the top 3 (FortiGate, Windows 11, Windows 10) are KEV-listed and ransomware-linked, each with "install the latest update", a vendor link and a one-sentence rule; but cards 2 and 3 are the same action, so it's 2 things, not 3. **Mentor's own example** ("Windows 10, Office 2019, a Fortinet VPN, WordPress 6.2" on one line, as written in the brief): *no*: the app shows **one** card titled with the whole line, "236 known flaws in this program", and "Every line was recognised", while the Fortinet VPN matched nothing. That is the brief's "wow" input and it fails on stage.
  - **Scores (1–5) on Traficom's criteria:**
    1. *Correct prioritisation: 3.* Only KEV items listed; ransomware → EPSS → date is shown in one sentence. But items 1–9 of the sample all show "99,9 %"-ish and ransomware, so the visible reason for "Windows 11 above Office 2019" is the same; the real tie-break is EPSS in the 3rd–4th decimal, which the user can't see. Windows 10 and Office 2019 get "install the latest update" although both are past Microsoft's end of support (to verify on Microsoft's site; recorded at the first-question check). The brief names CVSS (NVD) as one of the three signals; the app doesn't use it and doesn't say why.
    2. *Plain language FI/EN: 4.* Careful wording ("have been used", "forecast … somewhere in the world", "the tool does not check versions"), "does not mean safe" on unmatched lines, Finnish default. Finnish is stiff and not read by a native speaker; while the live AI runs, Streamlit shows the internal text "Running get_ai()." (`app.py:173`, `@st.cache_resource` without `show_spinner=False`).
    3. *Privacy and security of the tool: 5.* Inventory only in memory; Gemini gets four public facts, not even the product name; EPSS fetched for all KEV CVEs so FIRST and the committed cache learn nothing about the inventory; key only in `.env` (gitignored, no key pattern in any commit); AI text checked against the facts with a template fallback; user lines escaped. Worth saying in the pitch, it's the strongest part.
    4. *Matching accuracy, unmatched shown honestly: 2.* Sample: 13/16 matched and the 3 misses are shown honestly. But a comma-separated line is treated as one program (above), and these common names miss although KEV has them: "Fortinet VPN" / "FortiClient VPN" (KEV: FortiOS), "log4j" / "Apache Log4j" (KEV: Log4j2), "Oracle Java" (Java SE), "SonicWall firewall" (SonicOS), "Pulse Secure VPN" (Pulse Connect Secure), "iOS 17", "Edge", "Confluence" without the vendor, "Linux" (Kernel). False match: "Notepad" → Notepad++. No SBOM input (the brief mentions it; out of MVP scope).
  - **Event criteria (1–5):** relevance/value 4 (real gap, free, local); technical quality 4 (tested rules, cached fallbacks for KEV, EPSS and AI); feasibility 4 (runs on a laptop, no keys needed); understanding/explaining the system 4 (rule in one sentence, decisions logged; the hidden-decimal tie-break is the weak spot under questioning); responsible data 5.
  - **Issues by value per hour** (Adil decides what gets fixed):
    1. Split a pasted line on commas / semicolons / tabs outside brackets, so the brief's own example gives 4 items ("Microsoft 365 (Outlook, Teams)" must stay one). ~10 min. Fixes the demo input and the false "every line was recognised".
    2. Aliases for the probe misses: fortinet + vpn → fortios, log4j → log4j2, java → oracle java se, sonicwall → sonicos, pulse secure → pulse connect secure, vendor hints ios → apple, edge → microsoft, confluence → atlassian. Tests for each. ~15 min.
    3. Make the tie-break visible: sort on EPSS rounded to the shown one decimal, so near-ties fall to the newest-flaw date the user can see (changes the order, so it needs Adil's OK). ~10 min.
    4. One line in "How the order is decided" on why there's no severity score (CVSS): KEV already means "used in real attacks", NVD is the next step. ~5 min.
    5. `show_spinner=False` on `get_ai()`. ~2 min.
    6. End-of-support note for Windows 10 / Office 2019 (dates checked on Microsoft's site) and/or one card for identical CVE sets. Both rejected earlier by Adil; a judge will still ask. ~15–20 min.
    7. Finnish read by a native speaker (not code). Notepad → Notepad++ (low). SBOM: mention as next step only.
  - Every user group in §1 gets something: the office manager gets actions and links, the mentors get the rule, the credits and dates. The gap is the mentor's own input (issues 1–2).

- **Freeze** (2026-11-03, Adil: "freeze, write the presentation materials"; Adil chose to fix judge issues 1–2 first).
  - `core/match.py`: pasted lines split on commas / semicolons / tabs outside brackets (`split_items`); aliases fortinet+vpn → fortios, sonicwall+firewall → sonicos, pulse+secure → connect, log4j → log4j2, java → java se jre, linux → linux kernel; vendor hints ios → apple, edge → microsoft, confluence → atlassian (skipped for Cisco IOS / VMware Edge); "++" kept so Notepad no longer matches Notepad++. 46 tests pass (4 new).
  - Re-check on KEV 2026.10.30 / EPSS 2026-11-02 (`out/freeze_check.txt`): sample unchanged (13 of 16, same top 3). The brief's one-line example now gives 4 items, top 3 Fortinet VPN, Windows 10, Office 2019 (checked in the app, Finnish; card 3 got the template because live Gemini timed out). Judge probe: 37 of 54 names match (was 26, one false).
  - Presentation materials written from `pitch/facts.md`: `pitch/scenes.json` (5 scenes, ~45 s with pauses, target 40 s / max 60 s), `deck/deck.json` (10 slides, §5 colours; `npm run build` warns only about the missing screenshot), `pitch/writeup.md`, `pitch/live.md`. Headline: "mostly yes" with the caveats (2 distinct actions, no version check, 3 unmatched).
  - Video repo hand-over: `../videogen/CLAUDE.md` filled, `scenes.json` copied (exact copy, now the master there), committed there. `npm run check` there: only error is the missing clip.

- **Judge pass 2: the finished submission** (2026-11-03, fresh chat, review only, nothing fixed). Same judge role and sources as pass 1 (Traficom brief §3, SINCE AI "Judging"). Evidence: 47 tests pass; `deck/pitch.pptx` exported to PDF with LibreOffice and all 10 pages read; `../videogen/scenes.json` read and one Remotion still rendered per scene (s01–s05, plus a late s03 frame); `pitch/writeup.md` and `pitch/live.md` read; app run (port 8505, Finnish, sample list); core run on the sample, the brief's one-line example and 20 new messy names (KEV 2026.10.30 re-downloaded, unchanged; EPSS 2026-11-02); key-pattern scan of all git history (0 hits). Stills and PDF are in the session scratchpad, not the repo.
  - **Sponsor's question:** *mostly yes*, same as the pitch says. Sample top 3 unchanged (FortiGate, Windows 11, Windows 10, all ransomware-linked, "install the latest update", vendor links); still 2 distinct actions. **Brief's own example now works**: 4 of 4 items, top 3 Fortinet VPN, Windows 10, Office 2019, WordPress 4th (pass 1: one card, Fortinet missed). The materials say all of this honestly, including the duplicate Windows cards.
  - **Traficom criteria (1–5), pass 1 → pass 2:**
    1. *Prioritisation: 3 → 3.* Rule explained clearly on slide 6, in `live.md` and the app. Unchanged: near-ties decided in the 3rd–4th EPSS decimal (all top 7 show "99,9 %"), Windows 10 / Office 2019 told to "install the latest update", no word on why there's no CVSS. **New bug:** `action_kind()` (`core/explain.py:52`) labels any `requiredAction` containing "end-of-life" as EOL; 15 of the 83 such KEV entries are conditional ("disconnect EOL versions … for supported versions follow the mitigations"). A pasted "Sharepoint" ranks 2nd and gets "The vendor no longer fixes this product. Replace it or stop using it." (lead CVE-2025-53770): wrong for a supported SharePoint.
    2. *Plain language FI/EN: 4 → 4.* Card texts careful and honest. Still open: Finnish not read by a native speaker (card 1: "hyökkäyksiä tapahtuu … 99,9 % todennäköisyydellä" reads close to certainty), "Running get_ai()." on the live path (`app.py:173`, `@st.cache_resource` without `show_spinner=False`), the "Aineisto" credits stay English in Finnish mode. The video says "in Finnish or English" but shows only English.
    3. *Privacy and security: 5 → 5.* Unchanged and well told: slide 6 ("The AI never sees your list"), video s04, `live.md` Q3. `.env`, `out/`, `data/raw/`, `*.pptx`, the uncropped screenshot are ignored; no key pattern in history.
    4. *Matching: 2 → 3.* Comma splitting and aliases fixed the demo input; 37 of 54 pass-1 names. New 20-name probe: 10 match, the 10 misses are shown honestly (FortiClient VPN, Microsoft Teams, Word, Ubuntu, TP-Link router, AnyDesk, Android phones, Visma, Zoom, Notepad). Under-matching: "Exchange 2016" matches 1 CVE although KEV has 19 Exchange entries (no vendor hint exchange → Microsoft, and the line lacks "server"). CVSS/CPE (named in the brief) still absent, said on slide 9.
  - **Event criteria (1–5):** relevance/value 4; technical quality 4 (minus the EOL bug); feasibility 4; understanding/explaining the system 5 (was 4: `live.md` answers the tie-break, duplicate cards, and the 2018/2021 lead CVEs head-on); responsible data 5.
  - **Participant vote (deck + 47 s video, side by side):** clear and honest, on the §5 colours, real screenshot. Weak spots: the video opens on the solution with no problem line; it says "three things" in s01 and s05 but "2 distinct updates" in s03; it never shows Finnish or states the ranking rule.
  - **Submission completeness:** `README.md` missing (the event asks for a disclosed technology inventory, normally in the README); repo link "to be added" (slide 10, writeup); video unpublished. Slide 5's data-credit line runs into the page number "5" in the LibreOffice PDF. Slide 7, `writeup.md` and `facts.md` P5 say the 4 cached AI texts were "each read by a person"; this file records only Claude Code reading them (M3), so the claim is unverified unless Adil read them. `docs/laptop.md`, `docs/testing_laptop.md` (and other docs) are untracked, though §11 lists them as committed. Title and close slides are dark although §5 sets a light look (minor).
  - **What improved since pass 1:** the brief's example (the "wow" input) now gives 4 items and the right top 3; matching 26 → 37 of 54; the false "every line was recognised" is gone; the honest-limits story is now consistent across app, deck, video, writeup and live notes.
  - **Still open from pass 1:** issues 3 (visible tie-break), 4 (CVSS line), 5 (`get_ai` spinner), 6 (end of support / duplicate Windows cards), 7 (native-speaker Finnish).
  - **Issues by value per hour** (Adil decides; freeze allows bug fixes only, marked *bug*):
    1. Write the README ("write the README", `docs/PITCH.md`), with the technology inventory, AI use and how to run. Required for the submission. ~20 min.
    2. "Each read by a person": confirm Adil read the 4 cached texts, or change the wording on slide 7, `writeup.md`, `facts.md` P5. ~5 min.
    3. *Bug:* conditional EOL wording → treat as "update" when the text also gives an action for supported versions; test with the SharePoint text. ~15 min.
    4. *Bug:* `show_spinner=False` on `get_ai()`. ~2 min.
    5. Slide 5 credit line overlapping the page number: shorten or wrap it, rebuild, re-export. ~5 min.
    6. Repo link and published video link into slide 10 and `writeup.md` once they exist. ~5 min.
    7. Vendor hint exchange → Microsoft (and check "server"-less product names), with a test. ~10 min.
    8. Video: one problem line at the start, the rule in one line, a Finnish shot, and "three cards, two updates" said consistently. Needs a new voice pass and clip. ~45 min.
    9. Carry-overs from pass 1: issues 3, 4, 6, 7; Finnish credits in Finnish mode; decide which `docs/*.md` to commit.

## Broken / open
- **Recorded (Adil, 2026-11-03):** clip `../videogen/public/clips/c1_sample.mp4` (19.4 s, 1920×1032, 60 fps; 0–4 s idle Finnish page, cut by `trimStart: 4.0`, `speed: 1.0` after the voice pass, crop to the page below the browser bars, set in the video repo's `scenes.json`) and `deck/shots/top3.png` (cropped to the page from `top3_uncropped.png`, which is gitignored because it shows browser tabs). Deck rebuilt with no warnings; only slide 1 was checked visually.
- Bug fixed after freeze: the app crashed with ImportError when started with a Python that lacks the Gemini SDK (system `streamlit` instead of `.venv`); it now falls back to the template. 47 tests pass.
- **Links to be added:** repo (no git remote yet). Video rendered (`../videogen/out/video.mp4`, 46.8 s) but not published in this test run, so it has no link (Adil, 2026-11-03). No hosted demo by design (local only).
- `README.md` not written yet (waits for "write the README").
- In the video clip, card 1 says "99.9 %" and cards 2–3 "99.9 percent" (cached Gemini wording differs); cosmetic, left as is.
- Judge pass 2 found new open items (see Done → Judge pass 2): conditional-EOL action bug (SharePoint told "replace it"), slide 5 footer overlap, unverified "each read by a person" claim, "Exchange 2016" under-matching, no README.
- Judge issues 3–7 not fixed (visible tie-break, CVSS line in the How panel, `show_spinner=False` on `get_ai()` so "Running get_ai()." isn't shown, end-of-support / duplicate Windows cards, native-speaker Finnish).
- **Live AI is slow:** Gemini (`gemini-3.5-flash-lite`, the id works) took ~20–30 s per call on 2026-11-03. With the 20 s live timeout, a non-sample list (WordPress, Chrome, Ivanti) got 1 of 3 AI texts on the first try (sequential, ~60 s) and 0 of 3 on the second (parallel, page done in ~25 s); the rest showed the template. The sample list is unaffected (cached). Kept as is (Adil, 2026-11-03): see Key decisions.
- Cards 2 and 3 (Windows 11 / Windows 10) have identical facts, so they share one cached AI text (known ranking weakness, below).
- The cached Finnish texts are correct but a little stiff ("Tällä ohjelmalla on…", "Pahimman aukon ennusteen mukaan hyökkäyksiä tapahtuu … 99,9 % todennäköisyydellä"); not read by a native speaker.
- Not yet opened on a real phone over Wi-Fi (Adil to check).
- **Known ranking weakness (kept on purpose):** 9 of 13 matched sample items have a ransomware-linked CVE and most have a max EPSS above 0.99, from old, famous CVEs (lead CVEs added to KEV 2021–2023), so "Windows 10" and "Windows 11" are two separate top-3 items with the same 203 CVEs. Judges may ask about this; see Key decisions.
- Minor false match: a line "Notepad" matches Notepad++ (single-product vendor rule). Confirmed in the M2 UI: it gets a card.
- Ports 8501 and 8502 are held by stale Streamlits from M0/M1, which Claude Code was not allowed to stop; M2 was checked on port 8505 (`.claude/launch.json`). Close them with Ctrl+C in their terminals or restart the laptop.
- The text box applies on Ctrl+Enter, on leaving the box, or on "Show what to patch" (Streamlit behaviour); typing alone doesn't update the cards.
- Windows vendor links point to MSRC pages for the two newest CVEs, not a general "Windows Update" page (the data has no such link).

## Next
- To refresh the cached sample texts after a KEV/EPSS update: `python -m core.explain build` (~3–4 min), then **read every text** before committing: the checker catches numbers and key words, not grammar. Last read texts: `out/m3_texts.txt`.
- **Frozen:** only bug fixes from here.
- "write the README" here (clip, screenshot and video are done).
- Quick check of matching/ranking/text from the command line: `python -m pytest -q`.

## Key decisions
- Dropped `ANTHROPIC_API_KEY` / `TYPESAFE_API_KEY` from `.env.example`: this project only uses Gemini (§6).
- Gemini SDK not in `requirements.txt` until M3.
- **Ranking stays the §4 rule** (Adil, 2026-11-03): ransomware → max EPSS → latest `dateAdded`, one item per inventory line. Considered and rejected after M1: merging lines with identical CVE sets, and preferring CVEs added to KEV in the last 12 months.
- **EPSS for all KEV CVEs, not only matched ones** (deviation from §4): fetching only the matched CVEs would send an inventory-derived list to FIRST and write it into the committed cache, which reveals the user's software. Fetching all ~1,770 takes ~13 s once per day and keeps both independent of any inventory.
- FIRST attribution: their EPSS FAQ says attribution "is requested when EPSS data is used in publications or products"; the "Get the Data" page (first.org/epss/data) shows no exact wording in its HTML, so the §4 credit line is used unchanged.
- **M2 kept the §4 ranking unchanged** (per Adil's decision above). The sample read shows the same weakness already recorded; no new rule was found that clearly beats it without merging lines, which Adil rejected.
- **After the first-question check the §4 rule still stays** (Adil, 2026-11-03), knowing that cards 2 and 3 duplicate on the sample and the Windows 10 end of support isn't shown. Rejected: merging identical CVE sets into one card, and a hand-made end-of-support list. Judges' likely question "why is Windows 10 a separate card?" → answer: one card per line the user pasted, by design. The "have been used" wording fix (finding 5) still goes into M3.
- EPSS wording: never "risk" or "your risk"; it is a worldwide forecast, so the text says "somewhere in the world". Badge is "High attack forecast" (FI "Korkea hyökkäysennuste") from `HIGH_EPSS`.
- Finnish is the default language (the real user is Finnish); "tietoturva-aukko" is used instead of "haavoittuvuus" as the plainer word.
- **AI sees facts, not products** (M3): §3 allows sending the matched product name, but the two-sentence "why" doesn't need it, so the prompt carries only the four numbers/flags. Nothing inventory-derived reaches Google.
- **Sample cache keyed by facts, not by inventory** (M3): any inventory whose top-3 item has exactly the same facts as a sample item gets the cached text. It was written and checked for those exact facts, and it is still labelled "cached example text". When KEV or EPSS change, the key changes and the template is shown until `build` is re-run.
- **Live AI text: what the checker learned** (M3, 2026-11-03). First round, 3 of 4 texts passed the number checks but said more than the data: "There is a 99.9 % chance the worst flaw is used in the next 30 days" (certainty, no "forecast", no "somewhere in the world"), a Finnish text that dropped "used in attacks" for the 203 flaws, "yksi niistä … iskuun" ("exactly one … one attack" instead of "at least one"), and "Cybercriminals" (KEV doesn't say who). The checker now also requires the meaning words (attacks; at least / ainakin when ransomware and several flaws; forecast + world + 30 when there is an EPSS) and bans "criminal" and the Finnish "aukkoja" error. These real outputs are test cases in `tests/test_ai.py`. One Finnish text ("15 tiedossa olevaa tietoturva-aukkoja", "pahin näistä käytetään") was rejected by reading and regenerated (candidate 1 of 3 kept).
- **Live AI calls stay on with the 20 s timeout** (Adil, 2026-11-03), knowing that other lists often get the template because Gemini takes ~20–30 s. Rejected: a longer timeout, turning live calls off.
- Tests use `pytest` (approved by Adil 2026-11-03, pinned in `requirements.txt`). Run with `python -m pytest`.

## AI-use log
- Claude Code (Opus 5.5): M0 skeleton, KEV fetch/fallback, app page, docs, this file.
- Claude Code (Opus 5.5): M1 matching and ranking code, EPSS fetch/cache, tests, invented sample list, sample check.
- Claude Code (Opus 5.5): M2 home screen, FI/EN template sentences (Finnish written by Claude, not yet checked by a native speaker), explain tests, browser check.
- Claude Code (Opus 5.5): first-question check (ranked dump of the sample, sponsor read of the app in Finnish), findings above.
- Claude Code (Opus 5.5): M3 Gemini layer (prompt, output checker, sample-cache builder, parallel live calls, app wiring), tests, wording fix; read the Gemini texts for meaning and grammar and tightened the checker.
- Claude Code (Opus 5.5): M4 polish (summary line, translated loading text, dated KEV fallback, damaged-cache handling, link labels, fetch tests, phone-width check).
- Claude Code (Opus 5.5): judge pass (read brief and event judging, ran app and tests, matching probe, scores and issue list above); no code changed.
- Claude Code (Opus 5.5): post-freeze matching fixes (judge issues 1–2) and the presentation materials (`pitch/facts.md`, `pitch/scenes.json`, `deck/deck.json`, `pitch/writeup.md`, `pitch/live.md`), video repo hand-over.
- Claude Code (Opus 5.5), in `../videogen`: script check, clip timing and crop, counter labels, render (`../videogen/PROGRESS.md`).
- ElevenLabs (voice "Daniel"): the video voice-over, 5 scenes; Adil listened to every scene. Remotion (not AI) assembled and rendered the video.
- Claude Code (Opus 5.5): PITCH.md §4 recheck after the render (facts R4 corrected, video facts and links updated).
- Claude Code (Opus 5.5): judge pass 2 on the finished submission (deck PDF, video stills, writeup, live notes, app and probes); no code changed.
- Gemini (`gemini-3.5-flash-lite`, Interactions API): wrote the 4 cached sample texts in `data/processed/sample_texts.json` (FI/EN for FortiGate and Windows) from public facts only; one Finnish text regenerated after a grammar error.
