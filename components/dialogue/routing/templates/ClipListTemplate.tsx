"use client";

import { useState, type CSSProperties } from "react";
import { DialogueInterviewPlayer } from "@/components/dialogue/DialogueInterviewPlayer";
import { WaveformIcon } from "@/components/dialogue/product/icons";
import type { ClipResolved } from "@/lib/dialogue/routing/sampleDataset";

type Props = {
  data: ClipResolved;
  initialPlaying?: string | null;
};

/** Clip list that plays in place under the tapped row. */
export default function ClipListTemplate({ data, initialPlaying = null }: Props) {
  const [playing, setPlaying] = useState<string | null>(initialPlaying);

  return (
    <div className="dlg-route-answer" data-template="clip_list">
      <p className="dlg-route-finding">{data.finding}</p>
      <div className="dp-clip-quotes">
        {data.clips.map((clip) => {
          const on = playing === clip.name;
          return (
            <button
              key={clip.name}
              type="button"
              className={["dp-clip-quote", "dlg-route-clip-row", on ? "dp-clip-quote--selected" : ""]
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
              {on ? (
                <div className="dlg-live__clip" style={clipRange(clip.start, clip.end)}>
                  <DialogueInterviewPlayer current={clip.start} />
                </div>
              ) : null}
            </button>
          );
        })}
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
