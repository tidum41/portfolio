import type { ReactNode } from "react";
import { annotateSlug } from "@/components/dialogue/annotate";
import { chartBarTone } from "@/components/dialogue/product/chart/chartSpec";

export type ChartStackSegment = {
  label: string;
  value: number;
  /** Text printed under (simple) or inside (detailed) the segment. */
  display: string;
  focal?: boolean;
  /** Optional override for thumbnail ramp fills. */
  tone?: "focal" | "mid" | "soft" | "neutral";
};

type Props = {
  segments: ChartStackSegment[];
  /** Full width of the bar (for example 24 interviews). */
  total: number;
  /** Count ticks under the bar. */
  ticks?: number[];
  /** Also print each share inside its segment. */
  showShare?: boolean;
  legend?: boolean;
  /** Paper spec chart A: one legend line with two lanes, each a swatch, a muted label and its tabular count. */
  lanes?: boolean;
  note?: ReactNode;
  className?: string;
};

/** Single stacked proportion bar from zero to the full set, with direct labels under each segment. */
export default function ChartStackedBar({
  segments,
  total,
  ticks,
  showShare = false,
  legend = false,
  lanes = false,
  note,
  className,
}: Props) {
  return (
    <div className={["dp-chart-root dp-chart-stack", className].filter(Boolean).join(" ")}>
      <div className="dp-chart-stack__bar" data-annotate-part="stack-bar">
        {segments.map((seg, i) => (
          <span
            key={seg.label}
            className="dp-chart-stack__seg"
            data-focal={seg.focal ? "" : undefined}
            data-index={i}
            data-tone={seg.tone ?? chartBarTone(i, seg.focal)}
            style={{ width: `${(seg.value / total) * 100}%` }}
            data-annotate-part={`stack-seg-${annotateSlug(seg.label)}`}
          >
            {showShare ? `${Math.round((seg.value / total) * 100)}%` : null}
          </span>
        ))}
      </div>
      {ticks ? (
        <div className="dp-chart-stack__ticks" data-annotate-part="stack-ticks">
          {ticks.map((t) => (
            <span key={t} style={{ left: `${(t / total) * 100}%` }}>
              {t}
            </span>
          ))}
        </div>
      ) : null}
      {lanes ? (
        <div className="dp-chart-stack__lanes" data-annotate-part="stack-lanes">
          {segments.map((seg, i) => (
            <span key={seg.label} className="dp-chart-stack__lane" data-focal={seg.focal ? "" : undefined}>
              <span className="dp-chart-stack__swatch" data-focal={seg.focal ? "" : undefined} data-index={i} data-tone={seg.tone ?? chartBarTone(i, seg.focal)} aria-hidden />
              <span className="dp-chart-stack__lane-label">{seg.label}</span>
              <span className="dp-chart-stack__lane-value">
                <span className="dp-chart-stack__lane-count">{seg.value.toLocaleString("en-US")}</span>
                <span className="dp-chart-stack__lane-share" aria-hidden>{Math.round((seg.value / total) * 100)}%</span>
              </span>
            </span>
          ))}
        </div>
      ) : legend ? (
        <div className="dp-chart-stack__legend" data-annotate-part="stack-legend">
          {segments.map((seg, i) => (
            <span key={seg.label} className="dp-chart-stack__legend-item">
              <span className="dp-chart-stack__swatch" data-focal={seg.focal ? "" : undefined} data-index={i} data-tone={seg.tone ?? chartBarTone(i, seg.focal)} aria-hidden />
              {seg.label}
            </span>
          ))}
        </div>
      ) : (
        <div className="dp-chart-stack__labels">
          {segments.map((seg, i) => (
            <span
              key={seg.label}
              className="dp-chart-stack__label"
              data-focal={seg.focal ? "" : undefined}
              data-last={i === segments.length - 1 ? "" : undefined}
              style={
                i === segments.length - 1
                  ? undefined
                  : { width: `${(seg.value / total) * 100}%`, maxWidth: `calc(100% - 7.5em)` }
              }
              data-annotate-part={`stack-label-${annotateSlug(seg.label)}`}
            >
              <span className="dp-chart-stack__label-value">{seg.display}</span> {seg.label}
            </span>
          ))}
        </div>
      )}
      {note ? <p className="dp-chart-bars__note" data-annotate-part="stack-note">{note}</p> : null}
    </div>
  );
}
