import {
  dialogueChartSpec,
  formatChartDecimal,
} from "@/components/dialogue/product/chart/chartSpec";

export type ChartLinePoint = { label: string; value: number };

type Props = {
  points: ChartLinePoint[];
  /** `trend` may crop Y (Carbon); `count` starts at 0 */
  yMode?: "trend" | "count";
  /** Format point values; default one decimal for trend, integer for count */
  formatValue?: (n: number) => string;
  /** Index of focal point (cherry); default = max value */
  focalIndex?: number;
  /** Color the whole line cherry (single-series finding) */
  seriesFocal?: boolean;
  className?: string;
};

/**
 * Line plot with fixed intrinsic width so axis/value type stays 12px at 1:1
 * (viewBox user units == CSS px when displayed at plotWidth).
 */
export default function ChartLinePlot({
  points,
  yMode = "trend",
  formatValue,
  focalIndex,
  seriesFocal = false,
  className,
}: Props) {
  const s = dialogueChartSpec.line;
  const w = s.plotWidth;
  const h = s.plotHeight;
  const values = points.map((p) => p.value);
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  let yMin: number;
  let yMax: number;
  if (yMode === "count") {
    yMin = 0;
    yMax = dataMax === 0 ? 1 : dataMax * 1.15;
  } else {
    const pad = Math.max((dataMax - dataMin) * 0.15, 0.2);
    yMin = dataMin - pad;
    yMax = dataMax + pad;
  }
  const span = yMax - yMin || 1;
  const fmt =
    formatValue ??
    ((n: number) => (yMode === "count" ? String(Math.round(n)) : formatChartDecimal(n)));

  const peakIdx =
    focalIndex ??
    values.reduce((best, v, i) => (v > values[best]! ? i : best), 0);

  const coords = points.map((p, i) => {
    const x =
      s.padLeft + (i / Math.max(points.length - 1, 1)) * (w - s.padLeft - s.padRight);
    const y = h - s.padBottom - ((p.value - yMin) / span) * (h - s.padTop - s.padBottom);
    return { x, y, ...p, i };
  });

  const tickCount = 3;
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const t = i / (tickCount - 1);
    const value = yMax - t * span;
    const y = s.padTop + t * (h - s.padTop - s.padBottom);
    return { value, y };
  });

  const stroke = seriesFocal ? dialogueChartSpec.color.lineFocal : dialogueChartSpec.color.line;

  return (
    <div className={["dp-chart-root dp-chart-line", className].filter(Boolean).join(" ")}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width={w}
        height={h}
        role="img"
        aria-label="Line chart"
        className="dp-chart-line__svg"
      >
        {ticks.map((tick) => (
          <line
            key={`g-${tick.y}`}
            className="dp-chart-line__grid"
            x1={s.padLeft}
            x2={w - s.padRight}
            y1={tick.y}
            y2={tick.y}
          />
        ))}
        <line
          className="dp-chart-line__baseline"
          x1={s.padLeft}
          x2={w - s.padRight}
          y1={h - s.padBottom}
          y2={h - s.padBottom}
        />
        {ticks.map((tick) => (
          <text
            key={`t-${tick.y}`}
            className="dp-chart-line__tick"
            x={s.padLeft - 6}
            y={tick.y + 4}
            textAnchor="end"
          >
            {fmt(tick.value)}
          </text>
        ))}
        <polyline
          className="dp-chart-line__path"
          stroke={stroke}
          strokeWidth={dialogueChartSpec.line.strokeWidth}
          points={coords.map((c) => `${c.x},${c.y}`).join(" ")}
        />
        {coords.map((c) => {
          const focal = c.i === peakIdx;
          const r = focal
            ? dialogueChartSpec.line.focalDotRadius
            : dialogueChartSpec.line.dotRadius;
          const fill = focal || seriesFocal
            ? dialogueChartSpec.color.focal
            : dialogueChartSpec.color.line;
          return (
            <g key={c.label}>
              <circle cx={c.x} cy={c.y} r={r} fill={fill} />
              <text
                x={c.x}
                y={c.y - 8}
                textAnchor="middle"
                className={[
                  "dp-chart-line__value",
                  focal ? "dp-chart-line__value--focal" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {fmt(c.value)}
              </text>
              <text
                x={c.x}
                y={h - 8}
                textAnchor="middle"
                className="dp-chart-line__label"
              >
                {c.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
