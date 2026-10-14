# JOOLA film pass 25

Same branch and PR as pass 24. 481 frames, 16.03s. Numbers unchanged: cart **$19,306.50**, line **$16,197.60** at 120 × $134.98, PO **ENG-9812**, SO **SO-48213**, Net 30, credit **$25,693.50 left of $50,000**.

Shipping and tax both read **Calculated when it ships**. That is the wording on the summary. The amount is not known yet, so “calculated” is more accurate than “added,” and the two rows use the same sentence.

## What each beat is

No captions on screen. One line each, in order:

1. The JOOLA logo lands in the wholesale dashboard.
2. The buyer searches for Perseus, and the typed word stays visible.
3. The buyer picks Perseus Pro V.
4. The line appears at quantity 1, then the click sets it to 120.
5. The camera moves across to Match kit.
6. The buyer opens Match kit, holds on Add to order, and presses it.
7. The Match kit adds three products: Hyperion Pro IV 14mm, HC-40 Balls (3-Pack), and Tour Elite Bag.
8. The buyer holds on Add 4 lines to cart and presses it.
9. The cart total jumps from $0.00 to $19,306.50, and the badge reads 4.
10. The buyer reviews the summary and presses Place order.
11. The same button says Placing order, then the check draws and the button turns green: Order placed.
12. The confirmation replaces the summary. Collin Johns will confirm the ship date.

The cursor lands on the thing that changes next. It eases off the button during Placing order and is gone once the confirmation is the subject.

## Copy

| Place | Text |
|---|---|
| Confirmation subline | Collin Johns will confirm your ship date. Track it in Order history. |
| Order history | Inline link, same colour, 1px underline, brand blue on hover. Opens Orders. |
| Confirmation badge | Ship date pending |
| Processing button | Placing order |
| Success button | Order placed |
| Popover | Add to order / Replace order |
| Footer | 4 lines, and Add 4 lines to cart |
| Sidebar and page | Saved orders |
| Rail action | Add |
| Shipping and tax | Calculated when it ships |
| Credit | $25,693.50 left of $50,000 |
| Search | Search name or SKU. Upload CSV stays. |
| Green | #12824a on the success button and the title check |

## Cards

Both cards are scale **2.68** (about 9% smaller than pass 24’s 2.95), width 480, padding 24, radius 12. On the 720×540 still the borders are:

| | Left | Right | Top | Bottom |
|---|---:|---:|---:|---:|
| Summary, frame 320 | 38 | 38 | 70 | 70 |
| Confirmation, frame 430 | 38 | 38 | 47 | 48 |

Left and right match each other and match across the two shots. The confirmation is the taller card, so its top and bottom margins are smaller. Each card is centred on itself: the summary’s top and bottom match, and the confirmation’s differ by 1px.

The grow keeps the confirmation’s top locked to the summary’s screen top, then a short recenter eases the taller card to centre. The summary is not dimmed while the button says Placing order.

## Check alignment

The filled green circle beside “Order placed” is nudged `translateY(-0.8px)` in the prototype, which is the amount the cap centre sits above the flex line-box centre.

On the 1920×1440 frame, measured on the 4× crop `check-align-4x.png`:

- Circle centre is **0.14 page-pixels above** the cap-height centre of the O in “Order” (0.5px on the 1920 frame, about 2px on the 4× crop).
- Gap from the disc’s right edge to the O’s ink is **13.7 page-pixels**. The title row’s gap is 12px; the rest is the letter’s sidebearing.

## Distance

`distance-test.png` is seven before/after pairs. Before is the pass-24 film. After is this film. Each frame is scaled to 400px wide, then blurred 1px.

Perseus, 120, $134.98, $16,197.60, Add to order, Add 4 lines to cart, $19,306.50 with the badge 4, the summary total, and Order placed with SO-48213 all still read. Search stays weight 500 and still reads at that size.

## Motion

| | Frames | What it is |
|---|---|---|
| Open → search | 20–32 | Same move as before |
| Search → qty | 69–82 | Lands while the qty is still 1 |
| Qty → Add to order | 106–126 | 0.67s, same curve. End scale 6.4 |
| Rows | cut 182, rows 188–204 | Three products arrive in frame |
| Add 4 lines | cut 216, press 248 | Cursor settled from 228 |
| Pill | cut 260, fill 272–286 | $0.00 then $19,306.50, badge 4 |
| Summary | cut 302 | Full strength |
| Placing order | 337–362 | Label swaps, no ellipsis, ~0.7s readable |
| Check and green | 363–370, hold to 382 | Check draws, colour eases to #12824a |
| Confirmation | fade 383–386, cut 387, grow to 396, recenter 402–412 | Top-anchored, then centred |
| Order placed hold | 412–456 | About 1.5s |
| Logo | cut 457, hold to 480 | Full black lockup. No grey dissolve |

The end scale on Add to order is 6.4, against 6.2 in pass 24. A looser frame (5.85) cut the line “120 units, $16,197.60” and the footer rule. 6.4 is the frame that keeps Match kit, Add to order, and Replace order whole.

## check-film

`python3 scripts/check-film.py` on the 1920×1440 film:

| Flag | Result |
|---|---|
| numbers_ok | true |
| no_cuts | true |
| seam_ok | true (0.006) |
| no_forbidden | true |
| no_freeze | false |

`no_freeze` is false because the holds are intentional: qty about 0.6s, Add to order 0.6s, the new rows 0.6s, Add 4 lines 0.8s, the summary before the press 0.9s, Placing order 0.7s, Order placed about 1.2s on the settled card, logo 0.8s.

OCR read every expected string. It reads ENG-9812 as ENG-98i2, so the check requires “Your PO” plus SO-48213, $19,306.50, Net 30, and Collin Johns. The still shows ENG-9812. No forbidden string (middle dot, Sam Ortiz, 89,982, Build a bulk order). No blank frame: the lowest frame contrast outside the logo is still well above a flat frame.

## Loops

**Loop 1.** Stills of the new beats. The Add-to-order frame sliced the rail line above Match kit and a footer rule. The confirmation frame caught a header hairline. The processing label was a double exposure, and the logo outro sat on a grey card and a grey logo.

**Loop 2.** Full 676px draft. Rows, the pill, Add 4 lines to cart, the centred cards, and the black logo were clean. The success button still went blank for a frame while the two labels handed off.

**Loop 3.** The label now swaps in one frame while the colour eases and the check draws. One 1920×1440 render. No flat frames.

## Slop audit

Looked at every beat in the film and every prototype screen (Quick order, search, catalog, saved orders, orders, cart, confirmation, invoices, messages, mobile).

### Fixed

- **Grey logo outro.** A dissolve left a washed-out card and a grey lockup (`slop/outro-ghost-before.png`). The film now cuts to the black logo.
- **Two labels on one button.** “Place order” and “Placing order” sat on top of each other (`slop/button-smear-before.png`), and the success frame went empty. The label swaps in one frame. The colour still eases. The check still draws.
- **Sliced header rule** above the confirmation card. The cart and confirmation shots hide that rule so the card is not crossed by a hairline.
- **Orders page.** The status column was empty and the table was a narrow stub. Past orders now use the same status chips as invoices (Pending, Paid). The current order keeps Ship date pending. The table spans the content column (`slop/orders-after.png`).
- **Opening search field.** The right radius was cut off. The frame is wide enough that the pill is whole and Upload CSV stays out. Saved orders and Orders are both fully in the sidebar.

### Left as they are

- **Add to order sits close to the bottom of the frame** (`slop/popover-bottom.png`). The popover hangs over the footer. A wider frame brings the footer rule in; a tighter one clips the radius. The radius is whole, with the corner close to the edge.
- **Catalog reasons** read like generated merchandising: “Ordered most,” “Your history,” “Low stock at your store,” “Pairs with paddles” (`slop/catalog-reasons.png`). They are not in the approved copy, so they stay.
- **Repeated ledes.** “Orders for Engage Pickleball,” “Saved orders for Engage Pickleball,” “Products available to Engage Pickleball,” “Prices for Engage Pickleball.” Same pattern on every page. Left, because the approved copy list did not include them.
- **Two names for the wait.** Messages says Pending Fulfillment. The confirmation says Ship date pending. Left.
- **Mobile quick order** shows one line and the full $19,306.50 (`slop/mobile-stub.png`). It is a separate screen the film does not use.
- **“Saved” above Match kit** is a small grey meta label, sentence case, not an uppercase eyebrow. Left.
- **“Your rep confirms timing.”** on the cart is vague. Left.
- **PO-098 shows Paid.** It has no invoice on the invoices screen. PO-118 and PO-104 match their invoices. Paid is there so the status cell is not blank.
- **The two card shots float on white.** The rest of the dashboard is out of frame so the card reads at a distance. A sliced header was the worse option.
- **Fractional nudges that are doing a job:** the check’s −0.8px, the pill icon’s −0.5px, and the integer rail row. They stay.

Checked and not found: uppercase eyebrows in the product UI (the only uppercase label is the dev switcher, which the film hides), inconsistent icon stroke (16px, 1.5), a dimmed summary during Placing order, or a middle dot.
