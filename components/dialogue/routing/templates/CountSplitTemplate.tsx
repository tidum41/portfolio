"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { FridayBar } from "@/components/dialogue/live/AnswerCard";
import SideSample from "@/components/dialogue/product/scenarios/SideSample";
import { DialogueInterviewPlayer } from "@/components/dialogue/DialogueInterviewPlayer";
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
 * Count/split answer. Composes the live FridayBar (AnswerCard), SideSample
 * (QuoteListFigure + SourcePill), and DialogueInterviewPlayer — no chart fork.
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
  const open = data.groups.find((g) => g.id === side) ?? null;
  const active = open?.people[person] ?? open?.people[0] ?? null;
  const sideWhich =
    side === data.groups[0]?.id ? "friday" : side === data.groups[1]?.id ? "unsure" : false;

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
      <FridayBar
        still
        sideOpen={sideWhich}
        onSide={(which) => {
          const id = which === "friday" ? data.groups[0]?.id : data.groups[1]?.id;
          if (id) openSide(id);
        }}
        answer={{
          finding: data.finding,
          total: data.total,
          groups: data.groups.map((g) => ({
            label: g.label,
            value: g.value,
            focal: g.focal,
          })),
        }}
      />

      <div className="dlg-route-side" data-open={open ? "" : undefined} aria-live="polite">
        {open ? (
          <SideSample
            label={open.label.replace(/^[A-Z]/, (c) => c.toLowerCase())}
            total={open.value}
            quotes={open.people.map((p) => ({
              participant: p.name,
              time: p.time,
              quote: p.quote,
            }))}
            selectedParticipant={active?.name ?? null}
            onSelectQuote={(name) => {
              const idx = open.people.findIndex((p) => p.name === name);
              if (idx >= 0) {
                setPerson(idx);
                setClipOpen((v) => (idx === person ? !v : true));
              }
            }}
          />
        ) : (
          <p className="dlg-route-side__hint">Tap a side of the bar to see those people.</p>
        )}
      </div>

      {/* Reserved slot: live LiveSideSample nests the player inside the quote and
          shifts the list; the demo keeps the shared DialogueInterviewPlayer in a
          fixed-height slot so selection never moves the outer boxes. */}
      <div className="dlg-route-player-slot" data-open={clipOpen && active ? "" : undefined}>
        {clipOpen && active ? (
          <div className="dlg-live__clip" style={clipRange(active.time)}>
            <DialogueInterviewPlayer current={active.time.split("\u2013")[0]} />
          </div>
        ) : null}
      </div>

      <div className="dlg-route-followups">
        <button
          type="button"
          className="dlg-route-followup"
          onClick={() => {
            const id = data.groups[0].id;
            if (side !== id) openSide(id);
          }}
        >
          See the {data.groups[0].value} who {data.groups[0].label.replace(/^[A-Z]/, (c) => c.toLowerCase())}
        </button>
        <button
          type="button"
          className="dlg-route-followup"
          onClick={() => {
            const id = data.groups[0].id;
            if (side !== id) {
              setSide(id);
              setPerson(0);
            }
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
