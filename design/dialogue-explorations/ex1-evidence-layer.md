# Exploration 1: the evidence layer

Status: dev only, awaiting Mudit's OK. `/dev/dialogue-depth?ex=1` (add `&opt=a|b|c`, `&lift=rise|reveal|shadow`, `&auto=1` for the storyboard).

## What it repairs
Levels shows that stacking every level in one stream pushes the count out of view (Mudit found it on his own build, TASTE Round 13). This makes depth a layer: the people sit in front of the answer and the count never leaves view. Problems P3 and P5, and the Levels reversal.

## Data
Hearthside mock only (MOCK-DATA.md 4c): 225 side Ana 04:10 and Dev 11:02, 75 side Mei 18:27 and Owen 07:12, "+223 more" and "+73 more" from 225 and 75. The question is the Split template's existing question.

## Storyboard (auto)
0.9s open 225, 3.0s switch to 75 (sideways), 4.8s close, loop at 6.4s.

## Options
| | Spatial model | Timing | What stays fixed |
|---|---|---|---|
| a layer | z: one elevation step over the answer | 400ms in, 240ms out | Everything in the answer, to the pixel |
| b flow | y: grows below, panel scrolls to the bar | Grow plus smooth scroll | The bar's place on screen only after the scroll |
| c header | swap: the sentence drops, the bar is the header | instant | Nothing; the bar jumps up |

Chosen: a with the rise lift. DECISIONS D4 to D7.

## Micro-interactions
- Lift: rise, reveal or shadow (D5). Chosen rise.
- Count persistence while the layer is up: the sheet is pinned under the bar and scrolls inside itself, so the bar and both counts stay in view.
- Sideways 225 to 75: people swap at 0ms, the sheet stays (D6).
- Rows: hover warm fill, press stone fill, focus ring. No shift.

## Observation for Mudit
In the live AnswerCard the open side shows no selected state on the bar in this stage. The homepage card's v2 frame would mark it, but that is a decision about a shipped component and is logged as an open question.

## Clips and frames
- Options: `/workspace/dlg-depth-r1-shots/options/ex1-opt-{a,b,c}.mp4` and sheets, `ex1-opt-a-lift-{reveal,shadow}.mp4`, `ex1-lift-compare-strip.png` (top rise, bottom reveal, 0.7s to 1.6s), `ex1-all-open225.png`
- Chosen: `/workspace/dlg-depth-r1-shots/out/ex1-chosen-a-layer-rise.mp4`, `ex1-chosen-a-reduced-motion.mp4`
