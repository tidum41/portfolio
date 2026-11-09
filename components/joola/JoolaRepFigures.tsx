/**
 * Static side-by-side figures for replacement review + distributor account.
 * Marked for Mudit to replace with Paper layers. Layout mirrors the internship screens.
 */
export default function JoolaRepFigures({ caption }: { caption?: string }) {
  return (
    <figure className="joola-figure">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
        className="joola-rep-figures"
      >
        <div className="joola-placeholder" role="img" aria-label="Replacement review placeholder">
          <strong>Paper placeholder · replacement review.</strong>
          <div style={{ marginTop: 8 }}>
            Engage Pickleball asked to replace a line from SO-48213. Reason code Damaged in
            transit. Quantity 2 · unit price $0.00 · value given away $299.96.
          </div>
        </div>
        <div className="joola-placeholder" role="img" aria-label="Distributor account placeholder">
          <strong>Paper placeholder · distributor account.</strong>
          <div style={{ marginTop: 8 }}>
            Engage Pickleball · Anna Bright, buyer. Net 30 credit $40,091.34 left of $50,000.
            Overdue AR $1,200.00 · INV-1021.
          </div>
        </div>
      </div>
      {caption ? <figcaption className="cs-figcaption">{caption}</figcaption> : null}
      <style>{`
        @media (max-width: 640px) {
          .joola-rep-figures { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </figure>
  );
}
