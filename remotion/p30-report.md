# JOOLA film pass 30

12.5 seconds (375 frames). Logo intro, the outro fade and scale, and the Place order and Order placed frames keep their look.

## One camera move from 5s to 7s

The two zooms in that stretch are one move, frames 149–173, from the kit close-up to a single framing that holds the new lines and Add 4 lines to cart. The camera stays there. The cursor lands on the new line as the zoom ends, holds, moves to the button, and clicks.

## Cart amount

The pill is wider (92 empty, 156 with the total) and grows to the left, so the right edge stays put. The close-up is framed on the filled pill. The roll paints into a canvas the size of the amount and clips to one digit, so the next total cannot show under the current one. Resting frames show the full $4,908.66 and the badge inside the pill and the frame. The dollar sign and the comma open to their full ink once the roll has settled.

## Pill click

The cursor arrives on the header cart. The pill takes a colour hover, then a colour press, and that click cuts to Place order. The cursor comes in just above Place order and is on the label before the click. The summary and the confirmation are unchanged.

## Cursor and logo

The arrow is 2.2× the original 1.25 (2.75× the SVG), drawn at that size. The tip fraction is unchanged, so the hotspot stays on the point. Press still dips to 0.9.

The intro and outro mark is the same SVG, drawn at film pixels outside the stage scale. Settled, it is 614px wide on the 1920 frame, 32% of the width, centred. The fade and the 0.96→1 scale are the same lengths.

## Check

`check-film.py` once on the 1920×1440 film: 375 frames, no unexpected cuts, seam diff 0.01, ledger strings present. The frozen runs are the hold after the zoom, the green-button hold, and the settled logo.
