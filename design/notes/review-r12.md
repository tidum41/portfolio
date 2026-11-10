# Review (round 12, Nov 2 2026)

Base 6569224 on review/round-p15. The thin-data A placeholder is untouched, and so is every other placeholder.

## Part A, story holes
In `story-holes-r12.md`: section by section, what is shown and what is only asserted, what's missing, and one question for Mudit, with the top 5 ranked. No facts were added.

## Part B, copy
In `copy-diff-r12.md`: eight lines, about 50 words fewer. The changes:
- Cut repeats: the Problem deadline, A's verdict in the Levels caption, the data viz "concept" line, and the thin body's pattern line, which A's con row already states.
- Two captions now say what their pair proves: Levels B keeps the toggles above the clip, and thin A's bar fills its track for two people.
- The Problem principle is now first person.

## Part C, ramp C
- **Tokens.** `--ds-teal-70` #005d5d is Carbon `$teal-70`, slot 3 of the light-theme categorical palette, and is 7.7:1 on the white card. `--ds-teal-20` #9ef0f0 is Carbon `$teal-20`, about 1.3:1, fill-with-label only. The chart aliases are `--dp-chart-secondary` and `--dp-chart-secondary-soft`.
- **Code.** `ChartBarDatum` gains `secondary`. ChartBarList fills a secondary bar teal, and ChartDotPlot draws a secondary dot teal. Hex values live only in the token definitions, so check:dialogue-system's raw-colour rule holds.
- **Where teal appears.** Only the Repeat shoppers series: the By group pair (kept counts and the 64%/70% foil) and the 1 to 5 scale.
- **What stays the same.**
  - The 225 and 75 split, and the Other row: a remainder isn't a second series.
  - The tie and edge frames, and Ranked.
  - The thin near-miss.
  - The cherry focal, plus the neutral stone-900 focal on frames that aren't the 225.
- **Why teal-70 over the teal-60 fallback.** I checked teal-70 beside the neutral near-black focal at 1440, 2x. The hue separates clearly in both themes, since the cards stay white, so the fallback wasn't needed.
- **Soft teal** is defined but not used yet. No chart on the page has a labelled mark that needs a light fill.
- **TASTE** gets one ramp C line, after Round 11b.

## Part D, phone clip poster
- **Cause.** The phone clip take pinned the quotes head at the top, but the chat ran out of scroll first. That left the bar cut across the card's top edge, both in the held open state and in the poster.
- **Fix.**
  - On phone, the take now pins the bar's own top at 12 px. The open player stops with the bar whole: rounded corners, legend, 225 and 75 all in view.
  - Ana's clip and Dev's row fit below it.
  - The fold clamps back to the start frame, so the loop still closes.
  - Desktop is unchanged: the head still pins and the bar scrolls fully out, which never cropped.
- **Why the bar stays in view.** This isn't the first try's exact move (more scroll room, so the count leaves fully), and the rule both fixes share is nothing cropped. For Clips, keeping the count above the playing clip also makes its claim, a quote playing inside the answer. The Paper audit's top 3 noted that a frame with the count gone looks like the first-try failure. If Mudit prefers the first try's look, the switch is one line: give the phone clip body the first try's 160 px of scroll room and pin the head again.
- **Re-recorded** live-clip-m light and dark (first take passed both). Poster pinned at 3.5 s, the held open state, in light and dark. Versions re-hashed.

## Take improvements, suggested only (not built)
- **Desktop clip, count above the clip.** The desktop open state drops the count, so it reads close to the first-try failure frame. A 4:3 clip stage, or the phone's stop at the bar, would keep 225 of 300 above Ana's clip. Needs Mudit's OK because it changes an approved take.
- **Counts poster on the 75.** The counts poster (`live-side.jpg`) shows the 225 open, the same frame as the clip take's start and the hero's end. Holding it on the 75-open state (Mei and Owen under "picked from the 75", the 225 dimmed) would show "both sides open" in the still. It's a poster override, no re-record.
- **Thin poster after the follow-up.** The thin poster holds the flag before any follow-up is tapped. A later frame, with the 125 answer landed under the flag, would show the whole idea (refuse, then offer something countable) in one still. Check that nothing crops before pinning it.
- **Toggles back to Insight.** The kept toggles take could hold Insight for an extra beat at the end, so the "one tap brings the count back" moment the new caption names reads in motion as well. It's at 8.97 s now, so this means trimming elsewhere to stay under 9 s.

## Checks
- typecheck clean.
- check:dialogue-system OK, 76 files.
- Motion checker: 24 of 24 pass.
- Clip audit: 0 clipped at 1440, 390 and 360, light and dark.
- Pointer-on-text audit: 6 demos at 2 viewports, all 12 empty.

## Screenshots
`/opt/cursor/artifacts/screenshots/r12-*`:
- `r12-dataviz-{group,scale}-{light-1440,dark-1440,light-390}.png`: teal on the second series.
- `r12-live-clip-m-poster-{light,dark}.jpg`: the new phone clip posters.
- `r12-live-clip-m-before-r11b-frames.png` and `r12-live-clip-m-after-frames.png`: the take before and after the fix.
- `r12-desktop-light-*.png`: all 8 figures at 1440 light.
