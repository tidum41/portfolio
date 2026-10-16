# JOOLA film pass 37

15.0 seconds (450 frames). Branched from pass 36. Frames 0–161 are unchanged. From the cart pill click to the last frame is the pass-36 tail, shifted 30 frames. Opening and closing logos keep their lengths. The hover assertion is unchanged.

## Clicks

| Frame | Target | Visible result |
| --- | --- | --- |
| 50 | Search field | The field focuses. Perseus types in, and the results dropdown opens at frame 58. |
| 97 | Perseus result | The result presses. The Perseus line eases in through frame 109, and the dropdown closes with it. Then the camera zooms out, frames 109–133, with the cursor still on the result. |
| 151 | Quantity 12 | The chip selects. The unit price rolls to $149.98 and the line total to $1,799.76 through frame 161. |
| 223 | Match kit | After the pull-back (168–192) and a 300ms hold on Saved, the cursor travels to Match kit. The popup opens. |
| 239 | Add to order | On the release (frame 243) the popup closes, the camera cuts back to the order, and the three kit lines stagger in. |
| 275 | Add to cart | On the release (frame 278) the header cart cuts in. Pill width, the $ roll, and the count circle start together and arrive at frame 292. |
| 326 | Cart pill | The cart summary cuts in at frame 330. |
| 351 | Place order | The button presses, then Placing order, then the emerald check. |

## What changed

- After the quantity price has been read, frames 168–192 (800ms, `cubic-bezier(0.65, 0, 0.35, 1)`) pull back from the quantity framing to Match kit. The cursor stays on the 12 chip for the move and for the 300ms hold (through frame 201), then travels to Match kit. There is no cut on that move. The hold shows the Saved label with Match kit under it, and the popup that follows stays in the same framing.
- The cart roll is a DOM column slide: sub-pixel `translateY`, motion blur 0, and a clip mask on each column so the off-window glyph does not paint through the scaled stage. Width, the digits, and the circle share `cubic-bezier(0.22, 1, 0.36, 1)` for 14 frames (~467ms), starting on the Add to cart release. After it settles, the cursor holds 400ms (frames 292–304) before it heads to the cart.
- Cursor travels between 3s and the cart click are on the same ease, and none of them run during a camera move. The long hops (quantity chip to Match kit, and the header approach) are 16 frames so their peak step stays near the existing quantity approach.

## Check

`check-film.py` once on the 1920×1440 film: 450 frames, hover assertion clean (0 violations), no unexpected cuts, seam diff 0.021, ledger strings present. Holds over 0.4s are the settled pill (289–305), the cart summary (338–350), and the green button (369–383). `no_freeze` is false for those holds. All-caps OCR noise is `FYJOOLA` and `AMNAR`.
