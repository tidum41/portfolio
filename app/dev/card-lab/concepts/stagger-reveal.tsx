import type { CSSProperties } from "react";
import WireframeMedia from "../shell/WireframeMedia";
import { applyFieldOverrides } from "./tokens";
import { projectById } from "./projects";
import type { ConceptDefinition, ConceptVariant, RenderContext } from "./types";

const ASPECT = "16 / 10";
const PROJECT = projectById("habit");

export type StaggerRevealVariant = ConceptVariant & {
  id: "a" | "b" | "c";
  /** Where revealed content sits relative to the title. */
  reveal: "under" | "aside" | "replace-chips";
  staggerMs: number;
};

function StaggerRevealCard({
  v,
  ctx,
}: {
  v: StaggerRevealVariant;
  ctx?: RenderContext;
}) {
  const force = !!ctx?.forceHover;

  return (
    <div
      className="cl-stagger"
      data-cl-card
      data-cl-kind="stagger-reveal"
      data-cl-direction="12"
      data-cl-variant={v.id}
      data-cl-reveal={v.reveal}
      data-cl-stagger-ms={v.staggerMs}
      data-cl-force-hover={force ? "1" : "0"}
      data-cl-project={PROJECT.id}
      data-cl-skip-equalize="1"
      style={
        {
          "--cl-stagger": `${v.staggerMs}ms`,
        } as CSSProperties
      }
    >
      <div className="cl-stagger__media-wrap" data-cl-media-wrap>
        <WireframeMedia
          kind={PROJECT.wireframe}
          aspect={ASPECT}
          radius={8}
          className="cl-stagger__media"
        />
      </div>
      <div
        className={`cl-stagger__copy cl-stagger__copy--${v.reveal}`}
        data-cl-copy
      >
        <p className="cl-stagger__title" data-cl-card-title>
          {PROJECT.title}
        </p>
        <div className="cl-stagger__reveal" data-cl-stagger-reveal>
          {v.reveal === "aside" ? (
            <>
              <p
                className="cl-stagger__desc"
                data-cl-card-desc
                data-cl-stagger-item="0"
              >
                {PROJECT.subtitle}
              </p>
              <ul className="cl-stagger__chips" data-cl-stagger-chips>
                {PROJECT.pills.slice(0, 2).map((c, i) => (
                  <li
                    key={c}
                    className="cl-stagger__chip"
                    data-cl-chip
                    data-cl-stagger-item={String(i + 1)}
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </>
          ) : v.reveal === "replace-chips" ? (
            <>
              <p
                className="cl-stagger__desc"
                data-cl-card-desc
                data-cl-stagger-item="0"
              >
                {PROJECT.subtitle}
              </p>
              <p className="cl-stagger__metric" data-cl-stagger-item="1">
                {PROJECT.metrics[0]?.line}
              </p>
            </>
          ) : (
            <>
              <p
                className="cl-stagger__desc"
                data-cl-card-desc
                data-cl-stagger-item="0"
              >
                {PROJECT.subtitle}
              </p>
              <ul className="cl-stagger__chips" data-cl-stagger-chips>
                {PROJECT.pills.map((c, i) => (
                  <li
                    key={c}
                    className="cl-stagger__chip"
                    data-cl-chip
                    data-cl-stagger-item={String(i + 1)}
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
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
  mediaIndex: 0,
  variants: [
    { id: "a", reveal: "under", staggerMs: 40 },
    { id: "b", reveal: "aside", staggerMs: 80 },
    { id: "c", reveal: "replace-chips", staggerMs: 40 },
  ],
  label: (v) => `${v.id} · reveal ${v.reveal} · stagger ${v.staggerMs}ms`,
  applyOverrides: (v, params) =>
    applyFieldOverrides("d12", v.id, v, params, { stagger: "staggerMs" }),
  render: (v, ctx) => <StaggerRevealCard v={v} ctx={ctx} />,
};
