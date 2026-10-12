import PlaceholderMedia from "../shell/PlaceholderMedia";
import { applyFieldOverrides } from "./tokens";
import type { ConceptDefinition, ConceptVariant, RenderContext } from "./types";

const ASPECT = "4 / 3";
const MEDIA_INDEX = 0;
const TITLE = "Table redesign";
const DESC = "Unifying reorder surfaces for ops.";
const METRIC_A = "83% faster reorders";
const METRIC_B = "11 → 1 tables";

export type OutcomeMetricVariant = ConceptVariant & {
  id: "a" | "b" | "c";
  metricPlacement: "left" | "on-media";
  metricCount: 1 | 2;
};

function OutcomeMetricCard({
  v,
  ctx,
}: {
  v: OutcomeMetricVariant;
  ctx?: RenderContext;
}) {
  const force = !!ctx?.forceHover;
  const metrics =
    v.metricCount === 2 ? [METRIC_A, METRIC_B] : [METRIC_A];

  return (
    <div
      className="cl-metric"
      data-cl-card
      data-cl-kind="outcome-metric"
      data-cl-direction="6"
      data-cl-variant={v.id}
      data-cl-metric-placement={v.metricPlacement}
      data-cl-metric-count={String(v.metricCount)}
      data-cl-force-hover={force ? "1" : "0"}
    >
      {v.metricPlacement === "left" ? (
        <div className="cl-metric__text" data-cl-copy>
          <p className="cl-metric__title" data-cl-card-title>
            {TITLE}
          </p>
          <p className="cl-metric__desc" data-cl-card-desc>
            {DESC}
          </p>
          <div className="cl-metric__metrics" data-cl-metrics>
            {metrics.map((m) => (
              <p key={m} className="cl-metric__value" data-cl-metric>
                {m}
              </p>
            ))}
          </div>
          <span className="cl-metric__cta" data-cl-cta>
            Open case study
          </span>
        </div>
      ) : null}
      <div className="cl-metric__media-wrap" data-cl-media-wrap>
        <PlaceholderMedia
          aspect={ASPECT}
          mediaIndex={MEDIA_INDEX}
          radius={16}
          className="cl-metric__media"
        />
        {v.metricPlacement === "on-media" ? (
          <div className="cl-metric__on-media" data-cl-copy>
            <div className="cl-metric__metrics" data-cl-metrics>
              {metrics.map((m) => (
                <p key={m} className="cl-metric__value" data-cl-metric>
                  {m}
                </p>
              ))}
            </div>
            <span className="cl-metric__cta" data-cl-cta>
              Open case study
            </span>
          </div>
        ) : null}
      </div>
      {v.metricPlacement === "on-media" ? (
        <div className="cl-metric__below" data-cl-copy-secondary>
          <p className="cl-metric__title" data-cl-card-title>
            {TITLE}
          </p>
          <p className="cl-metric__desc" data-cl-card-desc>
            {DESC}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export const outcomeMetric: ConceptDefinition<OutcomeMetricVariant> = {
  id: "outcome-metric",
  kind: "outcome-metric",
  overrideKey: "d6",
  name: "Outcome metric card",
  intent:
    "A large outcome metric sits beside or on the media with a black pill CTA.",
  aspect: ASPECT,
  mediaIndex: MEDIA_INDEX,
  variants: [
    { id: "a", metricPlacement: "left", metricCount: 1 },
    { id: "b", metricPlacement: "left", metricCount: 2 },
    { id: "c", metricPlacement: "on-media", metricCount: 1 },
  ],
  label: (v) =>
    `${v.id} · metric ${v.metricPlacement} · count ${v.metricCount}`,
  applyOverrides: (v, params) => applyFieldOverrides("d6", v.id, v, params),
  render: (v, ctx) => <OutcomeMetricCard v={v} ctx={ctx} />,
};
