import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import QuoteCardH from "@/components/dialogue/product/hearthside/QuoteCardH";
import { COMPARISON_ROWS } from "@/lib/dialogue/product/hearthside";

/** One row per segment inside the shared 448 panel: a short segment label
    on its count bar, the claim it measures, then the quote behind the
    count with a small clip thumb beside it. */
export default function ComparisonRowsFigure() {
  return (
    <div className="dp-compare-panel" data-annotate-part="comparison-panel">
      <div className="dp-compare-rows">
        {COMPARISON_ROWS.map((row) => (
          <div key={row.segment} className="dp-compare-rows__group">
            <ChartBarList
              rows={[
                {
                  label: row.segment.replace(" buyers", ""),
                  value: row.mentioned,
                  display: row.count,
                  focal: true,
                },
              ]}
              max={row.total}
            />
            <p className="dp-compare-rows__theme">{row.theme}</p>
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
    </div>
  );
}
