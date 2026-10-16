# JOOLA film pass 41

16.8 seconds (504 frames). Branched from pass 40. The motion curves, the transitions, and the copy are the pass 40 film. Two rests are longer, and the cart pill is balanced on the figure midline.

## Breathing room

Nine frames (0.3s) of stillness on the cart summary. The cut is still frame 330. The cursor stays where it lands until frame 339, then travels to Place order on the same 12-frame ease. The press, the label crossfade, the colour, and the check keep their lengths.

Nine frames (0.3s) on Order placed, after the card has recentered and before the UI fades. The grow, the recenter, the fade to the ground, and the logo fade keep their lengths. The settled logo still holds 1.6s.

## Cart pill

The shared axis is the ink centroid of the tabular figures. The comma and the decimal point are not part of it. The basket centre is the filled basket body, with the handle and the wheels left out. The badge centre is the circle. The 4 is shifted so its own ink centroid, not its box, sits on that circle.

On the settled 1920 frame the basket is 0.15px from the axis, the circle is 0.23px from it, and the 4's centroid is 0.27px left and 0.01px above the circle centre. The two ink gaps are 59px and 59px. The outer insets are 92px and 93px, one pixel apart because the span is odd.

On the prototype at 8× the basket is 0.03px from the axis, the circle is 0.02px, and the 4's centroid is 0.03px from the circle centre, in CSS pixels. The gaps are 8px and 8px. The insets are 12.4px and 12.4px.

## Check

`check-film.py` once on the 1920×1440 film: 504 frames, 16.8s, hover assertion clean (0 violations), no unexpected cuts, seam diff 0.019, ledger strings present. Holds over 0.4s are the settled pill (297–311), the green button (378–392), Order placed (421–440, 0.67s), and the logo (456–503, 1.6s). The 0.3s summary read is under that flag. `no_freeze` is false for those holds. All-caps OCR tokens are `FYJOOLA` and `FYIJOOLA`.
