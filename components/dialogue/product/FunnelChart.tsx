import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import { formatChartPercent } from "@/components/dialogue/product/chart/chartSpec";
import { CHECKOUT_FUNNEL } from "@/lib/dialogue/product/sampleData";
import { dialogueCopy } from "@/components/dialogue/product/tokens";

type Props = {
  compact?: boolean;
  hero?: boolean;
  showLargestDrop?: boolean;
  anatomy?: boolean;
  /** Wrap summary + chart in bordered viz-card. */
  vizCard?: boolean;
};

export default function FunnelChart({
  compact,
  hero,
  showLargestDrop = true,
  anatomy,
  vizCard = true,
}: Props) {
  const data = CHECKOUT_FUNNEL;
  const rows = data.steps.map((step) => ({
    label: step.label,
    value: step.pct,
    display: formatChartPercent(step.pct),
    focal: Boolean(step.focal),
  }));

  const summaryBody = (
    <p className="dp-summary dp-text-body">
      {data.summary.split(data.emphasis)[0]}
      <span className="dp-summary__emph">{data.emphasis}</span>
      {data.summary.split(data.emphasis)[1] ?? ""}
    </p>
  );
  const summary = anatomy ? (
    <div className="dp-anatomy-target" data-anatomy-part="summary">
      <span className="dp-anatomy-part-marker" aria-hidden>
        2
      </span>
      {summaryBody}
    </div>
  ) : (
    summaryBody
  );

  const note =
    showLargestDrop && !compact ? (
      <>
        Largest drop:{" "}
        <strong>
          {dialogueCopy.funnelLargestDrop} (−{dialogueCopy.funnelLargestDropPct}%)
        </strong>
      </>
    ) : undefined;

  const bars = (
    <ChartBarList rows={rows} max={100} fillMode="index" note={note} />
  );

  const plot = vizCard ? (
    <ChartVizCard title={dialogueCopy.funnelTitle}>{bars}</ChartVizCard>
  ) : (
    <div className="dp-chart-root">
      <p className="dp-chart-title">{dialogueCopy.funnelTitle}</p>
      {bars}
    </div>
  );

  const chart = anatomy ? (
    <div className="dp-anatomy-target" data-anatomy-part="chart">
      <span className="dp-anatomy-part-marker" aria-hidden>
        3
      </span>
      {plot}
    </div>
  ) : (
    plot
  );

  return (
    <div className={`dp-funnel${hero ? " dp-funnel--hero" : ""}`}>
      {summary}
      {chart}
    </div>
  );
}
