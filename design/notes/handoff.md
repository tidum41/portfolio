# Handoff between the Paper agent (Mac) and the page agent (cloud)

Each agent appends its own dated section and never edits the other's. TASTE.md wins any conflict.

## Page (cloud), Nov 2 2026, round 13

Note: when I pulled, `handoff.md` did not exist on `review/round-p15`, and no Paper section had been pushed, so I built from `paper-asks-r12.md` and the page's own pieces. If the Paper frames differ, tell me which side moves.

What Paper should mirror for the Counts row (page: `/dialogue#counts`):
- **Pair, A above B, same layout as Levels and thin data.** A label row with the letter, then a one-line reason with a mark.
  - A: "Explored: two standard bar charts", with the X mark and "Splits 225 and 75 across two marks to compare."
  - B: "Kept: one bar with two sides", with the check mark and "One bar shows both counts at once in the 448px panel."
- **A's well holds two 448px panels, stacked, 16px apart.** Each is the product chart card titled "Read 'Arrives by Friday' as this Friday", with the note "Out of 300 shoppers". A small tag sits above each: "Two bars, side by side" and "Two bars, stacked".
  - Side by side: two vertical columns, 225 and 75, both on a 0 to 300 scale, track 96px tall, value above, label below ("Read it as this Friday", "Unsure").
  - Stacked: two horizontal rows, the same values, label and value on one line with the track under them.
  - Both are neutral: the 225 is stone-900 at 82%, the 75 is stone-500, no cherry, no teal. The kept bar in B carries the figure's one cherry.
- **B is the single bar:** cherry 225, stone-500 75, the swatch matching its segment, with the 75 open and Mei and Owen under "picked from the 75" as the poster-frame state.
- **Caption (one line):** "The kept bar holds 225 and 75 in one mark, and tapping 75 swaps in two of the unsure shoppers."
- **Body:** "I iterated on standard two-bar charts first, and the single bar came out of those iterations, with each side opening its people on a tap." Framed as an iteration choice, never a failure. The old "a table crowded the 448px panel" line is gone, since nothing broke.

Levels body changed (first person, no witness): "Using my own build, I found the open player pushed the count out of view, and I had to scroll back up for the one number I came for. Depth had to be something the reader opens."

Code notes for Paper naming:
- `ChartBarList` gained a `vertical` option (a prop on an existing allowlisted component, not a new component). Say if Mudit wants it treated as one.
- Teal variables from `paper-asks-r12.md` section 1 are in the code as `--ds-teal-70` and `--ds-teal-20`, used only on the Repeat shoppers series (By group pair, 1 to 5 scale).

## Page (cloud), Nov 2 2026, round 13b

Paper should mirror:
- **Teal rule.** Teal marks one thing only: a named second series (Repeat shoppers), labelled on its own row or dot. Never a rank position, highlight or chrome. Ranked, tie, Other and the 75 stay stone. The page follows this today; `paper-asks-r12.md` section 1 stays as written.
- **Explored recedes.** In every A versus B pair (Levels, Counts, thin data) and in the By group ruled-out half, the explored card is drawn at 62% opacity over the well. The kept card and all label rows stay full strength.
- **One rail for the data viz templates.** Every row is a 168px left rail (question type, template name, reason) and a card column to its right, 24px apart. By group no longer breaks out full width: its ruled-out card sits above the kept card, both inside that row's card column, each at the card column width, 16px apart, with the tags "Ruled out: percents on one scale" and "Kept: counts out of each group".
- **By group cut line.** After "each out of its own size." add "The other 161: [PLACEHOLDER: why they are in neither group]". 161 is 300 minus 14 minus 125.
- **Phone clip still.** The phone clip frame shows the whole answer sentence at the top, then the bar and legend, the quotes header and Ana's open clip. Dev's row waits just below the fold, so the still no longer crops the sentence. Desktop is unchanged.
