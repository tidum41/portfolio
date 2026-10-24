import type { ReactNode } from "react";
import { annotateSlug } from "@/components/dialogue/annotate";
import type { ChartBarDatum } from "@/components/dialogue/product/chart/chartSpec";

type Props = {
  rows: ChartBarDatum[];
  /** Axis runs from 0 to max, so position on the shared axis is the encoding. */
  max?: number;
  /** Tick labels under the axis. */
  ticks?: number[];
  formatTick?: (n: number) => string;
  /** Faint gridlines at these positions. */
  gridAt?: number[];
  note?: ReactNode;
  className?: string;
};

/** Dot plot on a zero-based axis: one dot per row, direct labels, one cherry accent. */
export default function ChartDotPlot({
  rows,
  max = 100,
  ticks,
  formatTick = (n) => `${n}%`,
  gridAt,
  note,
  className,
}: Props) {
  const hasDetail = rows.some((r) => r.detail);
  const pct = (v: number) => `${Math.max(0, Math.min(100, (v / max) * 100))}%`;
  return (
    <div
      className={["dp-chart-root dp-chart-dots", hasDetail ? "dp-chart-dots--detail" : "", className]
        .filter(Boolean)
        .join(" ")}
    >
      {rows.map((row) => (
        <div key={row.label} className="dp-chart-dots__row" data-annotate-part={`dot-row-${annotateSlug(row.label)}`}>
          <span className="dp-chart-dots__label" data-annotate-part={`dot-label-${annotateSlug(row.label)}`}>
            {row.label}
          </span>
          <div className="dp-chart-dots__plot" data-annotate-part={`dot-plot-${annotateSlug(row.label)}`}>
            {gridAt
              ? gridAt.map((t) => (
                  <span key={t} className="dp-chart-dots__grid" style={{ left: pct(t) }} aria-hidden />
                ))
              : null}
            <span
              className={["dp-chart-dots__dot", row.focal ? "dp-chart-dots__dot--focal" : ""].filter(Boolean).join(" ")}
              style={{ left: pct(row.value) }}
              data-annotate-part={`dot-${annotateSlug(row.label)}`}
            />
          </div>
          <span
            className={["dp-chart-dots__value", row.focal ? "dp-chart-dots__value--focal" : ""].filter(Boolean).join(" ")}
            data-annotate-part={`dot-value-${annotateSlug(row.label)}`}
          >
            {row.display ?? String(row.value)}
          </span>
          {hasDetail ? <span className="dp-chart-dots__detail">{row.detail ?? ""}</span> : null}
        </div>
      ))}
      {ticks ? (
        <div className="dp-chart-dots__row dp-chart-dots__row--axis" data-annotate-part="dot-axis">
          <span className="dp-chart-dots__label" aria-hidden />
          <div className="dp-chart-dots__plot dp-chart-dots__plot--axis">
            {ticks.map((t) => (
              <span key={t} className="dp-chart-dots__tick" style={{ left: pct(t) }}>
                {formatTick(t)}
              </span>
            ))}
          </div>
          <span className="dp-chart-dots__value" aria-hidden />
          {hasDetail ? <span className="dp-chart-dots__detail" aria-hidden /> : null}
        </div>
      ) : null}
      {note ? <p className="dp-chart-bars__note" data-annotate-part="dots-note">{note}</p> : null}
    </div>
  );
}
