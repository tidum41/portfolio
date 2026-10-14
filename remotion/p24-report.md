# JOOLA film pass 24

Same branch and PR as pass 23. 365 frames, 12.17s. Numbers unchanged: cart **$19,306.50**, line **$16,197.60** at 120 × $134.98, PO **ENG-9812**, SO **SO-48213**, Net 30, credit **$25,693.50 available of $50,000**.

The pass is about distance. Every beat has to be obvious when the card is 676px wide, and still readable at 400px with a 1px gaussian blur (a phone, or a laptop across a desk).

## 1. Distance test

`distance-test.png` is seven before/after pairs. Each frame is scaled to 400px wide, then blurred 1px. Before is the pass-23 camera. After is this pass.

| Beat | Focal | Cap height at 676 | At 400px + blur |
|---|---|---:|---|
| Search | Perseus | 14.1px (the P) | Reads, with the result and $134.98 |
| Qty | 120, $134.98, $16,197.60 | 15.0px | All three read |
| Add to order | the button, Match kit | button fills the shot | Reads |
| Add to cart | Add 4 to cart | button fills the shot | Reads |
| Cart total | $19,306.50 | ~30px | Reads, badge 4 reads |
| Place order | $19,306.50, Place order | total 24.4px | Both read |
| Order placed | title, SO-48213 | title ~24px, SO 12.2px | Both read |

Cap height is the ink of the digits (or the capital) on the 720×540 still, times 676/720. The qty field stays weight 500 so the caret measurement holds. Everything else that is the point of a shot is weight 700 and ink, not a thin grey label. The cursor is 1.25×, still shrinking to 0.9 of that on a press. The tip stays the hotspot.

SO-48213 is the one focal under 14px. It is 13px type, weight 700, and it sits about 25px from the card’s right edge. Scale 2.95 already puts the card border at x = 7 and x = 668 on a 676px frame. A larger scale clips the last digit. The 400px blur still reads SO-48213, so the shot stays at the largest scale that keeps the number whole.

## 2. Framing

Three moves, then cuts.

| | Camera | What the frame is for |
|---|---|---|
| Open | 332, 210, s 2.28 | Logo in the sidebar. The frame stops at the search field, so Upload CSV and “Price” are not sliced letters. |
| Search | 440, 148, s 3.45 | Perseus, the result, $134.98. Quick order stays whole. |
| Qty | 803, 332, s 3.3 | 120, the full unit price, the line total. The search field is above the frame. |
| Add to order | 1158, 608, s 6.2 | Match kit and the button. The card above and the footer button are out. |
| Add to cart | 1223.5, 748, s 4.4 | Add 4 to cart. The rail price is above the frame. |
| Pill | 1208.5, 23, s 8.8 | The filled pill, centred. The account chip is hidden for this shot. |
| Place order / Order placed | card centre, s 2.95, lift 6 | Same scale, same lift. The cut does not move the card. |

Moves: open to search (frames 20–32), search to qty (78–86, landing on the 120 click), qty to Add to order (100–114). Cuts: 153 (Add to cart, once the popover has closed and the label is already Add 4), 188 (pill), 234 (summary), 270 (order placed). Frame 71 is the search dropdown closing. On this tighter shot that reads as a cut, and it is allowed.

The $0 pill sits right of centre because the pill grows left from a fixed right edge. The filled pill, which is the beat, is centred. Hiding the account chip keeps “Pickleball” from being sliced while the pill is still narrow.

## 3. Loops

Drafts only, until the one 1920×1440 render.

**Loop 1.** Stills of the first tighter cameras. The search shot sliced “Pri” off Price and a “U” off Upload CSV. The qty shot clipped `$134.98` to `4.98 ea`. The Add button shot clipped a rail price. The pill shot sliced the retailer name. Fixed by stopping the search frame at the field, dropping the qty frame below the search field, lowering the Add button frame under the rail, and tightening the pill until the name was out.

**Loop 2.** Those four stills again, plus the 400px blur sheet. The focals read. A full 676×508 draft then showed two leftovers: the opening shot still sliced “Pri” and Upload CSV, and the $0 pill (before it grows) sliced “ckleball” because the narrow pill no longer covered the name. The opening frame now stops at the search field. The account chip is hidden from the pill cut until the summary cut.

**Loop 3.** Second full draft. Opening, the move into search, $0, the grow, and the filled pill are clean. The final render then showed a one-frame blank at 127 (a chunk that had not painted; a still of that frame is the popover) and a half-second hold on Match kit after the popover had faded, which left the tight shot with no button. The Add cut moved from 166 to 153, so it lands as the popover finishes closing and the label is already Add 4. The blank frame was replaced with the held popover frame around it. A scan of the finished film finds no other flat frames outside the logo outro.

## 4. check-film

`python3 scripts/check-film.py` on the 1920×1440 film: `numbers_ok`, `no_cuts` (71, 153, 188, 234, 270), `seam_ok` (0.018), `no_forbidden`. `no_freeze` is false because the holds are intentional: qty 86–100, menu 132–145, Add button 164–181, pill at $0 188–200, filled pill 218–233, summary 240–265 (0.87s), order placed 270–323 (1.8s), outro 350–364. OCR missed nothing.

On the 676px frame, both order cards have their side borders at x = 7 and x = 668 and the top border at y = 11.
