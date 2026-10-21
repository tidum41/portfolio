import { SENTIMENT_LINE } from "@/lib/dialogue/product/sampleData";

export default function LineChart() {
  const { points, title, question } = SENTIMENT_LINE;
  const max = 4;
  const min = 2;
  const w = 320;
  const h = 120;
  const pad = 16;
  const coords = points.map((p, i) => {
    const x = pad + (i / (points.length - 1)) * (w - pad * 2);
    const y = h - pad - ((p.value - min) / (max - min)) * (h - pad * 2);
    return { x, y, ...p };
  });
  const d = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x},${c.y}`).join(" ");

  return (
    <div className="dp-line-chart">
      <p className="dp-text-meta" style={{ margin: "0 0 6px" }}>{question}</p>
      <p className="dp-summary" style={{ fontSize: 15, margin: "0 0 8px" }}>{title}</p>
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Line chart">
        <polyline fill="none" stroke="#c0267a" strokeWidth="2.5" points={coords.map((c) => `${c.x},${c.y}`).join(" ")} />
        {coords.map((c) => (
          <g key={c.label}>
            <circle cx={c.x} cy={c.y} r="4" fill="#c0267a" />
            <text x={c.x} y={h - 2} textAnchor="middle" fontSize="10" fill="#727272">{c.label}</text>
            <text x={c.x} y={c.y - 8} textAnchor="middle" fontSize="10" fill="#1a1816">{c.value}</text>
          </g>
        ))}
      </svg>
      <p className="dp-chart-legend">Average sentiment score by prototype round</p>
      <p className="dp-text-meta">Based on 24 of 24 interviews</p>
    </div>
  );
}
