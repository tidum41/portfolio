/** Static invoice row figure. Neutral stand-in until Paper layers land. */
export default function JoolaInvoiceRow({ caption }: { caption?: string }) {
  return (
    <figure className="joola-figure">
      <div className="joola-placeholder" role="img" aria-label="Invoice row figure coming soon">
        <span className="joola-placeholder__label">Figure coming soon</span>
        <span className="joola-placeholder__hint">
          Invoice row with matching PO and Due in N days.
        </span>
      </div>
      {caption ? <figcaption className="cs-figcaption">{caption}</figcaption> : null}
    </figure>
  );
}
