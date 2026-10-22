import { formatChartCount } from "@/components/dialogue/product/chart/chartSpec";

export type ChartRankRow = {
  rank: number;
  label: string;
  value: number;
};

type Props = {
  rows: ChartRankRow[];
  className?: string;
};

/** Ranked magnitude list — theme ranking. One cherry accent on rank #1. */
export default function ChartRankList({ rows, className }: Props) {
  return (
    <ol className={["dp-chart-root dp-chart-rank", className].filter(Boolean).join(" ")}>
      {rows.map((row) => {
        const focal = row.rank === 1;
        return (
          <li key={row.label} className="dp-chart-rank__row">
            <span
              className={[
                "dp-chart-rank__num",
                focal ? "dp-chart-rank__num--focal" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {row.rank}
            </span>
            <span className="dp-chart-rank__label">{row.label}</span>
            <span className="dp-chart-rank__value">{formatChartCount(row.value)}</span>
          </li>
        );
      })}
    </ol>
  );
}
