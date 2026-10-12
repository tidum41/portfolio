# NetSuite notes for JOOLA B2B portal (design pass)

**Scope (Mudit):** Work only on the **customer-facing B2B portal UI**. Do not build internal sales-rep screens, NetSuite admin, custom forms, or order-type tooling. NetSuite research below is background so customer-side fields stay accurate: PO #, ship-to, ship date, warehouse notes, terms, status labels, returns path.

Goal: keep ordering cognitively simple while reflecting how a buyer’s order lands in JOOLA’s NetSuite sales orders.

## 1. Sales Order record (research only — not a UI to build)

What a placed customer order becomes inside NetSuite. Used to choose which fields belong on the **buyer** portal; not a brief for a rep console.

| Concept | NetSuite field / behavior | Notes for B2B UI |
| --- | --- | --- |
| Customer PO # | `otherRefNum` (UI label **PO #** / PO/Check Number) | Optional at checkout; buyers need it for their AP match |
| Ship date | `shipDate` | Requested ship date; warehouse may still adjust |
| Ship via | `shipMethod` | Internal / logistics; not a customer primary control |
| Location / warehouse | `location` | Drives fulfillment; surface as quiet “ships from” / availability, not a picker |
| Memo / warehouse notes | `memo` | Free text; maps cleanly to collapsed “Notes for warehouse” |
| Order type | `orderType` | Internal classification (pick strategies, reports). Examples Mudit recalled: replacement, compensation/warranty, new/standard. Not a default checkout dropdown for customers |
| Custom form | Form / custom form on SO | Rep-side; hide from portal |
| Terms | Payment terms on customer / SO (e.g. Net 30) | Show next to credit line; do not re-ask at every step |
| Status (approval) | `orderStatus` A = Pending Approval, B = Pending Fulfillment | Default depends on company preference (approval on/off) |
| Status (fulfillment / billing) | System statuses with Advanced Shipping: Pending Approval → Pending Fulfillment → Partially Fulfilled → Pending Billing → Billed (plus Closed / Canceled) | Customer “where is my order” should use these labels, not vague “Processing” |
| Credit limit / hold | Customer credit limit; hold Auto/On/Off | Portal should show used / available; hold is an edge state, not everyday chrome |

### Sources (Sales Order)

- [Sales Order schema (Browser 2026.1)](https://system.netsuite.com/help/helpcenter/en_US/srbrowser/Browser2026_1/schema/record/salesorder.html?mode=package) — `otherRefNum`, `shipDate`, `shipMethod`, `location`, `memo`, `orderStatus`
- [Sales Order script record (Browser 2025.2)](https://system.netsuite.com/help/helpcenter/en_US/srbrowser/Browser2025_2/script/record/salesorder.html) — `otherrefnum` (PO #), `ordertype`, `shipdate`, `memo`, ship-to select
- [Approving a sales order (REST)](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_159795516182.html) — Pending Approval (A) → Pending Fulfillment (B)
- [Viewing the status of sales orders](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N1220604.html) — full status list with Advanced Shipping, including **Billed**
- [Managing customer credit limits and holds](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N1080144.html)

## 2. SuiteCommerce / MyAccount customer portal (reference)

What NetSuite’s own **buyer** surface already trains customers to expect. Our prototype stays in this lane.

| Capability | Where it lives | Relevance |
| --- | --- | --- |
| Quick Order | SuiteCommerce Advanced — search/add by SKU in list form | Core of this prototype |
| Reorder from history | My Account / SuiteCommerce B2B | Rail “Recent orders” + templates |
| PO number at order | Common B2B checkout pattern; SO `otherRefNum` | Add optional PO on cart |
| Ship-to address book | Customer addresses / Ship To Select on SO | Ship-to selector from saved store addresses |
| Order history | My Account purchases | Keep recent orders quiet, not a second catalog |
| Invoices / statements | SuiteCommerce MyAccount | Invoices screen + Net 30 credit |
| Returns / RMA | My Account: View Returns, Request a Return | Replacement / warranty path — not an order-type dropdown |

### Sources (SuiteCommerce B2B)

- [SuiteCommerce: B2B](https://www.netsuite.com/portal/products/ecommerce/products/ecommerce/b2b.shtml) — reorder, quotes, MyAccount, self-service returns
- [Set up B2B functionality on SuiteCommerce](https://developers.suitecommerce.com/b2b-functionality.html) — quotes, reorder items
- [Quick Order](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4618800500.html) — SKU / part-number list add
- [SuiteCommerce MyAccount overview](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_159786656208.html) — invoices, statements, request return; SCMA does not replace full Quick Order entry

## 3. What we added to the prototype (and why)

Only fields that remove a phone call or a failed AP match without bloating the first screen.

1. **Optional PO number on cart** — Maps to `otherRefNum`. Buyers often cannot place without their internal PO; optional so it never blocks a quick restock.
2. **Requested ship date on cart** — Maps to `shipDate`. One date field; default filled from ledger story date so the screen stays calm.
3. **Ship-to selector (saved store addresses)** — Mirrors NetSuite Ship To Select / address book. Choosing a known Engage location beats pasting an address every time.
4. **“Notes for warehouse” collapsed** — Maps to `memo`. Progressive disclosure: zero visual weight until opened; no fake “order type” needed for packing notes.
5. **Replacement / Warranty via Returns link** — Order type stays internal. Customers who need replacement/warranty leave the standard new-order path and use Returns / RMA (SuiteCommerce MyAccount pattern).
6. **Net 30 next to credit** — Terms shown beside used/available in the account panel and on the invoices credit block. Removes a second “terms” explanation in body copy.
7. **Sales-order status on order details** — Messages detail uses **Pending Fulfillment** (NetSuite flow). Invoice table keeps **Paid / Pending / Overdue** (AR language for billed invoices).
8. **Quiet per-line “Ships from …” + availability** — Reflects `location` / inventory without a warehouse picker. One short meta line under SKU.

## 4. What we left out (and why)

| Candidate | Rejected because |
| --- | --- |
| Any sales-rep / NetSuite admin view | Out of scope; portal is buyer-only. |
| Order type dropdown (new / replacement / warranty) | Internal SO classification; customers use Returns/RMA instead. |
| Ship via / carrier picker | Logistics chooses; wrong primary action for a buyer. |
| Custom form / rep-only fields | Not customer-facing. |
| Credit hold banner as default chrome | Rare edge; credit used/available already answers “can I order?” |
| Full status taxonomy on invoice rows (Partially Fulfilled, Pending Billing/Partially Fulfilled, …) | Invoice screen is AR; overload. |
| Bulk CSV upload as a peer CTA to search | Demoted (link in rail). Primary job is search → qty → add. |
| Duplicate long ledes explaining credit + terms on every page | Cut; credit panel + one cart note suffice. |
| “Save template” as equal-weight primary next to Add all | Demoted to secondary text so each screen has one obvious primary. |

## 5. Cognitive pass (non-NetSuite) applied alongside

- Plain titles: **Quick order**, **Cart**, **Catalog**, **Invoices**.
- One primary CTA per screen (Add all / Place order).
- Progressive disclosure for advanced cart fields and warehouse notes.
- Catalog section **All products** (not a decorative category slogan).
- Slimmer message chrome: order context keeps identity + amount; ship/status live in details (no triple repeat).
- Rail labels shortened: **Templates**, **Recent**.

## 6. Ledger invariants (unchanged)

- Order total **$19,306.50** (Perseus 120 × $134.98 + Hyperion 24 + HC-40 48 + Bag 6)
- Credit used **$24,308.90** / available **$25,691.10** / limit **$50,000**
- Invoice statuses: Paid | Pending | Overdue (INV-1021 Overdue)
- `check-prototype.mjs` remains the mechanical gate
