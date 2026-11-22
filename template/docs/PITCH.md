# PITCH.md: presentation materials and README

> Read in full by `/present`, or when Adil says "write the README". Everything the app does is built by now; this is about telling it honestly.

## 1. Inputs
- `PROGRESS.md` (what works, what's broken), `docs/history.md` (judge passes), `docs/ai_log.md` (a competition has one; without it, ask me which AI tools were used), `tests/`, `data/`, the running app, and in AGENTS.md the sections Project, Problem, Competition and Presentation.
- Format specs: `docs/SCENES_FORMAT.md` (video), `docs/DECK_FORMAT.md` (slides).

## 2. Presentation materials (`/present`)
Write these into `pitch/`, from the same facts, in one go. Skip any I say I don't need. Start from `docs/pitch_card.md` (written at M0, corrected since): finish the tagline, the first lines of the description and the video's opening first; everything below follows them.
1. `pitch/facts.md`: every number and claim we can honestly make, each with its source (file, test, data). Everything below may only use facts from this list.
2. `pitch/scenes.json`: the video script, following `docs/SCENES_FORMAT.md` exactly. Target length and maximum: "Video length" in AGENTS.md. If either differs from 90 and 120 s, set `meta.targetSeconds` and `meta.maxSeconds` in the script, so `npm run check` tests the right limits. After the JSON, list the screen clips I must record (file name, screen, actions, ~seconds).
3. `deck/deck.json` (not in `pitch/`: the builder in `deck/` reads it there and finds screenshots in `deck/shots/`): the slides, following `docs/DECK_FORMAT.md`, replacing the blank template. Set its `colors` from the style guide's palette, with the accent colours in AGENTS.md "Presentation". Include a `business` slide using only honest numbers: counts from our own data, with anything else labelled as an assumption, and no invented prices or revenue. Wherever the deck shows data, credit it with licence names. After the JSON, list the screenshots I must take (file name under `deck/shots/` → what to capture).
4. `pitch/writeup.md`: project name, one-line description, ~150-word description, "how I built it", AI-use disclosure (from `docs/ai_log.md`), links (demo, repo, video placeholder). Usable for a portfolio page, a blog post, a LinkedIn post or a submission form.
5. `pitch/live.md`: for showing it to someone in person, in spoken sentences:
   - a **30 s demo** (what to say while showing the app, which screen to open first, the one thing to click);
   - a [3] **min talk** script that follows the deck's `notes` (title → problem → idea → demo → results → next steps → close);
   - **5 likely questions** from the person in AGENTS.md "For" with honest short answers (limits included), plus the **hard questions** a sceptical judge would ask: the oddest top result, the better setting not shipped, what the data can't show, the honest size of the opportunity.

6. `README.md`, following §3, if it doesn't exist yet (a submission needs it). The video link stays "to be added" and is listed as open in `PROGRESS.md`.

Rules: never invent numbers, users or results; video, deck, README and write-up use identical numbers and wording; stop after writing and give me the clip and screenshot lists.

**What the materials must carry:**
- The official score against its baseline, in one line, in the video, the deck and the first lines of the description, if the project has one.
- One line of value for each party the sponsor named (customer, partner, sponsor), in the sponsor's own product terms where they fit (their tier or plan name).
- A limits section in the deck and the write-up: what didn't work, what is untested.
- A demo that needs no setup: the link that opens it comes first; a local run is one command from the README.

**Claims about what I did** (read, tested, checked, approved, e.g. "each AI text was read by a person") need a record in `docs/history.md` or `PROGRESS.md`. A chat's own check is not mine. Without a record, ask me before writing the claim.

**Headline:** the deck, video and write-up open with the strongest true claim, stated directly: what it delivers, as a conclusion the reader doesn't have to work out ("saves X per site a year"), then the evidence. It answers the "First question" in AGENTS.md. The materials never argue against the project. Two kinds of caveat are handled differently:
- Where the data comes from (synthetic, simulated, estimate): a short label on the figure itself, every time.
- Limits of the offer (what it doesn't cover, what is untested, where the value is small): in the limits section of the deck and write-up, and in the answers in `pitch/live.md`. Never in the tagline, the first lines, the video's first 20 seconds or the title slide.

If the strongest true claim is weak, stop and tell me before writing. That is a product problem, not a wording problem.

**Hand-over to the video repo** (its path is "Video repo" in AGENTS.md; skip if there's no video):
- Fill every remaining `[...]` in the video repo's `CLAUDE.md` from `pitch/facts.md` (the voice is set during setup), including the production repo's path, the length target and maximum, the theme (the app's colour values, unchanged) and what must be stated. Commit it there.
- Copy `pitch/scenes.json` to the video repo's `scenes.json` as an exact file copy. From then on the video repo's copy is the master: script changes happen there, and after the render it's copied back over `pitch/scenes.json` as an exact file copy.

## 3. README (on "write the README")
- What it is (2–3 sentences), screenshot, demo link, video link.
- How to run locally: one command where possible (the Run command in AGENTS.md, with `.env.example` → `.env` if keys are needed), demo mode explained.
- How it works (data → rules → AI), honest limits, next steps.
- **AI disclosure:** which AI tools were used for what (code assistant, APIs inside the app, voice-over, deck), from `docs/ai_log.md`.
- Licence: same as `LICENSE`. Credits: data sources, libraries, anyone who helped.
- Numbers and wording identical to `pitch/facts.md` if it exists.

## 4. Before saying the materials are finished (both triggers, and again after the video is done)
- `README.md` exists and follows §3.
- The materials meet every item in "Hand-in" in AGENTS.md (e.g. a technology list that discloses pre-existing code). List any item still missing.
- Every claim about what I did has its record in `docs/history.md` or `PROGRESS.md` (§2 rules).
- Links, stated facts and open items agree across `README.md`, `pitch/writeup.md`, `pitch/facts.md` and `PROGRESS.md`. Open every link. A link may stay "to be added" only while it's listed as open in `PROGRESS.md`.
- `pitch/scenes.json` is the final script, and no tool is still described as planned once it's been used.
- No unfilled `[...]` placeholder is left in `deck/deck.json`, `pitch/scenes.json` or `pitch/writeup.md`, apart from a link allowed above. The deck build doesn't warn about these.
- Search these files, read as UTF-8, for broken characters (`Â`, `Ã`, `â€`, `âˆ`, `�`) and fix any you find.
- Report what you checked, and anything you couldn't.
