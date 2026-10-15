# JOOLA film pass 34

14.0 seconds (420 frames). Frames 0–89 and everything from the cart cut at frame 300 match pass 33, including both logo fades and Place order. Saved orders is gone. From 3s to 10s the buyer finishes one team order in a single framing.

## 3s to 10s

One camera move: frames 90–114 (800ms, cubic-bezier(0.65, 0, 0.35, 1)), from the search field out to the whole order, while the cursor rests on the Perseus result. That framing then holds through the cart click. The only later cut is the existing one into Place order.

The cursor clicks the result, the line eases in, and the price holds. It sets qty 12 and the $1,799.76 line holds. Hyperion, the ball pack, and the bag then land as one staggered gesture (2 frames apart, the same ease) into the empty rows under that line, and the footer total rolls with them. The button reads Add 4 lines to cart before the next move. The cursor clicks it, and on the release frame the pill widens, the total rolls from $0.00 to $4,908.66 in 9 frames (300ms), and the count circle morphs in on that same ease. After a short rest the cursor goes to the cart and clicks it.

Cursor travels in this stretch use the same ease, a small arc, and a 5-frame dwell before each click. Result, qty, and Add to cart press as a colour change. The cart click still dips, because that dip runs through the first frames of Place order.

## Check

`check-film.py` once on the 1920×1440 film: 420 frames, no unexpected cuts (300 and 357), seam diff 0.021, ledger strings present. The still stretches are the reading holds (the new line, the $1,799.76 line, the filled order, the settled cart) and the green-button hold (frames 339–353).
