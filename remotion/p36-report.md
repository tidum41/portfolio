# JOOLA film pass 36

14.0 seconds (420 frames). Branched from pass 35. Frames 0–90 keep the pass-35 camera and cursor path. The cart cut stays frame 300, and Place order stays frame 321.

## Clicks

| Frame | Target | Visible result |
| --- | --- | --- |
| 50 | Search field | The field focuses. Perseus types in, and the results dropdown opens at frame 58. |
| 97 | Perseus result | The result presses. The Perseus line eases in through frame 109, and the dropdown closes with it. |
| 151 | Quantity 12 | The chip selects. The unit price rolls to $149.98 and the line total to $1,799.76 over 10 frames. |
| 185 | Match kit | The saved-order popup opens. |
| 207 | Add to order | On the release (frame 211) the popup closes and the three kit lines stagger in. The footer count follows the lines that are actually on screen. |
| 255 | Add to cart | On the release (frame 258) the header cart cuts in. The pill rolls to $4,908.66 and the count becomes 4. |
| 296 | Cart pill | The cart summary cuts in at frame 300. |
| 321 | Place order | The button presses, then Placing order, then the emerald check. |

## What changed

- Hover and press are colour only, and only while the painted cursor tip is inside the control. The tip is the snapped arrow tip after the camera and the cursor scale. Entering takes 2 stage pixels; leaving clears the colour on that frame. Pressed is only inside that control's click window. Search, the cart pill, and Place order no longer dip the cursor.
- `check-film.py` compiles the pointer and fails the run if any hovered or pressed control does not contain that tip.
- After the Perseus line has landed, frames 109–133 (800ms, `cubic-bezier(0.65, 0, 0.35, 1)`) zoom out to the quantity row. The cursor stays on the result. This is not the post-search zoom.
- That quantity framing is scale 3, centred on the price, the chips, and the line total, so a 12px chip is about 10px and a 14px price is about 12px on a 400px-wide card. The four-line beat stays at scale 1.35 so the product names and Add to cart still share one frame.
- Add to cart is 155px from the first frame, the width of "Add 4 lines to cart". The label is centred, with tabular numbers. The right edge stays the prototype's.
- The cursor is 15% larger on screen (`1.25 × 1.6 × 1.15`), at every zoom, including the open and the Place order tail.

## Check

`check-film.py` once on the 1920×1440 film: 420 frames, hover assertion clean (0 violations), no unexpected cuts, seam diff 0.021, ledger strings present. Holds over 0.4s are the filled-order read (230–242), the cart summary (308–320), and the green button (339–353). `no_freeze` is false for those holds. The only all-caps OCR noise is `FYJOOLA`.
