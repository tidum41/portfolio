const ROWS = [
  { label: "Address field", count: 14 },
  { label: "Delivery fees", count: 11 },
  { label: "Payment trust", count: 9 },
  { label: "Autocomplete", count: 7 },
] as const;

const max = ROWS[0].count;

export default function QuoteFrequencyCard() {
  return (
    <div className="dp-viz-card" data-testid="viz-card">
      <div className="dp-viz-card__inner">
        <p className="dp-funnel__title">Mentions per theme in checkout interviews</p>
        <div className="dp-funnel__rows">
          {ROWS.map((row) => (
            <div key={row.label} className="dp-funnel__row">
              <span className="dp-funnel__label">{row.label}</span>
              <div className="dp-funnel__track">
                <div
                  className="dp-funnel__bar"
                  style={{ width: `${(row.count / max) * 100}%`, backgroundColor: "#57534D" }}
                />
              </div>
              <span className="dp-funnel__pct">{row.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
