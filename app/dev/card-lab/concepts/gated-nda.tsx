import WireframeMedia from "../shell/WireframeMedia";
import { applyFieldOverrides } from "./tokens";
import { projectById } from "./projects";
import type { ConceptDefinition, ConceptVariant, RenderContext } from "./types";

const ASPECT = "16 / 10";
const PROJECT = projectById("todolist");

export type GatedNdaVariant = ConceptVariant & {
  id: "a" | "b" | "c";
  gateStyle: "blur-lock" | "blur-code" | "frost-lock";
};

function GatedNdaCard({
  v,
  ctx,
}: {
  v: GatedNdaVariant;
  ctx?: RenderContext;
}) {
  const force = !!ctx?.forceHover;

  return (
    <div
      className="cl-gate"
      data-cl-card
      data-cl-kind="gated-nda"
      data-cl-direction="13"
      data-cl-variant={v.id}
      data-cl-gate={v.gateStyle}
      data-cl-force-hover={force ? "1" : "0"}
      data-cl-project={PROJECT.id}
    >
      <div className="cl-gate__media-wrap" data-cl-media-wrap>
        <WireframeMedia
          kind={PROJECT.wireframe}
          aspect={ASPECT}
          radius={12}
          className="cl-gate__media"
        />
        <div className="cl-gate__veil" data-cl-gate-veil aria-hidden="true" />
        {v.gateStyle === "blur-code" ? (
          <div className="cl-gate__code" data-cl-gate-lock aria-hidden={!force}>
            <span>0</span>
            <span>0</span>
            <span>0</span>
            <span>0</span>
          </div>
        ) : (
          <span className="cl-gate__lock" data-cl-gate-lock>
            <span className="cl-gate__lock-icon" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 12 12">
                <rect
                  x="2"
                  y="5"
                  width="8"
                  height="6"
                  rx="1"
                  fill="currentColor"
                />
                <path
                  d="M4 5V3.5a2 2 0 0 1 4 0V5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                />
              </svg>
            </span>
            Password protected
          </span>
        )}
        <span className="cl-gate__request" data-cl-gate-request>
          {v.gateStyle === "blur-code" ? "Enter code" : "Request access"}
        </span>
      </div>
      <div className="cl-gate__copy" data-cl-copy>
        <p className="cl-gate__title" data-cl-card-title>
          {PROJECT.title}
        </p>
        <p className="cl-gate__desc" data-cl-card-desc>
          {PROJECT.subtitle}
        </p>
      </div>
    </div>
  );
}

export const gatedNda: ConceptDefinition<GatedNdaVariant> = {
  id: "gated-nda",
  kind: "gated-nda",
  overrideKey: "d13",
  name: "Gated or NDA card",
  intent:
    "Blurred media with a lock chip; hover offers a request-access action.",
  aspect: ASPECT,
  mediaIndex: 0,
  variants: [
    { id: "a", gateStyle: "blur-lock" },
    { id: "b", gateStyle: "blur-code" },
    { id: "c", gateStyle: "frost-lock" },
  ],
  label: (v) => `${v.id} · gate ${v.gateStyle}`,
  applyOverrides: (v, params) => applyFieldOverrides("d13", v.id, v, params),
  render: (v, ctx) => <GatedNdaCard v={v} ctx={ctx} />,
};
