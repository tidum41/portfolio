# Review, round 10 (Nov 1 2026)

TASTE check before and after: every decided item re-read; no decision undone. Round 9 and earlier lines hold (single quotes, single-select picker, 225 cherry and 75 stone-500, cuts named on each card, A neutral in the A/B pair, picker by the composer, clip-range player). One TASTE line added for Round 10.

Checks: motion checker 24 of 24, typecheck clean, check:dialogue-system OK, DOM clipping audit 0 clipped at 1440, 390 and 360, light and dark.

1. Unsure swatch: the 75 segment was dimmed to 35% whenever the 225 was open (Source, People, hero, every, clip), so a stone swatch sat beside a pale bar. The 75 now keeps stone-500 in every state. When the 75 is open, the cherry 225 and its swatch dim together. Split card was already matched.
2. Ranked: bars keep top-value scaling (41 fills the track) and the caption says so. Scaling to 300 would leave the longest bar 14% of the track and make the five rows hard to compare, which is the point of a ranked chart. Counts stay "n of 300".
3. By group: the cut caption names 14 new and 125 repeat shoppers as two groups within the 300. Both counts already exist in the Hearthside mock (the scale card and the thin take); nothing is summed or invented, so no placeholder and no OPEN-ASKS line.
4. Levels B: on desktop the toggles card now hugs its content, so Insight shows the finding card and tabs with no blank card below. The well under it stays empty because the take is one fixed frame; the other levels grow the card. The grow and fold pull the flex gap and item margin with them and the fold runs 1.05 s with a symmetric ease, so the card edge never jumps (a dark take failed the checker until this was fixed). Phone takes are the card itself, so they keep the fixed height.
5. Clip open: opening taps land on blank right-side row space and the close tap lands in the blank header strip, so the pointer never covers 04:10 or the player times.
6. Dev's closed row keeps a bare length. TASTE (P16 round 4 toggles, Round 5 counts rows) has Source turn rows into play chips and closed rows show the duration in a fixed lane, so closed rows differ by design outside Source.

## Weak spots left
- Desktop B card leaves empty well below the Insight frame.
- Phone Insight frame still has a taller card than its content.
