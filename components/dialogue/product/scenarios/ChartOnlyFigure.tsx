import LineChart from "@/components/dialogue/product/LineChart";
import FunnelChart from "@/components/dialogue/product/FunnelChart";
import ThemeRankingCard from "@/components/dialogue/product/ThemeRankingCard";
import QuoteFrequencyCard from "@/components/dialogue/product/QuoteFrequencyCard";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import { formatChartCount, formatChartPercent } from "@/components/dialogue/product/chart/chartSpec";
import { COVERAGE_ADDRESS, SEGMENT_ADDRESS, SENTIMENT_LINE } from "@/lib/dialogue/product/sampleData";
import type { GalleryVariant } from "@/components/dialogue/product/scenarios/ChartGalleryFigure";

const DISTRIBUTION = [
  { label: "Never", pct: 22 },
  { label: "Once", pct: 39, focal: true },
  { label: "2–3×", pct: 27 },
  { label: "4+×", pct: 12 },
] as const;

/** Chart block only (no chat shell) for research thumbs, mapping, and hero collage. */
export default function ChartOnlyFigure({
  variant,
  collage,
}: {
  variant: GalleryVariant;
  /** Hero collage: chart-only tiles, no duplicate funnel summary. */
  collage?: boolean;
}) {
  switch (variant) {
    case "trend":
      return (
        <LineChart
          title={SENTIMENT_LINE.title}
          points={SENTIMENT_LINE.points}
          legend="Average sentiment score by prototype round"
          yMode="trend"
        />
      );
    case "funnel":
      return (
        <FunnelChart
          compact
          showLargestDrop={false}
          vizCard
          showSummary={!collage}
        />
      );
    case "segment":
      return (
        <ChartVizCard title={SEGMENT_ADDRESS.title} caption={SEGMENT_ADDRESS.caption}>
          <ChartBarList
            rows={SEGMENT_ADDRESS.rows.map((row) => ({
              label: row.label,
              value: row.pct,
              display: formatChartPercent(row.pct),
              focal: "focal" in row && row.focal,
            }))}
            max={100}
            fillMode="index"
          />
        </ChartVizCard>
      );
    case "distribution":
      return (
        <ChartVizCard title="Payment-trust mentions per interview">
          <ChartBarList
            rows={DISTRIBUTION.map((row) => ({
              label: row.label,
              value: row.pct,
              display: formatChartPercent(row.pct),
              focal: "focal" in row && row.focal,
            }))}
            max={100}
            fillMode="index"
          />
        </ChartVizCard>
      );
    case "theme":
      return <ThemeRankingCard />;
    case "quote-freq":
      return <QuoteFrequencyCard />;
    case "timeline":
      return (
        <LineChart
          title="Delivery fees spike after the cart step in round two."
          points={[
            { label: "Min 5", value: 1 },
            { label: "Min 12", value: 4 },
            { label: "Min 22", value: 11 },
            { label: "Min 31", value: 7 },
          ]}
          legend="Mentions of delivery fees across interview timeline"
          yMode="count"
        />
      );
    case "coverage":
      return (
        <ChartVizCard title={COVERAGE_ADDRESS.title} caption={COVERAGE_ADDRESS.detail}>
          <ChartBarList
            rows={COVERAGE_ADDRESS.rows.map((row) => ({
              label: row.label,
              value: row.count,
              display: formatChartCount(row.count),
            }))}
            fillMode="magnitude"
          />
        </ChartVizCard>
      );
    default:
      return null;
  }
}
