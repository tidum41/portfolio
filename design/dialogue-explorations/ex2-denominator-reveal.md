# Exploration 2: the denominator reveal

Status (round 3): the /dialogue figure is hover option a (counts at rest, the percent on hover, TASTE Round 18 item 5), pending Mudit's OK. The round 1 autoplay relabel is off the page. Hover option b and the round 1 options stay in dev. DECISIONS D15.

## What it repairs
The Data viz h2 says charts count people out of their own group, and before this round every figure in the section used one denominator (300). The proof lived in code (DialogueChartLibrary ENTRIES, 64% / 70% against 9 of 14 / 88 of 125) and was not rendered. Mudit approved featuring the unequal-segments blind spot (handoffs, Nov 9). Problems P6 and P4 in ANALYSIS section 2.

## Data
Hearthside mock only: New shoppers 9 of 14, Repeat shoppers 88 of 125 (MOCK-DATA.md section 4, DialogueChartLibrary SEGMENTS). 64% and 70% are those counts rounded. Nothing new. Copied into `components/dialogue/depth/hearthside.ts`.

## Options
| | What differs | Motion | End state |
|---|---|---|---|
| a relabel | Geometry fixed, only the value cell cuts | none, text cut | The kept By group chart |
| b rescale | Track resizes to group size on one people scale | 400ms staged after a 160ms gap | One axis, 9 of 14 looks small |
| c units | Bar replaced by one dot per person | mark swap, no morph | Icon array |

Chosen for the page: a. See DECISIONS D1 to D3 for evidence, rejections and the conflict with CHART-RATIONALE By group (d).

## Micro-interactions
- Value cell: percent and count share one grid cell, so the cut reflows nothing.
- Hover or focus a row in the people state: its percent shows in the same cell (TASTE Round 18 item 5).
- Autoplay once at 60% in view after 900ms. Reduced motion starts on the people state.

## Component
`components/dialogue/depth/DenominatorReveal/` (README, typed props, tokens only). Gate: `npm run check:dialogue-depth`.

## Clips and frames
- Options: `/workspace/dlg-depth-r1-shots/options/ex2-opt-{a,b,c}.mp4` and `-sheet.png`, `ex2-all-final.png`
- Chosen: `/workspace/dlg-depth-r1-shots/out/ex2-chosen-a-relabel.mp4`, `ex2-chosen-a-reduced-motion.mp4`, `page-dataviz-denominator.png`, `page-dataviz-denominator-t0.png`

## Open
- b or c on the page needs Mudit (OPEN-QUESTIONS, depth-r1 items).

## Round 3: the hover take
- Stage: `/dev/dialogue-depth?ex=hover&opt=a|b`. Recorder: `scripts/record-dialogue-depth-hover.mjs <base> <out> <a|b> [reduce]`.
- a (chosen): 9 of 14 and 88 of 125 at rest. Hovering a row swaps in 64% or 70% in the same cell (the shipped 150ms swap), with no outline.
- b (flagged): 64% and 70% at rest. Hovering reveals the count. Reverses Round 18 item 5.
- Outputs: `/workspace/dlg-depth-r1-shots/out/ex2-hover-{a,b}.mp4`, `-poster.png`, `-sheet.png`, `ex2-hover-a-reduced-motion.mp4`, `page-ex2-hover-1440.png`.
