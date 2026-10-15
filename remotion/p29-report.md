# JOOLA film pass 29

12.5 seconds (375 frames). The motions are the pass 28 lengths. The time came out of the holds. Logo intro and the outro fade, scale, and settled logo are unchanged.

## The shift at 3 seconds

The qty roll was swapping the price into `display: inline-flex` for six frames. The unit price and “ea” jumped up, and the line total, which is a grid cell, shrank to its ink and snapped to the left. Settled frames then snapped back.

The number now paints into an absolute layer. A hidden sizer keeps the line box, so the row, the grid cell, and “ea” do not move. Every column is that same line box, so a comma rolls through the window instead of a slot as short as its own ink. Frame 86 versus frame 94 (the hold after the roll) differs by 0 pixels above the noise threshold. The header band between the pre-click frame and the settled frame differs by 3 pixels.

## Cart pill

Tabular figures, a fixed line box, and whole-pixel width, height, and travel. The badge is a 20×20 slot with its origin at the centre, and the settled frame has no transform. The pill chrome from the settled roll through the badge differs by 9 pixels.

The first frame of a render used to paint those prices before the face was ready, so each 42-frame chunk opened with the totals a few pixels off. The frame is held until the face has loaded and the metrics are measured again. Chunk-start frame 168 versus the next frame is 53 pixels, which is the encoder, not a second layout.

## Cursor

The arrow is 1.85× the SVG, about 1.5× the previous 1.25, drawn at that size so it stays a vector at card width. It stays on the 12 chip until the camera leaves. On the hold before that pan, frames 88 and 94 are identical.

## Timing

Add to cart press is 3 frames, and the pause before it is shorter. Place order and the Order placed hold are shorter. The other stills were trimmed the same way. Cursor travels, camera moves, rolls, and fades keep their frame counts. Duration is 375 frames, 12.5s.

## Check

`check-film.py` once on the 1920×1440 film: 375 frames, no unexpected cuts, seam diff 0.01, ledger strings present. The two frozen runs are the green-button hold and the settled logo.
