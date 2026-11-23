# Exploration 4: from claim to moment

Status: dev only, awaiting Mudit's OK. `/dev/dialogue-depth?ex=4` (`&opt=a|b|c`, `&auto=1`).

## What it repairs
Traceability (P3, P4) and the clip as the deepest level (P9): 225, then Ana, then her clip from 04:10, each level born from the one before. It builds on exploration 1's layer, so the count never leaves view, which is the first-try failure in Levels ("the player pushes the count out of view", TASTE P16 round 4).

## Data
Hearthside mock only (MOCK-DATA.md 4c): Ana 04:10 to 04:24, Dev 11:02 to 11:15 (and Mei, Owen on the 75 side). The player is the existing `DialogueInterviewPlayer` with `start` and `total` set to the clip range.

## Storyboard (auto)
0.9s open 225, 2.2s Ana's clip (deeper), 4.0s Dev's clip (sideways), 5.6s close the clip, 6.6s close the side, loop at 8s.

## Options
| | How the clip is born | Motion | What stays fixed |
|---|---|---|---|
| a zoom | expands from the tapped row | scale 0.94 to 1, 400ms | The bar. The layer scrolls to the row |
| b cut | lands at once, with a path line "225 · Ana 04:10" | none | The bar, plus a written trail |
| c grow | the shipped Grow opens height under the row | Grow (approved) | The bar and the tapped row |

Chosen: c. DECISIONS D9 and D10.

## Rules kept
- Never a third elevation: the clip opens inside the layer, and the layer scrolls inside itself.
- Sideways (Ana's clip to Dev's): lands at once in every option.
- Reduced motion: no animation, scrolls jump.

## Close (fixed in round 2)
Closing a clip in c folds back with the shipped Grow on `--dlg-motion-shallower-ms` (240ms). A clip that replaced another opens at once but still folds on close. Strip: `/workspace/dlg-depth-r1-shots/out/ex4-fold-strip.png`. DECISIONS D14.

## Clips and frames
- Options: `/workspace/dlg-depth-r1-shots/options/ex4-opt-{a,b,c}.mp4` and sheets, `ex4-all-ana-clip.png`
- Chosen: `/workspace/dlg-depth-r1-shots/out/ex4-chosen-c-grow.mp4`, `ex4-chosen-c-reduced-motion.mp4`
