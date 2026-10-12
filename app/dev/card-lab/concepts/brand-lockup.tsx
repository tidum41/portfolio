import UiPreview from "../shell/UiPreview";
import { applyFieldOverrides } from "./tokens";
import type { ConceptDefinition, ConceptVariant, RenderContext } from "./types";

const ASPECT = "16 / 10";
const MEDIA_INDEX = 2;
const TITLE = "DailyOM";
const DESC = "UX/UI, product, design systems";

export type BrandLockupVariant = ConceptVariant & {
  id: "a" | "b" | "c";
  reveal: "crossfade" | "wipe" | "scale-center";
};

function BrandLockupCard({
  v,
  ctx,
}: {
  v: BrandLockupVariant;
  ctx?: RenderContext;
}) {
  const force = !!ctx?.forceHover;
  return (
    <div
      className="cl-brand"
      data-cl-card
      data-cl-kind="brand-lockup"
      data-cl-direction="8"
      data-cl-variant={v.id}
      data-cl-reveal={v.reveal}
      data-cl-force-hover={force ? "1" : "0"}
    >
      <div
        className="cl-brand__stage"
        data-cl-media
        data-cl-aspect={ASPECT}
        style={{ aspectRatio: ASPECT }}
      >
        <div className="cl-brand__lockup" data-cl-lockup>
          <svg
            className="cl-brand__mark"
            viewBox="0 0 64 32"
            width="48"
            height="24"
            aria-hidden="true"
          >
            <path
              d="M4 4h16a12 12 0 0 1 0 24H4V4z"
              fill="currentColor"
              opacity="0.92"
            />
            <circle
              cx="48"
              cy="16"
              r="11"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
            />
            <circle
              cx="48"
              cy="16"
              r="6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
            <circle cx="48" cy="16" r="2" fill="currentColor" />
          </svg>
          <span className="cl-brand__wordmark">DailyOM</span>
        </div>
        <div className="cl-brand__preview" data-cl-preview-layer>
          <UiPreview tone="warm" />
        </div>
      </div>
      <div className="cl-brand__copy" data-cl-copy>
        <p className="cl-brand__title" data-cl-card-title>
          {TITLE}
        </p>
        <p className="cl-brand__desc" data-cl-card-desc>
          {DESC}
        </p>
      </div>
    </div>
  );
}

export const brandLockup: ConceptDefinition<BrandLockupVariant> = {
  id: "brand-lockup",
  kind: "brand-lockup",
  overrideKey: "d8",
  name: "Brand lockup to product preview",
  intent:
    "A solid brand lockup at rest becomes a product UI preview on hover.",
  aspect: ASPECT,
  mediaIndex: MEDIA_INDEX,
  variants: [
    { id: "a", reveal: "crossfade" },
    { id: "b", reveal: "wipe" },
    { id: "c", reveal: "scale-center" },
  ],
  label: (v) => `${v.id} · reveal ${v.reveal}`,
  applyOverrides: (v, params) => applyFieldOverrides("d8", v.id, v, params),
  render: (v, ctx) => <BrandLockupCard v={v} ctx={ctx} />,
};
