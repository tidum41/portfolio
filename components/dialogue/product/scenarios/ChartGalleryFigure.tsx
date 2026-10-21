import LineChart from "@/components/dialogue/product/LineChart";
import FunnelChart from "@/components/dialogue/product/FunnelChart";
import ThemeRankingCard from "@/components/dialogue/product/ThemeRankingCard";
import QuoteFrequencyCard from "@/components/dialogue/product/QuoteFrequencyCard";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import QuerySearchStep from "@/components/dialogue/product/QuerySearchStep";
import { formatChartCount, formatChartPercent } from "@/components/dialogue/product/chart/chartSpec";
import {
  CHECKOUT_QUESTION,
  COVERAGE_ADDRESS,
  SEGMENT_ADDRESS,
  SENTIMENT_LINE,
} from "@/lib/dialogue/product/sampleData";

export type GalleryVariant =
  | "trend"
  | "funnel"
  | "segment"
  | "distribution"
  | "theme"
  | "quote-freq"
  | "timeline"
  | "coverage";

const DISTRIBUTION = [
  { label: "Never", pct: 22 },
  { label: "Once", pct: 39, focal: true },
  { label: "2–3×", pct: 27 },
  { label: "4+×", pct: 12 },
] as const;

export default function ChartGalleryFigure({ variant }: { variant: GalleryVariant }) {
  switch (variant) {
    case "trend":
      return (
        <StudyChatShell>
          <UserMessageBubble>{SENTIMENT_LINE.question}</UserMessageBubble>
          <QuerySearchStep searched={24} found={18} />
          <LineChart
            title={SENTIMENT_LINE.title}
            points={SENTIMENT_LINE.points}
            legend="Average sentiment score by prototype round"
            yMode="trend"
          />
        </StudyChatShell>
      );
    case "funnel":
      return (
        <StudyChatShell>
          <UserMessageBubble>{CHECKOUT_QUESTION}</UserMessageBubble>
          <QuerySearchStep searched={24} found={9} />
          <FunnelChart />
        </StudyChatShell>
      );
    case "segment":
      return (
        <StudyChatShell compact>
          <UserMessageBubble>{SEGMENT_ADDRESS.question}</UserMessageBubble>
          <QuerySearchStep searched={24} found={11} />
          <p className="dp-summary">{SEGMENT_ADDRESS.summary}</p>
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
        </StudyChatShell>
      );
    case "distribution":
      return (
        <StudyChatShell compact>
          <UserMessageBubble>How often did payment trust come up?</UserMessageBubble>
          <QuerySearchStep searched={24} found={14} />
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
        </StudyChatShell>
      );
    case "theme":
      return (
        <StudyChatShell compact>
          <UserMessageBubble>Top themes in checkout frustration</UserMessageBubble>
          <QuerySearchStep searched={24} found={16} />
          <ThemeRankingCard />
        </StudyChatShell>
      );
    case "quote-freq":
      return (
        <StudyChatShell compact>
          <UserMessageBubble>How often did address friction come up?</UserMessageBubble>
          <QuerySearchStep searched={24} found={14} />
          <QuoteFrequencyCard />
        </StudyChatShell>
      );
    case "timeline":
      return (
        <StudyChatShell compact>
          <UserMessageBubble>When did participants mention delivery fees?</UserMessageBubble>
          <QuerySearchStep searched={24} found={12} />
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
        </StudyChatShell>
      );
    case "coverage":
      return (
        <StudyChatShell compact>
          <UserMessageBubble>{COVERAGE_ADDRESS.question}</UserMessageBubble>
          <QuerySearchStep searched={24} found={18} />
          <p className="dp-summary">{COVERAGE_ADDRESS.headline}.</p>
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
        </StudyChatShell>
      );
    default:
      return null;
  }
}
