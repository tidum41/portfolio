# ChartChosen

Status: dev only, awaiting Mudit's OK. Exploration 3 in design/dialogue-explorations/ex3-watch-the-chart-get-chosen.md. Not on /dialogue.

One answer card that reshapes as the question changes: the Split bar (225 and 75 of 300), the Ranked rows (top five asks) and the thin-data Flag (2 of 300). Data: `CHOSEN_STEPS` in `components/dialogue/depth/hearthside.ts`, copied from the Match the chart rows.

## When to use
- A case-study figure that shows one card adapting across questions, so the reader sees a system and not a catalog.

## When not to use
- In product UI: a real answer arrives as a new message, never a morph of the previous one.
- To claim who picks the template. The framing stays [PLACEHOLDER] until OPEN-QUESTIONS 13 and 25 close.

## Props
| Prop | Type | Notes |
|---|---|---|
| `chooser` | `"model" \| "rule"` | `rule` runs `answerLayout` plus the under-3-people flag. `model` uses each step's `modelPick`. Both produce the same three templates for this data |
| `morph` | `"cut" \| "constancy" \| "staged"` | a, b, c. Recommended `"staged"` |
| `steps` | `readonly ChosenStep[]` | `{ question, title, total, modelPick, groups }` |
| `step` | `number` | Controlled index |

No `className` or `style` props.

## States
Split, ranked or flag, chosen by `pickKind(step, chooser)`. The question bubble changes at once in every option.

## Motion
- cut: none. The card height jumps.
- constancy: one set of marks travels (left, width, top, height) over `--dlg-motion-deeper-ms`. Labels fade in after.
- staged: the old body fades over `--dlg-motion-fade-ms` (110ms). Then the card resizes over `--dlg-motion-resize-ms` (240ms) while new rows fade in `--dlg-motion-stagger-ms` (20ms) apart. About 350ms in all.

## Reduced motion
Every option behaves as cut: no transitions, no animations, no height tween.
