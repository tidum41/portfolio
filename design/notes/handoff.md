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

## Page (cloud), Nov 2 2026, round 14

Paper should mirror:
- **Counts take poster.** The Counts video's still is now the 75 open: the 225 side of the bar dimmed to its pale pink, the Unsure segment in stone, the header "2 quotes shown, picked from the 75", and the two rows Mei ("Friday which week?") and Owen ("I checked the date to be sure."). This matches the Counts kept frame already in `paper-asks-r12.md`, so Paper's Counts B frame should already read this way. Phone gets the same state.
- **Counts holds.** Each side now holds about two seconds before the pointer moves on (take 6.2s, limit 9s).
- **No change to the other posters or frames.** Hero ends on Ana under the 225; Clip shows the quotes header, both rows and Ana's open player with nothing cropped; Every shows the count pushed out by the open player; Toggles shows Source; Thin shows the flag and its two follow-ups.
- **Decision logged:** a version of the desktop Clip that keeps the bar in view cuts the answer sentence at the top edge, so it was not kept. Phone Clip keeps its pinned layout.
- **Animation library:** none added. /dialogue is CSS keyframes, transitions and small requestAnimationFrame scroll loops; takes are recordings of those components. Details and file paths in `design/notes/motion-r14.md`.

## Page (cloud), Nov 3 2026, round 15

Test only; the page still plays the current Every and Toggles takes. For Paper, if Mudit ships the trim:
- **Every:** opens with the 75's people already showing (Mei and Owen under "picked from the 75", the 225 dimmed). One tap on Mei opens her player and pushes the count out of view; a second tap folds it, ending on the opening frame. 6.9s. Poster is the open player.
- **Toggles:** Chart, People, Source, Insight. Source holds about 2s on its play chips. Ana's play and fold are gone. 7.4s. Poster is Source open.
- Details, durations and still frames are in `design/notes/motion-r15.md`; the trimmed files shipped in round 16 and the `trim/` folder is gone.

## Page (cloud), Nov 3 2026, round 16

- **Shipped from round 15:** the trimmed Every and Toggles takes are the page defaults (assumption, not confirmed by Mudit).
- **For Paper:** segment seams are the flex gap only; a selected segment has a 2px marker in its own hue 6px under the bar, and its quote rows carry the same hue on the left edge. Every clickable has a hover (tint or darken, 150ms) and a distinct press. The depth picker is a take in live UI.
- **Open choices:** answer card (A patch the bar, B bar or rows by query, C rows every time; recommended B), Clips take (cut and keep a still, merge, or change; recommended cut), data viz section (Option 1 three rows, Option 2 worked example plus index; recommended 1).
- **Audits:** `npm run audit:dialogue-ui`, `npm run audit:dialogue-clip`, plus `check:dialogue-system` and `typecheck`.

## Page (cloud), Nov 3 2026, round 17

- **Answer card:** two short groups keep the bar; three or more groups, or any label over 26 characters, return one row per group (`answerLayout.ts`). One rows frame in Data visualization.
- **Clips:** a still replaces the take (no cursor, Ana's clip open under the 225's head line). Four clip videos removed.
- **Data viz:** three rows (split bar, ranked bars, flag), one line under each chart; Split carries the one cherry. By group and the awkward-shape frames are off the page, so there is no teal series on the page.
- Reasons for each are in `design/notes/decisions.md`.

