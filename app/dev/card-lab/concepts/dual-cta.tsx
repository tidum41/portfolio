import WireframeMedia from "../shell/WireframeMedia";
import { applyFieldOverrides } from "./tokens";
import { projectById } from "./projects";
import type { ConceptDefinition, ConceptVariant, RenderContext } from "./types";

const ASPECT = "16 / 10";
const PROJECT = projectById("todolist");

export type DualCtaVariant = ConceptVariant & {
  id: "a" | "b" | "c";
  ctaPlacement: "center" | "bottom" | "stack";
  edge: "gradient" | "hairline";
};

function DualCtaCard({
  v,
  ctx,
}: {
  v: DualCtaVariant;
  ctx?: RenderContext;
}) {
  const force = !!ctx?.forceHover;
  return (
    <div
      className="cl-dual"
      data-cl-card
      data-cl-kind="dual-cta"
      data-cl-direction="9"
      data-cl-variant={v.id}
      data-cl-cta-placement={v.ctaPlacement}
      data-cl-edge={v.edge}
      data-cl-force-hover={force ? "1" : "0"}
      data-cl-project={PROJECT.id}
    >
      <div className="cl-dual__media-wrap" data-cl-media-wrap>
        <span
          className="cl-dual__edge"
          data-cl-edge-layer
          data-cl-edge={v.edge}
          aria-hidden="true"
        />
        <WireframeMedia
          kind={PROJECT.wireframe}
          aspect={ASPECT}
          radius={12}
          className="cl-dual__media"
          dimmed
        />
        <div
          className={`cl-dual__ctas cl-dual__ctas--${v.ctaPlacement}`}
          data-cl-ctas
        >
          <span className="cl-dual__cta" data-cl-cta>
            View case study
          </span>
          <span className="cl-dual__cta" data-cl-cta>
            {PROJECT.liveLabel}
          </span>
        </div>
      </div>
      <div className="cl-dual__copy" data-cl-copy>
        <p className="cl-dual__title" data-cl-card-title>
          {PROJECT.title}
        </p>
        <p className="cl-dual__desc" data-cl-card-desc>
          {PROJECT.subtitle}
        </p>
      </div>
    </div>
  );
}

export const dualCta: ConceptDefinition<DualCtaVariant> = {
  id: "dual-cta",
  kind: "dual-cta",
  overrideKey: "d9",
  name: "Dual CTA over dimmed media",
  intent:
    "Two CTA pills fade in over dimmed media; a gradient hairline can rim the edge.",
  aspect: ASPECT,
  mediaIndex: 0,
  variants: [
    { id: "a", ctaPlacement: "center", edge: "gradient" },
    { id: "b", ctaPlacement: "bottom", edge: "gradient" },
    { id: "c", ctaPlacement: "stack", edge: "hairline" },
  ],
  label: (v) => `${v.id} · ctas ${v.ctaPlacement} · edge ${v.edge}`,
  applyOverrides: (v, params) => applyFieldOverrides("d9", v.id, v, params),
  render: (v, ctx) => <DualCtaCard v={v} ctx={ctx} />,
};
