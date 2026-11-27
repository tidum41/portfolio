/**
 * Top-left partial slice of Dick's Sporting Goods' CSV/Excel order form (mock data matching
 * proto13/public/joola-order-form.csv). Renders the header metadata block and product rows as
 * two distinct zones, blurs prices and sensitive values, and fades the right and bottom edges.
 */

type HeaderEntry = {
  readonly row: number;
  readonly label: string;
  readonly value: string;
  readonly blur?: boolean;
};

type ProductEntry = {
  readonly row: number;
  readonly sku: string;
  readonly description: string;
  readonly unitPrice: string;
  readonly msrp: string;
  readonly qty: number;
};

const HEADER_ROWS: readonly HeaderEntry[] = [
  { row: 1, label: "Account Name", value: "Dick's Sporting Goods" },
  { row: 2, label: "Account Internal ID", value: "20917", blur: true },
  { row: 3, label: "Contact Name", value: "Maya Collins" },
  { row: 5, label: "PO#", value: "DSG-31807" },
  { row: 6, label: "Requested Ship Date", value: "11/24/2026" },
  { row: 7, label: "Cancel Date", value: "12/12/2026" },
  { row: 10, label: "Email Confirmation", value: "purchasing@dickssportinggoods.com", blur: true },
  { row: 12, label: "Shipping Address", value: "4100 Ridgeline Dr, Round Rock TX 78664", blur: true },
  { row: 13, label: "Overall Comments", value: "Hold for store reset, deliver to dock 3" },
];

const PRODUCT_ROWS: readonly ProductEntry[] = [
  { row: 16, sku: "481159", description: "Perseus Pro V Ben Johns Blaze Red 16mm", unitPrice: "$173.97", msrp: "$299.95", qty: 108 },
  { row: 17, sku: "481180", description: "Hyperion Pro V Ben Johns Bolt Blue 14mm", unitPrice: "$173.97", msrp: "$299.95", qty: 90 },
  { row: 18, sku: "481168", description: "Scorpeus Pro V Anna Bright JOOLA Yellow 16mm", unitPrice: "$173.97", msrp: "$299.95", qty: 360 },
];

export type OrderFormSliceProps = {
  className?: string;
};

export default function OrderFormSlice({ className }: OrderFormSliceProps) {
  return (
    <div
      className={`jp jp-sheet${className ? ` ${className}` : ""}`}
      role="img"
      aria-label="Partial, blurred spreadsheet order form for Dick's Sporting Goods (buyer Maya Collins), with a header block for PO, dates, ship-to address, and comments above the product rows. Prices and account details are blurred."
    >
      <div className="jp-sheet__chrome" aria-hidden="true">
        <span className="jp-sheet__file">joola-order-form.csv</span>
        <span className="jp-sheet__tab">Sheet 1</span>
      </div>

      <div className="jp-sheet__mask" aria-hidden="true">
        <div className="jp-sheet__cols">
          <span className="jp-sheet__rn" />
          <span>A</span>
          <span>B</span>
          <span>C</span>
          <span>D</span>
        </div>

        <div className="jp-sheet__zone jp-sheet__zone--header">
          {HEADER_ROWS.map((entry) => (
            <div key={entry.row} className="jp-sheet__hrow">
              <span className="jp-sheet__rn jp-tnum">{entry.row}</span>
              <span className="jp-sheet__hlabel">{entry.label}</span>
              <span className={`jp-sheet__hval${entry.blur ? " is-blur" : ""}`}>{entry.value}</span>
            </div>
          ))}
        </div>

        <div className="jp-sheet__zone jp-sheet__zone--products">
          <div className="jp-sheet__prow jp-sheet__prow--head">
            <span className="jp-sheet__rn jp-tnum">14</span>
            <span>Item #</span>
            <span>Description</span>
            <span>Price</span>
            <span>MSRP</span>
            <span className="jp-sheet__end">Qty</span>
          </div>
          <div className="jp-sheet__pcat">
            <span className="jp-sheet__rn jp-tnum">15</span>
            <span>PADDLES</span>
          </div>
          {PRODUCT_ROWS.map((item) => (
            <div key={item.row} className="jp-sheet__prow">
              <span className="jp-sheet__rn jp-tnum">{item.row}</span>
              <span className="jp-tnum">{item.sku}</span>
              <span className="jp-sheet__desc">{item.description}</span>
              <span className="jp-tnum is-blur">{item.unitPrice}</span>
              <span className="jp-tnum is-blur">{item.msrp}</span>
              <span className="jp-sheet__end jp-tnum">{item.qty}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
