# JOOLA condensed case study, copy v6 (depth from existing material, draft for Mudit's approval)

Branch: claude/joola-condensed-2026-11-18. Nothing here is built. v6 has no questions for Mudit. Every open tag from v5 is resolved from a source or the line is rewritten to claim only what a source supports. Where no source records a reason, the section describes what the v18 prototype does, with its exact states and strings, in place of a stated reason. Figures are static v18 captures in `CaseStudyFigure` for now. Hero stays as it is. The approved case study disclaimer (DECISIONS section C) goes under the hero unchanged and is not in this file.

Source key (notes for Mudit, not page copy): T = `sources/aug19-call-full-transcript.md`, D = `DECISIONS.md`, CM = `sources/from-cookie-monster-ii_2026-11-18.md`, MSC = `sources/doordash/metrics_slide_copy.md`, CSN = `sources/CASE-STUDY-NOTES.md`, OI = `sources/history-2026-11-12/OPEN-ITEMS.md`, CL = `sources/history-2026-11-12/CHANGELOG.md`, TD = `taste/DESIGN-taste-draft.md`, V18 = `prototype-v18/src`. The transcript has no speaker labels, so quotes are attributed to the JOOLA sales team only.

## Metadata block (sourced from the current page, no change)

- Timeline: 10 weeks, Summer 2026
- Scope: Product design, Interaction design, Prototyping
- Collaborators: already in the page's Team row, left as is.

Headings read alone:
1. A buyer who knows the SKUs can build an order from one dense ledger.
2. Distributors need self-service ordering for wholesale orders and one-off orders, that reflect their business pricing.
3. An order sent by email or spreadsheet reached NetSuite only when someone typed it in.
4. An import should add the valid rows and list the ones it skipped.
5. Autofill should mark what it filled in without a chip on every field.
6. Order confirmation and Messages both landed on Order history, so orders and invoices became one tab.
7. Net 30 credit shows up once, as one account meter.
8. Over-limit orders wait in a queue for a rep... / ...but I haven't picked a layout for that queue yet.
9. Order turnaround is the number that would show the portal works.
10. I demoed it inside JOOLA, and it's on the roadmap.

(Section 8 holds the one ellipsis pair.)

---

## 1. The portal

**Kicker:** Solution
**Overview line:** JOOLA's B2B portal is a wholesale ordering site where distributor and retailer buyers place orders and JOOLA reps approve the ones that go over a credit limit.
**H2:** A buyer who knows the SKUs can build an order from one dense ledger.
**Evidence:** Buyers already typed quantities into a spreadsheet: "They go in and type it. I want two of these. I want six of these. I want eight of these."
**Explored:** An entry pad and a grouped list, weighed against the dense ledger.

I decided on the dense ledger, with the account price on every line. Zero-quantity lines stay hidden, so the ledger shows only what is in the order.

**Figure:** v18 `quick-order`, the dense ledger. Component: `CaseStudyFigure`.
**Caption:** Each line shows the product, its SKU, the account price, a stepper and its line total.

**Rejected, one line each (bold):** **Tiers and case packs were out because each distributor has its own price and buyers work in units.**

**In the prototype:**
- A line shows a thumbnail, name, "SKU {sku}", "{price} ea", a quantity stepper, the line total and a remove control. A stock badge appears only when an item ships later or runs low, and the warehouse name is not rendered.
- Search matches a name or a SKU, "/" focuses it, and an empty search says "No results for “{q}”" with "Try a SKU or a shorter product name."
- The footer reads "N lines, N units" and "Draft saved {savedOn} by {savedBy}".
- An empty order says "Your order is empty." and offers recent orders.

Source: evidence T196. Entry pad, dense ledger and grouped list were the three Paper options, and the dense ledger was picked ("Option B"), D203 (no reason recorded). Tiers removed and "One account price per SKU", CL39 and D135. "Buyers work in units", D136. Preset chips and "Use last" removed, D139 and D140. Line anatomy, V18 `screens/QuickOrderPage.tsx:899-934`. Zero-quantity lines hidden, `:294` and `:309`, D217. Search and empty strings `:764-765`, `:258-271`. Footer `:318-320`, `:1011`. Empty `:959`. Stock badge and hidden warehouse, V18 `data/ledger.ts:572-577`. Internal ops rule, TD36 and D223.

---

## 2. The problem

**Kicker:** Problem
**H2:** Distributors need self-service ordering for wholesale orders and one-off orders, that reflect their business pricing.
**Subline:** The current loop for ordering requires back and forth emailing, spreadsheet order forms, and causes all parties involved to focus on aspects that can be designed for.

Small orders were a key part of the problem: buyers placing them still faced a 2–3 day turnaround because reps manually entered orders and resolved issues over email or WeChat. That made self-service ordering especially valuable for these buyers.

**Figure:** Step-flow pills, two rows. Grey pills joined by arrows, the problem step as a light-red pill with red text. Built as site markup. The figure fills the content lane and wraps its pills at the 768 and 1200 breakpoints (design/RULES.md, site grid).
- Before: Buyer emails a spreadsheet or a list > Rep reads and checks it > Rep keys it into NetSuite > Issues go back and forth over email or WeChat (light-red pill)
- In the portal: Buyer searches or imports > Buyer reviews flagged lines > Buyer places the order > Rep steps in when an order needs one

**Caption:** Before, every order passed through a rep, and in the portal the buyer builds it.

Source: heading and subline D146, small orders sentence CSN3 and D17, all verbatim. The "2–3" keeps the en dash. Open question C1 stays open: the call says "might be a three to four day process" at T229 (hedged) and "could take 24, 48, 72 hours" at T231. Pill steps match T196 to T201 and T226. WeChat is Mudit's wording only, the call never mentions it.

---

## 3. Research

**Kicker:** Research
**H2:** An order sent by email or spreadsheet reached NetSuite only when someone typed it in.
**Evidence:** An Aug 19 call with JOOLA's sales team.

Buyers sent a spreadsheet or an email, and someone keyed it into NetSuite, so any stock or card problem went back to the buyer over email for another round. The sales team wanted accounts to place their small orders quickly, and their own term for those was "onesie twosie."

**Figure:** Two pull quotes set as site type, no screenshot.
- "they run into many things that aren't correct. And so they're just like forget it. I'll just call my rep." JOOLA sales team, Aug 19 call.
- "how much time our sales team is spending on these admin type of things as opposed to selling." JOOLA sales team, Aug 19 call.

**Caption:** The sales team described buyers giving up on the old site and reps doing admin work as opposed to selling.

**What else the call showed:** Buyers used order forms "because it's really the only way right now to guarantee that their pricing is going to be correct." Sales had also heard "I couldn't find the product I needed" and that the pricing was wrong. Several people at one account "just share the login."

Source: manual keying T197. Spreadsheet habit T196 to T198. Email back and forth T201, T225, T226. "Onesie twosies" T152 to T153 ("being able to do that quickly") and T282, with the safe framing from CSN8 to CSN13 (no share, no "most"). Quote 1 is T169, quote 2 is T235. Order forms and pricing T194. Missing products and wrong pricing T168. Shared login T214. "Small sales team" is on the page only in the Outcome, from D126.

---

## 4. Importing orders

**Kicker:** Exploration: importing orders
**H2:** An import should add the valid rows and list the ones it skipped.
**Evidence:** Buyers sent order forms because it was the only way to be sure their pricing was correct.
**Explored:** Three import iterations, from an error alert only to the final import with a drop zone, "Add your order form."

I decided the import adds the valid rows and lists the skipped ones. It never overwrites an address silently, so when the file's address differs from the account, it flags the difference and asks.

**Figure:** Two panels with tags.
- Earlier version: Quick order after importing a file with a bad row, showing only the alert "Row 21 couldn't be imported." (v18 viewer entry for the alert-only import)
- Final: row-level flag on the line, valid rows added, skipped rows listed (v18 `quick-order`, Final, loaded with the error demo file)

**Verdict under the Earlier version tag (bold, one line):** **It named the row and nothing else.**
**Caption:** The earlier version only named the failed row, and the final one keeps the valid rows.

**In the prototype:**
- Each row in the preview gets a status: "Ready", "Combined with row N", "Unknown SKU (skipped)" or "Missing quantity (skipped)". The summary says "N rows will be skipped." Rows sort by file row, then by SKU.
- A normal import ends with a toast, "N lines added to order" and "N rows skipped". If nothing is valid it says "No rows could be added. Check the SKUs and quantities in the file."
- A file with the wrong shape gets a plain error, for example "No quantity column found" or "This is not a CSV or Excel (.xlsx) file."
- A form for a different account says "This form is for {name}. Sign in to that account to use it." and blocks Add. An address that differs from the account says "Your order form has a different address." and offers "Use account address" or "Use it for this order".
- A quantity far above what an account usually orders is flagged "Usually N, check quantity", with "Change to N" and "Keep N". The flag fires when a quantity is more than five times the median of that account's past quantities for the SKU.

Source: evidence T194. Three import iterations and "Keep it to 2–3 iterations at most", D30 to D33. Alert names the row only, CM22 and CM23. Add valid rows and list skipped ones, CM26. Flag and ask on address, never silently overwrite, CM27. Sorted by row then SKU, CM28. Row statuses and summary, V18 `components/CsvImportDialog.tsx:33-36`, `:530`. Toast and zero-valid string, `screens/QuickOrderPage.tsx:436`, `:472`, `:492-493`. File errors, `lib/csvImport.ts:169-174`. Wrong account, `CsvImportDialog.tsx:519`. Address note, `screens/ReviewPage.tsx:733-748`. Quantity flag, `screens/QuickOrderPage.tsx:330-336` and `viewer/qtyCheck.ts:7` (factor of 5, usual is the median past quantity). The error state and the quantity flag must look distinct, CM24.

---

## 5. Reviewing autofill

**Kicker:** Exploration: reviewing autofill
**H2:** Autofill should mark what it filled in without a chip on every field.
**Evidence:** I asked for a cognitive-load cleanup pass on the review screen.
**Explored:** A baseline with a chip on every field, and three autofill iterations before the final.

I decided the review marks an imported value once and keeps a Default tag only where a default applies. The default address reads "(default)" in the dropdown, and an email from the account shows a Default tag without opening anything.

**Figure:** Two panels with tags.
- Earlier version: chip on every field (build v15, not in the v18 folder, needs a capture from the JOOLA box)
- Final: v18 `review`

**Verdict under the Earlier version tag (bold, one line):** **It put a chip on every field.**
**Caption:** The final review keeps the default tags and the quantity flag, and the heading "Order details" is gone.

**In the prototype:**
- An imported email carries "Autofilled from import". An address near one on the account says "Close to {near} on your account." An address from the order form that is new shows "Not on your account yet", with "Save {email} to account" unchecked.
- A bad email says "Enter an email address like name@company.com." A repeat says "That address is already on the list."
- Removing an imported chip goes back to the default, so there is no "Use account default" link.
- Saved addresses confirm with "Saved to your account. It is in the list now."

Source: cleanup pass t309 and t310, CM29 to CM35 (heading removed CM33, "Use account default" removed CM34). Chip on every field is the v15 baseline, CM15 and D28. Autofill 1, 2, 3 plus baseline, D27 and D28. Default tag, `components/ConfirmEmails.tsx:88`. "(default)", `screens/ReviewPage.tsx:397`. Chips and notes, `ConfirmEmails.tsx:86`, `:136-138`, `:154`, `:162`, `CsvImportDialog.tsx:181`. Email errors, `ConfirmEmails.tsx:55-56`. Saved confirmation, `ReviewPage.tsx:416`. Emails not on the account, CM37 to CM40. No source records why the chips went, so the section describes the final behavior in place of a reason.

---

## 6. Orders and invoices

**Kicker:** Decision: orders and invoices
**H2:** Order confirmation and Messages both landed on Order history, so orders and invoices became one tab.
**Evidence:** Both earlier prototypes kept Orders and Invoices as two tabs. I questioned that only after mapping where order confirmation and Messages sent a buyer.
**Explored:** An order that expands in place, a side panel, two tabs and one Orders tab.

I decided on one Orders tab, with the invoice shown on the order it belongs to. The panel is the full view of an order, so I dropped "Open full order."

**Figure:** Two panels with tags.
- Earlier version: two tabs, Orders and Invoices (v18 viewer entry for the two-tab version)
- Final: one Orders tab, order history with the side panel open (v18 `order-history`)

**Verdict under the Earlier version tag (bold, one line):** **Order confirmation and Messages led to Order history, and invoices sat in another tab.**
**Caption:** The final version keeps each order and its invoice in one list.

**Rejected, one line (bold):** **Open full order went because the panel is the full view.**

**In the prototype:**
- One tab is titled "Orders", with the columns Order, Placed, Status, Invoice and Total, and the filters All, Unpaid, Shipped and Delivered. The two-tab version has Order, Number, Placed, Status and Total.
- Statuses run Pending approval, Pending confirmation, Confirmed, Pending fulfillment, Shipped and Delivered, with Not approved and Cancelled as the other two.
- The panel shows when and by whom the order was placed, and its sales order. The first five lines show, then "Show all N".
- An invoice block on the order shows "Pay {amount}" and "Net 30". A replacement order says "Replaces {id}. Nothing to pay."
- With no history, the list says "No past orders yet."

Source: story CM79 and D92 (a memory paraphrase of Mudit, tagged "mem 11-18"), so the page states only the two-tab fact and the mapping. Two tabs in the first build, `prototype-v18/COMMITS.txt:23` and `:29` (that covers the first build only, CM79 is the source for both). One Orders tab, MSC23 and the commit note "merged Orders and Invoices is the clean=1 default" (`COMMITS.txt:29`). Expand in place replaced by a side panel (no reason recorded), CL108 and D208. "Drop Open full order, the panel is the full view" and his question "whats the difference between open full order and summary?", D207. Aligned status column ask, "chips need to be aligned and start at the same point in one column", OI36. Merged columns and filters, V18 `screens/OrderHistoryPage.tsx:200-204`, `:303`. Two-tab columns `:208-212`. Status lifecycle D137 (Mudit confirmed Nov 11) and `components/ui/primitives.tsx:943-952`. Panel facts `OrderHistoryPage.tsx:353-418`, `:469-476`. Invoice block `:491-515`. Empty `:153`. The merged Invoices route redirects to Orders, `screens/InvoicesPage.tsx:131`.

---

## 7. Credit

**Kicker:** Decision: credit
**H2:** Net 30 credit shows up once, as one account meter.
**Evidence:** I asked, "is net30 even worth having?" A check of nine wholesale portals, run for me on Nov 12, read one account-level meter where a meter existed, and none of the pages it read described a bar per invoice or per order.
**Explored:** A Net 30 bar on every invoice, then one account meter with one cart line.

I decided on one account meter on Invoices, showing credit used against the limit with the amount left as a number, and one quiet line in the cart. Invoice rows keep a status line under the due date and an amber Due pill.

**Figure:** One figure, two crops. v18 `invoices` (Net 30 meter) and the cart line from v18 `cart`.
**Caption:** The meter holds the whole account's credit, and the cart adds one line.

**Rejected, one line (bold):** **A bar on every invoice went after I asked whether Net 30 was even worth having.**

**In the prototype:**
- The meter is titled "Net 30 credit", with the amount left as a number. At 90 percent used it turns amber and shows "Near limit". With nothing left it shows "At limit". A legend reads "Open invoices", "This order", "Covered by credit", "Over the limit" and "of {limit} limit", and "View Net 30 terms" opens the terms.
- A due date reads "Due in N days" and turns amber within 7 days, and a late one reads "N days overdue" in red. The status pill is green for Paid, red for Overdue and amber for Due or Processing.
- The cart line reads "Credit left after order". Near the limit its number turns amber. Over the limit it reads "Over your remaining Net 30 credit. Your JOOLA rep approves it before a ship date is confirmed."
- A buyer paying on terms sees the same meter at review. If the order is over the limit and the rep can approve it, it says "Your JOOLA rep approves this order before a ship date is confirmed." If the order cannot go through, it says "This order is over your credit limit." with "Remove lines or ask your JOOLA rep to raise your limit."

Source: "is net30 even worth having?" and "yeah drop the bar", D206. "if there is a net30 bar, just keep it as one bar progress indicator not per order?", D226. The account-level reading is OI167. Nine portals (Faire, Shopify B2B, BigCommerce B2B Edition, Amazon Business, NetSuite SuiteCommerce, Balance, Resolve, Sana Commerce, OroCommerce) and "None of the pages I read describes a bar per invoice or per order", OI145 to OI167, with the "not found means not found in the pages read" limit at OI147. One meter on Invoices plus one cart line, invoice rows unchanged, "whatever you reccomend", D227. The 90 percent comes from Sana's widget, OI163 and OI171, not from Mudit. Meter and pills, V18 `screens/InvoicesPage.tsx:55-78`. Legend `components/CreditLegend.tsx:17-37`. Terms drawer `InvoicesPage.tsx:241-249`. Rows `:181-188`, `lib`-level timing `data/ledger.ts:936-955`, pills `:33-38`. Cart line `screens/CartPage.tsx:212-222`. Review `screens/ReviewPage.tsx:515-568`. D227 says the exact meter copy still needs Mudit's OK, so these strings are v18's current text, not approved copy.

---

## 8. The rep's side

**Kicker:** Exploration: the rep's side
**H2 (part one):** Over-limit orders wait in a queue for a rep...
**H2 (part two):** ...but I haven't picked a layout for that queue yet.
**Evidence:** Reps already decided order problems one at a time: "we go back and we ask them."
**Explored:** A ledger, a split inbox and a one-card triage view, with the triage view left out of this page on purpose.

Orders over a buyer's Net 30 credit wait in an approval queue, and I designed the rep's side of the portal as part of my internship work. I designed a ledger and a split inbox for that queue and haven't picked one.

**Figure:** Ledger and Split inbox side by side, tagged "Ledger" and "Split inbox", each captured from the v18 approval-queue harness at `/prototypes/approval-queue` in the same default state (`protoState=default`). The production route `/admin/approvals` is a single page and is not used here.
**Caption:** Both layouts handle the same over-limit queue.

**In the prototype:**
- The ledger is a table with Account, Over by, Why and Actions, and a row opens its math, its lines and a reason field. The split inbox lists "N waiting" on the left and puts the decision in a pane on the right.
- A rep sees Limit, Credit left, This order and Over by, plus Overdue when there is a balance past due, and the production queue adds "Last N invoices on time" or "No history yet".
- The reason field says "Internal only." with four quick reasons: "Paid on time", "Seasonal restock", "Credit increase pending" and "Overdue balance". A buyer who is turned down gets "{order} was not approved. Reply here if you have questions." and never sees the reason.
- An order type is set before approval: Standard, Replacement, Compensation or Sample. A replacement asks for the original order.
- Approve and Reject end in a toast with Undo. An empty queue says "No orders need review." Loading shows skeleton bars, and a failed load says "Approvals did not load."
- Admin Orders says "Confirm new orders within 48 hours." Each order shows "Received N h ago" and turns amber with "N h left" at 12 hours or fewer. A checklist headed "Goes to NetSuite" covers PO, Ship to, Needs by, Cancel by, Prices, Stock, Payment and No charge, and confirming says "{order} confirmed and sent to NetSuite."

Source: evidence T226. Rep and admin screens are Mudit's internship work, D120 and CORE. Ledger and Split inbox both kept and undecided, D145 (no pros or cons recorded anywhere), and Triage as a third harness-only direction, OI130 and `sources/copy/copy-pass-v2.md:310`. Layouts, V18 `prototypes/approval-queue/Ledger.tsx`, `Split.tsx`, `Triage.tsx`, `Frame.tsx:29-35`. Overdue and history lines, `screens/admin/ApprovalQueuePage.tsx:542-549`, `:672`. Reason, quick reasons and "Internal only.", `:66`, `:758`, enforced as "Enter a reason." at `:618-623`. Buyer notice and the reason staying with JOOLA, `state/Store.tsx:764`, `:866`. Order types `screens/admin/OrderTypeField.tsx`. Toast and Undo, `prototypes/approval-queue/useApprovalQueue.ts:107-110`. Empty, loading and error strings `ApprovalQueuePage.tsx:228`, `:201`. Admin Orders `screens/admin/AdminOrdersPage.tsx`, `orderIntake.ts:61-66`, `:133-156`, `AdminOrdersPage.tsx:453-483`. Capture note: the harness help text says the buyer sees the note, which contradicts production, so capture the reason field without that line.

---

## 9. Measuring

**Kicker:** Measuring
**H2:** Order turnaround is the number that would show the portal works.
**Evidence:** A round of back and forth "could take 24, 48, 72 hours," and the sales team needed "99.8% compliance" with its new processing SLA.

The admin Orders screen already logs each order from Received to Confirmed and says "Confirm new orders within 48 hours." Nothing is measured yet, and the baselines are the sales team's own estimates from the call.

**Figure:** One table, two blocks, set as site type.
- Metrics: Order turnaround time (today 24, 48 or 72 hours, logged Received to Confirmed in admin Orders). Adoption (asked what percent of all sales are B2B, the team answered "overall 1%, 2%", and admin Orders can split orders by Portal and Order form).
- What would show each decision worked: Import order form, the share of portal orders that start from an imported sheet. Quantity flag and autofill tags, orders a rep has to confirm with the distributor. One Orders tab, rep emails asking where an order or invoice is. Over the limit goes to the rep, rep touches per order (no estimate exists, so count first).

**Caption:** Each decision has a number that would show it worked, and none of them is measured yet.

Source: T231, T219 and T220 (the SLA, whose number the transcript renders as "40, 48 hours", so the page quotes only the compliance figure and the prototype's own "48 hours"). 1 to 2 percent, question T276 and answer T281, quoted without the rest of the sentence. Metric notes MSC13 and MSC14, decision rows MSC17 to MSC25, "Nothing is measured yet" MSC28 (reworded to avoid "shipped portal"). "Confirm new orders within 48 hours." and the Source filter All, Portal, Order form, V18 `screens/admin/AdminOrdersPage.tsx`, with "Received N h ago" and "N h left", `orderIntake.ts:61-66`. The 4 to 5 percent revenue metric is cut: the only mention is D81 and CM68, with no definition and no source. MSC14 calls the 1 to 2 percent a share of orders and MSC34 calls it a share of sales, so the page uses the call's own phrasing. The Saved orders row is out because this version has no Saved orders section.

---

## 10. Outcome

**Kicker:** Outcome
**H2:** I demoed it inside JOOLA, and it's on the roadmap.

The portal was a three-week project inside my ten-week internship, and it hasn't shipped. The people who saw the demo were very happy with it and asked whether I wanted to keep working on it, and I added the Messages thread afterward for JOOLA's small sales team.

**Figure:** None. Text close.
**Caption:** None.

**Two lessons (reflection, each a bold line plus one sentence):**
- **Map the redirects before keeping the tabs.** Both earlier prototypes kept orders and invoices apart until I mapped where order confirmation and Messages sent a buyer.
- **Every number here is an estimate.** The turnaround and adoption baselines come from the sales team's account on the Aug 19 call, and nothing is measured.

Source: demoed and on the roadmap, D117, CORE hard rules and CM84. Three-week project and ten-week internship, D121. Very happy and asked about keeping on, D122 (the names and titles stay off the page, so open question C6 does not block this). Messages added after the demo for the small sales team, D126. Lesson 1, CM79. Lesson 2, MSC28 and T231. The v5 lesson about never testing with a buyer is cut, because the pack records no buyer tests but does not prove none happened.

---

## Notes for Mudit

- Section 2 and your Nov 11 and Nov 18 wording are verbatim, with the "2–3" en dash as the single dash exception. No page copy says "two days", "9-screen" or "2 days to hours".
- What got deeper: sections 1, 4, 5, 6, 7 and 8 now carry the options explored, the decision and a block of exact v18 states (bad rows, near limit, over limit, empty, loading, error). Sections 3 and 9 use more of the call and the admin Orders screen. Tradeoffs appear only where a source records one, otherwise the behavior stands in.
- Cut from v5: the 4 to 5 percent revenue row, the "never put it in front of a buyer" lesson, the live piece proposal (still a separate go or no-go from v5, not in this file), the roadmap placeholder, the demo audience placeholder and the Messages figure.
- Code facts to handle at capture time, none of them a question: v18's Review screen shows the same Net 30 meter when a buyer pays on terms, so the page does not claim "no credit meter on checkout". The merged state redirects Invoices to Orders, so the Invoices meter capture comes from the two-tab state. The order panel still has a "View full order" link in its footer (`OrderHistoryPage.tsx:480-484`), so check the capture against D207. The invoice panel says "synced from NetSuite" (`InvoicesPage.tsx:424`), an internal system name a buyer sees, which conflicts with the internal ops rule at D223. The approved helper copy "Select a past order to see its lines and reorder." (D211) is not in v18 code.
- Rachel moves kept: overview line, Problem, Solution, Exploration and Decision labels, blunt past-tense verdicts, "I decided", bold one-line verdicts for rejected options, the ellipsis pair once (section 8), two lessons, metadata block. "Solution" is a kicker once.
- Needs assets: the Autofill "Earlier version" (v15, JOOLA box only), the Import and Orders "Earlier version" panels (v18 viewer entries), the Ledger and Split inbox captures (v18 harness), and a check that `order-history` reads as a table.
- Open and left alone: C1, C2, C5, C6, C8, C9, P4.
