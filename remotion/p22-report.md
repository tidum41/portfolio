# JOOLA film pass 22

Same branch and PR as pass 21. 365 frames, 12.17s. Numbers unchanged: cart **$19,306.50**, line **$16,197.60** at 120 × $134.98, PO **ENG-9812**, SO **SO-48213**, Net 30, credit **$25,693.50 available of $50,000**.

`check-film.py`: `numbers_ok`, `no_cuts`, `seam_ok` (0.009), `no_forbidden`. `no_freeze` is false because the holds are intentional (qty 86–100, menu 132–145, pill 217–233, summary, order placed 273–323 ≈ 1.7s). Hard cuts stay at 188, 234, and 270.

## 1. Place order and Order placed are one card

Prototype CSS first (r22), then the cameras.

Both cards are **480 × 340**, padding **24**, radius **12**, border **1**. The cart column is 480px so the summary is that width. The shared height is the confirmation’s box; the summary’s extra space sits under Place order. Measured with the switcher hidden:

| | x | y | w | h | centre |
|---|---:|---:|---:|---:|---|
| Place order | 804 | 123.59375 | 480 | 340 | (1044, 293.59375) |
| Order placed | 526 | 72 | 480 | 340 | (766, 242) |

Both shots use scale **2.7**, so a 480×340 card lands on the same screen box. The confirmation scale/translate settle is gone; frame 270 (the cut) and frame 280 are the same box.

Outer border pixels on the 1920×1440 film, then scaled by 676/1920:

| edge | frame 250 (summary) | frame 270 (cut) | delta at 676px |
|---|---:|---:|---:|
| left | 96 | 96 | **0.00** |
| top | 110 | 108 | **−0.70** |
| right | 1823 | 1823 | **0.00** |
| bottom | 1332 | 1331 | **−0.35** |

All four edges are inside 0–2px. The 2px top difference at 1920 is the fractional camera centre landing on a device pixel.

## 2. Quantity caret, measured

On the untransformed field, a DOM range of tabular “120” is 27.734px (digits 9.25, 9.25, 9.266). A 4× screenshot of that “0” puts the ink **0.61px** before the advance. Cap height from `measureText` on the loaded FK Grotesk Neue face is the caret height; a zero-width baseline probe centres it on that cap.

Inside the scaled film, `getBoundingClientRect` and SVG `getComputedTextLength` both return the proportional width (23.36) even with `font-variant-numeric: tabular-nums` computed. The caret therefore uses the measured tabular advance, 9.25px per digit, centred in the 74px field.

On frame 90 of the film the last dark pixel of “0” is x=1444 and the caret is x=1450–1451. That gap is 5 device pixels. The shot scale is 1.8 and the stage is 1920/1440, so 5 / (1.8 × 4/3) = **2.1 CSS px**, at the top of the 1–2px range. The caret runs y=603–630; the zero’s ink is inside that span. The I-beam to the right is the cursor, parked on the click point.

## 3. Cart pill shot is centred

`SHOT_PILL` cy was −12, which put the pill low. cy is now **23**, the pill’s centre (top 5, height 36). Scale stays 4.05 and cx stays 1112, so the account chip and the filled pill stay in frame. At 676px the chip-and-pill ink band is centred at y=253.0 against a frame mid of 253.5 (**−0.5px**).
