# JOOLA film pass 32

12.5 seconds (375 frames). The logo intro and outro, Place order, and the Order placed frames are unchanged.

## Hover

Hover is one per-frame hit test of the cursor tip against the controls it actually crosses: the search result, the quick-add chips, the quantity row and the kit rows, the saved-order rows, Add to order, Add to cart, the cart pill, and Place order. It turns on once the tip is 2px inside and stays on until the tip is 2px outside, so an edge skim cannot flip it. The colour moves over 80ms (2.4 frames), sampled from the frame so a one-frame graze cannot finish a snap.

The 12 used to drop its hover at frame 84 while the cursor was still on the chip. It now eases on as the tip enters (frame 72) and stays dark until the tip leaves (frame 99). The 6, which the tip crosses for one frame on the way in, only reaches part of the hover colour and fades back.

## Saved orders

The cursor still arrives on Add to order at frame 134. The click is frame 148, six frames (200ms) later than before. The popup, the kit lines, and the zoom each move with that click. Place order stays at frame 268.

## Header cart

The pill still widens first. The amount then rolls from $0.00 to $4,908.66 in 12 frames (400ms), and the count circle scales and fades on that same ease from that same frame. On the start frame the circle is not drawn. Halfway through, it is in the pill with the digits still traveling. Both are settled two frames before the cursor leaves its park. The pill click stays at frame 238, and the cut to Place order stays at frame 247.

## Check

`check-film.py` once on the 1920×1440 film: 375 frames, no unexpected cuts, seam diff 0.019, ledger strings present. The still stretches are the new hold on Add to order (0.5s), the green-button hold, and the settled logo.
