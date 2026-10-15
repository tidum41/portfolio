# JOOLA film pass 31

12.5 seconds (375 frames). The logo intro and outro, and the Order placed frames, are unchanged.

## Cursor size

The arrow is drawn outside the camera, so its draw scale is the on-screen size. That size is now 1.6× the original 1.25 (2.0× the SVG) at every zoom, including the wide shot around 6s. Dividing by the camera scale would shrink the close-ups to a speck. The tip fraction is unchanged. Press still dips to 0.9.

## Add to cart

The button is the 155px box. Hover, press, and release come from the cursor tip each frame. It stays the default blue until the tip enters, turns hover blue on that frame, goes to the pressed blue for the three mousedown frames, and returns to hover on release.

## Header cart

The click cuts to the cart pill in the header and holds that framing. The pill widens, the amount rolls from $0.00 to $4,908.66, and the badge counts to 4, all in frame. The camera does not zoom again. The settled dollar sign is the full stem, and the amount sits inside the pill with space to the frame edge.

The cursor waits under the pill while that plays, then moves onto the icon. Hover starts when the tip enters. The press is three frames. It holds the released hover for six frames (200ms), and only then cuts to Place order. Those six frames come from the old rest on the new line. The cursor lands just above Place order, as before.

## Check

`check-film.py` once on the 1920×1440 film: 375 frames, no unexpected cuts, seam diff 0.019, ledger strings present. The frozen runs are the green-button hold and the settled logo.
