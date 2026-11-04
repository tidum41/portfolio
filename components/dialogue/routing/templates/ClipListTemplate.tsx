"use client";

import { useState, type CSSProperties } from "react";
import { DialogueInterviewPlayer } from "@/components/dialogue/DialogueInterviewPlayer";
import { WaveformIcon } from "@/components/dialogue/product/icons";
import type { ClipResolved } from "@/lib/dialogue/routing/sampleDataset";

type Props = {
  data: ClipResolved;
  initialPlaying?: string | null;
};

/**
 * Clip list. Selection highlights the row quietly; the player lives in a
 * reserved slot below so opening a clip does not shift the list.
 */
export default function ClipListTemplate({ data, initialPlaying = null }: Props) {
  const [playing, setPlaying] = useState<string | null>(initialPlaying);
  const active = data.clips.find((c) => c.name === playing) ?? null;

  return (
    <div className="dlg-route-answer" data-template="clip_list">
      <p className="dlg-route-finding">{data.finding}</p>
      <div className="dp-clip-quotes dlg-route-clips">
        {data.clips.map((clip) => {
          const on = playing === clip.name;
          return (
            <button
              key={clip.name}
              type="button"
              className={[
                "dp-clip-quote",
                "dlg-route-clip-row",
                "dlg-route-quote",
                on ? "dlg-route-quote--open" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={on}
              onClick={() => setPlaying(on ? null : clip.name)}
            >
              <p className="dp-clip-quote__who">
                <WaveformIcon className="dp-clip-quote__icon" />
                <span className="dp-clip-quote__name">{clip.name}</span>
                <span className="dp-clip-quote__time">{clip.time}</span>
              </p>
              <p className="dp-clip-quote__text">{clip.quote}</p>
            </button>
          );
        })}
      </div>
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
