import PlaceholderMedia from "../shell/PlaceholderMedia";
import { applyFieldOverrides } from "./tokens";
import type { ConceptDefinition, ConceptVariant, RenderContext } from "./types";

const ASPECT = "16 / 10";
const MEDIA_INDEX = 2;
const TITLE = "Quick order redesign";
const YEAR = "2026";
const SUB = "Cut reorder time from six clicks to one.";
const CHIPS = ["B2B", "Checkout"] as const;

export type NumberedIndexVariant = ConceptVariant & {
  id: "a" | "b" | "c";
  expand: "inline" | "side" | "below";
};

function NumberedIndexCard({
  v,
  ctx,
}: {
  v: NumberedIndexVariant;
  ctx?: RenderContext;
}) {
  const force = !!ctx?.forceHover;
  return (
    <div
      className="cl-index"
      data-cl-card
      data-cl-kind="numbered-index"
      data-cl-direction="10"
      data-cl-variant={v.id}
      data-cl-expand={v.expand}
      data-cl-force-hover={force ? "1" : "0"}
    >
      <div className="cl-index__row" data-cl-copy>
        <span className="cl-index__num" data-cl-index-num>
          01
        </span>
        <div className="cl-index__main">
          <p className="cl-index__title" data-cl-card-title>
            {TITLE}
          </p>
          <span className="cl-index__year">{YEAR}</span>
          <div className="cl-index__reveal" data-cl-index-reveal>
            <p className="cl-index__sub" data-cl-card-desc>
              {SUB}
            </p>
            <ul className="cl-index__chips">
              {CHIPS.map((c) => (
                <li key={c} className="cl-index__chip" data-cl-chip>
                  {c}
                </li>
              ))}
            </ul>
            {v.expand === "inline" || v.expand === "below" ? (
              <div
                className={`cl-index__preview cl-index__preview--${v.expand}`}
                data-cl-preview
              >
                <PlaceholderMedia
                  aspect={ASPECT}
                  mediaIndex={MEDIA_INDEX}
                  radius={4}
                  className="cl-index__preview-media"
                />
              </div>
            ) : null}
          </div>
        </div>
        {v.expand === "side" ? (
          <div className="cl-index__preview cl-index__preview--side" data-cl-preview>
            <PlaceholderMedia
              aspect={ASPECT}
              mediaIndex={MEDIA_INDEX}
              radius={4}
              className="cl-index__preview-media"
            />
          </div>
        ) : null}
      </div>
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
  mediaIndex: MEDIA_INDEX,
  variants: [
    { id: "a", expand: "inline" },
    { id: "b", expand: "side" },
    { id: "c", expand: "below" },
  ],
  label: (v) => `${v.id} · expand ${v.expand}`,
  applyOverrides: (v, params) => applyFieldOverrides("d10", v.id, v, params),
  render: (v, ctx) => <NumberedIndexCard v={v} ctx={ctx} />,
};
