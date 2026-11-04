"use client";

import QuoteListFigure from "@/components/dialogue/product/scenarios/QuoteListFigure";
import type { QuoteResolved } from "@/lib/dialogue/routing/sampleDataset";

type Props = {
  data: QuoteResolved;
  /** Kept for screenshot harnesses that previously forced a selection. */
  initialSelected?: number;
};

/** Quote list: the live QuoteListFigure, fed by the routed example dataset. */
export default function QuoteListTemplate({ data }: Props) {
  return (
    <div className="dlg-route-answer" data-template="quote_list">
      <p className="dlg-route-finding">{data.finding}</p>
      <QuoteListFigure
        focus="answer"
        quotes={data.quotes.map((q) => ({
          participant: q.name,
          time: q.time,
          quote: q.quote,
        }))}
      />
    </div>
  );
}
