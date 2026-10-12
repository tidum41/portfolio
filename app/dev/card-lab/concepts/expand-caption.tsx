import type { CSSProperties } from "react";
import WireframeMedia from "../shell/WireframeMedia";
import { applyFieldOverrides } from "./tokens";
import { projectById } from "./projects";
import type { ConceptDefinition, ConceptVariant, RenderContext } from "./types";

const ASPECT = "16 / 10";
const PROJECT = projectById("cd-player");
/** Hover growth budget — matches measured ~60px caption band. */
const CAPTION_BAND = 60;

/**
 * eemonroy — media-only at rest; hover grows ~60px and reveals captions.
 * Variants declare reserve vs absolute so the grid does not jump.
 */

export type ExpandCaptionVariant = ConceptVariant & {
  id: "a" | "b" | "c";
  approach: "reserve" | "absolute-bottom" | "absolute-fade";
};

function Captions() {
  return (
    <div className="cl-xcap__captions" data-cl-xcap-captions>
      <p className="cl-xcap__desc" data-cl-card-desc>
        {PROJECT.subtitle}
      </p>
      <p className="cl-xcap__meta" data-cl-xcap-meta>
        <span className="cl-xcap__role">{PROJECT.role.toUpperCase()}</span>
        <span className="cl-xcap__sep"> · </span>
        <span className="cl-xcap__year">{PROJECT.year}</span>
      </p>
    </div>
  );
}

function ExpandCaptionCard({
  v,
  ctx,
}: {
  v: ExpandCaptionVariant;
  ctx?: RenderContext;
}) {
  const force = !!ctx?.forceHover;

  return (
    <div
      className="cl-xcap"
      data-cl-card
      data-cl-kind="expand-caption"
      data-cl-direction="18"
      data-cl-variant={v.id}
      data-cl-approach={v.approach}
      data-cl-force-hover={force ? "1" : "0"}
      data-cl-project={PROJECT.id}
      data-cl-skip-equalize="1"
      style={
        {
          "--cl-xcap-band": `${CAPTION_BAND}px`,
        } as CSSProperties
      }
    >
      <div className="cl-xcap__frame" data-cl-xcap-frame>
        <div className="cl-xcap__media-wrap" data-cl-media-wrap>
          <WireframeMedia
            kind={PROJECT.wireframe}
            aspect={ASPECT}
            radius={12}
            className="cl-xcap__media"
          />
          {v.approach !== "reserve" ? <Captions /> : null}
        </div>
        {v.approach === "reserve" ? (
          <div className="cl-xcap__band" data-cl-xcap-band>
            <Captions />
          </div>
        ) : null}
      </div>
      {/* Always-visible title for Mudit title check + identity; outside grow band. */}
      <p className="cl-xcap__title" data-cl-card-title>
        {PROJECT.title}
      </p>
    </div>
  );
}

export const expandCaption: ConceptDefinition<ExpandCaptionVariant> = {
  id: "expand-caption",
  kind: "expand-caption",
  overrideKey: "d18",
  name: "Expand plus caption",
  intent:
    "Media-first card; hover reveals a ~60px caption band without shifting the grid.",
  aspect: ASPECT,
  mediaIndex: 0,
  variants: [
    { id: "a", approach: "reserve" },
    { id: "b", approach: "absolute-bottom" },
    { id: "c", approach: "absolute-fade" },
  ],
  label: (v) => `${v.id} · ${v.approach}`,
  applyOverrides: (v, params) => applyFieldOverrides("d18", v.id, v, params),
  render: (v, ctx) => <ExpandCaptionCard v={v} ctx={ctx} />,
};
