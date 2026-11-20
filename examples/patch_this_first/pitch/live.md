# Showing Patch This First in person

All numbers from `pitch/facts.md` (KEV 2026.10.30, EPSS 2026-11-02). If the data is refreshed before the demo, re-read the top 3 first: never quote a result you haven't seen that day.

## Before you start
- Run the app (`streamlit run app.py`) and open it in a maximised browser. Click **English** (or keep Finnish for a Finnish audience).
- Click "Use sample list" once beforehand, so the KEV and EPSS downloads are cached. The sample uses cached AI texts, so there's no 20 s wait.

## 30-second demo
*Screen: the app's home page, empty text box.*
> "This is for the person who does the IT at a small office next to their real job. I paste the software list of an invented 12-person office..."

*Click **"Use sample list"**.*
> "...and in a second it tells me the three things to fix this week. First the firewall: 15 flaws attackers have already used, some in ransomware. Install the vendor's update, and here's the link. Then Windows 11 and Windows 10, which share the same flaws, so that's really one Windows update. At the bottom it lists the three programs it couldn't match, and says that doesn't mean safe. My list never left this laptop."

## 4-minute talk (follows the deck notes)
**1. Title (20 s).** "Hi, I'm Adil. Patch This First is for the person who does the IT at a small office next to their real job. You paste your software list, and you get the three things to fix this week, why, and a link to the fix."

**2. Problem (35 s).** "Traficom publishes vulnerability alerts, but they're written for security staff. The office manager or teacher who looks after IT gets a list of CVE numbers. Those are just ID numbers for security flaws. They can't tell which of their own programs are being attacked right now, and they have about thirty minutes a month for this. So they patch whatever sounds loudest, or nothing."

**3. Idea (25 s).** "So the idea in one sentence: match your software list against the programs attackers are already exploiting, and give you three things to patch this week, without reading advisories. It answers three questions: which of my programs are attacked, which three first and why, and what exactly do I do."

**4. Demo (60 s).** *Switch to the app, click "Use sample list".* "This is an invented 12-person office: sixteen programs. Thirteen matched. Number one is the FortiGate firewall: fifteen flaws on CISA's list of flaws attackers have actually used, at least one in ransomware, and a forecast of 99.9 percent that the worst one is used somewhere in the world in the next thirty days. What to do: install the vendor's latest update, here's the link. Two and three are Windows 11 and Windows 10. Honestly, they share the same 203 flaws, so this week is really two updates, not three. And at the bottom: Zoom, the NAS and the printer weren't matched, and the app says that does not mean safe." *Optional: click Suomi to show the same cards in Finnish.*

**5. How it works and results (50 s).** "Under the hood: the list stays in memory. Each line is matched against CISA's catalog of known exploited vulnerabilities, 1,766 entries. The order is one rule: anything used in ransomware first, then the highest forecast, then the newest. The AI, Gemini, only rewrites four public facts into two sentences. It never sees your list, and if its text changes a number it's thrown out. Results: on the brief's own example, Windows 10, Office 2019, a Fortinet VPN and WordPress on one line, it gives three distinct actions. On 54 messy product names, 37 match. 47 tests pass."

**6. Business and next steps (35 s).** "I have no users and no prices, so I won't pretend. The data is free and public, and the tool needs no keys. Being linked from Traficom's alerts, or used by small-business IT firms, are assumptions to test. Next: an end-of-support list, so Windows 10 says 'upgrade' and not 'update', a lookup for products CISA doesn't list, and a native speaker's read of the Finnish."

**7. Close (15 s).** "Patch This First: three fixes this week, in plain words. Thank you. Questions?"

## Likely questions from the Traficom mentors
1. **"Why is the firewall above Windows?"** Both have a flaw used in ransomware, so the next rule is the attack forecast (EPSS: the chance a flaw is used somewhere in the world in the next 30 days). The firewall's worst flaw is slightly higher. Honestly, both show as 99.9 %, so the user can't see the difference; the order comes from the third or fourth decimal.
2. **"Does it tell me I'm vulnerable?"** No. It doesn't check versions. It says "this product has known exploited flaws; check that you have the fixed version".
3. **"What happens to my list?"** It's processed in memory only: not saved, not logged, not sent. EPSS is downloaded for the whole catalog, not just your programs, so even that request reveals nothing. Gemini gets four public facts per card, not even the product name.
4. **"What if my program isn't on CISA's list?"** It shows up under "not matched", with the note that this doesn't mean safe. The KEV list only covers flaws with confirmed exploitation. The next step is the NVD database for everything else.
5. **"Can it get the Finnish wrong?"** The template sentences are fixed, and the AI text is checked for numbers, banned words and the right language. Grammar isn't checked by code, and no native speaker has read it yet.

## Hard questions a sceptical judge would ask
- **Oddest top result:** Windows 11 and Windows 10 are cards 2 and 3 with the same 203 flaws and the same text. It's one card per line by design, but it means three cards and only two distinct actions. And the lead flaws behind the top 3 are from 2018 and 2021. The newest-addition dates (27.7.2026 and 13.10.2026) are what show they're current.
- **Better setting not shipped:** merging cards with identical flaw sets, and a hand-made end-of-support list (Windows 10, Office 2019), were both considered and rejected for the MVP. A third option, sorting on the forecast as rounded on screen so ties fall to the visible date, wasn't done because it changes the order.
- **What the data can't show:** whether you're already patched (no versions), whether a product is past end of support, anything not on CISA's exploited list. The EPSS forecast is worldwide, not for your office. 75 % of the catalog's flaws have a forecast of 10 % or more, so the "high attack forecast" label alone separates little.
- **Honest size of the opportunity:** unknown. I have no users, no pilot and no prices. The data shows the problem is current: 313 entries were added to the catalog in the last 12 months. How many small organisations would use it, and who would pay, is untested.
- **Matching:** 37 of 54 messy names match. FortiClient VPN, Teams, Word, Ubuntu and home routers still don't. Matching is the weakest part, so the unmatched list is always shown.
- **Live AI:** Gemini took ~20–30 s per call. Lists other than the sample often get the template text instead. That's safe, but less fluent.
