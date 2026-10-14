# JOOLA film pass 21

Same branch and PR as pass 20. 365 frames, 12.17s. Numbers unchanged: cart **$19,306.50**, line **$16,197.60** at 120 × $134.98, PO **ENG-9812**, SO **SO-48213**, Net 30, credit **$25,693.50 available of $50,000**.

## Issues found, and what fixed them

1. **The Add to order / Replace order menu shifted 1px while it was open.** Pass 20 had measured the Match kit row (stable) and missed the menu. On the rendered film, both buttons translated together: at 960px the menu sat at y 565–607, jumped to y 564–606 on frame 126, then landed at y 565–608. The row’s text did not move. The camera was already still (the pan ends at frame 114; the menu opens at 118).

   Cause: the film wrote `top` every frame from `offsetTop + offsetHeight + 4`, and the row was **72.078px** tall. That fraction sits on a device-pixel boundary. Frame 126 is also when the Add button’s hover latches, which was enough to flip the rounding. It was not a scale, not a camera move, and not the row’s margin.

   Fix, in the prototype and the film:
   - Line boxes on the reorder row are 16px, so the row is **72px** (`offsetTop` 331, `offsetHeight` 72, both integers).
   - The menu’s `left`, `top`, and `width` are rounded integers (`offsetLeft + 12`, `offsetTop + 72 + 4`, width `offsetWidth − 24`) and are the same on every frame.
   - Entrance is an opacity fade only (`cubic-bezier(0.4, 0, 0.2, 1)`, frames 118–123). No translate, no scale.
   - Hover and press change colour only. Border width stays 1px and font-weight stays 500, so the buttons cannot change size.

   Re-measured on the new render, film pixels, every frame the menu is opaque: Add to order stayed at **(1373, 1130)–(1820, 1216)** from frame 123 through 145. Replace order’s ink stayed at **(1481, 1263)–(1713, 1295)** from frame 122 through 150. Delta **0**. On the press (frames 146–149) the blue bbox loses 1px of antialiased fringe because the fill goes from `#2c3ee0` to `#1a2599`; Replace order does not move, and the blue box returns on frame 150. That is a colour change, not a shift.

2. **Quantity 120 never showed the field being edited.** The value stepped 1 → 12 → 120, the cursor stayed an arrow, and there was no caret.

   Fix: the click aims at the right side of the qty field (not a preset). From the moment the hotspot is over that field the cursor is a traditional I-beam (stem plus serifs, white halo). On frame 86 the value swaps **1 → 120** in one frame, a neutral focus ring appears, and a caret blinks just after the digits (8 frames on, 8 frames off) until the next click. The caret is absolutely positioned so the digits do not move. No blue fill, no selected preset.

3. **The cart total did not feel like one gesture.** Width used an ease-in-out, the full string `$19,306.50` was painted immediately and clipped by `overflow` (glyphs broke mid-character), and the badge popped on the last 10% of that same curve.

   Fix, in the order from the Stripe / Ramp / Linear notes in the motion report:
   - Add to cart press, frames 182–185, colour only.
   - Hard cut at 188 onto the pill, still **$0.00**. That beat holds while the cursor travels (0.47s, ease-in-out) and lands on the cart icon at frame 200.
   - Width eases **85 → 151** on one curve, `cubic-bezier(0.2, 0, 0, 1)`, frames 200–214. The right edge stays put; the pill grows left. The cursor rides the icon on that same curve.
   - The number swaps on frame 205, the first frame the width (135px) can hold `$19,306.50` without clipping a glyph. Until then the label stays `$0.00`.
   - The count badge is the last beat: scale **0.6 → 1** over 5 frames (213–218), same ease-out, no overshoot and no 1.1 bump. It lands in the space the width already opened.

4. **The summary card’s top corners were clipped.** `SHOT_SUM` at cy 262 left about 6px above a 272px card, so the top radius sat on the frame edge (visible on the contact sheet at frame 234). cy is now **258**: about 10px above the card and 6px below, so both radii and the Place order button are inside the frame. Scale stays 3.75, so the type is unchanged at 676px.

5. **Order placed had no dashboard context.** `SHOT_D` cy 252 put the frame top at y≈53, just under the 48px header. cy is now **241**, frame top y≈42. The header’s bottom rule is in frame. The account chip and cart pill end near y=41, so they are not sliced. The panel (y 72–411) still fits, and 14px type stays well above 11px at 676.

6. **The mark was a small wordmark PNG.** The intro, the sidebar, and the outro now use JOOLA’s official horizontal lockup, the black SVG served from the storefront. It stays sharp at 1920×1440 because it is vectors, not a scaled PNG.

## Watched at 676px and left as they are

- **Summary shot has no header sliver.** The card runs from y 124 to y 396 and the header rule is at y 48. Fitting both, plus the Place order button, means a scale of about 3.0. At that scale the frame is wide enough to either cut into the line-item prices (they end at x 932) or slide the card off centre with a large empty right margin. Either one hurts the shot more than a 1px rule helps it. The pill shot already shows the account chip, the $0 → $19,306.50 pill, and the header rule. Order placed shows the rule. The summary stays a centred card.
- **Holds that check-film flags as frozen** are the reading holds: qty (86–100), the open menu (132–145), the filled pill (217–233), the cart (239–265), and Order placed (278–323, about 1.5s). The logo card holds at the head and the tail. The loop seam diff is ~0.
- **Hard cuts** are only the three designed ones: pill at 188, summary at 234, Order placed at 270. Place order hover is latched (`#2433c4` from arrival through the press, `#1a2599` on frames 266–269). No blue click fills. One cursor, in screen space across the cuts, hidden on the logo cards.

## Logo source

- File: `joola-logo.svg` (also `remotion/public/joola-b2b/joola-logo.svg` and the prototype)
- URL: https://joola.com/cdn/shop/files/JOOLA_Lockup_Horizontal_Outline_Black_RGB.svg

The same artwork is the header lockup on joola.com (`Joola_Logo_1.png`). The SVG is the one used, so the 340px intro card and the 120px sidebar slot rasterize cleanly.
