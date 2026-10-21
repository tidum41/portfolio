import { CHECKOUT_FUNNEL } from "@/lib/dialogue/product/sampleData";

type Props = {
  compact?: boolean;
  hero?: boolean;
  showFootnote?: boolean;
};

export default function FunnelChart({ compact, hero, showFootnote = true }: Props) {
  const data = CHECKOUT_FUNNEL;
  return (
    <div className={`dp-funnel${hero ? " dp-funnel--hero" : ""}`}>
      <p className="dp-summary">
        {data.summary.split(data.emphasis)[0]}
        <span className="dp-em">{data.emphasis}</span>
        {data.summary.split(data.emphasis)[1] ?? ""}
      </p>
      <p className="dp-funnel__title">Checkout funnel, % of participants still in flow</p>
      {data.steps.map((step) => (
        <div key={step.label} className="dp-funnel__row">
          <span className="dp-funnel__label">{step.label}</span>
          <div className="dp-funnel__track">
            <div className="dp-funnel__bar-wrap">
              <div className="dp-funnel__bar-inner">
                <div
                  className={`dp-funnel__bar${step.focal ? " dp-funnel__bar--focal" : ""}`}
                  style={{ width: `max(4px, calc(${step.pct}% - 2rem))` }}
                />
                <span className="dp-funnel__pct">{step.pct}%</span>
                <div className="dp-funnel__bar-rest" aria-hidden />
              </div>
            </div>
          </div>
        </div>
      ))}
      {!compact && !hero && (
        <p className="dp-text-meta dp-funnel__note">Largest drop: Shipping address (−38%)</p>
      )}
      {showFootnote && (
        <p className="dp-text-meta dp-funnel__note">Based on 24 of 24 interviews</p>
      )}
    </div>
  );
}
