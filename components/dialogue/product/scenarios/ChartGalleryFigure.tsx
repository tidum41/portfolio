import LineChart from "@/components/dialogue/product/LineChart";
import FunnelChart from "@/components/dialogue/product/FunnelChart";
import ThemeRankingCard from "@/components/dialogue/product/ThemeRankingCard";
import QuoteFrequencyCard from "@/components/dialogue/product/QuoteFrequencyCard";
import CoverageCallout from "@/components/dialogue/product/CoverageCallout";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import QuerySearchStep from "@/components/dialogue/product/QuerySearchStep";
import { formatChartPercent } from "@/components/dialogue/product/chart/chartSpec";
import { CHECKOUT_QUESTION, SENTIMENT_LINE } from "@/lib/dialogue/product/sampleData";

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
  { label: "Never", pct: 18 },
  { label: "Once", pct: 42, focal: true },
  { label: "2–3×", pct: 28 },
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
          <UserMessageBubble>Which segment struggled with address validation?</UserMessageBubble>
          <QuerySearchStep searched={24} found={11} />
          <p className="dp-summary">
            Mobile participants reported autocomplete resets 2× more often.
          </p>
          <FunnelChart compact />
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
              { label: "Min 5", value: 2 },
              { label: "Min 12", value: 5 },
              { label: "Min 22", value: 9 },
              { label: "Min 31", value: 6 },
            ]}
            legend="Mentions of delivery fees across interview timeline"
            yMode="count"
          />
        </StudyChatShell>
      );
    case "coverage":
      return (
        <StudyChatShell compact>
          <UserMessageBubble>{CHECKOUT_QUESTION}</UserMessageBubble>
          <QuerySearchStep searched={24} found={9} />
          <CoverageCallout
            headline="18 of 24 participants mentioned address friction"
            detail="75% coverage on the shipping step in this study"
          />
          <FunnelChart compact vizCard={false} showLargestDrop={false} />
        </StudyChatShell>
      );
    default:
      return null;
  }
}
