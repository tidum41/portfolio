# JOOLA film pass 33

14.0 seconds (420 frames). The extra 1.5s is breathing room in the ordering sequence. The logo ink is still 32% of the 1920 frame. The Place order colour, the check, the card grow, and the recenter keep their pass-32 lengths, as do both logo fades.

## One thing at a time

The open push is the only zoom: 18 frames (600ms), ease-in-out, while the cursor rests. Qty, Match kit, the kit lines, and the header are hard cuts. The cursor keeps its screen pixel across each of those cuts, then travels only after the new frame is still.

Cursor paths ease in and settle, with a small curve. Each click has a 6-frame (200ms) dwell. After the $1,799.76 roll the price sits for 12 frames (400ms). The kit lines sit for 12 frames before the cursor leaves. The Add to order popup finishes scaling, then rests 8 frames. On the header the cursor arrives under the pill and rests, the pill widens, then the amount rolls from $0.00 to $4,908.66 in 12 frames (400ms) with the count circle on that same ease, then the total holds before the cursor moves onto the icon.

Dropdown, row insert, popup scale, qty roll, and pill width each ease out. The hover test from pass 32 is unchanged: 2px hysteresis and an 80ms colour ramp.

## Ending

The cart cut is frame 300. Place order is frame 321, the same 21 frames after the cut as before. Four still frames came off the settled Order placed card and four off the settled logo so the price, the lines, and the popup could sit. The fades themselves are the pass-32 lengths.

## Check

`check-film.py` once on the 1920×1440 film: 420 frames, no unexpected cuts, seam diff 0.021, ledger strings present. The one still stretch over 0.4s is the green-button hold (frames 339–353).
