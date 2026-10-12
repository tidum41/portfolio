import PlaceholderMedia from "../shell/PlaceholderMedia";
import { applyFieldOverrides } from "./tokens";
import type { ConceptDefinition, ConceptVariant, RenderContext } from "./types";

const ASPECT = "16 / 10";
const MEDIA_INDEX = 2;
const TITLE = "Sazabi cockpit";
const DESC = "YC Spring 2026 · confidential.";

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
  const lockLabel =
    v.gateStyle === "blur-code" ? "Enter code" : "Password protected";

  return (
    <div
      className="cl-gate"
      data-cl-card
      data-cl-kind="gated-nda"
      data-cl-direction="13"
      data-cl-variant={v.id}
      data-cl-gate={v.gateStyle}
      data-cl-force-hover={force ? "1" : "0"}
    >
      <div className="cl-gate__media-wrap" data-cl-media-wrap>
        <PlaceholderMedia
          aspect={ASPECT}
          mediaIndex={MEDIA_INDEX}
          radius={12}
          className="cl-gate__media"
        />
        <div className="cl-gate__veil" data-cl-gate-veil aria-hidden="true" />
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
          {lockLabel}
        </span>
        <span className="cl-gate__request" data-cl-gate-request>
          Request access
        </span>
      </div>
      <div className="cl-gate__copy" data-cl-copy>
        <p className="cl-gate__title" data-cl-card-title>
          {TITLE}
        </p>
        <p className="cl-gate__desc" data-cl-card-desc>
          {DESC}
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
  mediaIndex: MEDIA_INDEX,
  variants: [
    { id: "a", gateStyle: "blur-lock" },
    { id: "b", gateStyle: "blur-code" },
    { id: "c", gateStyle: "frost-lock" },
  ],
  label: (v) => `${v.id} · gate ${v.gateStyle}`,
  applyOverrides: (v, params) => applyFieldOverrides("d13", v.id, v, params),
  render: (v, ctx) => <GatedNdaCard v={v} ctx={ctx} />,
};
