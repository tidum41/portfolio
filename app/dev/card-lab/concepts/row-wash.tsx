import WireframeMedia from "../shell/WireframeMedia";
import { applyFieldOverrides } from "./tokens";
import { MUDIT_PROJECTS } from "./projects";
import type { ConceptDefinition, ConceptVariant, RenderContext } from "./types";

/**
 * Josh Puckett — soft list-row background wash.
 * Measured: radius 12, pad 12/16, hover rgb(245,245,245) @ 0.15s material ease.
 */

export type RowWashVariant = ConceptVariant & {
  id: "a" | "b" | "c";
  thumbnail: boolean;
  descLines: 1 | 2;
};

function RowWashCard({
  v,
  ctx,
}: {
  v: RowWashVariant;
  ctx?: RenderContext;
}) {
  const force = !!ctx?.forceHover;
  const rows = MUDIT_PROJECTS.slice(0, 3);

  return (
    <div
      className="cl-wash"
      data-cl-card
      data-cl-kind="row-wash"
      data-cl-direction="14"
      data-cl-variant={v.id}
      data-cl-thumb={v.thumbnail ? "1" : "0"}
      data-cl-desc-lines={String(v.descLines)}
      data-cl-force-hover={force ? "1" : "0"}
      data-cl-skip-equalize="1"
    >
      {rows.map((p, i) => {
        const active = force && i === 1;
        return (
          <div
            key={p.id}
            className={`cl-wash__row${active ? " cl-wash__row--active" : ""}`}
            data-cl-wash-row
            data-cl-wash-active={active ? "1" : "0"}
            data-cl-project={p.id}
          >
            {v.thumbnail ? (
              <div className="cl-wash__thumb" data-cl-media-wrap>
                <WireframeMedia
                  kind={p.wireframe}
                  aspect="1 / 1"
                  radius={8}
                  compact
                  className="cl-wash__thumb-media"
                />
              </div>
            ) : null}
            <div className="cl-wash__copy" data-cl-copy>
              <p className="cl-wash__title" data-cl-card-title>
                {p.title}
              </p>
              <p
                className={`cl-wash__desc cl-wash__desc--${v.descLines}`}
                data-cl-card-desc
              >
                {v.descLines === 1
                  ? p.subtitle
                  : `${p.subtitle}. ${p.role} · ${p.year}.`}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export const rowWash: ConceptDefinition<RowWashVariant> = {
  id: "row-wash",
  kind: "row-wash",
  overrideKey: "d14",
  name: "Row wash",
  intent:
    "List rows fill from transparent to a soft grey wash on hover; content stays put.",
  aspect: "1 / 1",
  mediaIndex: 0,
  variants: [
    { id: "a", thumbnail: true, descLines: 1 },
    { id: "b", thumbnail: true, descLines: 2 },
    { id: "c", thumbnail: false, descLines: 2 },
  ],
  label: (v) =>
    `${v.id} · ${v.thumbnail ? "thumb" : "no-thumb"} · ${v.descLines}-line`,
  applyOverrides: (v, params) => applyFieldOverrides("d14", v.id, v, params),
  render: (v, ctx) => <RowWashCard v={v} ctx={ctx} />,
};
