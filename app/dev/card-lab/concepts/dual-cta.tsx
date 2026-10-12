import PlaceholderMedia from "../shell/PlaceholderMedia";
import { applyFieldOverrides } from "./tokens";
import type { ConceptDefinition, ConceptVariant, RenderContext } from "./types";

const ASPECT = "16 / 10";
const MEDIA_INDEX = 1;
const TITLE = "Retail ads UX";
const DESC = "Design engineering on ad tools.";

export type DualCtaVariant = ConceptVariant & {
  id: "a" | "b" | "c";
  ctaPlacement: "center" | "bottom";
  edge: "gradient" | "hairline" | "none";
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
    >
      <div className="cl-dual__media-wrap" data-cl-media-wrap>
        {v.edge !== "none" ? (
          <span
            className="cl-dual__edge"
            data-cl-edge-layer
            data-cl-edge={v.edge}
            aria-hidden="true"
          />
        ) : null}
        <PlaceholderMedia
          aspect={ASPECT}
          mediaIndex={MEDIA_INDEX}
          radius={12}
          className="cl-dual__media"
        />
        <div
          className="cl-dual__dim"
          data-cl-dim
          aria-hidden="true"
        />
        <div
          className={`cl-dual__ctas cl-dual__ctas--${v.ctaPlacement}`}
          data-cl-ctas
        >
          <span className="cl-dual__cta" data-cl-cta>
            View case study
          </span>
          <span className="cl-dual__cta" data-cl-cta>
            Live site
          </span>
        </div>
      </div>
      <div className="cl-dual__copy" data-cl-copy>
        <p className="cl-dual__title" data-cl-card-title>
          {TITLE}
        </p>
        <p className="cl-dual__desc" data-cl-card-desc>
          {DESC}
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
  mediaIndex: MEDIA_INDEX,
  variants: [
    { id: "a", ctaPlacement: "center", edge: "gradient" },
    { id: "b", ctaPlacement: "bottom", edge: "gradient" },
    { id: "c", ctaPlacement: "center", edge: "hairline" },
  ],
  label: (v) => `${v.id} · ctas ${v.ctaPlacement} · edge ${v.edge}`,
  applyOverrides: (v, params) => applyFieldOverrides("d9", v.id, v, params),
  render: (v, ctx) => <DualCtaCard v={v} ctx={ctx} />,
};
