import type { CSSProperties } from "react";
import PlaceholderMedia from "../shell/PlaceholderMedia";
import { applyFieldOverrides } from "./tokens";
import type { ConceptDefinition, ConceptVariant, RenderContext } from "./types";

const ASPECT = "16 / 10";
const MEDIA_INDEX = 1;
const TITLE = "Inspiration digest";
const DESC = "Daily editorial signup for wellness.";
const CHIPS = ["Brand", "Growth", "Email"] as const;

export type StaggerRevealVariant = ConceptVariant & {
  id: "a" | "b" | "c";
  staggerMs: number;
  chipCount: 2 | 3;
  liftPx: number;
};

function StaggerRevealCard({
  v,
  ctx,
}: {
  v: StaggerRevealVariant;
  ctx?: RenderContext;
}) {
  const force = !!ctx?.forceHover;
  const chips = CHIPS.slice(0, v.chipCount);

  return (
    <div
      className="cl-stagger"
      data-cl-card
      data-cl-kind="stagger-reveal"
      data-cl-direction="12"
      data-cl-variant={v.id}
      data-cl-stagger-ms={v.staggerMs}
      data-cl-lift={v.liftPx}
      data-cl-force-hover={force ? "1" : "0"}
      style={
        {
          "--cl-stagger": `${v.staggerMs}ms`,
          "--cl-lift": `${v.liftPx}px`,
        } as CSSProperties
      }
    >
      <div className="cl-stagger__media-wrap" data-cl-media-wrap>
        <PlaceholderMedia
          aspect={ASPECT}
          mediaIndex={MEDIA_INDEX}
          radius={8}
          className="cl-stagger__media"
        />
      </div>
      <div className="cl-stagger__copy" data-cl-copy>
        <p className="cl-stagger__title" data-cl-card-title>
          {TITLE}
        </p>
        <p
          className="cl-stagger__desc"
          data-cl-card-desc
          data-cl-stagger-item="0"
        >
          {DESC}
        </p>
        <ul className="cl-stagger__chips" data-cl-stagger-chips>
          {chips.map((c, i) => (
            <li
              key={c}
              className="cl-stagger__chip"
              data-cl-chip
              data-cl-stagger-item={String(i + 1)}
              style={{ transitionDelay: force ? "0ms" : undefined }}
            >
              {c}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export const staggerReveal: ConceptDefinition<StaggerRevealVariant> = {
  id: "stagger-reveal",
  kind: "stagger-reveal",
  overrideKey: "d12",
  name: "Staggered subtext reveal",
  intent:
    "At rest only the title shows; hover lifts it and staggers in description and chips.",
  aspect: ASPECT,
  mediaIndex: MEDIA_INDEX,
  variants: [
    { id: "a", staggerMs: 40, chipCount: 3, liftPx: 8 },
    { id: "b", staggerMs: 40, chipCount: 2, liftPx: 8 },
    { id: "c", staggerMs: 40, chipCount: 3, liftPx: 4 },
  ],
  label: (v) =>
    `${v.id} · chips ${v.chipCount} · lift ${v.liftPx} · stagger ${v.staggerMs}ms`,
  applyOverrides: (v, params) =>
    applyFieldOverrides("d12", v.id, v, params, {
      stagger: "staggerMs",
      lift: "liftPx",
    }),
  render: (v, ctx) => <StaggerRevealCard v={v} ctx={ctx} />,
};
