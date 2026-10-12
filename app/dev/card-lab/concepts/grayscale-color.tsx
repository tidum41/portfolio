import WireframeMedia from "../shell/WireframeMedia";
import { applyFieldOverrides } from "./tokens";
import { projectById } from "./projects";
import type { ConceptDefinition, ConceptVariant, RenderContext } from "./types";

const ASPECT = "1 / 1";
const PROJECT = projectById("bruinlease");

/**
 * Vercel design — media rests desaturated; filter recovers over 0.4s.
 */

export type GrayscaleColorVariant = ConceptVariant & {
  id: "a" | "b" | "c";
  restFilter: "full" | "half" | "dim-grey";
};

function GrayscaleColorCard({
  v,
  ctx,
}: {
  v: GrayscaleColorVariant;
  ctx?: RenderContext;
}) {
  const force = !!ctx?.forceHover;

  return (
    <div
      className="cl-grey"
      data-cl-card
      data-cl-kind="grayscale-color"
      data-cl-direction="17"
      data-cl-variant={v.id}
      data-cl-rest-filter={v.restFilter}
      data-cl-force-hover={force ? "1" : "0"}
      data-cl-project={PROJECT.id}
    >
      <div className="cl-grey__media-wrap" data-cl-media-wrap>
        <WireframeMedia
          kind={PROJECT.wireframe}
          aspect={ASPECT}
          radius={12}
          colored
          className="cl-grey__media"
        />
      </div>
      <div className="cl-grey__copy" data-cl-copy>
        <p className="cl-grey__title" data-cl-card-title>
          {PROJECT.title}
        </p>
        <p className="cl-grey__desc" data-cl-card-desc>
          {PROJECT.subtitle}
        </p>
      </div>
    </div>
  );
}

export const grayscaleColor: ConceptDefinition<GrayscaleColorVariant> = {
  id: "grayscale-color",
  kind: "grayscale-color",
  overrideKey: "d17",
  name: "Grayscale to colour",
  intent:
    "Colored wireframe media rests desaturated and recovers with a 0.4s filter transition.",
  aspect: ASPECT,
  mediaIndex: 0,
  variants: [
    { id: "a", restFilter: "full" },
    { id: "b", restFilter: "half" },
    { id: "c", restFilter: "dim-grey" },
  ],
  label: (v) => `${v.id} · rest ${v.restFilter}`,
  applyOverrides: (v, params) => applyFieldOverrides("d17", v.id, v, params),
  render: (v, ctx) => <GrayscaleColorCard v={v} ctx={ctx} />,
};
