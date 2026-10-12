# JOOLA B2B Quick Order — Design & UX Decisions

Condensed reference of the reasoning behind this mockup, grouped by topic. Full detail in `design-considerations.txt`; round-by-round history in `CHANGELOG.md`.

## Navigation & wholesale identity
- One identical wholesale sub-nav on every screen (brand dot, tabs, cart, account switcher) — three divergent versions early on read as "the nav keeps changing."
- Identity order: **org first, person second and muted** ("Pickleball Central" / "Anna Bright · Buyer") — shared-account B2B tool, not a personal consumer account.
- "Wholesale" stated exactly once (in the sub-nav) — a duplicate tag next to the logo was redundant and physically collided with another control.
- Main-header cart icon removed for B2B (shared storefront with DTC) — one cart, one icon, living where it also shows a running total.
- Cart control is icon-only, no "Cart" text — icon + live $ + badge already say it.

## Pricing & cost clarity
- All totals (Quick Order, Cart, header pill) are computed live from qty × price — no hardcoded strings, since the whole point of bulk ordering is changing quantities fast.
- Cost numbers are deliberately the loudest thing in their row — bigger/bolder than labels, matching the priority called out early.
- Tier hints are two-tone (gray label, bold price) so the actionable number stands out.
- Tier %/MOQs modeled on real wholesale convention (keystone discounts, case-pack MOQs), not arbitrary numbers.
- "Low stock" merged into the MOQ line instead of a separate "Only N left" row — keeps every card the same height regardless of stock state.
- In-stock (default case) shows zero extra UI — badges only earn their place for states worth flagging.

## Catalog
- Category chips sit above Recommended For You — the primary action, reached first.
- Recommended For You is its own visually distinct section (different logic — history/trends — than plain browse).
- Recommended's toggle actually hides its own description copy when off, not just the cards — otherwise the toggle looks broken.
- Recommended badges are specific and varied (reorder history / discovery / social proof), not one repeated label.
- Category labels dropped from the main grid (redundant with the selected chip); kept on Recommended cards, where they explain an out-of-category surprise.
- Retail/wholesale pricing toggle lives in Catalog's toolbar, not the shared nav — it's a demo affordance, not navigation.

## Cart & Checkout
- Line items grouped by source ("Added from Quick Order" / "Added from Catalog") — makes the multi-source cart behavior visible, not just true in theory.
- Every add-to-cart is a real DOM row (merges by SKU if already present); Cart's own steppers/remove edit real rows. Subtotal is always a fresh sum of visible rows — no separate accumulator to drift out of sync.
- Product-image placeholder is a fixed 56×56 square, exactly matched to the header spacer — a stray width/size class conflict had made it a rectangle, which read as "table alignment is off."
- Order Summary labels (Subtotal / Estimated shipping / Total due) and PO number format match Invoices' Order column — same underlying data, not two coincidentally-similar mockups.
- Net 30 selected by default over Credit card — matches this account's actual standing terms.

## Templates & Order History
- Expanding one card no longer stretches siblings — real cause was CSS Grid's default `align-items: stretch`, not a JS scoping bug.
- Expand/collapse is instant, no animation — an animated version was tuned twice, still read as choppy, and was removed rather than kept fiddling with.
- Matching vertical rhythm between the two screens (previously drifted paddings) — small inconsistency, but noticeable side by side.
- Names are real JOOLA-sponsored athletes ("Anna Bright," "Lea Jansen," "Ben Johns"), consistent across buyer identity, templates, and order history — reads as one real team.

## Invoices & Terms
- Credit-line numbers ($4,200 of $10,000) match Checkout exactly — same account fact, shown once, consistently.
- "Paid" reuses existing success green; "Due in N days" is the one genuinely new state, and earns its color from JOOLA's own unused warning token rather than an invented one.
- Redundant eyebrow labels removed once the active nav tab already states the section.

## Color, tokens & consistency discipline
- All meaningful color (identity blue, warning, success, error) pulled from real joola.com tokens — verified live, not guessed. A reference screenshot's unmatched bright accent was deliberately not copied.
- Radius/font/spacing pulled from the real site's computed styles (found the real font is self-hosted, not served by the Typekit link; found a "monospace" utility that was silently falling back to system monospace).
- All click-only controls (toggles, chips, pills) disable text selection via one shared rule, not patched per-instance.

## Challenges & considerations not solved here
**Hard bugs along the way:**
- "Nav keeps moving" took four rounds to fully kill (markup drift → three divergent nav-bar builds → sticky-switcher/scroll conflict → scrollbar-gutter shift) — each fix was real, the bug just had more than one cause.
- "Opening one Template card opens the others" looked like a JS bug; was actually CSS Grid's `align-items: stretch` inflating siblings.
- Order History's expand/collapse animation was tuned twice, still read as choppy, and was pulled entirely for an instant toggle — a deliberate stop, not an unfinished effort.
- Cart's pricing engine had a real architecture bug (a directly-bumped total could be silently overwritten by Cart's own steppers) — fixed by making every addition a real row, not patching the symptom.
- Three Cart alignment bugs surfaced back to back, each exposed by fixing the last: rectangular thumbnail → oversized header row → "Product" label 72px off the page margin.
- Original plan was Paper, not hand-coded HTML — hit the weekly MCP credit limit 4 screens into a 7-screen rebuild.

**Flagged but deliberately not built:**
- DTC ↔ B2B mode switching — the "Switch to Retail Store" link was removed rather than kept as a fake stand-in; real version needs gated-account logic and a rule for what happens to an in-progress B2B cart mid-switch.
- No native messaging — no in-app way to ask a rep about an order or clarify a PO; still email today.
- Restock notifications are a UI stub with no subscription logic behind them.
- No admin dashboard — nothing for managing purchasing access, spend limits, or approval permissions.
- No approval workflow — one role ("Buyer") only, no manager/approver path.
- Payment and credit-line limits are visual only, not enforced.
- Search stayed intentionally static (scope decision, not a shortcut).
- Recommended For You's badges are hardcoded, no real history data behind them.
- Catalog and Quick Order don't share one product identity (Catalog items lack real SKUs), so the same product can double up as two Cart lines instead of merging.
- Mobile coverage is Quick Order only — every other screen is desktop-only, set as scope from round one.
- Product Detail was retired outright — assumed tiered pricing this fixed-price distributor doesn't have.
- No shipping/fulfillment modeling — single ship-to, no partial shipments.

## Attention to detail — specific redesigns and the logic behind them
- **Typographic hierarchy for cost clarity**: Quick Order's total (24→38px), line totals (→17px bold), PDP unit price (24→30px), Catalog prices (16→17px) — all bumped once cost clarity was named a top priority, so the cost answer is always the loudest thing in its row.
- **Functional realism over cosmetic realism**: insisted on live qty×price math everywhere instead of plausible-looking hardcoded strings — a materially higher bar, and the reason the real cart-state bug above was even findable. Stock states (In/Low/Out) were asked to actually affect the add-to-cart flow, not just show a badge.
- **Cutting rather than adding, repeatedly**: eyebrow labels, explanatory sentences, and a specific stock count ("Only 8 left" → "Low stock") were removed once judged redundant with something already visible — a standing rule, invoked by name ("don't add visual or cognitive clutter"), used again to justify removing the duplicate "Wholesale" nav tag.
- **Choosing to stop, not just to add**: the Order History animation was tuned twice then removed outright once it wasn't earning its complexity — a considered decision, not an abandoned effort.
- **Compactness in controls**: "Switch to Retail Store" went from a bulky text link to a single icon (then was removed entirely rather than kept as a fake stand-in); the Cart pill dropped its "Cart" text label since the icon + live amount + badge already say it.
- **Product Detail was disabled outright, not just deprioritized** — grayed, unclickable, moved to the end of the screen list, once the reasoning was made explicit: it exists for tiered pricing this distributor doesn't have.
- **Brand authenticity as a specific, repeated ask**: placeholder names became real pro pickleball players, then were refined again to only use athletes actually sponsored by JOOLA (verified against JOOLA's own roster) — accuracy, not just realism. A reference screenshot's accent color was rejected specifically for not existing in JOOLA's real palette, even though it looked fine on its own.
- **Pixel-level accountability**: several rounds were "look at this screenshot, is this off?" — a header not lining up with its own control, a thumbnail rendering as a rectangle instead of a square, a label sitting 72px off the page's true margin. None were functional bugs; each was chased to an exact, provable pixel cause rather than nudged until it looked better.
