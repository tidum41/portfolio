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
  /** Quarter gridlines over the tracks (the analyst's first draft). */
  gridlines?: boolean;
};

/** Horizontal bar list — funnel, distribution, quote frequency, segment companion. */
export default function ChartBarList({
  rows,
  max: maxProp,
  fillMode = "index",
  note,
  className,
  gridlines = false,
}: Props) {
  const max = maxProp ?? Math.max(...rows.map((r) => r.value), 1);
  const hasDetail = rows.some((r) => r.detail);

  return (
    <div
      className={["dp-chart-root dp-chart-bars", hasDetail ? "dp-chart-bars--detail" : "", className].filter(Boolean).join(" ")}
    >
      {gridlines ? <span className="dp-chart-bars__grid" aria-hidden data-annotate-part="gridlines" /> : null}
      {rows.map((row, i) => {
        const widthPct = Math.max(0, Math.min(100, (row.value / max) * 100));
        const fill =
          fillMode === "magnitude"
            ? chartBarFillByMagnitude(row.value, max, row.focal)
            : chartBarFill(i, row.focal);
        return (
          <div key={row.label} className="dp-chart-bars__row" data-annotate-part={`bar-row-${annotateSlug(row.label)}`}>
            <span className="dp-chart-bars__label" data-annotate-part={`bar-label-${annotateSlug(row.label)}`}>{row.label}</span>
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
            {hasDetail ? (
              <span className="dp-chart-bars__detail" data-annotate-part={`bar-detail-${annotateSlug(row.label)}`}>
                {row.detail ?? ""}
              </span>
            ) : null}
          </div>
        );
      })}
      {note ? <p className="dp-chart-bars__note" data-annotate-part="bars-note">{note}</p> : null}
    </div>
  );
}
