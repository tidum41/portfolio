import WireframeMedia from "../shell/WireframeMedia";
import { applyFieldOverrides } from "./tokens";
import { projectById } from "./projects";
import type { ConceptDefinition, ConceptVariant, RenderContext } from "./types";

const ASPECT = "4 / 3";
const PROJECT = projectById("bruinlease");

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
  const metrics = PROJECT.metrics.slice(0, v.metricCount);

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
      data-cl-project={PROJECT.id}
    >
      {v.metricPlacement === "left" ? (
        <div className="cl-metric__text" data-cl-copy>
          <p className="cl-metric__title" data-cl-card-title>
            {PROJECT.title}
          </p>
          <p className="cl-metric__desc" data-cl-card-desc>
            {PROJECT.subtitle}
          </p>
          <div className="cl-metric__metrics" data-cl-metrics>
            {metrics.map((m) => (
              <div key={m.line} className="cl-metric__metric" data-cl-metric>
                <p className="cl-metric__value">{m.value}</p>
                <p className="cl-metric__caption">{m.line.replace(m.value, "").trim() || m.line}</p>
              </div>
            ))}
          </div>
          <span className="cl-metric__cta" data-cl-cta>
            Open case study
          </span>
        </div>
      ) : null}
      <div className="cl-metric__media-wrap" data-cl-media-wrap>
        <WireframeMedia
          kind={PROJECT.wireframe}
          aspect={ASPECT}
          fill={v.metricPlacement === "left"}
          radius={16}
          className="cl-metric__media"
          play={force}
        />
        {v.metricPlacement === "on-media" ? (
          <div className="cl-metric__on-media" data-cl-copy>
            <div className="cl-metric__metrics" data-cl-metrics>
              {metrics.map((m) => (
                <div key={m.line} className="cl-metric__metric" data-cl-metric>
                  <p className="cl-metric__value">{m.value}</p>
                  <p className="cl-metric__caption">{m.line.replace(m.value, "").trim() || m.line}</p>
                </div>
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
            {PROJECT.title}
          </p>
          <p className="cl-metric__desc" data-cl-card-desc>
            {PROJECT.subtitle}
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
  mediaIndex: 0,
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
