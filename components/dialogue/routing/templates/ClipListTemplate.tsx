"use client";

import { useState, type CSSProperties } from "react";
import ClipQuotes from "@/components/dialogue/product/ClipQuotes";
import { DialogueInterviewPlayer } from "@/components/dialogue/DialogueInterviewPlayer";
import type { ClipResolved } from "@/lib/dialogue/routing/sampleDataset";

type Props = {
  data: ClipResolved;
  initialPlaying?: string | null;
};

/**
 * Clip list: live ClipQuotes + DialogueInterviewPlayer in a reserved slot
 * so opening a row does not shift the list.
 */
export default function ClipListTemplate({ data, initialPlaying = null }: Props) {
  const [playing, setPlaying] = useState<string | null>(initialPlaying);
  const active = data.clips.find((c) => c.name === playing) ?? null;

  return (
    <div className="dlg-route-answer" data-template="clip_list">
      <p className="dlg-route-finding">{data.finding}</p>
      <ClipQuotes
        clips={data.clips.map((c, i) => ({
          id: `${c.name}-${i}`,
          participant: c.name,
          segment: c.time,
          transcript: c.quote,
        }))}
        selectedParticipant={playing}
        onSelect={(name) => setPlaying((p) => (p === name ? null : name))}
      />
      <div className="dlg-route-player-slot" data-open={active ? "" : undefined}>
        {active ? (
          <div className="dlg-live__clip" style={clipRange(active.start, active.end)}>
            <DialogueInterviewPlayer current={active.start} />
          </div>
        ) : (
          <p className="dlg-route-side__hint">Tap a row to play its clip.</p>
        )}
      </div>
    </div>
  );
}

function clipRange(start: string, end: string): CSSProperties {
  const sec = (t: string) => t.split(":").reduce((a, n) => a * 60 + Number(n), 0);
  const a = sec(start);
  const z = sec(end);
  const total = sec("42:10");
  return {
    ["--clip-a" as string]: `${(a / total) * 100}%`,
    ["--clip-w" as string]: `${((z - a) / total) * 100}%`,
  } as CSSProperties;
}
