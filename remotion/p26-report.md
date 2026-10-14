# JOOLA film pass 26

Same numbers as pass 25. Cart **$19,306.50**, line **$16,197.60** at 120 × $134.98, PO **ENG-9812**, SO **SO-48213**, Net 30, credit **$25,693.50 left of $50,000**. Shipping and tax both still read **Calculated when it ships**.

The confirmation screen is the pass 25 screen.

## Intro

The logo holds, full black, on the plain ground. Frame 18 is a cut to the dashboard at full strength. There is no opacity ramp and no shared frame where both are half there. The outro was already that kind of cut, at frame 457.

## Add button

The row was already 72px tall. What moved the menu was the Quick order title: `line-height: 1.15` on a 24px font is 27.6px, so every block under the title sat 0.4px off the grid. The menu was placed with `Math.round` of a live rectangle. That value sat close enough to a half pixel that two renders rounded it different ways. On the pass 25 film the Add to order button jumped 8 film-pixels up on frames 168 and 169, which is one page-pixel at that shot’s scale, and the Match kit type did not move with it. A fresh still of frame 167 did not match the chunk that had rendered it.

The chip itself used `top: 50%` and `translateY(-50%)`, and its width followed the word “Add” (39.438px).

What changed, in the prototype and the film:

- The Quick order title is a 28px line. The shots under that title (search, qty, Add to order, the new rows, Add to cart) have their camera centre 0.4px lower, so the frame stays where it was.
- The Reorder label is a 15px box, so a fallback font cannot change the rows’ offset.
- Add is 40×24 at `top: 24px`, which is `(72 − 24) / 2`. No translate.
- The menu’s top is `offsetTop + 72 + 4`. Both of those are integers. It is not rounded from a fractional `getBoundingClientRect`.

Measured in the prototype at 1312×756. The Add chip and the Add to order button were the same box on rest, hover, press, and with the menu open:

| | x | y | w | h |
|---|---:|---:|---:|---:|
| Add chip | 1217 | 592 | 40 | 24 |
| Add to order | 1076 | 653 | 164 | 32 |
| Menu | 1067 | 644 | 182 | 88 |

Delta **0**. The row’s bottom is 640. The menu’s top is 644. The gap is 4px.

On the 676px draft, the chip’s ink box was `(539, 128)–(604, 152)` on every frame from 126 through 135 (hover, camera already still). The Add to order button’s ink box was `(98, 292)–(577, 387)` on every frame from 139 through 174, which includes the press. Delta **0**.

## Place order

Two fills, same button, same timing (333ms, ease-out `cubic-bezier(0.2, 0, 0, 1)`, no bounce):

- **Radial, from the click.** The cursor rests right of centre (263px across a 430px button). Emerald grows from that point. The edge is almost straight because the button is only 40px tall, and the leftover blue is on the left, which is the side the click has not reached yet.
- **Left to right.** A straight edge from the left. It reads as a progress bar, and it starts on the opposite side from the cursor.

Radial is the one in the film. The label is the spinner and “Placing order” (no ellipsis) until the fill starts, then a check, in one frame. The button stays 430×40. The prototype measured `[829, 394.59, 430, 40]` on idle, on Placing order, and at the start of the fill. The summary stays at full strength. The confirmation after that is unchanged.

## Audit

Four passes, then a cross-read. Motion, pixel alignment, copy at 400px with a 1px blur, and the button states.

| Finding | Who raised it | Decision |
|---|---|---|
| Intro cut has no grey frame | Motion | Shipped |
| Outro cut is already clean | Motion | Unchanged |
| Radial fill is the cleaner of the two, and the check is centered | Motion, states, pixels | Shipped. Left-to-right rejected |
| Add chip and the menu do not move across hover, press, and open | Pixels | Shipped. Draft ink boxes and the prototype boxes above |
| Add sits about 1.5px below the Match kit title’s centre | Pixels, as optional | Left. The chip is centered in the 72px row. Nudging it would put it back on a fraction |
| Popover open spends a frame at partial opacity | Motion, as a fix. Pixels said leave it | Left. The open is opacity-only, which is the pass 21 entrance. The box does not move during it |
| Summary type fades before the confirmation | Motion, as a fix | Left. That 4-frame fade is the pass 25 handoff, and the confirmation was not to change |
| “120” and the cart jump are hard to read at 400px | Copy, on the draft | Withdrawn for 120. A lossless frame 96, scaled to 400px and blurred 1px, still reads 120, $134.98, and $16,197.60. The draft was a heavy jpeg. The pill’s $19,306.50 and the badge 4 read the same way. The $0 frame is the beat before the number swaps |
| The fill can look like a wipe because the cursor has already left | States, as optional | Left. The cursor leaving during Placing order is the hold from pass 25 |

## check-film

`python3 scripts/check-film.py` on the 1920×1440 film: `no_cuts` true, `seam_ok` (0.001), `numbers_ok`, `no_forbidden`. `no_freeze` is false because the holds are intentional: logo 0–17 (0.6s), qty 90–106 (0.57s), Add to order 150–167 (0.6s), rows 197–215 (0.63s), Add 4 lines 224–247 (0.8s), pill 260–272 (0.43s), summary 307–333 (0.9s), Placing order 342–362 (0.7s), emerald check 368–383 (0.53s), confirmation 422–456 (1.17s), logo outro 457–480 (0.8s). Hard cuts are the allowed ones: 18, 69, 176, 182, 216, 260, 302, 387, 457. Max step 26.74 at frame 302, the summary cut. OCR missed nothing. One all-caps token, `BBBBDDDDBPF`, is noise.

The first final had four extra cuts, at 84, 86, 378, and 380. Frames 84–85 and 378–379 were not a new camera. They were the first frames of two 42-frame chunks, photographed before the camera transform had painted, so the picture was a zoomed fragment and then snapped back. A still of each of those frames matches the hold around it (84 equals 86, 378 equals 380). Those two chunks were rendered again with one browser page, and the opening frames match the stills within the encoder (mean difference 0.12 and 0.46). The render script’s final pass now uses one page for the same reason.

On that film the Add to order button’s edge box is x 259–1659, y 801–1074 on frames 166, 168, 170, 172, and 174. Hover, the open menu, and the press share that box. Delta **0**. A tight threshold on the blue fill can drop one pixel of the darker press fringe. The edge does not.
