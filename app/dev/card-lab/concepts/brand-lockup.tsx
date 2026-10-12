import WireframeMedia from "../shell/WireframeMedia";
import { applyFieldOverrides } from "./tokens";
import { projectById } from "./projects";
import type { ConceptDefinition, ConceptVariant, RenderContext } from "./types";

const ASPECT = "16 / 10";
const PROJECT = projectById("bruinlease");

export type BrandLockupVariant = ConceptVariant & {
  id: "a" | "b" | "c";
  reveal: "crossfade" | "wipe" | "scale-center";
  lockup: "plain" | "mark-word" | "mark-only";
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
      data-cl-lockup={v.lockup}
      data-cl-force-hover={force ? "1" : "0"}
      data-cl-project={PROJECT.id}
    >
      <div
        className="cl-brand__stage"
        data-cl-media
        data-cl-aspect={ASPECT}
        style={{
          aspectRatio: ASPECT,
          background: PROJECT.brand,
          color: PROJECT.brandInk,
        }}
      >
        <div
          className={`cl-brand__lockup cl-brand__lockup--${v.lockup}`}
          data-cl-lockup
        >
          <svg
            className="cl-brand__mark"
            viewBox="0 0 48 32"
            width={v.lockup === "mark-only" ? 56 : 40}
            height={v.lockup === "mark-only" ? 36 : 24}
            aria-hidden="true"
          >
            <rect
              x="4"
              y="6"
              width="18"
              height="20"
              rx="4"
              fill="currentColor"
              opacity="0.92"
            />
            <circle
              cx="34"
              cy="16"
              r="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle cx="34" cy="16" r="3" fill="currentColor" />
          </svg>
          {v.lockup !== "mark-only" ? (
            <span className="cl-brand__wordmark">BruinLease</span>
          ) : null}
        </div>
        <div className="cl-brand__preview" data-cl-preview-layer>
          <WireframeMedia
            kind={PROJECT.wireframe}
            aspect={ASPECT}
            className="cl-brand__preview-media"
          />
        </div>
      </div>
      <div className="cl-brand__copy" data-cl-copy>
        <p className="cl-brand__title" data-cl-card-title>
          {PROJECT.title}
        </p>
        <p className="cl-brand__desc" data-cl-card-desc>
          {PROJECT.subtitle}
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
  mediaIndex: 0,
  variants: [
    { id: "a", reveal: "crossfade", lockup: "plain" },
    { id: "b", reveal: "wipe", lockup: "mark-word" },
    { id: "c", reveal: "scale-center", lockup: "mark-only" },
  ],
  label: (v) => `${v.id} · ${v.lockup} · reveal ${v.reveal}`,
  applyOverrides: (v, params) => applyFieldOverrides("d8", v.id, v, params),
  render: (v, ctx) => <BrandLockupCard v={v} ctx={ctx} />,
};
