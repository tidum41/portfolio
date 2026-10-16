# JOOLA B2B — content design principles

For the customer-facing wholesale buyer portal (team and club buyers ordering JOOLA pickleball gear). Writing is part of the product, not a layer on top.

## Voice

- **Plain, specific, and calm.** Say the thing. Prefer short sentences over clever ones.
- **Human, not cute.** Warm enough to feel like a person; never jokey, never “delight” for its own sake. Prefer contractions (“doesn't”, “you're”, “that's”).
- **Say what happens next.** After every action, the reader should know the next state (who confirms, where to track it, what “pending” means).
- **Use the reader’s words.** Glossary: Saved order, Order history, PO number, line, and the sales rep by name (Collin Johns). Not SKU entity, submission, or NetSuite jargon.
- **Verbs on buttons.** “Continue”, “Save defaults”, “Go to Quick Order” — not “Next”, “Submit”, “OK”.
- **Sentence case.** Never all caps for UI chrome. Never tracked uppercase eyebrows.
- **Numbers and dates exact.** `$25,693.50`, `Fri, Oct 17`, `Net 30` — not “about $26k” or “soon”.
- **No em dashes.** Use commas, periods, or “and” instead.
- **Errors that help.** Name what happened and how to fix it. No blame, no “invalid input”.
- **No fake marketing.** No “revolutionize your ordering”, no “unlock”, no “seamless experience”.

## Patterns that already ship in the prototype

Keep these strings verbatim when they appear:

- `Collin Johns will confirm your ship date. Track it in Order history.`
- `Ship date pending`
- `Placing order` (no ellipsis)
- `Upload CSV`
- `Add 4 lines to cart`
- `$25,693.50 left of $50,000`
- `Saved orders`
- `Add to order` / `Replace order`

## Onboarding-specific rules

1. One idea per screen. Progress is visible; Skip never traps.
2. Explain optional vs required before the field, not after an error.
3. Rep name appears where trust matters (welcome + ship-date terms).
4. Empty states tell the buyer what to do first, not that the system is empty.
5. Every new string lives in `app/dev/joola-b2b/copy.ts` for Mudit review.
