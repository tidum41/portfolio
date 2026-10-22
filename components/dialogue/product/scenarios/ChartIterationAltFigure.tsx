import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import { formatChartPercent } from "@/components/dialogue/product/chart/chartSpec";
import { CHECKOUT_FUNNEL, SEGMENT_ADDRESS, SENTIMENT_LINE } from "@/lib/dialogue/product/sampleData";

export type IterationAlt = "plain-table" | "radar" | "heatmap" | "percent-row";

/** Rejected chart ideas for the library "before" thumbnails. */
export default function ChartIterationAltFigure({ alt }: { alt: IterationAlt }) {
  switch (alt) {
    case "plain-table":
      return (
        <ChartVizCard title="Checkout step loss">
          <table className="dp-alt-table">
            <tbody>
              {CHECKOUT_FUNNEL.steps.slice(0, 4).map((step) => (
                <tr key={step.label}>
                  <th scope="row">{step.label}</th>
                  <td>{step.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartVizCard>
      );
    case "radar":
      return (
        <ChartVizCard title="Segment radar">
          <div className="dp-alt-radar" aria-hidden>
            <svg viewBox="0 0 120 100" className="dp-alt-radar__svg">
              <polygon
                points="60,12 95,38 78,88 42,88 25,38"
                fill="rgb(28 25 23 / 6%)"
                stroke="rgb(28 25 23 / 18%)"
              />
              <polygon
                points="60,22 88,42 74,78 46,78 32,42"
                fill="rgb(214 70 140 / 22%)"
                stroke="rgb(214 70 140 / 55%)"
              />
            </svg>
            <ul className="dp-alt-radar__labels">
              {SEGMENT_ADDRESS.rows.map((row) => (
                <li key={row.label}>{row.label}</li>
              ))}
            </ul>
          </div>
        </ChartVizCard>
      );
    case "heatmap":
      return (
        <ChartVizCard title="Sentiment by round">
          <div className="dp-alt-heatmap" aria-hidden>
            {SENTIMENT_LINE.points.map((p, row) => (
              <div key={p.label} className="dp-alt-heatmap__row">
                <span className="dp-alt-heatmap__label">{p.label}</span>
                <div className="dp-alt-heatmap__cells">
                  {[2.1, 2.4, p.value, 3.2, 3.5].map((v, col) => (
                    <span
                      key={col}
                      className="dp-alt-heatmap__cell"
                      style={{
                        background: `rgb(214 70 140 / ${0.12 + (v / 4) * 0.45})`,
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ChartVizCard>
      );
    case "percent-row":
      return (
        <ChartVizCard title="Interview agreement">
          <ChartBarList
            rows={[
              { label: "Agree", value: 72, display: formatChartPercent(72) },
              { label: "Unsure", value: 18, display: formatChartPercent(18) },
              { label: "Disagree", value: 10, display: formatChartPercent(10) },
            ]}
            max={100}
            fillMode="index"
          />
        </ChartVizCard>
      );
    default:
      return null;
  }
}
