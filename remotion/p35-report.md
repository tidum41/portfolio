# JOOLA film pass 35

14.0 seconds (420 frames). Branched from pass 33. The middle keeps pass 34's craft and puts pass 33's saved-orders cause back in front of the kit lines. There is no zoom after the search.

## Kept from pass 34

- Locked order framing (`SHOT_ORDER`, scale 1.35). The result, the 12 chip, the four rows, Add to cart, and the pill stay in one frame. The post-search zoom is gone: frame 91 is a hard cut, and the cursor stays on the result.
- Cursor dwells of about 180ms before each middle click, and arcs on `FLOW_E` (`cubic-bezier(0.65, 0, 0.35, 1)`). `FLOW_E` is only for travels whose keys sit strictly between frame 90 and the cart cut. Frames 0–90 and the Place order approach stay on `PTR_E`.
- Reading holds after the Perseus line, after the 12-chip price, and after the kit lines settle.
- The 12-chip beat: one click, then the unit price and the line total roll for 10 frames on `FLOW_E`.
- The three kit lines land as one gesture: 2 frames apart, each on the same 18-frame `FLOW_E`. They start at frame 203, the Add to order release, not while the cursor is parked on the 12 chip.
- Add to cart eases from the prototype width to 155px, right edge fixed, and reads "Add 4 lines" once it is wide enough, before the hold.
- Press on the result, the 12 chip, Match kit, Add to order, and Add to cart is a colour change only. Search, the cart pill, and Place order still dip.
- Cart roll timing: the amount, the width, and the count circle start on the Add to cart release. The digits and the circle run 9 frames (300ms). The box leads inside that window so the $ is on screen before the roll's middle.

## Restored from pass 33

- Saved orders. The cursor cuts to Match kit (frame 159), clicks the template (175), the popup opens, and Add to order is clicked (199). The kit lines do not exist before that click.
- The open push, the search, both logos, and the Place order tail from the cart cut (frame 300) through frame 419. Place order is still frame 321.
- The header hard cut on the Add to cart release (frame 258), so the pill update is seen, then the cursor clicks the cart (296) and the cart cut stays 300.

## Also kept from the first pass 35

- The pill is the tabular width of `$0.00` and of `$4,908.66`, with 12px padding on both ends. Before the header cut the empty pill stays pass 33's 92px, so the account chip does not move.
- The Place order button still hovers `#2433c4` and presses `#1a2599`. The blue-to-emerald morph is painted again after the hover pass clears it, on frames 334–339, so the check sits on green.

## Check

`check-film.py` once on the 1920×1440 film: 420 frames, no unexpected cuts, seam diff 0.021, ledger strings present. Holds over 0.4s are the line read (108–122), the price read (146–158), the filled-order read (222–240), and the green button (339–353). Frames 0, 30, 300, 386, 400, and 419 match pass 33. Frames 340 and 345 differ on the button, which is the emerald morph.
