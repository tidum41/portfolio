# JOOLA film pass 35

14.0 seconds (420 frames). Branched from pass 33. The ordering story is pass 33's: search, Perseus, qty 12, Match kit, Add to order, then the three kit lines. The lines still appear only after Add to order. The open push is still the only zoom. Qty, Match kit, the kit lines, and the header are hard cuts.

## Cart pill

The header cut is frame 229, the Add to cart release. The cursor keeps its screen pixel, below the pill. The amount, the width, and the count circle start on that frame and share one ease-out. The digits and the circle run 9 frames (300ms). The box leads them inside that same window so the $ is on screen before the roll's middle, and both ends are the tabular width of the amount: $0.00 and $4,908.66, with 12px padding on each side. Before the cut the empty pill stays pass 33's 92px, so the account chip does not move.

The cursor rests through the roll, rises to the park, holds the settled total, then clicks the cart icon at frame 296. The cart cut stays frame 300.

## Place order

Hover and press already used the same colours as the other buttons (#2433c4 and #1a2599, 2px hysteresis, 80ms ramp). The blue-to-emerald morph was painted and then cleared, so the check sat on the rest blue. It is painted again after that clear, on the same frames as before (334–339).

## Check

`check-film.py` once on the 1920×1440 film: 420 frames, no unexpected cuts, seam diff 0.021, ledger strings present. Still stretches over 0.4s are the settled pill (253–280) and the green-button hold (339–353). Frames 0, 69, 96, 106, 140, 170, 196, 206, 300, and 386 match pass 33.
