# JOOLA film pass 23

Same branch and PR as pass 22. 365 frames, 12.17s. Numbers unchanged: cart **$19,306.50**, line **$16,197.60** at 120 × $134.98, PO **ENG-9812**, SO **SO-48213**, Net 30, credit **$25,693.50 available of $50,000**.

## 1. The last two shots

Pass 22 framed both cards at scale 2.7. A 480px card is then `480 × 2.7 / 1440` = **90%** of the frame, with about 30px of page around it. That is the cramped pair.

Card width fraction is `s / 3`. The 62–70% band is scale **1.86–2.10**. Both shots have to use the same scale and the same offset from each card’s page centre, or the cut moves the card. The two centres are (1044, 293.59375) and (766, 242). Lifting the card means adding the same `d` to both `cy` values.

Four stills, summary and confirmation side by side at 676px (`variants-676.png`):

| | scale | width | lift `d` | what the margin actually contains |
|---|---:|---:|---:|---|
| A | 1.86 | 62% | 24.7 | Most air. Summary header includes a sliced account chip. Line prices still cut. |
| B | 1.98 | 66% | 16 | Header rule on both, no sliced name. Card has even side margins and sits just above centre. |
| C | 2.04 | 68% | 14 | Same clipped prices, less air, header rule easy to miss on the summary. |
| D | 2.10 | 70% | 12 | Closest to the cramped 2.7 framing. Summary header rule is on the edge. |

**B is the one.** It is the middle of the requested band. At 1920 the card border is x = 326 on both the summary and the confirmation, so the side margins match. At 676 the borders are x = 115 and x = 560 (right margin 116). The card’s vertical centre is about 15px above the frame centre. The header rule is inside both frames.

A sidebar edge cannot share that framing. The card is centred, so the frame’s left edge on the summary is page x ≈ 680. The sidebar ends at 220. Pulling the card off centre to show the sidebar would break the equal margins.

Every scale in the band also cuts the cart line prices (they end near x = 772). Showing a full price and a centred 62–70% card is the same problem from the other direction. The film hides `.cart-main` and the header pills on these two screens only, so the margin is the page and the header rule is what ties the card to the app. The pills stay visible on the Quick order shots, including the cart-pill close-up.

## 2. Polish loops

Each loop checked balance, related-shot scale, the cursor path, easing, holds, text, pixel alignment, layout shift, flicker, and the loop seam.

**Loop 1.** Full film at the new card cameras, reviewed at 676. Cards match. No flicker (a frame that resembles the one two back more than its neighbour: none). Holds are the intentional ones (qty, menu, pill, summary ≈ 0.9s, order placed ≈ 1.7s). Seam ≈ 0.011. Click margins all inside the targets (Place order 20px).

Two defects:

- The Add shot (`s = 1.48`, centre 800, 378) clipped the footer total to `06.50` and cut `Add 4 to cart` on the right. The header title was `order`.
- Travel, fades, and UI entrances were three cubics. `UI_E` and `EASE_OUT` were already the same ease-out. `FADE_E` was a third curve, close to but not the camera curve.

Fix: Add shot is now `{ cx: 769, cy: 378, s: 1.36 }`, which puts `$19,306.50` and the full button inside the frame along with the header chip and the reorder rail. Camera, cursor, and fades all use `MOVE_E` (`0.45, 0, 0.25, 1`). Inserts, pill width, and the badge stay on the one ease-out (`0.2, 0, 0, 1`).

**Loop 2.** Re-rendered and reviewed the Add shot, the pill, both cards, and the outro. The total and the button are whole. The pill’s blue badge sits on the frame’s vertical centre. Both card borders still land on x = 115 and x = 560 at 676. No further framing change.

**Loop 3.** Draft at 676×508, same frames. The Add shot, pill, and both cards still match loop 2. One new defect: the pointer was frozen in screen space across the order-placed cut, and that screen point is the Place order hotspot. Place order sits higher in its card than the confirmation buttons, so the arrow rested in the blank between “Ship to” and “Message Collin” for the first frames of Order placed. Fix: the pointer stays through the press (frame 269) and is gone on the cut (frame 270). A still of each frame confirms the arrow is on the blue button, then absent. No other change.

## 3. Draft renders

`scripts/render-chunks.sh` defaults to a draft. `--final` is the one 1920×1440 render.

`--scale=0.35` is not usable: `1440 × 0.35` is `503.99999999999994`, and Remotion rejects a non-integer height. `--width` / `--height` resize the composition. This film’s stage is hardcoded at 1440×1080, so that override crops the top-left of the picture. The first draft saved that way was replaced. The working draft renders at `--scale=0.375` (exact 720×540) and ffmpeg scales it to 676×508, because 507 is an odd height and yuv420 needs an even one. JPEG quality 60, CRF 28, concurrency = all cores. Layout variants stay stills.

`draft-film.mp4` in the artifacts folder is the full-length draft, including the cursor fix.

## 4. check-film

`python3 scripts/check-film.py` on the 1920×1440 film: `numbers_ok`, `no_cuts` (hard cuts only at 188, 234, 270), `seam_ok` (0.012), `no_forbidden`. `no_freeze` is false because the holds are intentional: qty 86–100, menu 132–145, pill 217–233, summary 238–265 (0.93s), order placed 270–323 (1.8s), outro 352–364. OCR missed nothing.
