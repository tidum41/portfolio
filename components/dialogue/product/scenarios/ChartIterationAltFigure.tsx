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
            <svg viewBox="0 0 220 150" className="dp-alt-radar__svg">
              <polygon
                points="110,22 168,112 52,112"
                fill="rgb(28 25 23 / 5%)"
                stroke="rgb(28 25 23 / 18%)"
              />
              <polygon
                points="110,52 140,100 76,100"
                fill="none"
                stroke="rgb(28 25 23 / 12%)"
              />
              <polygon
                points="110,30 154,104 84,96"
                fill="rgb(214 70 140 / 22%)"
                stroke="rgb(214 70 140 / 60%)"
              />
              <text x="110" y="14" textAnchor="middle" className="dp-alt-radar__label">
                {SEGMENT_ADDRESS.rows[0]?.label}
              </text>
              <text x="168" y="132" textAnchor="middle" className="dp-alt-radar__label">
                {SEGMENT_ADDRESS.rows[1]?.label}
              </text>
              <text x="52" y="132" textAnchor="middle" className="dp-alt-radar__label">
                {SEGMENT_ADDRESS.rows[2]?.label}
              </text>
            </svg>
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
