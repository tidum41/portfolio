# /dialogue review, round dialogue-reset-r1 (Nov 23 2026)

Reviewer: Claude Opus (claude-opus-5-5, effort high), headless, read-only on the repo. Inputs: 30 section slices of the current /dialogue build (review/dialogue-depth-r1 @ 19a4534) at 1440 and 390, the dialogue-agent knowledge pack, design/TASTE.md, the depth-r1 decision log and story changes. Grok Bot checked every callout and the key claims against TASTE before building the board. Mudit writes the copy; every wording below is a proposal.

Visual board: /workspace/dlg-review-opus/board/overview.png and board/00-hero.png to 06-takeaway.png (red Wrong, green Right, amber Obvious). Raw findings with reasons and next moves: opus/findings.json (45 findings: 22 Wrong, 12 Right, 11 Obvious; 3 of the Wrong are repo cuts).
After the cuts: board-after/overview-after.png and board-after/01-cut-ex1.png, 02-cut-ex4.png, 03-cut-hero-option.png.

Read against design/TASTE.md (wins every conflict), the dialogue-agent pack, the depth-r1 exploration notes, the page source and all 30 slices. Finding ids refer to findings.json.

## Verdict

The page is closer than it feels. The hero shows the final answer with a real verbatim, the problem has an honest annotated before still, Levels holds the one real reversal in Mudit's own words, and the ending admits that only the count shipped. Two things pulled it off track. First, the figures that should prove the turn do not show it from a still: the first try looks like a working answer and matches the Counts shipped frame, option A is an empty panel and option B is half blank. Second, Data viz tells three different stories about who picks the chart, and its mock numbers leave gaps a researcher will spot. The fix is mostly crops, posters, one framing decision and a few sentences. It is not a new structure.

## Biggest WRONG findings, ranked

1. **Data viz contradicts itself on who picks the chart (F27).** The body says "a rule I wrote", the figure header says "the shape of the question picks the chart", and Mudit said on Nov 9 that the model picks (OPEN-QUESTIONS 25). This is the first question a hiring manager at a research-tool company will ask.
2. **The turn does not read from stills (F12, F13, F14, F21).** The first-try frame shows the count in view with Mei and Owen listed, the same frame as the Counts shipped take. A shows an empty chat and B leaves about 430px of blank stage. A skimming reader sees no failure and no fix.
3. **"How Dialogue's chat answers today" (F06).** This contradicts the count bar the page says shipped. ANALYSIS §2c also dates the before gaps to Oct 2026, after the engagement.
4. **Mock data a researcher will catch (F29, F31, F37, F38, F22).** The 161 untagged shoppers have no sentence (TASTE Nov 10). The 75 is stone in four figures and pink in two. "Under three people" is stated with its reason placeholder gone. The near-miss bar adds a cause the flag never states. The Counts still shows 75% and 25% under a heading about counts.
5. **System slips (F01, F33, F40, F05).** The hero is 750px wide, breaking the 640 lock. The templates caption is a list of three. The phone thin take is caught mid-fade. A fixed site button sits on product UI at 390.

## RIGHT, build on these

- The hero's final answer with Ana's words and timecode (F03), and an intro that states the spine (F04).
- The annotated before still with one cherry mark (F07), and the tension line "A fast answer and a deep one pull apart" (F08).
- The Levels reversal (F10), with Ana's clip in place as its payoff (F17).
- The "8 versions" work count (F24).
- The thin-data pair, which draws the rejected option (F36), and the denominator figure that leads with counts (F39).
- The honest shipped section (F41) and the takeaway line (F42).

## OBVIOUS, says too much or says it twice

- Captions that narrate the take or restate the labels: hero (F02), Counts (F26), thin (F35).
- Kickers "The moment" and "The turn" name the story's mechanics (F19).
- The PM and director line asserts an audience split that no figure shows (F20).
- A and B look the same from stills (F15), and Levels runs 3600px (F18).
- Counts repeats the first-try frame (F21).
- Hover instructions inside figures that are mostly read as stills or on phones (F32).
- Thin data is told twice, once in the Flag row and again in the A and B pair (F34).
- The h2's proof comes second in Data viz (F28).

## Story direction

Keep the order approved in TASTE Round 19: Problem, Levels with clips, Counts, Data viz closing on thin data, Shipped and next, Takeaway. Keep Direction A: one decision per section, each with its why and a figure, ending on what he'd test next. The spine stays speed versus depth, and every section should answer one question: how does a team get this fast without losing the people behind it?

- **Hero.** Final answer first. One-line caption. Lock to 640.
- **Problem.** Use Rachel Chen's "...but" pair. The want is a claim for tomorrow's share-out. The constraint (a fixed 448px panel and no direct access to teams) comes before the figure, so it turns the problem instead of footnoting it. Call the still "before", with a dated placeholder.
- **Levels (the turn).** Assumption, check, reversal. The first-try figure must show the count gone. A and B must differ at a glance. End on Ana's clip with the count still above it. That is the payoff and what teams want first (TASTE Nov 22).
- **Counts (quick build).** Count what he touched (8 versions), show the explored charts with the same label rows as the other pairs, and hold the take on counts. Opening the 75 shows dissent, which is the trust half of depth (ANALYSIS §3). One sentence can say that.
- **Data viz.** Open on the By group figure: segment comparison is the second thing teams want, and it proves the h2. Then the rows rule, then templates, then thin data as the closing rule. One framing for who picks, settled by Mudit.
- **Shipped and next.** Keep it honest. Add which signal he'd watch first and what would make him change the design.
- **Takeaway.** Keep the line. The placeholder should be his lesson about himself.

Sharing, the third thing teams want, has no home. Do not invent it. If Mudit did share or export work, it belongs in "what I'd test next".

## CUT list

| What | Where | Why |
|---|---|---|
| Evidence layer cells (exploration 1) | app/dev/dialogue-depth/DepthLab.tsx, Ex1Cell, the ex 1 lift links and branch | Not approved by Mudit in round 3 (ex1-ex4-review.md, D4, D5). Keep the EvidenceLayer component only while LiveFigure imports it |
| Claim-to-moment cells (exploration 4) | app/dev/dialogue-depth/DepthLab.tsx, Ex4Cell and branch | Not approved (D9, D10, D14). The placeholder player shows nothing |
| Hero option route | app/dialogue/hero-option/page.tsx and .dlg-hero-opt CSS | Says in its own comment that it conflicts with the 640 lock. Public route with only noindex |

Nothing on /dialogue that TASTE approves is on this list.

## Copy proposals

Each is a proposal. Mudit writes the final.

- **Hero caption.** "Tapping the count opens the people behind it. Recorded from my live code recreation. Illustrative data." (Proposal, Mudit writes the final)
- **Problem caption.** "Dialogue's chat before the redesign, recreated in code. 'Many found' hides a count. [PLACEHOLDER: when this answer was captured]. Illustrative data." (Proposal, Mudit writes the final)
- **Levels h2, if he wants the word to match the take (STORY-CHANGES P4).** "Every level at once lost the count, so depth became optional" (Proposal, Mudit writes the final)
- **Counts body, in place of "everyone reads".** "NN/g reports small studies as counts, such as 1 out of the 6 participants, so the count leads." (Proposal, Mudit writes the final)
- **Data viz opening, until OQ 13 closes.** "[PLACEHOLDER: who picks the chart in real Dialogue]. A rule I wrote handles long labels: three or more groups, or a label over 26 characters, get a row each." (Proposal, Mudit writes the final)
- **By group caption, with the blind spot.** "Each row counts people out of its own group. The 161 shoppers tagged neither new nor repeat sit outside both rows. Illustrative data." (Proposal, Mudit writes the final)
- **Templates caption.** "Each kind of question gets the chart that answers it from the same study. Illustrative data." (Proposal, Mudit writes the final)
- **Thin body.** "Under three people the answer swaps its chart for an early-signal flag. [PLACEHOLDER: why the cutoff sits there, and what would change your mind]" (Proposal, Mudit writes the final)
- **Thin caption.** "Two people get a flag and a follow-up with more to count. Recorded from my live code recreation. Illustrative data." (Proposal, Mudit writes the final)
- **Shipped and next, added line.** "[PLACEHOLDER: the signal you'd watch first, and the result that would make you change the design]" (Proposal, Mudit writes the final)

## Questions only Mudit can answer

1. In real Dialogue, does the model pick the chart, or does a rule you wrote? (OQ 13, 25)
2. When was the before answer captured: before your work, or in Oct 2026 after it? (ANALYSIS §2c)
3. Levels h2: does the failure stay "too slow", or become "lost the count"?
4. Should the real 18 of 24 appear in the Shipped Counts section? Right now the only real number on the page is "8 versions".
5. Why does the thin cutoff sit at three people, and what would change your mind?
6. Which carries thin data: the Flag template row or the A and B pair?
7. Which of the 8 versions are the three shown in Counts, and what did the others try?
8. Did you do any share or export work? Sharing is the third thing teams ask for, and the page has nowhere for it.


## What was cut (branch review/dialogue-reset-r1)

Only clearly misaligned removals. Nothing on the published /dialogue page changed: all 14 section shots match the before shots in size, so every page finding above is still open for Mudit.

| Cut | Files | Reason |
|---|---|---|
| Exploration 1 lab cells (evidence layer, three options, lift links) | app/dev/dialogue-depth/DepthLab.tsx | Not approved, round 3 (ex1-ex4-review.md, D4, D5). EvidenceLayer component kept because exploration 5 renders it |
| Exploration 4 lab cells (zoom, cut, grow in place) | app/dev/dialogue-depth/DepthLab.tsx | Not approved (D9, D10, D14); placeholder player shows nothing |
| /dialogue/hero-option route and .dlg-hero-opt CSS | app/dialogue/hero-option/page.tsx, components/dialogue/product/dialogue-product.css | Its own comment says it conflicts with the 640 lock; TASTE Round 19 records the hero options page as deleted; it was public (noindex only) |

Revert any of them with git revert on the cut commit. ex1-ex4-review.md has a dated update line.

Checked but not cut, because they are fixes or Mudit's call rather than removals: the hero's 750px well (F01), the 75's pink in two charts (F31), the empty or half blank Levels stills (F13, F14), the near-miss sentence (F38), and every copy line.
