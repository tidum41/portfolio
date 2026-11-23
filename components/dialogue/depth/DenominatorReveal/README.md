# DenominatorReveal

Status: dev only, awaiting Mudit's OK. One use is on /dialogue (Data viz section) at the supervising agent's request; see design/dialogue-explorations/STORY-CHANGES.md for the revert.

Shows two groups of different size first as percents, then as people out of their own group. Exploration 2 in design/dialogue-explorations/ex2-denominator-reveal.md.

## When to use
- A comparison of exactly two groups whose sizes differ enough that equal-looking percents hide it (the Hearthside 9 of 14 vs 88 of 125).
- A case-study figure that has to show the blind spot, not product UI.

## When not to use
- Groups of similar size: the reveal shows nothing and costs a beat.
- More than two groups, or one group against the study: use ChartBarList or ChartStackedBar.
- Any number that is not Hearthside mock data or a real STORY.md number.

## Props
| Prop | Type | Notes |
|---|---|---|
| `option` | `"relabel" \| "rescale" \| "units"` | a, b, c. The /dialogue figure uses `"relabel"` (it ends on the kept By group chart). `"rescale"` contradicts CHART-RATIONALE By group (d) and waits for Mudit |
| `title` | `string` | The chart title (answer sentence) |
| `groups` | `readonly [DenominatorGroup, DenominatorGroup]` | `{ label, count, of, tone: "focal" \| "mid" }`. Tone maps to chart tokens, never a colour string |
| `phase` | `"rate" \| "people"` (optional) | Controlled. Omit it and the figure runs itself once 60% in view |
| `holdMs` | `number` (optional, 900) | How long the percents hold before the reveal |

No `className` or `style` props (check:dialogue-depth fails on them).

## States
- `rate`: both rows on one percent scale, percent in the value cell.
- `people`: the value cell cuts to "9 of 14". `rescale` then resizes each track to its group size on one people scale. `units` swaps the bar for one dot per person.
- Hover or focus a row in `people`: the cell shows its percent in the same grid cell (TASTE Round 18 item 5). Nothing reflows.

## Motion
- Label cut: instant. Track resize (`rescale`): `--dlg-motion-deeper-ms` (400ms) on `--dlg-motion-ease`, after `--dlg-motion-stage-gap-ms` (160ms), so the value change and the scale change are staged apart (Heer and Robertson 2007).
- `units`: marks are replaced, never morphed.

## Reduced motion
Starts in `people` and never transitions (JS check plus a CSS `transition: none` block).
