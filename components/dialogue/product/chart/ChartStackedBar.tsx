import type { ReactNode } from "react";
import { annotateSlug } from "@/components/dialogue/annotate";
import { chartBarTone } from "@/components/dialogue/product/chart/chartSpec";

export type ChartStackSegment = {
  label: string;
  value: number;
  /** Text printed under (simple) or inside (detailed) the segment. */
  display: string;
  focal?: boolean;
  /** Non-focal remainder of a two-segment count split (the 75): stone, not ramp B mid. */
  remainder?: boolean;
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

/** Past two segments, labels under the bar collide and a one-line legend runs out of room, so the legend becomes one
 *  row per segment (swatch, label, count), the same rows the homepage card already uses. Depth r4. */
export const STACK_INLINE_MAX = 2;

/** Fill role for a segment. Two segments keep the ramp by index (focal and mid, or the stone remainder of a two-way
 *  split). From three on, the rank ramp would paint two non-focal neighbours the same mid, so non-focal segments alternate
 *  mid and soft in bar order (three segments read cherry, mid, soft, as the homepage card's 3+ ramp does) and no seam
 *  depends on the gap alone. A caller's explicit tone always wins (the homepage card passes its own). */
function stackTone(segments: ChartStackSegment[], i: number): NonNullable<ChartStackSegment["tone"]> {
  const seg = segments[i];
  if (seg.tone) return seg.tone;
  if (segments.length <= STACK_INLINE_MAX || seg.focal) return chartBarTone(i, seg.focal, seg.remainder);
  const k = segments.slice(0, i).filter((s) => !s.focal).length;
  return k % 2 === 0 ? "mid" : "soft";
}

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
  const legendRows = segments.length > STACK_INLINE_MAX;
  const showLanes = lanes || (!legend && legendRows);
  return (
    <div className={["dp-chart-root dp-chart-stack", className].filter(Boolean).join(" ")} data-segments={segments.length}>
      <div className="dp-chart-stack__bar" data-annotate-part="stack-bar">
        {segments.map((seg, i) => (
          <span
            key={seg.label}
            className="dp-chart-stack__seg"
            data-focal={seg.focal ? "" : undefined}
            data-index={i}
            data-tone={stackTone(segments, i)}
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
      {showLanes ? (
        <div className="dp-chart-stack__lanes" data-annotate-part="stack-lanes" data-rows={legendRows ? "" : undefined}>
          {segments.map((seg, i) => (
            <span key={seg.label} className="dp-chart-stack__lane" data-focal={seg.focal ? "" : undefined}>
              <span className="dp-chart-stack__swatch" data-focal={seg.focal ? "" : undefined} data-index={i} data-tone={stackTone(segments, i)} aria-hidden />
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
              <span className="dp-chart-stack__swatch" data-focal={seg.focal ? "" : undefined} data-index={i} data-tone={stackTone(segments, i)} aria-hidden />
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
