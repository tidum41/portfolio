import TextChart from "@/components/dialogue/product/chart/TextChart";
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
  showSummary?: boolean;
  showChart?: boolean;
};

export default function FunnelChart({
  compact,
  hero,
  showLargestDrop = true,
  anatomy,
  vizCard: _vizCard = true,
  showSummary = true,
  showChart = true,
}: Props) {
  const data = CHECKOUT_FUNNEL;
  const rows = data.steps.map((step) => ({
    label: step.label,
    value: step.pct,
    display: formatChartPercent(step.pct),
    focal: Boolean(step.focal),
  }));

  const summaryBody = (
    <p className="dp-summary dp-text-body" data-annotate-part="summary">
      {data.summary.split(data.emphasis)[0]}
      <span className="dp-summary__emph" data-annotate-part="summary-emphasis">{data.emphasis}</span>
      {data.summary.split(data.emphasis)[1] ?? ""}
    </p>
  );
  const summary = anatomy ? (
    <div className="dp-anatomy-target" data-anatomy-part="summary" data-annotate-part="anatomy-summary">
      <span className="dp-anatomy-part-marker" aria-hidden data-annotate-part="anatomy-marker-1">
        1
      </span>
      {summaryBody}
      <p className="dp-source-line" data-annotate-part="source-line">
        From 9 checkout moments, including{" "}
        <span className="dp-source-line__link">Jordan M. at 14:03–14:19</span>
      </p>
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

  const plot = (
    <>
      <TextChart title={dialogueCopy.funnelTitle} rows={rows} columns={["Step", "Still in flow"]} max={100} />
      {note ? <p className="dp-chart-bars__note" data-annotate-part="bars-note">{note}</p> : null}
    </>
  );

  const chart = anatomy ? (
    <div className="dp-anatomy-target" data-anatomy-part="chart" data-annotate-part="anatomy-chart">
      <span className="dp-anatomy-part-marker" aria-hidden data-annotate-part="anatomy-marker-3">
        3
      </span>
      {plot}
    </div>
  ) : (
    plot
  );

  return (
    <div className={`dp-funnel${hero ? " dp-funnel--hero" : ""}`}>
      {showSummary ? summary : null}
      {showChart ? chart : null}
    </div>
  );
}
