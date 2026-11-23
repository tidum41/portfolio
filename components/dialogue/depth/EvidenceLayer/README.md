# EvidenceLayer

Status: dev only, awaiting Mudit's OK. Explorations 1 and 4 in design/dialogue-explorations/ex1-evidence-layer.md and ex4-zoom-claim-to-moment.md. Not on /dialogue.

Opening a side of the count shows its people (the quote rows), while the count stays in view. Wraps the shipped AnswerCard; never edits it.

## When to use
- The question, the answer card and one side's people in a 448px chat panel, where the reader has to keep the count while reading the people.

## When not to use
- To stack a third elevation. The clip (exploration 4) opens inside the layer, under its person, and the layer scrolls inside itself so the bar never moves.
- For sibling switches (225 to 75): those swap content in place, with no motion. The component already does this.

## Props
| Prop | Type | Notes |
|---|---|---|
| `option` | `"layer" \| "flow" \| "header"` | a, b, c. Recommended: `"layer"` |
| `lift` | `"rise" \| "reveal" \| "shadow"` (optional, `"rise"`) | How the layer arrives (layer only) |
| `question` | `string` | The user bubble above the answer |
| `finding` | `string` | The answer sentence |
| `total` | `number` | The study size (300) |
| `sides` | `Record<"friday" \| "unsure", EvidenceSideData>` | Label, count and people per side, from Hearthside mock data |
| `open` / `onOpen` | `"friday" \| "unsure" \| null` | Controlled |
| `clip` | `{ person, onPerson, motion: "zoom" \| "cut" \| "grow" }` (optional) | Exploration 4. Rows become buttons and the tapped person's clip opens under the row, inside the layer. Recommended `"grow"` |

## States
- Closed: question and answer card, the panel at the answer elevation (`--dlg-elev-answer-shadow`).
- Open: `layer` lifts the people one step (`--dlg-elev-evidence-shadow`), pinned under the bar. `flow` grows them below (shipped Grow) and scrolls so the bar holds the top. `header` drops the finding sentence and the bar becomes the header.
- Sideways (225 to 75 while open): the people swap in place at `--dlg-motion-sideways-ms` (0ms).
- Rows: hover warm fill, press stone fill, focus ring. Fill only, so nothing shifts.

## Motion
- Open: `--dlg-motion-deeper-ms` (400ms). Close: `--dlg-motion-shallower-ms` (240ms). Curve `--dlg-motion-ease`.
- `rise`: 8px up plus the shadow step. `reveal`: unclips downward from the bar. `shadow`: lands at once and only the shadow deepens.

- Clip (exploration 4): `grow` uses the shipped Grow, `zoom` scales 0.94 to 1 over `--dlg-motion-deeper-ms`, `cut` lands at once. One clip replacing another is sideways and never animates.

## Reduced motion
Every transition and animation is `none`, and every scroll jumps (`behavior: "auto"`).
