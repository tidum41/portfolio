# Motion, round 15 (Nov 3 2026): trimmed Every and Toggles

Mudit approved a test. Every and Toggles sat within a second of the 9s limit, and Toggles went over it on 3 of 8 recording attempts (9.03s, 9.07s and 9.03s), so a take needed retries to land. The trimmed storyboards are recorded behind `DLG_TRIM=1` in `scripts/record-dialogue-motion.mjs` and write files ending in `-trim`. No GSAP; takes are still recordings of the real components. The shipped takes on the page are unchanged. The trimmed files are in `public/dialogue/motion/trim/` and nothing on the page references them.

## What was cut

| Take | Step cut | Result |
| --- | --- | --- |
| Every | The tap on the 75. The take now opens with the 75's people already showing, taps Mei (her player opens and pushes the count out of view), then taps Mei again to fold it. The chevron step is gone with it, since the fold returns to the start state | 4 steps become 2 |
| Toggles | Ana's play beat (her tap and her fold). The take is Chart, People, Source, then Insight | 6 steps become 4 |

Two things I tried first and rejected.
- **Every, first attempt:** cutting the 75 tap left a few pixels of scroll offset after the fold, so the last frame did not match the first and the loop check failed on all four takes. Fixed by easing the chat back to the top (`up(500)`) as the player folds. After that, all four variants passed on the first take.
- **Toggles, cutting only Ana's fold tap:** Insight then folds the open player together with the rows, and the player fades out as a ghost video for a few frames (`motion-r15/r15-toggles-rejected-ghost-player.png` shows the faded player). TASTE (P16 round 4, blur) says the player opens and folds as a solid block and no fading still may sit over moving rows, so this was rejected. Cutting Ana's whole beat avoids opening the player in the first place.

## Durations (seconds, light desktop / phone / dark desktop / dark phone)

| Take | Current | Trimmed |
| --- | --- | --- |
| Every | 8.33 / 8.57 / 8.33 / 8.57 | 6.93 / 7.00 / 6.93 / 7.00 |
| Toggles | 8.97 / 8.73 / 8.97 / 8.73 (first attempts 9.03 to 9.07 failed the 4 to 9s check) | 7.37 / 7.17 / 7.37 / 7.17 |

Key moment, time on screen from the tap that creates it to the pointer's next press, from the storyboard timings. Every: the open player with the count out of view, about 2.4s now and about 2.7s trimmed. Toggles: Source open with its play chips, about 0.7s now and about 1.9s trimmed.

Checker (`scripts/check-dialogue-motion.py`): trimmed 8 of 8, public takes 24 of 24 (untouched). Longest mid hold: Every 0.7s now, 0.97s trimmed; Toggles 0.37s now, 1.07s trimmed. Final hold 1.27 to 1.83s in every trimmed take, inside the 1 to 1.9s limit.

## Audits
- `DLG_AUDIT=1` pointer-on-text, Every and Toggles, desktop and phone, current and trimmed: `"touches":[]` in all 8.
- Clip audit at 1440, 390 and 360, light and dark: 0 clipped in all six.
- `npm run typecheck` clean, `npm run check:dialogue-system` OK.

## Stills (`design/notes/motion-r15/`, copies in `/opt/cursor/artifacts/screenshots/r15-*`)
- `r15-every-desktop-light-sheet-cur-over-trim.png`, `r15-every-phone-light-sheet-cur-over-trim.png`: one frame per second, current on top, trimmed below.
- `r15-toggles-desktop-light-sheet-cur-over-trim.png`, `r15-toggles-phone-light-sheet-cur-over-trim.png`: same for Toggles.
- `r15-every-key-moment-cur-left-trim-right.png`, `r15-toggles-key-moment-cur-left-trim-right.png`: the poster frame of each.

## Pick

Trim both.
- **Every:** 6.9s against 8.3s, with the key moment about as long as before (it was already near 2.4s) and no other beat compressed. The proof it exists for is intact: the open player pushes the count out of view. The loss is the first tap, so the take no longer shows the 75 opening its people. The Counts take (`live-side`) already shows that tap, and this take starts from that state.
- **Toggles:** 7.4s against 9.0s, so it stops failing the length check on a bad run, and Source, the poster state, now holds about 1.9s instead of 0.7s. The loss is Ana's play, which the Clip and Every takes already show.

What Mudit should confirm before the trimmed files replace the shipped ones. This touches two lines in TASTE (P16 round 3 "Toggles go Chart, People, Source, then a tap on Mei" and round 4 "Ana plays", and round 4 "the 75 opens people" for Every). I did not edit them. To ship: copy the files from `public/dialogue/motion/trim/` over the matching names without `-trim`, add the poster times from `trim/poster-times.json`, and run `node scripts/version-dialogue-motion.mjs`.
