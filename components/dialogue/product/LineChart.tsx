type Point = { label: string; value: number };

type Props = {
  title: string;
  points: Point[];
  legend: string;
  footnote?: string;
};

export default function LineChart({
  title,
  points,
  legend,
  footnote = "Based on 24 of 24 interviews",
}: Props) {
  const max = Math.max(...points.map((p) => p.value)) + 0.4;
  const min = Math.min(...points.map((p) => p.value)) - 0.4;
  const w = 300;
  const h = 112;
  const padX = 38;
  const padY = 20;
  const coords = points.map((p, i) => {
    const x = padX + (i / (points.length - 1)) * (w - padX * 2);
    const y = h - padY - ((p.value - min) / (max - min)) * (h - padY * 2);
    return { x, y, ...p };
  });

  return (
    <div className="dp-line-chart">
      <p className="dp-summary dp-line-chart__summary">{title}</p>
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Line chart" className="dp-line-chart__svg">
        <polyline
          fill="none"
          stroke="#c0267a"
          strokeWidth="2"
          points={coords.map((c) => `${c.x},${c.y}`).join(" ")}
        />
        {coords.map((c) => (
          <g key={c.label}>
            <circle cx={c.x} cy={c.y} r="3.5" fill="#c0267a" />
            <text x={c.x} y={c.y - 6} textAnchor="middle" className="dp-chart-svg-value">
              {c.value}
            </text>
            <text x={c.x} y={h - 6} textAnchor="middle" className="dp-chart-svg-label">
              {c.label}
            </text>
          </g>
        ))}
      </svg>
      <p className="dp-chart-legend">{legend}</p>
      <p className="dp-text-meta">{footnote}</p>
    </div>
  );
}
