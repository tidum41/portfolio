# JOOLA film pass 20 — report

365 frames, 30fps, **12.17s**. Started from pass 19 (370 frames, 12.33s).

## Timing

| Beat | Frames | Duration | Notes |
|---|---|---|---|
| Logo → sidebar | 4–18 | 0.47s | Lands in the sidebar slot on the opening shot |
| Dashboard → table | 20–32 | 0.40s | Ease onto search |
| Search + type | 36–51 | 0.50s | Dropdown from 44 |
| Select result | 68 | | Row in at 71 |
| Qty → 120 | 86–92 | 0.20s | Tier and line total swap with the digits |
| Move → Reorder | 100–114 | 0.47s | |
| Template popover | 118–150 | 1.07s | Add to order at 146 |
| Move → Add | 166–180 | 0.47s | Same Add framing as pass 19 |
| Add 4 to cart | 182 | | |
| Cut → cart pill | 188 | | Hard cut |
| Pill width + total | 190–214 | 0.80s | Right edge fixed; badge appears at the end |
| Cut → summary | 228 | | Hard cut. Total + Place order are the frame |
| Place order | 266–269 | 0.13s | Hover has been on since 233 |
| Cut → Order placed | 270 | | Hard cut, then 8-frame settle (270–278) |
| Order placed hold | 278–323 | 1.50s | |
| JOOLA logo | 323–365 | 1.40s | Simple lockup, then the loop |

## Why the Order placed transition is a hard cut

A shared-element morph scales the summary card onto the confirmation panel. Those two boxes do not share an aspect ratio, so the scale is different on x and y. At 676px that stretch smears the type for the whole morph.

A hard cut puts the confirmation type on screen at full size on frame 270. The panel then settles with one uniform scale, 0.97 → 1, and a 6px rise, over 8 frames with an ease-out. Glyphs are never scaled on different axes. The other cart content is simply gone on the cut, which is the same device as the pill cut and the summary cut.

## Story after Add

Each shot has one subject:

1. **Add 4 to cart** keeps the pass 19 framing (header pill and footer button in one frame).
2. **Cart pill** is a hard cut. The pill’s right edge stays put and the width eases from 85px to 151px while the total grows into `$19,306.50`. The count badge comes in only once the pill is wide enough to hold it, so it never sits on the digits. The account chip stays fully in frame while the pill pushes it left.
3. **Summary** is a hard cut. The card is centred. The line list is outside the frame. The total and Place order are the hero.
4. **Place order**, then a hard cut to **Order placed**, centred, header chrome out of frame.

The cursor is one continuous path. It is mid-travel on the pill cut and the summary cut, so those cuts do not teleport it. On the order-placed cut it is frozen in screen space and fades out, so it does not reproject onto the new camera.

## Hover flicker

Pass 19 turned hover on with `elementFromPoint`, and it bailed out whenever the cursor moved more than 6px in a frame. The click frame therefore had no class, then active, then hover, then nothing. On top of that, `.cart-pill { transition: … !important }` beat the film’s `* { transition: none }`, so every class change restarted a fade.

Pass 20 latches hover from geometry. The class turns on when the hotspot enters the control and stays on until the press ends. It does not use hit-testing. Place order, measured on the rendered film: rest through frame 232, hover from 233 through 265 (one colour, `#2433c4`), press 266–269 (`#1a2599`). No frame in between flips back. The cart pill uses the same latch and the same colour-only rule (band on hover, wash on press, no scale).

The film rule `.film-layer .cart-pill` / `.btn-primary` sets `transition: none !important`, which wins over the prototype’s width transition. Width is owned by a `--film-pill-w` custom property, because the prototype’s `width: max-content !important` was ignoring the per-frame inline width and snapping the pill.

## Template button, 0px

Playwright at 1312×756, switcher hidden, Match kit `[data-template="tpl-match"]`:

| State | Δx | Δy | Δw | Δh | Δ name y | scrollY |
|---|---|---|---|---|---|---|
| rest | 1055, 567.906, 206 × 72.078 | | | | name y 594.906 | 0 |
| hover | 0 | 0 | 0 | 0 | 0 | 0 |
| mousedown | 0 | 0 | 0 | 0 | 0 | 0 |
| dropdown open | 0 | 0 | 0 | 0 | 0 | 0 |

(The 567.9 y includes the 48px dev switcher; the film rect is y 519.9. The deltas are the proof.)

What still could move it: an outside focus ring (`outline-offset: 1px`) is included in scroll-into-view, and a mousedown focuses the row. The ring is now inset (`outline-offset: -3px`) and mousedown calls `preventDefault`. The popover is `position: fixed`, so it is not in flow. The row’s `margin: 0 -6px` is intentionally not zeroed — clearing it moves the row from x 1055 to x 1061.

In this Chrome the box was already 0.000 before the inset ring. The ring and the mousedown guard are there so a browser that scroll-into-views the outline cannot shift it.

## Opening shot

`SHOT_OPEN` is scale 1.64, framed from the left edge. The JOOLA mark, Wholesale, and the nav (Quick order through Messages) are in frame, and the header rule sits under them. Search stays readable (about 11px at 676). The account chip and cart pill live at the right edge of the header. Pulling them into this shot means a scale near 1.1, which puts 14px type at about 7px. They stay for the pill shot.

## Checks

`check-film.py` on `film.mp4`: `numbers_ok`, no unexpected cuts (hard cuts at 188, 228, 270 only), seam diff 0.011, no forbidden strings, no stray all-caps. Frozen runs are the reading holds: qty, popover, pill, summary (1.1s), Order placed (1.53s), logo.

Numbers: cart `$19,306.50`, SO-48213, PO ENG-9812, Net 30, line `$16,197.60` at 120 × `$134.98`. Search dropdown shows the ledger `buyerPrice` `$134.98`; the inserted row shows `$179.97` until the qty tier changes.

## Artifacts

- `/opt/cursor/artifacts/film.mp4`
- `/opt/cursor/artifacts/card-676.mp4` (676×508, 12.17s)
- `/opt/cursor/artifacts/card-sheet.png`
- `/opt/cursor/artifacts/crops/beat-*.png` (15 frames at 676px)
- `/opt/cursor/artifacts/p20-report.md`
