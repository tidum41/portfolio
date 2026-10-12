import WireframeMedia from "../shell/WireframeMedia";
import { applyFieldOverrides } from "./tokens";
import { MUDIT_PROJECTS } from "./projects";
import type { ConceptDefinition, ConceptVariant, RenderContext } from "./types";

const ASPECT = "16 / 10";

export type NumberedIndexVariant = ConceptVariant & {
  id: "a" | "b" | "c";
  expand: "inline" | "side" | "below";
};

function IndexRow({
  index,
  expand,
  active,
}: {
  index: number;
  expand: NumberedIndexVariant["expand"];
  active: boolean;
}) {
  const p = MUDIT_PROJECTS[index];
  const num = String(index + 1).padStart(2, "0");
  return (
    <div
      className="cl-index__item"
      data-cl-index-item
      data-cl-index-active={active ? "1" : "0"}
      data-cl-project={p.id}
    >
      <div className="cl-index__row">
        <span className="cl-index__num">{num}</span>
        <div className="cl-index__main">
          <div className="cl-index__head">
            <p className="cl-index__title" data-cl-card-title>
              {p.title}
            </p>
            <span className="cl-index__year">{p.year}</span>
          </div>
          {active ? (
            <div className="cl-index__reveal" data-cl-index-reveal>
              <p className="cl-index__sub" data-cl-card-desc>
                {p.subtitle}
              </p>
              <ul className="cl-index__chips">
                {p.pills.slice(0, 2).map((c) => (
                  <li key={c} className="cl-index__chip" data-cl-chip>
                    {c}
                  </li>
                ))}
              </ul>
              {expand === "inline" ? (
                <div
                  className="cl-index__preview cl-index__preview--inline"
                  data-cl-preview
                >
                  <WireframeMedia
                    kind={p.wireframe}
                    aspect={ASPECT}
                    radius={4}
                    className="cl-index__preview-media"
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        {active && expand === "side" ? (
          <div className="cl-index__preview cl-index__preview--side" data-cl-preview>
            <WireframeMedia
              kind={p.wireframe}
              aspect={ASPECT}
              radius={4}
              className="cl-index__preview-media"
            />
          </div>
        ) : null}
      </div>
      {active && expand === "below" ? (
        <div className="cl-index__preview cl-index__preview--below" data-cl-preview>
          <WireframeMedia
            kind={p.wireframe}
            aspect={ASPECT}
            radius={4}
            className="cl-index__preview-media"
          />
        </div>
      ) : null}
    </div>
  );
}

function NumberedIndexCard({
  v,
  ctx,
}: {
  v: NumberedIndexVariant;
  ctx?: RenderContext;
}) {
  const force = !!ctx?.forceHover;
  // Hover row: second project (index 1) is expanded; rest row: none expanded.
  const activeIndex = force ? 1 : -1;

  return (
    <div
      className="cl-index"
      data-cl-card
      data-cl-kind="numbered-index"
      data-cl-direction="10"
      data-cl-variant={v.id}
      data-cl-expand={v.expand}
      data-cl-force-hover={force ? "1" : "0"}
      data-cl-skip-equalize="1"
    >
      {MUDIT_PROJECTS.map((p, i) => (
        <IndexRow
          key={p.id}
          index={i}
          expand={v.expand}
          active={i === activeIndex}
        />
      ))}
    </div>
  );
}

export const numberedIndex: ConceptDefinition<NumberedIndexVariant> = {
  id: "numbered-index",
  kind: "numbered-index",
  overrideKey: "d10",
  name: "Numbered index rows",
  intent:
    "Numbered rows stay tight at rest; hover expands subtext, chips, and a small preview.",
  aspect: ASPECT,
  mediaIndex: 0,
  variants: [
    { id: "a", expand: "inline" },
    { id: "b", expand: "side" },
    { id: "c", expand: "below" },
  ],
  label: (v) => `${v.id} · expand ${v.expand}`,
  applyOverrides: (v, params) => applyFieldOverrides("d10", v.id, v, params),
  render: (v, ctx) => <NumberedIndexCard v={v} ctx={ctx} />,
};
