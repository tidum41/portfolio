import WireframeMedia from "../shell/WireframeMedia";
import { applyFieldOverrides } from "./tokens";
import { MUDIT_PROJECTS } from "./projects";
import type { ConceptDefinition, ConceptVariant, RenderContext } from "./types";

/**
 * Jakub — trailing affordance fades + nudges ~4px on a 16px-radius icon row.
 */

export type ChevronRevealVariant = ConceptVariant & {
  id: "a" | "b" | "c";
  trail: "arrow" | "external" | "read";
};

function TrailGlyph({ trail }: { trail: ChevronRevealVariant["trail"] }) {
  if (trail === "read") {
    return <span className="cl-chev__trail-text">Read</span>;
  }
  if (trail === "external") {
    return (
      <svg
        className="cl-chev__trail-icon"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        aria-hidden="true"
      >
        <path
          d="M4.5 3.5h5.5v5.5M9.5 3.5 3.5 9.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg
      className="cl-chev__trail-icon"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path
        d="M5.5 3.5 10.5 8 5.5 12.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRevealCard({
  v,
  ctx,
}: {
  v: ChevronRevealVariant;
  ctx?: RenderContext;
}) {
  const force = !!ctx?.forceHover;
  const rows = MUDIT_PROJECTS.slice(0, 3);

  return (
    <div
      className="cl-chev"
      data-cl-card
      data-cl-kind="chevron-reveal"
      data-cl-direction="16"
      data-cl-variant={v.id}
      data-cl-trail={v.trail}
      data-cl-force-hover={force ? "1" : "0"}
      data-cl-skip-equalize="1"
    >
      {rows.map((p, i) => {
        const active = force && i === 1;
        return (
          <div
            key={p.id}
            className={`cl-chev__row${active ? " cl-chev__row--active" : ""}`}
            data-cl-chev-row
            data-cl-chev-active={active ? "1" : "0"}
            data-cl-project={p.id}
          >
            <div className="cl-chev__tile" data-cl-media-wrap>
              <WireframeMedia
                kind={p.wireframe}
                aspect="1 / 1"
                radius={12}
                compact
                className="cl-chev__tile-media"
              />
            </div>
            <div className="cl-chev__copy" data-cl-copy>
              <p className="cl-chev__title" data-cl-card-title>
                {p.title}
              </p>
              <p className="cl-chev__desc" data-cl-card-desc>
                {p.subtitle}
              </p>
            </div>
            <span className="cl-chev__trail" data-cl-chev-trail aria-hidden="true">
              <TrailGlyph trail={v.trail} />
            </span>
          </div>
        );
      })}
    </div>
  );
}

export const chevronReveal: ConceptDefinition<ChevronRevealVariant> = {
  id: "chevron-reveal",
  kind: "chevron-reveal",
  overrideKey: "d16",
  name: "Chevron reveal",
  intent:
    "A trailing affordance fades in and nudges 4px on hover over a 16px-radius icon row.",
  aspect: "1 / 1",
  mediaIndex: 0,
  variants: [
    { id: "a", trail: "arrow" },
    { id: "b", trail: "external" },
    { id: "c", trail: "read" },
  ],
  label: (v) => `${v.id} · trail ${v.trail}`,
  applyOverrides: (v, params) => applyFieldOverrides("d16", v.id, v, params),
  render: (v, ctx) => <ChevronRevealCard v={v} ctx={ctx} />,
};
