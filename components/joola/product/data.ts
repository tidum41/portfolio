/**
 * Maya's order, as the v18 prototype shows it. Mock data from the prototype's demo
 * order form (Dick's Sporting Goods, Maya Collins). No prices or tiers are shown here.
 */

type RowBase = { row: number; sku: string; name: string; qty: number };

/** A line the import can add, a line it skips, or a line above the quantity check that waits for a choice. */
export type ImportRow =
  | (RowBase & { status: "ready" })
  | (RowBase & { status: "unknown" })
  | (RowBase & { status: "flagged"; usual: number });

export type FlaggedRow = Extract<ImportRow, { status: "flagged" }>;

/** What the buyer picked on a flagged row. */
export type Resolution = "open" | "changed" | "kept";

export const ROW_18: FlaggedRow = {
  row: 18,
  sku: "481168",
  name: "Scorpeus Pro V Anna Bright JOOLA Yellow 16mm",
  qty: 360,
  status: "flagged",
  usual: 36,
};

/** Maya's other lines around row 18, in file order, as the prototype's preview shows them. */
export const ROW_16: ImportRow = { row: 16, sku: "481159", name: "Perseus Pro V Ben Johns Blaze Red 16mm", qty: 108, status: "ready" };
export const ROW_17: ImportRow = { row: 17, sku: "481180", name: "Hyperion Pro V Ben Johns Bolt Blue 14mm", qty: 90, status: "ready" };
export const ROW_20: ImportRow = { row: 20, sku: "480691", name: "HC-40 Outdoor Balls (3-Pack)", qty: 216, status: "ready" };
export const ROW_22: ImportRow = { row: 22, sku: "600565", name: "Compact Pickleball Practice Net", qty: 6, status: "unknown" };

/** Row 18 as the earlier previews showed it: the quantity is not checked, so it reads Ready at 360. */
export const ROW_18_UNCHECKED: ImportRow = { row: 18, sku: ROW_18.sku, name: ROW_18.name, qty: ROW_18.qty, status: "ready" };

/** The rep's decision panel for Maya's order (v18 prototype, mock numbers). */
export const REP_ORDER = {
  account: "Dick's Sporting Goods",
  so: "SO-57288",
  over: "$7,860.00",
  order: "$42,214.50",
  creditLeft: "$34,354.50",
  openInvoices: "$90,645.50",
  covered: "$34,354.50",
  limit: "$125,000.00",
  payments: "Last 12 invoices on time",
  policy: "Within policy: under 10% over the limit.",
  lines: "4 lines, 450 units",
  placeholder: "e.g. paid on time",
  reason: "Paid on time",
  /** The prototype's quick reasons, shown under the field while it has focus. */
  quickReasons: ["Paid on time", "Seasonal restock", "Credit increase pending", "Overdue balance"] as const,
  orderTypes: ["Standard", "Replacement", "Compensation", "Sample"] as const,
  /** How the decision record words the chosen type. */
  recordType: "Standard order",
  decidedBy: "Sales rep",
  /** A fixed time in the prototype's format, so the loop reads the same every pass. */
  decidedAt: "10:38 AM",
} as const;

/** The credit bar's numbers (whole dollars), used the way the prototype's creditBar does. */
const CREDIT = { limit: 125000, used: 90645.5, covered: 34354.5, over: 7860 } as const;

const pct = (n: number, scale: number) => `${((n / scale) * 100).toFixed(3)}%`;

/** Shares of the bar for open invoices, covered by credit, and over the limit, plus where the limit tick sits. */
export const CREDIT_BAR = (() => {
  const order = CREDIT.covered + CREDIT.over;
  const scale = Math.max(CREDIT.limit, CREDIT.used + order);
  return {
    used: pct(CREDIT.used, scale),
    within: pct(CREDIT.covered, scale),
    over: pct(CREDIT.over, scale),
    limit: pct(CREDIT.limit, scale),
  } as const;
})();
