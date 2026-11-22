<!-- What /entry adds to the project's docs/plan.md when it adds the Competition section. Each block says where it goes. Add these before the blocks of plan.presentation.md: two of those go into sections added here. -->

<!-- Into "M0 Skeleton", before its "Done when": -->
- Check that "First question" in AGENTS.md is filled. If it isn't, ask me before building.
- Find the official evaluator or benchmark and run the supplied baseline. Put the command and the baseline's score in AGENTS.md "Official score". List what it scores (each task, label family or action) and mark which ones the plan answers; a gap gets a check in the plan or a line in "Not doing". If there is none, tell me, and propose a held-out split and a metric.
- Load the full data set once. Count the rows in every table its documentation describes and write the counts in PROGRESS.md; an empty table is compared against the original archive before anything is built on it. If something can't be loaded, tell me why.

<!-- Into "M0 Skeleton", after its "Done when": -->
- Also done when: AGENTS.md has the baseline's score, and PROGRESS.md has the row counts.

<!-- Two new sections before "Review (fresh session)", in this order: -->
## First-question check (15 min, fresh session)
Read the results as the person in "For" would, and answer three things from them:
- The First question. If the answer is weak, the product changes, not the wording.
- The Title question: which built thing answers it? A page of text doesn't count.
- Each line of "Not doing" in AGENTS.md: does it still hold after what the sponsor and the data have said? Is a cheaper, software-only route written down as a limit instead of built?

If any answer is weak, tell me before going on.
- **Done when:** docs/history.md has the three answers and your verdict, and I approve it.

## Polish
- The demo moment, layout on the target screen, wording without jargon.
- Error states: [the ones you expect, e.g. missing data, no key, no connection].
- No function or variable names on screen, including loading messages.
- **Done when:** `[the Check command]` passes; by hand I check [the demo moment on the target screen].

<!-- Two new sections after "Review (fresh session)", at the end of the plan, in this order: -->
## Submission dry run (before the last evening)
- Build the hand-in from the current commit. Unpack it in an empty folder and run it from its README alone: no setup beyond one command, where the data terms allow.
- Open the demo link signed out. It must work with no login and no setup.
- List every file in the hand-in that is a note and not product.
- Count every form field against its limit.
- **Done when:** docs/history.md lists each item as passed, or says what is missing.

## Freeze
After the judge pass, when the budget is used up, or when I say so. From then on, bug fixes only.
When the hand-in is ready: `/judge final` in a fresh session.
