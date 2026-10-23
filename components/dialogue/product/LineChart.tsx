import ChartLinePlot from "@/components/dialogue/product/chart/ChartLinePlot";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import { formatChartDecimal } from "@/components/dialogue/product/chart/chartSpec";

type Point = { label: string; value: number };

type Props = {
  title: string;
  points: Point[];
  legend: string;
  /** `trend` crops Y; `count` starts at 0 (timeline) */
  yMode?: "trend" | "count";
};

export default function LineChart({
  title,
  points,
  legend,
  yMode = "trend",
}: Props) {
  return (
    <div className="dp-line-chart">
      <p className="dp-summary dp-line-chart__summary">{title}</p>
      <ChartVizCard title={legend}>
        <ChartLinePlot
          points={points}
          yMode={yMode}
          formatValue={
            yMode === "count"
              ? (n) => String(Math.round(n))
              : (n) => formatChartDecimal(n)
          }
          seriesFocal={false}
        />
      </ChartVizCard>
    </div>
  );
}
