import { CHECKOUT_FUNNEL } from "@/lib/dialogue/product/sampleData";

type Props = { compact?: boolean };

export default function FunnelChart({ compact }: Props) {
  const data = CHECKOUT_FUNNEL;
  return (
    <div className="dp-funnel">
      <p className="dp-summary">
        {data.summary.split(data.emphasis)[0]}
        <span className="dp-em">{data.emphasis}</span>
        {data.summary.split(data.emphasis)[1] ?? ""}
      </p>
      <p className="dp-funnel__title">Checkout funnel, % of participants still in flow</p>
      {data.steps.map((step) => (
        <div key={step.label} className="dp-funnel__row">
          <div className="dp-funnel__row-main">
            <span className="dp-funnel__label">{step.label}</span>
            <div className="dp-funnel__bar-wrap">
              <div
                className={`dp-funnel__bar${step.focal ? " dp-funnel__bar--focal" : ""}`}
                style={{ width: `${step.pct}%` }}
              />
            </div>
          </div>
          <span className="dp-funnel__pct">{step.pct}%</span>
        </div>
      ))}
      {!compact && (
        <p className="dp-text-meta" style={{ margin: "6px 0 0" }}>
          Largest drop: Shipping address (−38%)
        </p>
      )}
      <p className="dp-text-meta" style={{ margin: "4px 0 0" }}>Based on 24 of 24 interviews</p>
    </div>
  );
}
