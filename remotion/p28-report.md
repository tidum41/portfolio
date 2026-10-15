# JOOLA film pass 28

The stretch after Add to order is one eased zoom, a hold on the filled order, then one eased move onto Add to cart. The cart total is the prototype’s per-digit roll, about half a second, and the close-up is a recording of that roll. Logo and Place order are the pass 27 beats.

## Numbers

Unchanged from pass 27. Order total **$4,908.66**.

| Line | Qty | Unit | Amount |
|---|---:|---:|---:|
| Perseus Pro V | 12 | $149.98 | $1,799.76 |
| Hyperion Pro IV 14mm | 24 | $103.48 | $2,483.52 |
| HC-40 Balls (3-Pack) | 48 | $5.47 | $262.56 |
| Tour Elite Bag | 6 | $60.47 | $362.82 |

Credit still reads **$40,091.34 left of $50,000**. PO **ENG-9812**, SO **SO-48213**.

## After Add to order

The three kit lines are in the table before the camera moves. The tight Match kit shot does not show them, so the zoom is the reveal. Nothing else animates during the zoom: no row stagger, no footer roll (that roll finishes as the zoom starts).

The zoom is 18 frames (0.6s), `cubic-bezier(0.45, 0, 0.25, 1)`, from the Match kit to the order table. The cursor travels with it and lands on the Hyperion row. Hold 200–218 (0.63s). Then an 18-frame ease onto **Add 4 lines to cart**. The cursor lands on the label as the camera lands. The button is already the wide label, so the box does not grow under the cursor. Press is frame 248.

A table label is hidden only while the moving frame cuts through its glyphs (more than 8px). The Match kit copy stays up as the camera leaves it. Held frames show the full rows: names, prices, line totals.

The old hard cut at 216 is gone.

## Cart total

The pill is the prototype control. `digit-roll.js` paints it; the film calls the same painter on each frame.

1. Hold **$0.00** (frames 260–268).
2. The pill eases to the filled width (268–276, 8 frames). **$0.00** stays pinned to the right, so the cents column does not jump.
3. Per-digit roll, 14 frames (467ms), ease-out. Right-aligned, tabular figures. Each column is only as tall as the ink it swaps, and every column shares one baseline. Digits that do not change (the decimal) stay put. There is no count-up.
4. Badge **4** scales in after the digits have settled (290–296).

The right edge of the amount stays put from **$0.00** through the roll to **$4,908.66** (within 2px on the 1920 frame). Settled frames OCR as **$4,908.66**, comma included. Blur on the column is capped so the s=8.8 shot stays under 2px on the 1920 frame; at that shot the cap is below the threshold and the glyphs are sharp.

## Place order and logo

Not changed. Place order is still the blue “Placing order” face, then emerald **#12824a** over 5 frames, then the check stroke over 8 frames, then the cut to Order placed. The logo and the UI still never share a frame. Intro is frames 0–11. Outro is frames 457–488. Duration stays 489.

## Button states

Hover and press change colour only. On Add 4 lines, the box is the same rectangle: hover fill about `#2434c4`, press fill about `#1a269a`. No scale, no shift.

## check-film

`python3 scripts/check-film.py` on the 1920×1440 film (489 frames, 16.3s): `no_cuts` true, `seam_ok` (0.01), `numbers_ok`, `no_forbidden`. `no_freeze` is false because the holds are intentional: Add to order 150–167 (0.6s), order table 200–218 (0.63s), summary 307–333 (0.9s), Placing order 342–355 (0.47s), emerald check 360–383 (0.8s), confirmation 421–457 (1.23s), logo 474–488 (0.5s).

Hard cuts are the allowed ones: 69 (result click), 136 (popover opens), 174 (popover closes), 260 (pill), 302 (summary), 387 (Order placed). The zoom and the move onto Add to cart are not cuts.

The cart pill at a 400px-wide frame with a 1px blur still OCRs as **$4,908.66**.
