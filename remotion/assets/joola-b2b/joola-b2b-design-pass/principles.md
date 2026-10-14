# JOOLA B2B portal — product principles (r9)

Customer-facing wholesale buyer portal only. Derived from B2B ordering UX (Shopify B2B / Trade, Faire, NetSuite SuiteCommerce MyAccount, Amazon Business, Grainger, Ordoro) and classic HCI (Rams, Hick, recognition > recall, Fitts, error prevention, forgiving formats).

## Research takeaways

Wholesale buyers are **restocking under account rules**, not browsing lifestyle merch. Portals that win:

- Show **account price, terms, MOQ/case, stock honesty, and credit** before submit — not after rejection.
- Make **reorder from history / saved lists** one or two actions; SKU/name search for planned buying.
- Keep **PO, ship-to, need-by** on one review surface with a sticky total.
- Use **deliberate friction** only for irreversible or high-risk commits (over credit, unusual size, duplicate PO); keep everyday restock frictionless.
- Prefer **recognition** (recent orders, templates, address cards) over recall (retyping SKUs and addresses).

## Rules for this portal

1. **Less but better.** Every control earns its place; cut before adding.
2. **Reorder in one tap.** Rail “Add” and templates rebuild lines without retyping.
3. **Never retype known facts.** Ship-to cards, saved PO patterns, account prices, last-bought context.
4. **Totals always visible.** Sticky footer on QO; sticky summary on cart; confirmation repeats the same ledger total.
5. **Credit impact before commit.** Cart shows used / this order / remaining on Net 30 before Place order.
6. **Confirm only irreversible or high-value actions.** Place order → confirmation. Soft undo for line remove. Extra notice when order exceeds remaining credit or is unusually large vs recent history.
7. **Warn, don’t block, on recoverable mistakes.** Duplicate PO hint; need-by is a request, not a schedule.
8. **Recognition over recall.** Search suggests products; rail shows recent POs by name; invoices link the same order id.
9. **Fitts: big targets for frequent actions.** Qty stepper 36px hits; primary CTA 40px; rail Add on hover without stealing layout.
10. **Hick: one primary path per screen.** QO owns product search; cart owns checkout fields; no competing chrome search.
11. **Forgiving formats.** Qty presets + steppers; optional PO; need-by unchecked by default.
12. **Error prevention at the line.** Stock exceptions as quiet tags; tier hints; no warehouse jargon for buyers.
13. **Same numbers everywhere.** Single ledger SSOT for unit, line, order, invoice, credit, messages.
14. **Show progress, not process.** Confirmation states what ships next and points to invoice — no fake multi-step wizard.
15. **Breathing room on identity chrome.** Account and cart pills share height; logo tile and padding are optically even — cramped chrome erodes trust.

## Deliberate friction (when to slow the buyer)

| Trigger | Friction | Why |
| --- | --- | --- |
| Place order | Confirmation screen (not a modal essay) | Irreversible commit; clear receipt |
| Order > remaining credit | Inline hold notice on cart before Place order | Prevents “rejected after submit” |
| Order ≫ recent history (e.g. > 2× last PO) | Quiet “larger than usual” note on cart | Catch fat-finger qty without blocking |
| Duplicate PO # vs open invoice | Soft warning under PO field | Avoid double-billing disputes |
| Remove line / clear cart | Inline undo toast (2–3s) | Forgiving; no confirm-dialog spam |

## Journey (Engage Pickleball buyer, busy Tuesday)

| Step | Friction removed | Deliberate friction kept/added |
| --- | --- | --- |
| Find product | One QO search; rail reorder | — |
| Set qty | Presets + stepper; tier hint | — |
| Review cart | Sticky total; same ledger prices | Larger-than-usual note when warranted |
| PO | Optional; placeholder example | Duplicate-PO soft warning |
| Ship-to | Address card + Change | — |
| Need-by | One short line; off by default | — |
| Place order | One primary CTA | → confirmation screen |
| Confirmation | Order id, total, ship-to, next invoice | — |
| Invoice | Same INV / total / Net 30 meter | — |
| Return | Quiet returns link on cart | — |
