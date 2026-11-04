"use client";

import { useEffect, useState, type CSSProperties } from "react";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import SourcePill from "@/components/dialogue/product/SourcePill";
import { DialogueInterviewPlayer } from "@/components/dialogue/DialogueInterviewPlayer";
import { WaveformIcon } from "@/components/dialogue/product/icons";
import type { CountSplitResolved } from "@/lib/dialogue/routing/sampleDataset";

type Props = {
  data: CountSplitResolved;
  /** Force a side open for screenshots. */
  initialSide?: string | null;
  /** Force a person selected for screenshots. */
  initialPerson?: number;
  /** Force the in-place clip open for screenshots. */
  initialClip?: boolean;
  /** Notify parent when the reader drills into people or a clip. */
  onDepth?: (depth: "chart" | "people" | "clip") => void;
};

/**
 * Count/split bar in the 448px panel. Tap a side to see those people,
 * then a source pill, then play the clip in place.
 */
export default function CountSplitTemplate({
  data,
  initialSide = null,
  initialPerson = 0,
  initialClip = false,
  onDepth,
}: Props) {
  const [side, setSide] = useState<string | null>(initialSide);
  const [person, setPerson] = useState(initialPerson);
  const [clipOpen, setClipOpen] = useState(initialClip);
  const total = data.total;
  const lead = Math.round((data.groups[0].value / total) * 10000) / 100;
  const open = data.groups.find((g) => g.id === side) ?? null;
  const active = open?.people[person] ?? open?.people[0] ?? null;

  useEffect(() => {
    if (!side) onDepth?.("chart");
    else if (clipOpen) onDepth?.("clip");
    else onDepth?.("people");
  }, [side, clipOpen, onDepth]);

  const openSide = (id: string) => {
    setSide((s) => {
      if (s === id) {
        setClipOpen(false);
        return null;
      }
      setPerson(0);
      setClipOpen(false);
      return id;
    });
  };

  return (
    <div className="dlg-route-answer" data-template="count_split">
      <ChartVizCard title={data.finding} className="dlg-route-card">
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
            onClick={() => openSide(data.groups[0].id)}
          />
          <button
            type="button"
            className="dlg-live__side dlg-live__side--unsure"
            style={{ width: `calc(${100 - lead}% + 12px)` }}
            aria-label={`Open ${data.groups[1].label}, ${data.groups[1].value} of ${total}`}
            aria-expanded={side === data.groups[1].id}
            onClick={() => openSide(data.groups[1].id)}
          />
        </div>
      </ChartVizCard>

      <div className="dlg-route-side" data-open={open ? "" : undefined} aria-live="polite">
        {open ? (
          <>
            <p className="dlg-route-side__head">
              <span
                className="dlg-route-side__swatch"
                data-focal={open.focal ? "" : undefined}
                aria-hidden
              />
              <span className="dlg-route-side__label">{open.label}</span>
              <span className="dlg-route-side__count">{open.value}</span>
            </p>
            <div className="dlg-route-pills" role="list">
              {open.people.map((p, i) => (
                <button
                  key={p.name}
                  type="button"
                  className="dlg-route-pill-btn"
                  aria-pressed={i === person}
                  onClick={() => {
                    setPerson(i);
                    setClipOpen(false);
                  }}
                >
                  <SourcePill
                    name={p.name}
                    time={p.time.split("\u2013")[0]}
                    selected={i === person}
                  />
                </button>
              ))}
              {open.value > open.people.length ? (
                <SourcePill name={`+${open.value - open.people.length} more`} time="" />
              ) : null}
            </div>
            {active ? (
              <button
                type="button"
                className={[
                  "dp-clip-quote",
                  "dlg-route-quote",
                  "dlg-route-quote--open",
                  clipOpen ? "dlg-route-quote--playing" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-pressed={clipOpen}
                onClick={() => setClipOpen((v) => !v)}
              >
                <p className="dp-clip-quote__who">
                  <WaveformIcon className="dp-clip-quote__icon" />
                  <span className="dp-clip-quote__name">{active.name}</span>
                  <span className="dp-clip-quote__time">{active.time}</span>
                </p>
                <p className="dp-clip-quote__text">{active.quote}</p>
              </button>
            ) : null}
            <div className="dlg-route-player-slot" data-open={clipOpen ? "" : undefined}>
              {clipOpen && active ? (
                <div className="dlg-live__clip" style={clipRange(active.time)}>
                  <DialogueInterviewPlayer current={active.time.split("\u2013")[0]} />
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <p className="dlg-route-side__hint">Tap a side of the bar to see those people.</p>
        )}
      </div>

      <div className="dlg-route-followups" role="list">
        <button
          type="button"
          className="dlg-route-followup"
          role="listitem"
          disabled={side === data.groups[0].id}
          onClick={() => openSide(data.groups[0].id)}
        >
          See the {data.groups[0].value} who {data.groups[0].label.toLowerCase()}
        </button>
        <button
          type="button"
          className="dlg-route-followup"
          role="listitem"
          disabled={!open || clipOpen}
          onClick={() => {
            if (!side) openSide(data.groups[0].id);
            setPerson(0);
            setClipOpen(true);
          }}
        >
          Play {data.groups[0].people[0]?.name ?? "a"} clip
        </button>
      </div>
    </div>
  );
}

function clipRange(time: string): CSSProperties {
  const sec = (t: string) => t.split(":").reduce((a, n) => a * 60 + Number(n), 0);
  const [a, z] = time.split(/[\u2013-]/).map(sec);
  const total = sec("42:10");
  return {
    ["--clip-a" as string]: `${(a / total) * 100}%`,
    ["--clip-w" as string]: `${(((z ?? a) - a) / total) * 100}%`,
  } as CSSProperties;
}
