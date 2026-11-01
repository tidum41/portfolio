# Review (round 8, Nov 1 2026)

Base: review/round-p15 at fc34d18. Feedback from Mudit on the picker still, the toggles Source state, the clip take, the data viz figure and the thin take. Checked at 1440 light and dark, 390 light and dark. Screenshots: /opt/cursor/artifacts/screenshots/r8-*.png.

## Fixes

| Item | Cause | Fix |
| --- | --- | --- |
| Depth picker cropped | The picker stage was the same height as the answer stages; the chip row and the answer ran 43px past the card on desktop and 10px on phone. | The picker stage is 48px taller on desktop and 16px on phone (`EXTRA_H` in stages.ts). Every figure and take measured again for content past the card at 1440, 390 and dark. |
| Source state | Source swapped the rows for a bare "play" label that did not look like the side chat. | Source adds the play chip with the clip length to each quote row in a fixed 68px lane (TASTE: play chips with clip lengths). The row does not reflow when the chips appear. |
| Clip time shifts | DM Sans digits are proportional even with tabular-nums (0 is 0.684em, 1 is 0.312em), so every tick moved the text. | `TimeDigits` renders each digit of the player's current and total time in a fixed 0.64em cell. One layout across every tick. The static quote lengths (00:14) stay plain text, since they never change. |
| Phone player controls overlapped | At the 278px phone card the total time ran into the fullscreen icon (also in the previous take). | Under a 300px container the player drops the scrubber and the total time and keeps the current time between the skip and fullscreen controls. |
| Clip close does not settle | The grow unmounted while its tail was still animating, and padding and gap changed with it (4px pops); the chat kept 5 to 6px of scroll after the fold. | The fold is one solid 520ms block, the gap and padding live inside it, unmount waits for the animation plus 80ms, and the scroll follows the height every frame on open and clamps naturally on close. |
| Thin chips | The plus icon was gone and the counts were text. | Plus icon on each chip, the question in the middle, the count in a 40px chip at the right. |
| Data viz | One table of pairs, ruled-out options and edge cases; too much text. | Three routing steps, then one row per question type: type, chart name, one reason, the chart, its Carbon source. One cherry focal (the first row); neutrals elsewhere. Four short edge cases under it. |
| Duplicate frames | The screencast delivers about 25fps; resampling to 30 repeated every sixth frame in the middle of motion. | Takes record at half speed (CDP animation playback rate 0.5, stage timers scaled by K) and the encode retimes by K, so every motion frame is a real frame. |
| rAF timestamps | Under a slowed playback rate the rAF timestamp runs at 1/K while performance.now does not, which froze the scroll helpers. | Scroll helpers read performance.now() directly. |

## Remaining weak spots

- The data viz figure is still the longest figure on the page; each row carries one chart, so it cannot shrink further without dropping a question type.
- Source marks every row playable; only Ana's opens a player in the take.
- The frame-repeat scan now finds 37 repeats across 24 takes (it found 6 or more in each take before). Most are typed characters in the hero take and the single skipped screencast frame; none sits inside a scroll or fold.
- The phone player shows the current time only; the total and scrubber are dropped under 300px.
