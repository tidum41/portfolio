/** Static invoice row figure. Marked for Mudit to replace with a Paper layer. */
export default function JoolaInvoiceRow({ caption }: { caption?: string }) {
  return (
    <figure className="joola-figure">
      <div className="joola-placeholder" role="img" aria-label="Invoice row placeholder">
        <strong>Paper placeholder · invoice row.</strong>
        <div style={{ marginTop: 8 }}>
          Matching invoice for the credit meter: PO on the same order, status Due in N days,
          Net 30 credit line $4,200 of $10,000. Replace this block with an editable Paper layer.
        </div>
        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr 0.9fr 0.8fr 0.7fr",
            gap: 8,
            fontSize: 13,
            fontFamily: "var(--font-sans)",
            color: "var(--color-text-primary)",
          }}
        >
          <span>INV-1042</span>
          <span>PO-092</span>
          <span>Oct 3, 2026</span>
          <span>$4,908.66</span>
          <span>Due in 24 days</span>
        </div>
      </div>
      {caption ? <figcaption className="cs-figcaption">{caption}</figcaption> : null}
    </figure>
  );
}
