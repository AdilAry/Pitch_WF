I've read both briefs. I'll judge this as a DNA judge would: the four challenge criteria first, then the general Since AI points (business value, technical quality, feasibility, how well you can explain the system, and privacy/data handling). Now the submission.

Tests pass and I've gone through the ranking output. Next I'll run the app, look at the deck and the videos, and then write the verdict.

Deck, video and app have all been checked. One last look at a video frame, then the verdict.

# Judge's review: Broadband Gap Finder (DNA challenge)

**Verdict: 28/40. Could reach the top 3, unlikely to win as it stands.** It's the kind of entry a jury trusts: careful, honest, well documented. Where it falls short is the question DNA's business owner will ask first: *"Which villages do I market to next quarter?"* Right now the answer is one square with 14 residents.

## Scores against DNA's criteria

| Criterion | Score | Why |
|---|---|---|
| 1. Soundness of ranking | 6/10 | The method is right, but the tier order and the 1 km cell size work against the goal of finding fixed-wireless candidates |
| 2. Clarity of map and explanation | 8/10 | The card, legend and "How the ranking works" panel are clear. The AI sentences have wording problems |
| 3. Actionability | 5/10 | The CSV exists and is well built, but its contents can't drive a campaign |
| 4. Data handling | 9/10 | Best in class. A few small gaps |

## What impressed me
- **The arithmetic is correct and explainable.** Speeds are a test-weighted mean of tiles, the "median of tile averages" is labelled honestly, and squares with no tests show as "No data", never as slow. `check_bbox_covers` fails loudly instead of quietly dropping cells.
- **Thin data is shown, not hidden.** That's exactly what the mentor asked for. The shortlist keeps its evidence tier on every row.
- **The AI is boxed in well.** Gemini gets numbers only, with no place names. `check_sentence` checks the numbers, their order and banned words, and there's a template fallback. It's easy to defend in Q&A.
- **Privacy goes beyond the brief.** Residents and speeds are hidden for squares under 10 residents, and the exact counts never reach the browser.
- **Attribution and the "not operator-specific" note** appear in the app, the CSV header, the README, the deck and the video.
- **Engineering:** all 77 tests pass (I ran them), the map works on a phone, and the error states have been thought through.

## What would cost points in the jury room

**1. The tier order ranks the wrong things first.** Tier 2 sits above tier 3, so weak-mobile cells outrank strong-mobile ones:
- Rank 3 (Loimaa) has 13 residents, and mobile nearby is **5.3 Mbit/s from 2 tests**. That's the last place to sell fixed wireless.
- Rank 6 (Mynämäki) has **142 residents and 151.9 Mbit/s mobile from 11 tests**.
- Rank 16 (Oripää) has **320 residents and 423 Mbit/s mobile**, but only 9 mobile tests.

The ordering rewards confidence in the *fixed* speed over the actual fixed-wireless case. A "slow fixed, slow mobile" cell matters to a network planner (where to add capacity), not to sales.

**2. The cells are too small for this data.** Only 420 of the 7,791 cells have 10 or more fixed tests. Tier 3's median is 1 test. Rank 17 averages **0.086 Mbit/s from 3 tests**, which is almost certainly a broken measurement, and it still ranks. The mentor said "choosing the right 50 villages"; the tool gives back 1 km squares averaging under 70 residents. Your own sensitivity table in `PROGRESS.md` shows that pooling 4 quarters with a 50 Mbit/s threshold and a 5-test minimum gives 20 strong squares. You found the fix and didn't ship it.

**3. The headline undersells the work.** "1 of 20 passes every rule" and a hero square with 14 residents read as "found almost nothing". In a side-by-side peer vote, a team claiming "47 villages, 12,000 residents" will look stronger even if it's less honest.

**4. The CSV won't open cleanly where sales will use it.** It's comma-separated with `#` header lines, and Finnish Excel expects semicolons. It's listed as a known limit but not fixed, which hurts the "use it next week" criterion directly.

**5. The AI wording breaks your own caveat.** The rank 1 sentence says "14 residents **have** a fixed download speed of 16.9 Mbit/s". Your README says those tests may not come from residents (220 tests for 14 residents). The rank 2 sentence reads "so it is **a slow fixed broadband**". The number check passes both.

**6. Network planners barely get anything.** Upload and latency are available in the data but unused, and there's no planner view.

**7. There's no business case anywhere.** The deck has no slide on addressable residents or revenue, even though the mentor's "business angle" is right there in the brief.

## Smaller issues
- **Links are out of date:** the README and `pitch/writeup.md` both still say "Video: to be added", but the video exists.
- **Contradiction about the API key:** the README says the public app runs without a key, but `PROGRESS.md` still lists "`GEMINI_API_KEY` is in the Streamlit secrets" as an open item. Check which is true and make the two agree.
- **Privacy rule only in the UI:** `cells.parquet` in the public repo still holds speeds for under-10-resident squares, so "their speeds are not shown" is only true in the app.
- **Share-alike licence not stated:** the processed data comes from CC BY-NC-SA data, but `data/README.md` doesn't say the processed files carry that licence.
- **Broken characters:** `PROGRESS.md` shows garbled symbols like `Â§4` and `âˆ’`, which a judge reading the repo will see.
- **Deck attribution:** slide 5's footer leaves out the licence names.

## Questions to prepare for (6 minutes of jury Q&A)
1. "Your top pick has 220 tests for 14 residents. What is that place?"
2. "Ookla's fixed data includes Wi-Fi tests behind any home router. How do you know slow 'fixed' isn't an existing 4G home router, which would make it an upsell rather than a new sale?"
3. "Why does a square with 5 Mbit/s mobile rank above one with 150 Mbit/s mobile?"
4. "Why 1 km and one quarter, when your own analysis shows pooling gives a usable list?"
5. "How many households could this convert, roughly?" Have an honest answer based on residents, not invented numbers.

## Fixes, highest value per hour first
1. **Reorder the tiers:** put strong-mobile thin cells above weak-mobile cells, or move weak-mobile cells to a separate "planner" list.
2. **Ship 4-quarter pooling,** and ideally let the thresholds be changed with sliders in the app. That turns "thresholds not confirmed" into a live demo of the trade-off.
3. **Merge neighbouring candidate squares into areas** and add up their residents and tests. This answers "villages" and thin data at the same time.
4. **Rank thin cells by evidence,** not just by score, and drop physically implausible averages.
5. **Make the CSV Excel-friendly:** a semicolon-separated version, or xlsx (needs openpyxl, which isn't on the approved list, so that's your call).
6. **Rewrite the AI prompt** to say "tests in this square averaged…", and add a grammar check.
7. **Add one business slide,** plus a video hook that leads with the honest-but-useful number.

**What I checked:** I ran the tests and the app locally, read the code and the processed data, and went through all 10 deck slides and both videos (105 s, identical apart from the background colour). I couldn't open the deployed Streamlit URL because this environment's network policy blocks it, so the live app and the key question are unverified.