# Exploration 3: watch the chart get chosen

Status: dev only, awaiting Mudit's OK. `/dev/dialogue-depth?ex=3` (`&opt=a|b|c`, `&chooser=rule|model`, `&auto=1` cycles the three questions every 2.2s; the question buttons under each cell step by hand).

## What it repairs
The Data viz templates sit side by side, so they read as a catalog. Here one card answers three questions in turn and reshapes, which shows the system adapting. It also gives "the answer arrives in the right shape" a visual, without timing numbers (ANALYSIS section 3 and item 3).

## Data
The three Match the chart rows, unchanged (DialogueChartLibrary ChartTemplatesPairs): "How many read it which way?" Split 225 and 75 of 300. "What did people ask for?" Ranked 41, 28, 17, 11, 8 of 300. "Did anyone miss a delivery?" Flag, 2 of 300, with the shipped THIN_FLAG copy. In `CHOSEN_STEPS` (components/dialogue/depth/hearthside.ts).

## Who picks
Open question (OQ 13, 25). `chooser="rule"` runs `answerLayout` (lib/dialogue/product/answerLayout.ts) plus the under-3-people flag. `chooser="model"` reads each step's `modelPick`. For this data both produce the same templates, so the figure works under either answer. The framing is a visible [PLACEHOLDER] on the dev page.

## Options
| | Model | Motion | Marks |
|---|---|---|---|
| a cut | swap | none, height jumps | the shipped chart components |
| b constancy | one set of marks travels | 400ms | custom marks on chart tokens (needed to travel) |
| c staged | fade out, resize, fade in | 110 + 240ms, 20ms stagger | the shipped chart components |

Chosen: c. DECISIONS D11.

## Clips and frames
- Options: `/workspace/dlg-depth-r1-shots/options/ex3-opt-{a,b,c}.mp4` and sheets, `ex3-all-step0.png`, `ex3-morph-strip-b-top-c-bottom.png`
- Chosen: `/workspace/dlg-depth-r1-shots/out/ex3-chosen-c-staged.mp4`, `ex3-chosen-c-reduced-motion.mp4`
