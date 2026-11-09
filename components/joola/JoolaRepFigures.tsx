/**
 * Static side-by-side figures for replacement review + distributor account.
 * Neutral stand-ins until Paper layers land.
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
        <div
          className="joola-placeholder"
          role="img"
          aria-label="Replacement review figure coming soon"
        >
          <span className="joola-placeholder__label">Figure coming soon</span>
          <span className="joola-placeholder__hint">Replacement review</span>
        </div>
        <div
          className="joola-placeholder"
          role="img"
          aria-label="Distributor account figure coming soon"
        >
          <span className="joola-placeholder__label">Figure coming soon</span>
          <span className="joola-placeholder__hint">Distributor account</span>
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
