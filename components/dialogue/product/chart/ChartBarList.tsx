import type { ReactNode } from "react";
import {
  chartBarFill,
  chartBarFillByMagnitude,
  type ChartBarDatum,
  dialogueChartSpec,
} from "@/components/dialogue/product/chart/chartSpec";

type Props = {
  rows: ChartBarDatum[];
  /** Default max = max(values); bars always scale from 0 (Carbon). */
  max?: number;
  /** `index` = stone by row order; `magnitude` = darker = larger */
  fillMode?: "index" | "magnitude";
  note?: ReactNode;
  className?: string;
};

/** Horizontal bar list — funnel, distribution, quote frequency, segment companion. */
export default function ChartBarList({
  rows,
  max: maxProp,
  fillMode = "index",
  note,
  className,
}: Props) {
  const max = maxProp ?? Math.max(...rows.map((r) => r.value), 1);

  return (
    <div className={["dp-chart-root dp-chart-bars", className].filter(Boolean).join(" ")}>
      {rows.map((row, i) => {
        const widthPct = Math.max(0, Math.min(100, (row.value / max) * 100));
        const fill =
          fillMode === "magnitude"
            ? chartBarFillByMagnitude(row.value, max, row.focal)
            : chartBarFill(i, row.focal);
        return (
          <div key={row.label} className="dp-chart-bars__row">
            <span className="dp-chart-bars__label">{row.label}</span>
            <div
              className="dp-chart-bars__track"
              style={{ height: dialogueChartSpec.bar.thickness }}
            >
              <div
                className="dp-chart-bars__bar"
                style={{ width: `${widthPct}%`, backgroundColor: fill }}
              />
            </div>
            <span
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
      {note ? <p className="dp-chart-bars__note">{note}</p> : null}
    </div>
  );
}
