# Review, round 9 (Nov 1 2026)

Checks: motion checker 24 of 24, typecheck clean, check:dialogue-system OK, DOM clipping audit 0 clipped at 1440, 390 and 360, light and dark. Every take re-recorded in half-speed capture; no fade, no blur, loops seamless.

## Fixes
1. Source state: single select. Only Source carries the stone-200 fill and weight 500; the other levels read as unselected. TASTE does not make levels cumulative, so no cumulative state. The take is reframed so the top card is fully inside the frame in dark and light.
2. 225 and 75 encoding: cherry for the 225 segment, stone-500 for the 75, swatches match segments. Stacked-bar even segments no longer drift to the darker stone. One cherry focal per figure: the A and B pair keeps A neutral, and the data viz figure keeps cherry on the Split card only.
3. Data viz: each card names its own cut and denominator. By group uses 9 of 14 and 88 of 125, matching the scale card. Ranked is sorted bars with 'n of 300'. The scale card says each dot is the group median, with one count format per row. The three-step header is now one sentence. Each row leads with the question type in bold, then the chart name, then the reason.
4. Clip open: the player timeline is the clip range, 04:10 to 04:24. The quote's 00:14 hides while the player is open.
5. Clip closed: the third 225 claim is gone; the head reads "2 quotes shown, picked from the 225".
6. Picker: empty band between chart and tab row closed. The picker stays by the composer.
7. Single quotes around 'Arrives by Friday' in components, lib and takes.

## Judgment calls
- Ranked counts are out of 300, the study total, because the five asks are shares of all shoppers.
- Cherry on the Split card rather than By group: the Split card is where 225 against 75 is drawn.

## Weak spots left
- Phone takes scroll inside a 320 by 520 panel, so a mid-scroll frame shows a row cut by the panel edge; held frames are clean.
- Arial fallback in this environment does not render weight 500, so the medium weight is checked in CSS, not in the screenshots.

## Follow-up
The pointer in the takes is the take's own cursor, not the OS cursor (the screencast does not capture that). It covered the 'I' in Ana's quote when it tapped the row. Opening taps in the clip, every and toggles takes now land on the empty right side of the row, below the play chip. Those three takes were re-recorded in all four variants; motion checker 24 of 24 after the Split recolour.
