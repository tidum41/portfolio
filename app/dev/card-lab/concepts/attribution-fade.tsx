import WireframeMedia from "../shell/WireframeMedia";
import { applyFieldOverrides } from "./tokens";
import { projectById } from "./projects";
import type { ConceptDefinition, ConceptVariant, RenderContext } from "./types";

const ASPECT = "16 / 10";
const PROJECT = projectById("sviz");

/**
 * Devouring Details — role/company fades in on group hover; title stays.
 */

export type AttributionFadeVariant = ConceptVariant & {
  id: "a" | "b" | "c";
  fadeColor: "accent" | "grey";
  fadePlacement: "above" | "below";
};

function AttributionFadeCard({
  v,
  ctx,
}: {
  v: AttributionFadeVariant;
  ctx?: RenderContext;
}) {
  const force = !!ctx?.forceHover;
  const roleLine = `${PROJECT.role} · ${PROJECT.year}`.toUpperCase();

  const fade = (
    <p
      className={`cl-attr__fade cl-attr__fade--${v.fadeColor} cl-attr__fade--${v.fadePlacement}`}
      data-cl-attr-fade
    >
      {roleLine}
    </p>
  );

  return (
    <div
      className="cl-attr"
      data-cl-card
      data-cl-kind="attribution-fade"
      data-cl-direction="15"
      data-cl-variant={v.id}
      data-cl-fade-color={v.fadeColor}
      data-cl-fade-place={v.fadePlacement}
      data-cl-force-hover={force ? "1" : "0"}
      data-cl-project={PROJECT.id}
    >
      <div className="cl-attr__media-wrap" data-cl-media-wrap>
        <WireframeMedia
          kind={PROJECT.wireframe}
          aspect={ASPECT}
          radius={8}
          className="cl-attr__media"
        />
      </div>
      <div className="cl-attr__copy" data-cl-copy>
        <div className="cl-attr__title-block">
          {fade}
          <p className="cl-attr__title" data-cl-card-title>
            {PROJECT.title}
          </p>
        </div>
        <p className="cl-attr__desc" data-cl-card-desc>
          {PROJECT.subtitle}
        </p>
      </div>
    </div>
  );
}

export const attributionFade: ConceptDefinition<AttributionFadeVariant> = {
  id: "attribution-fade",
  kind: "attribution-fade",
  overrideKey: "d15",
  name: "Attribution fade",
  intent:
    "Title stays; the role/company line fades in on hover at 150ms ease-out.",
  aspect: ASPECT,
  mediaIndex: 0,
  variants: [
    { id: "a", fadeColor: "accent", fadePlacement: "below" },
    { id: "b", fadeColor: "grey", fadePlacement: "below" },
    { id: "c", fadeColor: "accent", fadePlacement: "above" },
  ],
  label: (v) => `${v.id} · fade ${v.fadeColor} · ${v.fadePlacement}`,
  applyOverrides: (v, params) => applyFieldOverrides("d15", v.id, v, params),
  render: (v, ctx) => <AttributionFadeCard v={v} ctx={ctx} />,
};
