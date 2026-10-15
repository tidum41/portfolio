# JOOLA film pass 27

The qty beat is one click on the **12** chip. The order is now **$4,908.66**. The confirmation card is the same card as pass 26, with that total.

## Numbers

Perseus Pro V at 12 is **$149.98**. The line is 12 × $149.98 = **$1,799.76**.

Before that click the live row is still qty 1 at **$179.97**.

The other three lines did not change:

| Line | Qty | Unit | Amount |
|---|---:|---:|---:|
| Perseus Pro V | 12 | $149.98 | $1,799.76 |
| Hyperion Pro IV 14mm | 24 | $103.48 | $2,483.52 |
| HC-40 Balls (3-Pack) | 48 | $5.47 | $262.56 |
| Tour Elite Bag | 6 | $60.47 | $362.82 |

Order total **$4,908.66**. Match kit stays “3 products, $3,108.90” (those three lines, not Perseus). The saved rail “Perseus restock” reads “12 units, $1,799.76”.

Credit limit **$50,000**, already used **$5,000**. After this order, used is **$9,908.66** and the meter reads **$40,091.34 left of $50,000**. The bar is prior 10% plus this order 9.8%, ending at 19.8%.

Search still shows the best tier, **$134.98**. It does not follow the order qty. Line count stays 4. PO **ENG-9812**, SO **SO-48213**, Net 30. Shipping and tax both still read **Calculated when it ships**.

## After Add to order

One zoom, 18 frames (0.6s), the same travel curve as the other moves (`cubic-bezier(0.45, 0, 0.25, 1)`), no dip. It starts on the Match kit card and lands on the order table while the three kit lines arrive. There is no caption and no second move. The old cuts at 176 and 182 are gone.

## Popover

Add to order / Replace order is solid on every frame it is open. Opacity stays 1. It scales 0.98 → 1 from the top of the menu over 3 frames (100ms), ease-out. The open and the close are cuts (frames 136 and 174). Nothing is caught half-transparent.

## Cart total

The pill eases wider, then **$4,908.66** rolls in over 6 frames (200ms). Each digit that changes moves up one line with a short blur. Digits that do not change stay put. There is no count-up. The badge is still 4. The same roll runs on the unit price, the line total, and the footer total when the 12 chip is clicked.

## Place order

The radial fill is gone. The button stays 430×40.

1. Spinner and “Placing order”, still blue.
2. The background changes to emerald **#12824a** over 5 frames (167ms).
3. The spinner becomes a check. The stroke draws on over 8 frames (267ms). The first frame already shows the start of the stroke, so the button is never empty.
4. The existing cut to Order placed.

The summary stays at full strength. The confirmation copy is unchanged: “Order placed”, “Ship date pending”, “Collin Johns will confirm your ship date. Track it in Order history.”

## Logo

The logo and the UI never share a frame. Each fades against the solid ground `#f5f4f1`.

Outro: the confirmation fades out (frames 457–465), then the logo fades in and scales 0.96 → 1 over 9 frames (300ms), then holds. Intro is the reverse and shorter: the logo fades and scales 1 → 0.96 over 5 frames, a blank ground frame, then the dashboard fades up. Frame 0 and frame 488 are the same full black logo at scale 1.

## check-film

`python3 scripts/check-film.py` on the 1920×1440 film (489 frames, 16.3s): `no_cuts` true, `seam_ok` (0.01), `numbers_ok`, `no_forbidden`. `no_freeze` is false because the holds are intentional: Add to order 150–167 (0.6s), rows after the zoom 194–215 (0.73s), Add 4 lines 224–247 (0.8s), pill at $0.00 260–272 (0.43s), summary 307–333 (0.9s), Placing order 342–355 (0.47s), emerald check 360–383 (0.8s), confirmation 421–457 (1.23s), logo 474–488 (0.5s).

Hard cuts are the allowed ones: 69 (result click), 136 (popover opens solid), 174 (popover closes), 216 (Add to cart), 260 (pill), 302 (summary), 387 (Order placed). Max step is the popover close. The zoom, the intro, and the outro are not cuts.

OCR reads each frame twice. At 4:3 the zero in “Net 30” stays a zero. At 16:9 the Roman numeral in “Hyperion Pro IV” stays IV. One scale alone drops one of those strings. The words are on the frames either way.
