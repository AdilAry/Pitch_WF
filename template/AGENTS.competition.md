## Competition [IF someone else judges the result against criteria and a deadline]
- **Event:** [name, dates, deadline].
- **First question:** [what the judge or user asks first, and what a useful answer looks like].
- **Judged on:** [criteria with weights | none given].
- **Title question:** [the challenge's title, read as a question]. Answered by: [the one built thing that answers it; a document or a concept page doesn't count].
- **Official score:** [the evaluator or benchmark command, and the supplied baseline's score | none supplied: the held-out split and the metric I chose]. Every result is reported against it, in one line.
- **Hand-in:** [what must be delivered, with limits | none].
- **Demo moment:** [one concrete thing shown live or found in real data].
- **Demo access:** no setup for the judge: [a hosted link that opens without a login | one command from the README]. Whatever must be judged is also in the video and the deck.
- **Look:** from the style guide; see Presentation. Fixed at M0. Sponsor logo: [allowed, asked on day one | not allowed | not asked yet].
- **Team:** [me (solo) | names and roles].
- **Budget:** [16] h of work. M0 skeleton and baseline score 10% · M1 foundation 10% · M2 core feature 20% · first-question check · M3 [model and its score | extra layer] 20% · M4 polish 10% · judge pass + fixes 20% · submission dry run 10% · freeze. When a milestone reaches its budget, stop and tell me what's left and what you'd cut; I decide. Time left under budget goes first to the biggest gap from the first-question check and the judge pass, then to polish.
- **Libraries:** whatever the official data and the official evaluator need is approved in advance. Anything else, ask.
- **Not doing:** the Scope line is re-read at the first-question check, at /judge and after a sponsor Q&A. A line stays only if it still holds after what was learned.
- **Model:** if Data has a Model line, the default is to build the model the challenge invites. "None" there needs a reason I have agreed to.
- **After freeze:** bug fixes only; question any other change before doing it. For any change visible on screen, list the screenshots and clips that need retaking.
- **At /start also:** log the start time (`Get-Date` on Windows, `date` on Linux) in a "Time" table in PROGRESS.md. If the table isn't there yet, add it: Milestone, Budget, Start, End.
- **At /wrap also:** log the end time in the Time table and put the time spent in the history entry. If a new AI tool or purpose was used this session, add a row to docs/ai_log.md.
- **At /judge also:**
  - When you use the product, start from the hand-in or the demo link and its README alone, not from "How to run". Every step beyond what "Demo access" promises is an issue.
  - Run the Official score; say whether the materials report the result against the baseline in one line.
  - Ask the First question and read the top results. Do they answer it usefully? Does every user group named there get something it can use?
  - Title question: which built thing answers it? A page of text doesn't count.
  - Describe the entry that would win on this brief (what it builds, what it shows first, the number it closes on) and list what it has that this one lacks.
  - Name every line of "Not doing" that the brief, the sponsor's answers or your own findings now argue against.
  - In the headline text of the hand-in (title, tagline, first lines of the description), list every sentence that argues against the project's own value; each moves to the limits section or the Q&A answers. Labels that say where the data comes from stay.
- **At /judge also (final):** check every item in "Hand-in", if it lists any.

<!-- /entry adds this row to the project's "Read only when needed" table, not as a table of their own: -->
| `docs/ai_log.md` | writing the README or disclosures |
