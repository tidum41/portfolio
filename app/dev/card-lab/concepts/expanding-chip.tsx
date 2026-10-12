import PlaceholderMedia from "../shell/PlaceholderMedia";
import { applyFieldOverrides } from "./tokens";
import type { ConceptDefinition, ConceptVariant, RenderContext } from "./types";

const ASPECT = "4 / 3";
const MEDIA_INDEX = 0;
const REST = "B2B / Client work";
const HOVER = "B2B / Client work / Quick order redesign";
const TITLE = "Stardog";
const DESC = "Product designer on quick order.";

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
    >
      {v.placement === "above-media" ? (
        <div className="cl-expand__chip-row" data-cl-chip-row>
          <span className="cl-expand__chip" data-cl-chip data-cl-chip-fill={v.fill}>
            <span className="cl-expand__chip-rest">{REST}</span>
            <span className="cl-expand__chip-hover" aria-hidden={!force}>
              {HOVER}
            </span>
          </span>
        </div>
      ) : null}
      <div className="cl-expand__media-wrap" data-cl-media-wrap>
        <PlaceholderMedia
          aspect={ASPECT}
          mediaIndex={MEDIA_INDEX}
          radius={8}
          className="cl-expand__media"
        />
        {v.placement === "on-media" ? (
          <span
            className="cl-expand__chip cl-expand__chip--overlay"
            data-cl-chip
            data-cl-chip-fill={v.fill}
          >
            <span className="cl-expand__chip-rest">{REST}</span>
            <span className="cl-expand__chip-hover" aria-hidden={!force}>
              {HOVER}
            </span>
          </span>
        ) : null}
      </div>
      <div className="cl-expand__copy" data-cl-copy>
        <p className="cl-expand__title" data-cl-card-title>
          {TITLE}
        </p>
        <p className="cl-expand__desc" data-cl-card-desc>
          {DESC}
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
  mediaIndex: MEDIA_INDEX,
  variants: [
    { id: "a", placement: "on-media", fill: "solid" },
    { id: "b", placement: "above-media", fill: "solid" },
    { id: "c", placement: "on-media", fill: "tinted" },
  ],
  label: (v) => `${v.id} · chip ${v.placement} · ${v.fill}`,
  applyOverrides: (v, params) => applyFieldOverrides("d4", v.id, v, params),
  render: (v, ctx) => <ExpandingChipCard v={v} ctx={ctx} />,
};
