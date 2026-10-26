import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import QuoteCardH from "@/components/dialogue/product/hearthside/QuoteCardH";
import { COMPARISON_ROWS } from "@/lib/dialogue/product/hearthside";

/** One row per segment: the segment and its theme, its count as a bar, the
    quote behind the count, and the clip. */
export default function ComparisonRowsFigure() {
  return (
    <div className="dp-compare-rows" data-annotate-part="comparison-rows">
      {COMPARISON_ROWS.map((row) => (
        <div key={row.segment} className="dp-compare-rows__group">
          <p className="dp-compare-rows__head">
            <span className="dp-compare-rows__segment">{row.segment}</span>
            <span className="dp-compare-rows__theme">{row.theme}</span>
            <span className="dp-compare-rows__count">{row.count}</span>
          </p>
          <ChartStackedBar
            total={row.total}
            segments={[
              { label: "Mentioned it", value: row.mentioned, display: row.count, focal: true },
              { label: "Did not", value: row.total - row.mentioned, display: `${row.total - row.mentioned} of ${row.total}` },
            ]}
          />
          <QuoteCardH quote={row.quote} />
          <div className="dp-hs-thumb" data-annotate-part="comparison-clip">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={row.clipPhoto} alt="" className="dp-hs-thumb__img" />
            <span className="dp-hs-thumb__time">{row.clipTime}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
