import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import QuoteCardH from "@/components/dialogue/product/hearthside/QuoteCardH";
import { COMPARISON_ROWS } from "@/lib/dialogue/product/hearthside";

/** One row per segment: its count as a bar row, then the quote behind the
    count with a small clip thumb beside it at every width. */
export default function ComparisonRowsFigure() {
  return (
    <div className="dp-compare-rows" data-annotate-part="comparison-rows">
      {COMPARISON_ROWS.map((row) => (
        <div key={row.segment} className="dp-compare-rows__group">
          <ChartBarList
            rows={[
              {
                label: `${row.segment.replace(" buyers", "")}, ${row.theme.charAt(0).toLowerCase()}${row.theme.slice(1)}`,
                value: row.mentioned,
                display: row.count,
                focal: true,
              },
            ]}
            max={row.total}
          />
          <div className="dp-compare-rows__media">
            <QuoteCardH quote={row.quote} />
            <div className="dp-hs-thumb dp-hs-thumb--small" data-annotate-part="comparison-clip">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={row.clipPhoto} alt="" className="dp-hs-thumb__img" />
              <span className="dp-hs-thumb__time">{row.clipTime}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
