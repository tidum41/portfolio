import { CHECKOUT_FUNNEL } from "@/lib/dialogue/product/sampleData";

type Props = {
  compact?: boolean;
  hero?: boolean;
  showFootnote?: boolean;
  anatomy?: boolean;
};

export default function FunnelChart({
  compact,
  hero,
  showFootnote = true,
  anatomy,
}: Props) {
  const data = CHECKOUT_FUNNEL;
  const summary = (
    <p className="dp-summary">
      {data.summary.split(data.emphasis)[0]}
      <span className="dp-em">{data.emphasis}</span>
      {data.summary.split(data.emphasis)[1] ?? ""}
    </p>
  );

  const chartInner = (
    <>
      <p className="dp-funnel__title">Checkout funnel, % of participants still in flow</p>
      {data.steps.map((step) => (
        <div key={step.label} className="dp-funnel__row">
          <span className="dp-funnel__label">{step.label}</span>
          <div className="dp-funnel__track">
            <div
              className={`dp-funnel__bar${step.focal ? " dp-funnel__bar--focal" : ""}`}
              style={{ width: `${step.pct}%` }}
            />
          </div>
          <span className="dp-funnel__pct">{step.pct}%</span>
        </div>
      ))}
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

  return (
    <div className={`dp-funnel${hero ? " dp-funnel--hero" : ""}`}>
      {summary}
      {chart}
      {!compact && !hero && (
        <p className="dp-text-meta dp-funnel__note">Largest drop: Shipping address (−38%)</p>
      )}
      {showFootnote && (
        <p className="dp-text-meta dp-funnel__note">Based on 24 of 24 interviews</p>
      )}
    </div>
  );
}
