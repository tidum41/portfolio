const THEMES = [
  { rank: 1, label: "Address validation", count: 18 },
  { rank: 2, label: "Unexpected fees", count: 15 },
  { rank: 3, label: "Saved payment", count: 12 },
] as const;

export default function ThemeRankingCard() {
  return (
    <div className="dp-viz-card" data-testid="viz-card">
      <div className="dp-viz-card__inner">
        <ol className="dp-theme-rank">
          {THEMES.map((row) => (
            <li key={row.label} className="dp-theme-rank__row">
              <span className="dp-theme-rank__num">{row.rank}</span>
              <span className="dp-theme-rank__label">{row.label}</span>
              <span className="dp-theme-rank__count">{row.count} interviews</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
