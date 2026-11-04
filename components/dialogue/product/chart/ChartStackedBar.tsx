"use client";

import { useRef, useState, type PointerEvent, type ReactNode } from "react";
import { annotateSlug } from "@/components/dialogue/annotate";

export type ChartStackSegment = {
  label: string;
  value: number;
  /** Text printed under (simple) or inside (detailed) the segment. */
  display: string;
  focal?: boolean;
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
  const rootRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ x: number; y: number; text: string } | null>(null);
  const track = (event: PointerEvent<HTMLElement>, text: string) => {
    const box = rootRef.current?.getBoundingClientRect();
    if (!box) return;
    setPill({ x: event.clientX - box.left, y: event.clientY - box.top, text });
  };
  return (
    <div ref={rootRef} className={["dp-chart-root dp-chart-stack", className].filter(Boolean).join(" ")}>
      <div className="dp-chart-stack__bar" data-annotate-part="stack-bar">
        {segments.map((seg, i) => {
          const share = `${Math.round((seg.value / total) * 100)}%`;
          return (
            <span
              key={seg.label}
              className="dp-chart-stack__seg"
              data-focal={seg.focal ? "" : undefined}
              data-index={i}
              style={{ width: `${(seg.value / total) * 100}%` }}
              data-annotate-part={`stack-seg-${annotateSlug(seg.label)}`}
              onPointerMove={(event) => track(event, share)}
              onPointerLeave={() => setPill(null)}
            >
              {showShare ? share : null}
            </span>
          );
        })}
      </div>
      {pill ? (
        <span className="dp-hero-tooltip dlg-chart-pill" role="tooltip" data-chart-pill="" style={{ left: pill.x, top: pill.y }}>
          {pill.text}
        </span>
      ) : null}
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
              <span className="dp-chart-stack__swatch" data-focal={seg.focal ? "" : undefined} data-index={i} aria-hidden />
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
              <span className="dp-chart-stack__swatch" data-focal={seg.focal ? "" : undefined} data-index={i} aria-hidden />
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
