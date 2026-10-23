import { annotateSlug } from "@/components/dialogue/annotate";

export type GroupedBarRow = {
  label: string;
  all: number;
  segment: number;
  /** Quiet extra column, for example the drop at a step. */
  detail?: string;
};

type Props = {
  rows: GroupedBarRow[];
  max?: number;
  seriesNames: [string, string];
  className?: string;
};

/**
 * Dense two-series bar table: both series per step on quarter gridlines, a
 * legend, value columns and a drop column. Used as the busy first draft in the
 * chart library.
 */
export default function ChartGroupedBars({ rows, max = 100, seriesNames, className }: Props) {
  const w = (v: number) => `${Math.max(0, Math.min(100, (v / max) * 100))}%`;
  return (
    <div className={["dp-chart-root dp-chart-grouped", className].filter(Boolean).join(" ")}>
      <div className="dp-chart-grouped__legend" data-annotate-part="grouped-legend">
        <span className="dp-chart-grouped__legend-item">
          <span className="dp-chart-grouped__swatch" data-series="all" aria-hidden />
          {seriesNames[0]}
        </span>
        <span className="dp-chart-grouped__legend-item">
          <span className="dp-chart-grouped__swatch" data-series="segment" aria-hidden />
          {seriesNames[1]}
        </span>
      </div>
      <div className="dp-chart-grouped__head" aria-hidden>
        <span />
        <span />
        <span>All</span>
        <span>Mobile</span>
        <span>Drop</span>
      </div>
      {rows.map((row) => (
        <div key={row.label} className="dp-chart-grouped__row" data-annotate-part={`grouped-row-${annotateSlug(row.label)}`}>
          <span className="dp-chart-grouped__label">{row.label}</span>
          <div className="dp-chart-grouped__plot">
            <span className="dp-chart-grouped__bar" data-series="all" style={{ width: w(row.all) }} />
            <span className="dp-chart-grouped__bar" data-series="segment" style={{ width: w(row.segment) }} />
          </div>
          <span className="dp-chart-grouped__num">{row.all}%</span>
          <span className="dp-chart-grouped__num">{row.segment}%</span>
          <span className="dp-chart-grouped__num dp-chart-grouped__num--quiet">{row.detail ?? ""}</span>
        </div>
      ))}
    </div>
  );
}
