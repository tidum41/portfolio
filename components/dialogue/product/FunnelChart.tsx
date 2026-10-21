import { CHECKOUT_FUNNEL } from "@/lib/dialogue/product/sampleData";
import { dialogueCopy } from "@/components/dialogue/product/tokens";

type Props = {
  compact?: boolean;
  hero?: boolean;
  showLargestDrop?: boolean;
  anatomy?: boolean;
  /** Wrap summary + chart in bordered viz-card (Paper section-3). */
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

  const chartInner = (
    <>
      <p className="dp-funnel__title">{dialogueCopy.funnelTitle}</p>
      <div className="dp-funnel__rows">
        {data.steps.map((step) => (
          <div key={step.label} className="dp-funnel__row">
            <span className="dp-funnel__label">{step.label}</span>
            <div className="dp-funnel__track">
              <div
                className={`dp-funnel__bar${step.focal ? " dp-funnel__bar--focal" : ""}`}
                style={{
                  width: `${step.pct}%`,
                  backgroundColor: step.barColor,
                }}
              />
            </div>
            <span
              className={`dp-funnel__pct${step.focal ? " dp-funnel__pct--focal" : ""}`}
            >
              {step.pct}%
            </span>
          </div>
        ))}
      </div>
      {showLargestDrop && !compact && (
        <p className="dp-funnel__largest">
          Largest drop:{" "}
          <span className="dp-funnel__largest-strong">
            {dialogueCopy.funnelLargestDrop} (−{dialogueCopy.funnelLargestDropPct}%)
          </span>
        </p>
      )}
    </>
  );

  const chart = anatomy ? (
    <div className="dp-anatomy-target" data-anatomy-part="chart">
      <span className="dp-anatomy-part-marker" aria-hidden>3</span>
      <div className="dp-funnel__chart">{chartInner}</div>
    </div>
  ) : (
    <div className="dp-funnel__chart">{chartInner}</div>
  );

  const inner = (
    <>
      {summary}
      {chart}
    </>
  );

  const body = vizCard ? (
    <div className="dp-viz-card" data-testid="viz-card">
      <div className="dp-viz-card__inner">{inner}</div>
    </div>
  ) : (
    inner
  );

  return <div className={`dp-funnel${hero ? " dp-funnel--hero" : ""}`}>{body}</div>;
}
