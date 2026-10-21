import ChartRankList from "@/components/dialogue/product/chart/ChartRankList";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";

const THEMES = [
  { rank: 1, label: "Address validation", value: 18 },
  { rank: 2, label: "Unexpected fees", value: 15 },
  { rank: 3, label: "Saved payment", value: 12 },
] as const;

export default function ThemeRankingCard() {
  return (
    <ChartVizCard
      title="Top themes by interview count"
      caption="Counts across 24 checkout interviews"
    >
      <ChartRankList rows={[...THEMES]} />
    </ChartVizCard>
  );
}
