# Broadband Gap Finder

**One line:** A map tool that ranks 1 km squares in Varsinais-Suomi where people live with slow fixed broadband, so sales teams can choose fixed-wireless campaign areas without guessing from municipal averages.

## Description
Broadband Gap Finder joins public speed tests to Finland's 1 km population grid, covering 7,791 inhabited squares and 491,224 residents in Varsinais-Suomi. Rules label each square, and a click on the map explains the pick in one sentence with real numbers and test counts. The top 20 export as a CSV with attribution and an operator note.

The result is deliberately honest about thin data. Of the 20 shortlisted squares, 1 passes every rule, 4 have unproven mobile, and 15 rest on too few tests, so they are leads to check, not findings. Speed tests don't say which operator was tested: they show what people in an area experience, not any operator's coverage. Squares under 10 residents keep their numbers hidden.

I built it as a dry run for Since AI 2026, using the mock DNA challenge "Broadband gap finder". DNA did not make, use or endorse it.

## How I built it
- **Data:** DuckDB reads only the region's Speedtest by Ookla tiles (2026 Q3) over HTTPS. Tile centres are converted to the Finnish coordinate system (EPSG:3067), assigned to 1 km squares and joined to the Statistics Finland population grid.
- **Rules:** slow fixed is under 30 Mbit/s, strong mobile nearby is at least 100 Mbit/s from at least 10 tests in a 3 × 3 km area, and thin data is under 10 fixed tests. Score = residents × gap, used only to sort. These are my own choices and aren't confirmed with the mentor.
- **App:** Streamlit and pydeck, deployed on Streamlit Community Cloud. 77 automated tests pass.
- **AI in the app:** Gemini rewords one square's computed facts. Code rejects any sentence whose numbers differ, and a standard sentence is used instead. The 20 shortlist sentences are saved in advance, and the public app runs without a key.

## AI-use disclosure
- **Claude Code (Opus 5.5):** wrote the code, tests and pipeline, checked the data sources, tested the app in a browser, drafted this text, the video script and the slides, and adjusted the video engine, revised the script and timed the screen clips in the video repo. I made the product decisions and tested the deployed app.
- **Gemini (`gemini-3.5-flash-lite`):** wrote the reason sentences in the app from computed facts only.
- **ElevenLabs:** generated the video's voice-over.

## Links
- Demo: https://broadband-gap-finder.streamlit.app/
- Repo: https://github.com/AdilAry/production
- Video: [to be added]

Data: Speedtest® by Ookla® open data, CC BY-NC-SA 4.0 (2026 Q3). Statistics Finland, 1 km population grid, CC BY 4.0 (2025 edition).
