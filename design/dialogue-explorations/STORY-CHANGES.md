# Story changes (round depth-r1)

Mudit writes the story. Structural changes and figures are logged here with a revert. Every new or changed sentence is a proposal: it is not on /dialogue, and it shows only on the dev page (`/dev/dialogue-depth?ex=story`), marked "Proposal".

## On the page

### 1. Data viz: the denominator figure (structure plus figure, no new copy)
- Where: `components/dialogue/DialogueCaseStudyContent.tsx`, Data viz section, directly after "Each template is adapted from IBM Carbon and counts people out of their own group, since two groups of different size look alike as percents."
- What: `DenominatorReveal option="relabel"` in the system frame. It plays once in view (64% and 70%, then 9 of 14 and 88 of 125).
- Caption: Mudit's existing verdict line from DialogueChartLibrary ENTRIES (segments), unchanged, plus the standard "Illustrative data." suffix every mock figure carries.
- Why: the h2 claims each group has its own denominator, and no figure showed one. Mudit approved featuring this blind spot (Nov 9).
- Gate: `DenominatorReveal` is added to design/SYSTEM-COMPONENTS.md marked PENDING Mudit's OK.
- Revert: delete the figure and Caption block after that sentence, the two imports at the top of the file, and the `DenominatorReveal` line in SYSTEM-COMPONENTS.md.

## Proposals (not on /dialogue)

| # | Story break (ANALYSIS section 3) | Old | Proposed | Why |
|---|---|---|---|---|
| P1 | Data viz says "a rule I wrote", Mudit's Nov 9 direction says the model picks | "The chart follows a rule I wrote." | If the model picks: "The model picks the chart from templates I designed, and a rule I wrote handles long labels." If a rule picks: keep his sentence. [PLACEHOLDER] until OQ 13 and 25 close | Removes the contradiction without asserting either answer |
| P2 | Carbon is named but no rule is shown | (no figure) | A figure of one adapted rule: Carbon's axis guidance (bars start at zero, per CHART-RATIONALE row "Bars start at zero") beside the 448px panel bar. Caption [PLACEHOLDER] until the Carbon axes page is re-fetched and quoted | One rule shown being bent proves the "adapted from" claim |
| P3 | Problem shows only the hidden count | One figure, "Many found" marked | Second symptom: the comparison that pooled counts hide (P6), drawn as the 64% and 70% bars alone. The misattributed quote (P4) waits on OQ "when were the before gaps observed" | Comparison is the decision most questions are about, and its numbers already exist |
| P4 | Levels h2 claims "too slow", the take shows lost place | "Every level at once was too slow, so depth became optional" | "Every level at once lost the count, so depth became optional" | The proof is spatial. Mudit's words (Oct 28) say "not feasible and efficient", so he may prefer to keep "slow". His call |
| P5 | Speed has no visual proof | (text only) | A hops figure: the before path to a person (section page, then quote modal) beside one tap on the bar. Hop count [PLACEHOLDER] until PLATFORM "a few steps away" is confirmed. No timing numbers | Shows speed as fewer steps, with nothing invented |

## Round 2 proposals (dev page only, never on /dialogue)

| # | Where | Old | Proposed | Why |
|---|---|---|---|---|
| P6 | Exploration 5 container control (live mode off) | (none) | "Try it" | The control needs a label. Two words, sentence case. Mudit writes the final copy |
| P7 | Exploration 5 container control (live mode on) | (none) | "Watch the take" | Returns to the recording |
| P8 | Exploration 3 framing under the figure | (none) | [PLACEHOLDER] until OQ 13 and 25 close. If the model picks: "The model picks the template from the question." If a rule picks: "A rule I wrote picks the template from the answer's shape." | The figure works under either answer, so only this line changes |
| P9 | Speed break (ANALYSIS section 3) | (text only) | Exploration 3 as the speed figure: one card that answers three questions in the right shape, with no re-asking. No timing numbers | Shows speed as the right shape first time, nothing invented |

No new copy went on /dialogue in round 2.

## Round 3 (page)
- The Data viz denominator figure now uses `DenominatorReveal option="hover-counts"`: 9 of 14 and 88 of 125 at rest, and hovering a row shows its percent in the same cell (TASTE Round 18 item 5). The round 1 autoplay relabel is removed. The caption is unchanged (Mudit's verdict line plus "Illustrative data."). No new copy.
- Revert to round 1: set `option="relabel"` on that line in DialogueCaseStudyContent.tsx. Revert entirely: as in section 1 above.
