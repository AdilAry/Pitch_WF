# Showing it live

Before you start: open https://broadband-gap-finder.streamlit.app/ on the Legion so it wakes up, with graphics acceleration on in the browser.

## 30-second demo
**Open first:** the app's home screen, with the map and card in view.
**The one thing to click:** the big red ring, west of Turku.

> This map shows Varsinais-Suomi in 1 kilometre squares, coloured by how slow fixed broadband is and how much data we have. I'll click the red ring. Naantali: 14 residents, fixed download 16.9 megabits from 220 tests, mobile nearby 111.1 megabits. That's a strong fixed-wireless candidate. Below is the shortlist of 20, which downloads in one click. The tests name no operator, so this shows what people experience, not anyone's coverage.

## 3-minute talk
**Title (15 s).** Hi, I'm Adil. This is Broadband Gap Finder: find the slow broadband, and know how sure you are. It's a map for sales teams choosing fixed-wireless campaign areas in Varsinais-Suomi. I built it as a dry run, on a mock DNA challenge.

**Problem (25 s).** As the challenge states it, campaign areas are chosen from municipal statistics. Those averages hide villages with real demand. And there's no shared list that explains where to market next quarter. Fixed wireless, a home router on the mobile network, could replace slow connections quickly, if you know where to look.

**Idea (20 s).** So the map asks three questions. Where is fixed slow? Is mobile strong nearby? And how sure are we? That third question matters most, because the data is thin.

**Demo (50 s).** *Switch to the app.* Each colour is a label. Purple means too few tests to judge, and those squares stay visible instead of being dropped. *Click the red ring.* Naantali: 14 residents, fixed 16.9 megabits from 220 tests, mobile nearby 111.1 megabits from 16 tests. *Scroll to the shortlist.* Here are the 20, with the evidence for each. *Point at the download button.* One click gives a CSV with the reason for every square, the data attribution and the operator note. The panel below lists every threshold. Rules decide every label and rank. The AI only rewords the facts, and code checks its numbers.

**Results (35 s).** The region has 7,791 inhabited squares and 491,224 residents. Only 2 squares are strong candidates, and 1 of those is on the shortlist. The other has under 10 residents, so it stays off. Then 4 have unproven mobile, and 15 rest on too few tests, with a median of 1 fixed test. Those are leads to check, not findings. I'd rather show that than a confident list the data can't support.

**Next steps (25 s).** Today it's not operator-specific, it covers one region and one quarter, and my thresholds aren't confirmed with the mentor. Next, I'd confirm them and try pooling several quarters of tests. A real commercial use would also need checking against Ookla's non-commercial licence.

**Close (10 s).** Broadband Gap Finder: find the slow broadband, and know how sure you are. The demo and the code are on this slide. Thank you. Questions?

## 5 likely questions
1. **How does the ranking work?** Each square gets a label from fixed thresholds: slow under 30 megabits, mobile at least 100 from at least 10 tests, and under 10 fixed tests counts as thin. The shortlist fills strong candidates first, then unproven mobile, then thin leads. Within each group, it sorts by residents times how far below 30 the speed is.
2. **Is this DNA's coverage?** No. The speed tests don't say which operator was tested. They show what people in an area experience, so a planner still needs DNA's own network data.
3. **Why is only 1 square fully proven, with just 14 residents?** Because tests are sparse. A square usually has very few, and I kept my thresholds instead of loosening them to look better. I measured what looser rules would do: 4 pooled quarters, slow below 50 megabits and a 5-test minimum give 20 strong squares. That choice belongs with the mentor and the sales team.
4. **Can I trust those numbers? 220 tests for 14 residents looks odd.** They're real data values, but the tests may not come only from residents. Visitors or a few repeat testers could be included, and Ookla's open data can't separate them. Treat it as a lead to check before spending campaign money.
5. **What about privacy, and what does the AI do?** I use only aggregated 1 kilometre squares, never addresses or households. Squares under 10 residents never reach the shortlist or export, and their numbers aren't shown. The AI gets one square's numbers and no place name, only rewords them, and code rejects any sentence with different numbers.
