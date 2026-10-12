import WireframeMedia from "../shell/WireframeMedia";
import { applyFieldOverrides } from "./tokens";
import { projectById } from "./projects";
import type { ConceptDefinition, ConceptVariant, RenderContext } from "./types";

const ASPECT = "16 / 10";
const PROJECT = projectById("bruinlease");

export type PillRowVariant = ConceptVariant & {
  id: "a" | "b" | "c";
  pillStyle: "filled" | "outlined" | "plain";
};

function PillRowCard({
  v,
  ctx,
}: {
  v: PillRowVariant;
  ctx?: RenderContext;
}) {
  const force = !!ctx?.forceHover;
  return (
    <div
      className="cl-pills"
      data-cl-card
      data-cl-kind="pill-row"
      data-cl-direction="5"
      data-cl-variant={v.id}
      data-cl-pill-style={v.pillStyle}
      data-cl-force-hover={force ? "1" : "0"}
      data-cl-project={PROJECT.id}
    >
      <div className="cl-pills__stage" data-cl-media-wrap>
        <WireframeMedia
          kind={PROJECT.wireframe}
          aspect={ASPECT}
          radius={12}
          className="cl-pills__media"
        />
      </div>
      <div className="cl-pills__copy" data-cl-copy>
        <p className="cl-pills__title" data-cl-card-title>
          {PROJECT.title}
        </p>
        <p className="cl-pills__desc" data-cl-card-desc>
          {PROJECT.subtitle}
        </p>
        {v.pillStyle === "plain" ? (
          <p className="cl-pills__plain" data-cl-pill-row>
            {PROJECT.pills.join(" · ")}
          </p>
        ) : (
          <ul className="cl-pills__row" data-cl-pill-row>
            {PROJECT.pills.map((p) => (
              <li
                key={p}
                className="cl-pills__pill"
                data-cl-pill
                data-cl-pill-style={v.pillStyle}
              >
                {p}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export const pillRow: ConceptDefinition<PillRowVariant> = {
  id: "pill-row",
  kind: "pill-row",
  overrideKey: "d5",
  name: "Role and domain pill row",
  intent:
    "Outcome-sentence title with a role and domain pill row always visible.",
  aspect: ASPECT,
  mediaIndex: 0,
  variants: [
    { id: "a", pillStyle: "filled" },
    { id: "b", pillStyle: "outlined" },
    { id: "c", pillStyle: "plain" },
  ],
  label: (v) => `${v.id} · pills ${v.pillStyle}`,
  applyOverrides: (v, params) => applyFieldOverrides("d5", v.id, v, params),
  render: (v, ctx) => <PillRowCard v={v} ctx={ctx} />,
};
