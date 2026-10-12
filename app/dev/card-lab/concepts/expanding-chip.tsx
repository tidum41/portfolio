import WireframeMedia from "../shell/WireframeMedia";
import { applyFieldOverrides } from "./tokens";
import { projectById } from "./projects";
import type { ConceptDefinition, ConceptVariant, RenderContext } from "./types";

const ASPECT = "4 / 3";
const PROJECT = projectById("todolist");
/** Clear band above wireframe chrome so on-media chips never cover dots/bar. */
const CHIP_CLEAR = 48;

export type ExpandingChipVariant = ConceptVariant & {
  id: "a" | "b" | "c";
  placement: "on-media" | "above-media";
  fill: "solid" | "tinted";
};

function ExpandingChipCard({
  v,
  ctx,
}: {
  v: ExpandingChipVariant;
  ctx?: RenderContext;
}) {
  const force = !!ctx?.forceHover;
  return (
    <div
      className="cl-expand"
      data-cl-card
      data-cl-kind="expanding-chip"
      data-cl-direction="4"
      data-cl-variant={v.id}
      data-cl-chip-placement={v.placement}
      data-cl-chip-fill={v.fill}
      data-cl-force-hover={force ? "1" : "0"}
      data-cl-project={PROJECT.id}
    >
      {/* Same reserved rail on every variant so media top edges share one line. */}
      <div className="cl-expand__chip-rail" data-cl-chip-rail>
        <span
          className={`cl-expand__chip${v.placement === "above-media" ? " cl-expand__chip--in-rail" : " cl-expand__chip--ghost"}`}
          data-cl-chip={v.placement === "above-media" ? "1" : undefined}
          data-cl-chip-fill={v.fill}
          aria-hidden={v.placement !== "above-media"}
        >
          <span className="cl-expand__chip-rest">{PROJECT.taxonomyRest}</span>
          <span className="cl-expand__chip-hover">{PROJECT.taxonomyHover}</span>
        </span>
      </div>
      <div className="cl-expand__media-wrap" data-cl-media-wrap>
        <WireframeMedia
          kind={PROJECT.wireframe}
          aspect={ASPECT}
          radius={8}
          className="cl-expand__media"
          topClear={v.placement === "on-media" ? CHIP_CLEAR : 0}
        />
        {v.placement === "on-media" ? (
          <span
            className="cl-expand__chip cl-expand__chip--overlay"
            data-cl-chip
            data-cl-chip-fill={v.fill}
          >
            <span className="cl-expand__chip-rest">{PROJECT.taxonomyRest}</span>
            <span className="cl-expand__chip-hover">{PROJECT.taxonomyHover}</span>
          </span>
        ) : null}
      </div>
      <div className="cl-expand__copy" data-cl-copy>
        <p className="cl-expand__title" data-cl-card-title>
          {PROJECT.title}
        </p>
        <p className="cl-expand__desc" data-cl-card-desc>
          {PROJECT.subtitle}
        </p>
      </div>
    </div>
  );
}

export const expandingChip: ConceptDefinition<ExpandingChipVariant> = {
  id: "expanding-chip",
  kind: "expanding-chip",
  overrideKey: "d4",
  name: "Expanding taxonomy chip",
  intent:
    "A solid chip on the media edge grows into a longer taxonomy path on hover.",
  aspect: ASPECT,
  mediaIndex: 0,
  variants: [
    { id: "a", placement: "on-media", fill: "solid" },
    { id: "b", placement: "above-media", fill: "solid" },
    { id: "c", placement: "on-media", fill: "tinted" },
  ],
  label: (v) => `${v.id} · chip ${v.placement} · ${v.fill}`,
  applyOverrides: (v, params) => applyFieldOverrides("d4", v.id, v, params),
  render: (v, ctx) => <ExpandingChipCard v={v} ctx={ctx} />,
};
