import type { ReactNode } from "react";
import {
  chartBarFill,
  chartBarFillByMagnitude,
  type ChartBarDatum,
  dialogueChartSpec,
} from "@/components/dialogue/product/chart/chartSpec";
import { annotateSlug } from "@/components/dialogue/annotate";

type Props = {
  rows: ChartBarDatum[];
  /** Default max = max(values); bars always scale from 0 (Carbon). */
  max?: number;
  /** `index` = stone by row order; `magnitude` = darker = larger */
  fillMode?: "index" | "magnitude";
  note?: ReactNode;
  className?: string;
  /** Library near-miss only: drop the direct labels (a legend names the bars instead). */
  hideLabels?: boolean;
  /** Library near-miss only: bars start here instead of zero (truncated baseline). */
  baseline?: number;
};

/** Horizontal bar list — funnel, distribution, quote frequency, segment companion. */
export default function ChartBarList({
  rows,
  max: maxProp,
  fillMode = "index",
  note,
  className,
  hideLabels = false,
  baseline = 0,
}: Props) {
  const max = maxProp ?? Math.max(...rows.map((r) => r.value), 1);

  return (
    <div className={["dp-chart-root dp-chart-bars", className].filter(Boolean).join(" ")}>
      {rows.map((row, i) => {
        const widthPct = Math.max(0, Math.min(100, ((row.value - baseline) / (max - baseline)) * 100));
        const fill =
          fillMode === "magnitude"
            ? chartBarFillByMagnitude(row.value, max, row.focal)
            : chartBarFill(i, row.focal);
        return (
          <div key={row.label} className="dp-chart-bars__row" data-annotate-part={`bar-row-${annotateSlug(row.label)}`}>
            {hideLabels ? null : (
              <span className="dp-chart-bars__label" data-annotate-part={`bar-label-${annotateSlug(row.label)}`}>{row.label}</span>
            )}
            <div
              className="dp-chart-bars__track"
              data-annotate-part={`bar-track-${annotateSlug(row.label)}`}
              style={{ height: dialogueChartSpec.bar.thickness }}
            >
              <div
                className="dp-chart-bars__bar"
                data-annotate-part={`bar-${annotateSlug(row.label)}`}
                style={{ width: `${widthPct}%`, backgroundColor: fill }}
              />
            </div>
            <span
              data-annotate-part={`bar-value-${annotateSlug(row.label)}`}
              className={[
                "dp-chart-bars__value",
                row.focal ? "dp-chart-bars__value--focal" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {row.display ?? String(row.value)}
            </span>
          </div>
        );
      })}
      {note ? <p className="dp-chart-bars__note" data-annotate-part="bars-note">{note}</p> : null}
    </div>
  );
}
