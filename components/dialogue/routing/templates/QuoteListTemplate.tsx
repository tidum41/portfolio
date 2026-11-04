"use client";

import { useState } from "react";
import SourcePill from "@/components/dialogue/product/SourcePill";
import { WaveformIcon } from "@/components/dialogue/product/icons";
import type { QuoteResolved } from "@/lib/dialogue/routing/sampleDataset";

type Props = {
  data: QuoteResolved;
  initialSelected?: number;
};

/** Quote list with speaker and timestamp source-pill chips. No coloured left bar. */
export default function QuoteListTemplate({ data, initialSelected = 0 }: Props) {
  const [selected, setSelected] = useState(initialSelected);
  const active = data.quotes[selected] ?? data.quotes[0];

  return (
    <div className="dlg-route-answer" data-template="quote_list">
      <p className="dlg-route-finding">{data.finding}</p>
      <div className="dlg-route-pills" role="list">
        {data.quotes.map((q, i) => (
          <button
            key={q.name}
            type="button"
            className="dlg-route-pill-btn"
            aria-pressed={i === selected}
            onClick={() => setSelected(i)}
          >
            <SourcePill
              name={q.name}
              time={q.time.split("\u2013")[0]}
              selected={i === selected}
            />
          </button>
        ))}
      </div>
      {active ? (
        <div className="dp-clip-quote dp-clip-quote--selected">
          <p className="dp-clip-quote__who">
            <WaveformIcon className="dp-clip-quote__icon" />
            <span className="dp-clip-quote__name">{active.name}</span>
            <span className="dp-clip-quote__time">{active.time}</span>
          </p>
          <p className="dp-clip-quote__text">{active.quote}</p>
        </div>
      ) : null}
    </div>
  );
}
