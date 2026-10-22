import HeroChatCard from "@/components/dialogue/product/scenarios/HeroChatCard";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartLinePlot from "@/components/dialogue/product/chart/ChartLinePlot";
import ChartRankList from "@/components/dialogue/product/chart/ChartRankList";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import {
  formatChartCount,
  formatChartDecimal,
  formatChartPercent,
} from "@/components/dialogue/product/chart/chartSpec";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import {
  CHECKOUT_FUNNEL,
  COVERAGE_ADDRESS,
  SEGMENT_ADDRESS,
  SENTIMENT_LINE,
} from "@/lib/dialogue/product/sampleData";

const THEMES = [
  { rank: 1, label: "Address validation", value: 17 },
  { rank: 2, label: "Unexpected fees", value: 13 },
  { rank: 3, label: "Payment retry", value: 10 },
];

function Tile({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div
      className={`dp-hero-collage__tile dp-hero-collage__tile--${id} dialogue-product-root dp-chat-panel-typography ${dialogueProductFontClassName}`}
    >
      {children}
    </div>
  );
}

/** Hero collage: chat card plus six library charts at mixed sizes, scattered and overlapping. */
export default function HeroStructuredFigure() {
  return (
    <div className="dp-hero-collage dialogue-product-root">
      <div className="dp-hero-collage__stage">
        <Tile id="funnel">
          <ChartVizCard title="Drop-off by step">
            <ChartBarList
              rows={CHECKOUT_FUNNEL.steps.slice(0, 4).map((s) => ({
                label: s.label,
                value: s.pct,
                display: formatChartPercent(s.pct),
                focal: Boolean(s.focal),
              }))}
              max={100}
              fillMode="index"
            />
          </ChartVizCard>
        </Tile>
        <Tile id="segment">
          <ChartVizCard title="Resets by segment">
            <ChartBarList
              rows={SEGMENT_ADDRESS.rows.map((r) => ({
                label: r.label,
                value: r.pct,
                display: formatChartPercent(r.pct),
                focal: "focal" in r && r.focal,
              }))}
              max={100}
              fillMode="index"
            />
          </ChartVizCard>
        </Tile>
        <Tile id="trend">
          <ChartVizCard title="Sentiment by round">
            <ChartLinePlot
              points={SENTIMENT_LINE.points}
              yMode="trend"
              formatValue={(n) => formatChartDecimal(n)}
              seriesFocal={false}
            />
          </ChartVizCard>
        </Tile>
        <Tile id="coverage">
          <ChartVizCard title="Who agrees">
            <ChartBarList
              rows={COVERAGE_ADDRESS.rows.map((r) => ({
                label: r.label === "Mentioned it" ? "Said it" : "Didn't",
                value: r.count,
                display: formatChartCount(r.count),
              }))}
              fillMode="magnitude"
            />
          </ChartVizCard>
        </Tile>
        <Tile id="themes">
          <ChartVizCard title="Top themes">
            <ChartRankList rows={THEMES} />
          </ChartVizCard>
        </Tile>
        <div className="dp-hero-collage__tile dp-hero-collage__tile--clip" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/dev/dialogue-static/clip-photos/clip-02.jpg" alt="" decoding="async" />
          <span>15:47</span>
        </div>
        <div className="dp-hero-collage__chat">
          <HeroChatCard />
        </div>
      </div>
    </div>
  );
}
