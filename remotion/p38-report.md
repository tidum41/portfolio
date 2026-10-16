# JOOLA film pass 38

15.0 seconds (450 frames). Branched from pass 37. Three changes only. Frames 0–242 keep pass 37's camera and cursor path. The cart pill click stays at frame 326, so frames 330–449 are the pass 37 tail.

## Clicks

| Frame | Target | Visible result |
| --- | --- | --- |
| 50 | Search field | The field focuses. Perseus types in, and the results dropdown opens at frame 58. |
| 97 | Perseus result | The result presses. The Perseus line eases in through frame 109, and the dropdown closes with it. Then the camera zooms out, frames 109–133, with the cursor still on the result. |
| 151 | Quantity 12 | The chip selects. The unit price rolls to $149.98 and the line total to $1,799.76 through frame 161. |
| 223 | Match kit | After the pull-back (168–192) and a 300ms hold on Saved, the cursor travels to Match kit. The popup opens. |
| 239 | Add to order | On frame 243 the popup closes. The camera then zooms out to the order, frames 243–265, with the cursor still on that point. The kit lines stagger in from frame 260. |
| 282 | Add to cart | On the release (frame 285) the header cart cuts in. Pill width, the $ roll, and the count circle start together and arrive at frame 299. |
| 326 | Cart pill | The cart summary cuts in at frame 330. |
| 351 | Place order | The button presses, then Placing order, then the emerald check. |

## What changed

- The cursor is 25% larger than pass 37 (`1.25 × 1.6 × 1.15 × 1.25` = 2.875) at every zoom. It is painted outside the camera. The tip offset scales with the arrow, so hover still tests the painted tip. The hover assertion is unchanged and passed with 0 violations.
- The hard cut from the saved-order popup to the order is a zoom. It runs frames 243–265 (733ms, `cubic-bezier(0.65, 0, 0.35, 1)`), starting on the first frame the popup is gone, with the cursor at rest on Add to order. Product names enter the frame at 260, and the three kit lines stagger from there (2 frames apart, 10-frame ease) so the names are on screen while they arrive. The Add to cart click moved to 282 to make room. The 14-frame roll and the 400ms hold are unchanged. The header approach is 11 frames (311–322) so the pill click stays at 326.
- The cart amount window is the wider of the eased width and the measured column strip, so `$4,908.66` is not clipped while the ease-out is still showing the new glyphs. Each roll column has 2px of mask padding above the ascender and below the descender, and the period column has a 4px descent floor. On the header shot the settled pill sits 130px below the top of the frame and 377px inside the right edge. Every roll frame (285–299) and every hold frame (300–311) was sampled: the ink stays inside the pill, and the pill stays inside the frame.

## Same as pass 37

Frames 0–242, compared to the pass 37 film with the cursor masked: two frames have more than 40 pixels differing by over 50, and the worst pixel is 70. That residue is the larger cursor's shadow and encode edges. Frames 330–449 match the same way (one frame, 411, has 53 near-white pixels from the encode). Frames 326–329 still show the pill, so they also carry the new price padding.

## Check

`check-film.py` once on the 1920×1440 film: 450 frames, hover assertion clean (0 violations), no unexpected cuts, seam diff 0.021, ledger strings present. Holds over 0.4s are the settled pill (297–311) and the green button (369–383). `no_freeze` is false for those holds. All-caps OCR noise is `FYJOOLA` and `GCRRSE`. The popup still leaves in one frame (243, diff 5.15, down from pass 37's 11.84 camera cut). The order zoom is not a cut. The header cut moved from 278 to 285 with the Add to cart click.
