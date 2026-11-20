# CLAUDE.md: Patch This First

## 1. The situation
- **Project:** a small local web app where the "accidental IT person" of a small organisation pastes a plain software list and gets the three things to patch this week, each with a plain-language reason and a link to the fix. **Why it exists:** template test (2026-11-03): a 2-hour dry run of this project template on the mock Traficom (NCSC-FI) challenge "Patch this first for small organisations". The process, timings and the finished presentation hand-over matter as much as the app.
- **Who it's for:** Traficom NCSC-FI mentors judging the challenge, standing in for the real user: an office manager or teacher who looks after IT on the side, has no security vocabulary and about 30 minutes a month for this.
- **Judged on:** the challenge criteria:
  1. Correct prioritisation: the KEV-listed, high-EPSS items really come first, and the ranking is explained.
  2. Plain-language quality for a non-expert, in Finnish and English.
  3. Privacy and security of the tool itself: inventory handling, no secrets in the client, safe use of LLMs.
  4. Matching accuracy from messy product names to vulnerabilities, with unmatched items shown honestly.
- **Sponsor's first question:** "If a 12-person office pastes its software list, does it get the right three things to fix this week, and can someone with no security background act on them?" A useful answer: for a realistic sample inventory, the top 3 are items attackers are already exploiting (KEV-listed), ordered by a rule I can explain in one sentence, each with what to do and the vendor link, plus a visible list of what the tool couldn't match.
- **Video repo:** `../videogen`. If a chat can't reach it, ask me for access.
- **Team:** Adil (solo).

## 2. About me
- Adil, embedded systems engineer (ESP32, KiCad), comfortable with Python and C, newer to web frontends. Explain non-obvious code briefly; tell me exactly what to run.
- **New to vulnerability data:** explain CVE, KEV, EPSS and CVSS in one line each when they first come up. Judges will ask why one item ranks above another, so I must be able to explain the ranking rule myself.
- Windows laptop, PowerShell, 16 GB RAM, GTX 1650 with 4 GB VRAM (`docs/laptop.md`). Apps run locally; anything that needs a real GPU (model training, large local models) goes to a cloud GPU (Verda / Modal / free Kaggle or Colab notebooks). This project needs no GPU.
- Second machine for demos and budget-hardware tests: ThinkPad T480s, Linux Mint, CPU only, 8 GB RAM (`docs/testing_laptop.md`). Commands there are **bash**, not PowerShell (`source .venv/bin/activate`); give both versions when a step runs on it.

## 3. The problem
- **Who has the problem:** the person who "does the IT" at a small company, school or association, next to their real job. Traficom's NCSC-FI publishes vulnerability alerts, but these people can't turn a list of CVE numbers into a decision.
- **Pain points:**
  - Alerts are written for security staff, so they patch whatever sounds loudest, or nothing.
  - They don't know which of their own programs are actually being attacked right now.
  - They have about 30 minutes a month for this.
- **What they want / don't want:** paste a list, read three actions in plain Finnish or English, each with the reason and a link to the vendor fix. No security jargon, no scores without an explanation, no account or upload of their inventory.
- **Constraints:**
  - Public vulnerability data only.
  - The inventory is the user's own and must not leave their machine unredacted: it is matched locally and **never sent to the AI**; only the matched public facts (CVE id, product name, KEV fields, EPSS) are.
  - Finnish and English output; the UI itself may be English.
  - Runs on a normal laptop, local only.

## 4. The data
- **Sources** (all free, no keys; both checked on 2026-11-03 and responding):
  - **CISA Known Exploited Vulnerabilities (KEV) catalog:** one JSON file (`https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json`, mirrored at `cisagov/kev-data`), about 1.8 MB. Top level: `title`, `catalogVersion`, `dateReleased`, `count`, `vulnerabilities`. Each entry: `cveID`, `vendorProject`, `product`, `vulnerabilityName`, `dateAdded`, `shortDescription`, `requiredAction`, `dueDate`, `knownRansomwareCampaignUse` (`Known` / `Unknown`), `notes` (often holds the vendor advisory link), `cwes`, `forensicTriage`. Download once into `data/raw/kev.json` and record `catalogVersion`.
  - **FIRST EPSS API:** `https://api.first.org/data/v1/epss?cve=CVE-…,CVE-…` returns `epss` (probability of exploitation in the next 30 days, as a string) and `percentile` per CVE, plus the score date. Fetch scores only for KEV entries that matched, in batches; cache them in `data/processed/epss.json` with the date. The API is marked beta, so the app must still rank (by KEV fields alone) if it's down.
  - **NVD CVE API 2.0:** not used in the MVP (rate-limited without a key, and CPE matching doesn't fit in 2 h). Mention it as the next step for products that aren't in KEV.
- **Matching** (in `core/match.py`): each inventory line is lower-cased and normalised (punctuation removed, common aliases such as "ms" → "microsoft", "win" → "windows"). A line matches a KEV entry when the entry's vendor **and** product words both appear in the line, or the product name alone when it is distinctive (at least two words, e.g. "FortiOS SSL-VPN"). Versions are **not** checked in the MVP: the app says "this product has known exploited flaws; check that you have the fixed version", never "you are vulnerable". Lines with no match are listed as "not matched" with the note that this does not mean safe.
- **Rules / ranking** (in `core/rules.py` as named constants; my choices, shown in the app under "How the order is decided"):
  - Only KEV-listed vulnerabilities make the to-do list (KEV = confirmed exploitation).
  - Group by inventory item: one action per product, listing its matched CVEs.
  - Order items by: (1) any matched CVE with `knownRansomwareCampaignUse == "Known"` first; (2) then highest EPSS among its CVEs; (3) then most recent `dateAdded`.
  - **High EPSS:** `HIGH_EPSS = 0.10` (10 % chance of exploitation in 30 days), shown as a label, not used to drop anything.
  - Top `TOP_N = 3` are the "this week" actions; the rest are listed below as "after that".
  - EPSS is a probability: show it as a percentage with no more than one decimal, never as "risk score".
- **Licences:**
  - CISA KEV → CC0 1.0. Attribution not required; credit anyway: "CISA Known Exploited Vulnerabilities Catalog (CC0 1.0), version <catalogVersion>". No CISA logo, no wording that implies CISA endorsement.
  - FIRST EPSS → free to use; attribution is requested in products. Credit: "EPSS scores from FIRST.org (first.org/epss), dated <score date>". Check the exact wording on FIRST's EPSS "Get the Data" page at M1 and use it.
- `data/raw/` is **never committed** (it is regenerated by download). `data/processed/` holds only public-data caches and can be committed. Sample inventories in `data/samples/` are invented examples, labelled as such, never a real organisation's list.

## 5. The concept
- **One sentence:** A local web app that matches a pasted software list against the programs attackers are already exploiting, so that a small organisation's part-time IT person knows the three things to patch this week without reading security advisories.
- **The 3 questions it answers for the user:**
  1. Which of my programs are being attacked right now?
  2. Which three do I fix first, and why in that order?
  3. What exactly do I do, and what couldn't the tool check?
- **The "wow" moment for the demo:** paste a short sample inventory (for example "Windows 10, Office 2019, Fortinet VPN, WordPress") and, in a second, get three numbered actions in plain Finnish with the reason ("attackers are already using this flaw", "used in ransomware attacks") and the vendor link, plus a grey "not matched" list. Use whatever the real KEV and EPSS data return on the day; never script the result in advance.
- **Look:** light. Background `#FFFFFF`, text `#1B1F24`, accent `#0B5CAD` (blue), warning `#C0392B` (red, for "used in ransomware"). Not Traficom's branding (no permission). Set at M0, and used unchanged by the app, deck and video.
- **MVP:**
  - A text box for the inventory (one program per line) with a "Use sample list" button, and an FI / EN switch.
  - The top-3 "fix this week" cards: product, what to do (from KEV `requiredAction`), why (ransomware flag, EPSS, date added), CVE ids, and the vendor link from `notes` when present.
  - "After that" list and a "Not matched" list, both visible.
  - A short "How the order is decided" panel and the data credits with dates.
- **Not doing (explicitly):** login, saving inventories, version-level matching, SBOM or spreadsheet upload, NVD/CPE lookup, CVSS scores, automatic patching, deploy, a native app.

## 6. Stack (defaults, change only with a reason)
- Python 3.12 + **Streamlit** (mobile-first layout), pandas; FastAPI only if a separate API is needed. Plotly isn't needed (no charts). `requests` for the two downloads.
- AI: Gemini API (`GEMINI_API_KEY`, see `docs/gemini.md`), free tier. The AI only rewrites the facts of each top-3 action (KEV fields, EPSS, ransomware flag) into two short plain sentences in Finnish or English. It never sees the inventory, never adds facts, and its output is checked against the input fields. **Rules and real data come first**; a template sentence in both languages is the default and always available.
- Hardware: none.
- Deploy: none, local only (`streamlit run app.py`). For a phone check, open the "Network URL" Streamlit prints, on the same Wi-Fi.
- **Demo mode:** the app must work without API keys: precomputed Gemini sentences for the sample inventory are cached in `data/processed/sample_texts.json` and labelled "cached example text"; any other inventory uses the template sentences. Live AI calls are limited to the top 3 per run.

## 7. Secrets and data rules
- Keys only in `.env` (loaded with python-dotenv). Never in code, logs, screenshots, chat, slides or recordings. Never print them.
- `.env`, raw private data, `out/`, generated decks, `.claude/` and large media are in `.gitignore`. Check `git status` before every commit.
- Privacy rules apply to everything published (repo data files, exports, data sent to the browser), not only to what the UI shows. The user's pasted inventory is never written to disk or logs.
- `data/README.md` states each source, its licence and the processing. Files derived from share-alike data carry that licence and say so (none here).
- Set spending limits on every API key, where the plan allows it.

## 8. Milestones (stop after each, tell me how to check it, update `PROGRESS.md`, commit)
**Time budget:** 2 h of building, split as shown below. At the start and end of each milestone, run `Get-Date` and log the time in `PROGRESS.md`. If a milestone reaches its budget, stop and tell me what's left and what you'd cut; I decide whether to continue. The budget is a guide, not a deadline.
- **M0: skeleton (5%, ~6 min).** First check that §1's first question is written down; if not, ask me before building. Repo structure, `requirements.txt`, `.env.example`, `PROGRESS.md`, `LICENSE` (MIT for the code; data licences in `data/README.md`), a page that downloads the KEV file and shows one number (the entry count and catalog version); running locally and reachable on a phone over the Network URL.
- **M1: data + rules (15%, ~18 min).** Download KEV, fetch EPSS for matched CVEs, matching and ranking from §4. Tests in `tests/` on hand-made cases: normalisation and aliases, a vendor+product match, a no-match line, ransomware-first ordering, EPSS tie-break, `TOP_N`. Drop entries with a missing `cveID` or an EPSS outside 0–1 and log how many. Check how many lines of the sample inventory match anything; if almost none do, tell me before M2.
- **M2: core feature (25%, ~30 min).** The MVP from §5 on the home screen in plain language.
  - It ranks: read the top 3 for the sample inventory as the office manager would. Each must be a real, current action, in a sensible order. If an analysis finds a better rule, ship it or record why not in `PROGRESS.md`.
  - No export in the MVP.
- **First-question check (10 min, fresh chat):** read the top results as the sponsor would and answer §1's first question from them. If the answer is weak, tell me before M3.
- **M3: AI layer (10%, ~12 min).** Gemini sentences per §6, cache for the sample inventory, template fallback, demo mode with no key. Read the Finnish and English text for meaning and grammar as well as checking its numbers: it must not claim more than the data shows (in particular, never "you are vulnerable").
- **M4: polish (20%, ~24 min).** The demo moment, mobile layout, wording without jargon, error states (empty input, nothing matched, EPSS API down, KEV download fails → last cached file with its date).
- **JUDGE PASS AND FIXES (25%, ~30 min, in a fresh chat; shorten it rather than skip it):** first read the challenge brief and event rules I attach, and take the judge's role; if none are attached, use §1. Only then open the repo and review the project as a sceptical judge, running the app and reading its data and published files.
  - Score it against §1's criteria. If they're still a `[...]` placeholder or none were given, say so and use: answers the first question, sound method, clear result, usable next week, data handled properly.
  - Ask §1's first question and read the app's top results: do they answer it usefully? Does every user group named in §1 get something it can use?
  - Give evidence for each score and list the issues by value per hour. I decide what gets fixed. Log the result in `PROGRESS.md`.
- **FREEZE, after the judge pass, when the budget is used up or I say so:** after this only bug fixes. Then §10.

## 9. Working rules
- **One milestone per chat.** Before stopping, update `PROGRESS.md` so a fresh chat can continue from it alone. I start a new chat for the next milestone.
- **After each milestone:** Tell me what to do to test the outcome AND the expected output that I can compare to.
- `git pull` before starting a session (when a remote exists); small commits with clear messages.
- Run the tests and the app before every commit. No deploy in this project; run the app locally after every milestone instead.
- **One branch:** commit directly to `main`, and push it if a remote exists. No other branches unless I ask.
- Prefer boring, working code over clever code. No new libraries without asking, beyond `requests` and the Gemini SDK from `docs/gemini.md`.
- If something about the problem is unclear, ask me instead of guessing.
- **Look, don't dump:** inspect data with `head`, `df.info()`, `df.describe()`, `value_counts()`. Never print whole files or long logs into the chat; save long output to `out/` and show the summary.
- **Chat replies:** answer first, then what to run. No preamble, no recap of the diff, no closing offers. Keep the brief code explanations from §2. Files (code, README, `pitch/`) follow their own rules, not this one.
- **Never invent numbers, users or results**, anywhere: app text, commits, docs. The mentor's example inventory is an example input, not a result; the outputs shown come from the real data on the day.
- Keep `PROGRESS.md`: what's done, what's broken, what's next, key decisions and how to run the app (I read it after breaks, which may be days or weeks), plus an **AI-use log** (tool → what it did, including video and voice tools), which the README and write-up need at the end. Close open items when they're resolved, so this file never contradicts the README.

## 10. Presentation materials and README
Only when I say **"freeze, write the presentation materials"** or **"write the README"**: read `docs/PITCH.md` in full first and follow it exactly. Don't read it before then.

## 11. File structure
```
app.py              Streamlit entry point
core/               fetch.py (KEV + EPSS download and cache), match.py, rules.py, explain.py (templates + Gemini); no UI code
tests/              tests for matching and ranking
data/               README.md (sources, licences, processing), raw/ (gitignored), processed/ (public caches), samples/ (invented example inventories)
docs/               PITCH.md, SCENES_FORMAT.md, DECK_FORMAT.md, API notes, laptop.md, testing_laptop.md (committed)
pitch/              facts.md, scenes.json, writeup.md, live.md (after freeze)
deck/               build.js, deck.json, shots/ (screenshots, committed)
out/                summaries and long output (gitignored)
.env.example  requirements.txt  README.md  PROGRESS.md  LICENSE
```
