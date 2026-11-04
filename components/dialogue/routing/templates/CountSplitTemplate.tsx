"use client";

import { useState } from "react";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import SourcePill from "@/components/dialogue/product/SourcePill";
import { WaveformIcon } from "@/components/dialogue/product/icons";
import type { CountSplitResolved } from "@/lib/dialogue/routing/sampleDataset";

type Props = {
  data: CountSplitResolved;
  /** Force a side open for screenshots. */
  initialSide?: string | null;
};

/**
 * Count/split bar in the 448px panel. Tap a side to see those people.
 * Reuses ChartStackedBar, ChartVizCard, SourcePill and the quote row markup.
 */
export default function CountSplitTemplate({ data, initialSide = null }: Props) {
  const [side, setSide] = useState<string | null>(initialSide);
  const total = data.total;
  const lead = Math.round((data.groups[0].value / total) * 10000) / 100;
  const open = data.groups.find((g) => g.id === side) ?? null;

  return (
    <div className="dlg-route-answer" data-template="count_split">
      <ChartVizCard title={data.finding}>
        <div className="dlg-live__bar" data-layout="bar" data-side={side || undefined}>
          <ChartStackedBar
            lanes
            total={total}
            segments={data.groups.map((g) => ({
              label: g.label,
              value: g.value,
              display: `${g.value} of ${total}`,
              focal: g.focal,
            }))}
          />
          <button
            type="button"
            className="dlg-live__side dlg-live__side--friday"
            style={{ width: `calc(${lead}% + 12px)` }}
            aria-label={`Open ${data.groups[0].label}, ${data.groups[0].value} of ${total}`}
            aria-expanded={side === data.groups[0].id}
            onClick={() =>
              setSide((s) => (s === data.groups[0].id ? null : data.groups[0].id))
            }
          />
          <button
            type="button"
            className="dlg-live__side dlg-live__side--unsure"
            style={{ width: `calc(${100 - lead}% + 12px)` }}
            aria-label={`Open ${data.groups[1].label}, ${data.groups[1].value} of ${total}`}
            aria-expanded={side === data.groups[1].id}
            onClick={() =>
              setSide((s) => (s === data.groups[1].id ? null : data.groups[1].id))
            }
          />
        </div>
      </ChartVizCard>
      {open ? (
        <div className="dlg-route-side" aria-live="polite">
          <p className="dlg-route-side__head">
            <span
              className="dlg-route-side__swatch"
              data-focal={open.focal ? "" : undefined}
              aria-hidden
            />
            {open.label} · {open.value}
          </p>
          <div className="dlg-route-pills" role="list">
            {open.people.map((p, i) => (
              <button
                key={p.name}
                type="button"
                className="dlg-route-pill-btn"
                aria-pressed={i === 0}
              >
                <SourcePill name={p.name} time={p.time.split("\u2013")[0]} selected={i === 0} />
              </button>
            ))}
            {open.value > open.people.length ? (
              <SourcePill name={`+${open.value - open.people.length} more`} time="" />
            ) : null}
          </div>
          {open.people[0] ? (
            <div className="dp-clip-quote dp-clip-quote--selected">
              <p className="dp-clip-quote__who">
                <WaveformIcon className="dp-clip-quote__icon" />
                <span className="dp-clip-quote__name">{open.people[0].name}</span>
                <span className="dp-clip-quote__time">{open.people[0].time}</span>
              </p>
              <p className="dp-clip-quote__text">{open.people[0].quote}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
