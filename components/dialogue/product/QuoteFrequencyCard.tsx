import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import { formatChartCount } from "@/components/dialogue/product/chart/chartSpec";

const ROWS = [
  { label: "Address field", count: 14, focal: true },
  { label: "Delivery fees", count: 11 },
  { label: "Payment trust", count: 9 },
  { label: "Autocomplete", count: 7 },
] as const;

export default function QuoteFrequencyCard() {
  const rows = ROWS.map((row) => ({
    label: row.label,
    value: row.count,
    display: formatChartCount(row.count),
    focal: "focal" in row && row.focal,
  }));

  return (
    <ChartVizCard title="Mentions per theme in checkout interviews">
      <ChartBarList rows={rows} fillMode="magnitude" />
    </ChartVizCard>
  );
}
