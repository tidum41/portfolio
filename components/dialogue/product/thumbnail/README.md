# Dialogue homepage card demo

`DialogueThumbnailDemo` is the looping product demo inside the Dialogue
project card on the homepage (`components/DialogueThumbnailCard.tsx`). It is
the real chart card (`ChartVizCard` and `ChartStackedBar`) with the Hearthside
225 and 75 split, a demo cursor, and the people for the open side. Decisions
and revert recipes live in `CHANGELOG.md`, newest first. `design/TASTE.md`
wins any conflict.

## States rules (the shipped `states` cut)

- Bars never move: no transform, lift or layout change in any state.
- Segments keep the bar's radius in every state. A state rule never sets a
  segment's `border-radius`.
- Selection is the detached frame, `--dlg-thumb-selected-frame` (2px panel
  gap, then a 2px ink ring), on the open segment and on the pressed segment.
  Exactly one segment carries it at full strength: when a press lands on the
  other segment, the open one drops its frame in the same instant.
- Hover previews the frame at 45% ink, `--dlg-thumb-hover-frame`. Press
  lands at once (no transition).
- Fills never change with selection. Only hover and press deepen the segment
  under the pointer (the `--dlg-thumb-hover-*` and `--dlg-thumb-press-*`
  mixes toward ink).
- Legend: one row per segment. The closed side's text mutes; every swatch
  always shows its own segment's colour.
- Hovering counts never swaps them for percents on the card.
- Loop: opens on the empty state, the first open plays the entrance, later
  switches land whole, and the Friday hold ends with the clearing.

## Ramp by segment count

`thumbnailBarRamp.ts` picks each segment's tone. `THUMBNAIL_BAR_TONE_TOKEN`
(a typed `Record<ThumbnailBarTone, ...>`) is the only tone to token map.

| Segments | Fills |
| --- | --- |
| 2 | cherry `--dp-chart-focal`, stone `--dp-border-strong` |
| 3 or more | `--dp-chart-focal`, `--dp-chart-mid`, `--dp-chart-soft`, then `--dp-border-strong` |

Callers pass data only (`ThumbnailSegmentInput`); a `tone`, `color`, `fill`
or `background` on a segment is a type error.

## Selection motion (`selMotion`)

`selMotion: "cut" | "travel"`, default `"cut"` everywhere. The homepage
always uses cut. `"travel"` is a dev exploration for Mudit's open question:
one frame element slides from the old segment to the new one over 180ms on
`cubic-bezier(0.2, 0, 0, 1)` when the press lands. Both edges move on the
same curve, so there is no overshoot and never a second frame. In scrub mode
its position is a pure function of `switchMs` from `thumbnailStateAt`.

## Dev routes

- `/dev/dialogue-thumbnail?variant=product|story|tight|lift-explore`: the demo
  frame and the homepage card frame, locked to one loop clock (`loopEpoch`).
  Add `&sel=travel` (or the "Selection travels" button) for travel on the
  demo frame; the card frame stays on cut. `&poster=1` shows the poster.
  `&t=<ms>` renders the demo frame at that loop time (recorder hook).
- `/dev/dialogue-thumbnail/playground`: scrubbable timeline with DialKit
  timing, fill and `selMotion` controls.
- `/dev/dialogue-thumbnail/states`: the `sel-1` to `sel-7` prototypes.

## Recording

```sh
node scripts/record-thumbnail-loop.mjs --variant product --sel cut --name main-card-cut --out <dir>
```

The script steps scrub time at 40ms (25fps) through exactly one loop,
screenshots `[data-demo-frame]` at 2x on the light page, and writes an h264
yuv420p mp4 with faststart. Frame 0 is the loop's t=0 state, and the last
frame wraps into it. `THUMB_BASE` / `--base` points at another server;
`--channel chromium` uses the bundled headless shell.
`scripts/shoot-thumbnail-demo.mjs` (stills, metrics and the Paper compare)
takes `--base` / `--out` and skips its Mac-only steps when their files are
absent.

## Gates

| Gate | Enforces |
| --- | --- |
| `npm run check:thumbnail-card` | No segment transform, outline or state radius; segment box-shadow is `none` or a role token; segment and swatch fills are ramp tokens or the documented mixes; `[data-tone]` fills match `THUMBNAIL_BAR_TONE_TOKEN`; no raw colour literals in the card CSS and TSX outside token definitions; the homepage never passes `selMotion` or `lift-explore`. Runs its `--self-test` first. |
| `npm run check:dialogue-system` | The Dialogue system rules, and it runs `check:thumbnail-card`. |
| `npm run check:dialogue-tokens` | Hard-coded values in Dialogue CSS and TSX. |
| `npx tsc --noEmit` | The typed ramp map and segment input. |

## Exploration only

`?variant=lift-explore` (lift-and-marker), the `data-sel-variant` `sel-*`
prototypes and `selMotion="travel"` are dev explorations. They keep working,
the card gate exempts the first two, and none of them ship on the homepage.
