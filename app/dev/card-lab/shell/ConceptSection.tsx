import type {
  ConceptDefinition,
  ConceptVariant,
  RenderContext,
} from "../concepts/types";

function VariantRow({
  concept,
  index,
  variants,
  forceHover,
  rowMode,
  showModeLabel,
}: {
  concept: ConceptDefinition;
  index: number;
  variants: ConceptVariant[];
  forceHover: boolean;
  rowMode: "rest" | "hover";
  showModeLabel: boolean;
}) {
  const ctx: RenderContext = { forceHover };

  return (
    <>
      {showModeLabel ? (
        <p className="card-lab__row-mode" data-cl-row-mode-label>
          {rowMode}
        </p>
      ) : null}
      <div
        className="card-lab__row"
        data-cl-row
        data-cl-row-mode={rowMode}
      >
        {variants.map((v) => (
          <div
            key={`${rowMode}-${String(v.id)}`}
            className="card-lab__variant"
            data-cl-variant-cell
            data-cl-concept={concept.id}
            data-cl-kind={concept.kind}
            data-cl-direction={String(index)}
            data-cl-variant={String(v.id)}
            data-cl-force-hover={forceHover ? "1" : "0"}
          >
            <div className="card-lab__stage" data-cl-stage>
              {concept.render(v, ctx)}
              <p className="card-lab__spec" data-cl-spec>
                {concept.label(v)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/**
 * Shared lab shell for one concept: section head, equal-weight variant
 * columns, card stage, and generated spec line.
 *
 * When compareHover is set, renders rest then hover rows so stills can
 * compare end states (?hover=all).
 */
export default function ConceptSection({
  concept,
  index,
  variants,
  compareHover = false,
}: {
  concept: ConceptDefinition;
  /** 1-based section index for data-cl-section / legacy data-cl-direction. */
  index: number;
  variants: ConceptVariant[];
  compareHover?: boolean;
}) {
  const headingId = `cl-${concept.id}-name`;

  return (
    <section
      data-cl-section={String(index)}
      data-cl-concept={concept.id}
      data-cl-kind={concept.kind}
      aria-labelledby={headingId}
    >
      <header className="card-lab__section-head" data-cl-section-head>
        <h2 id={headingId} className="card-lab__section-name">
          {concept.name}
        </h2>
        <p className="card-lab__section-intent">{concept.intent}</p>
      </header>
      <VariantRow
        concept={concept}
        index={index}
        variants={variants}
        forceHover={false}
        rowMode="rest"
        showModeLabel={compareHover}
      />
      {compareHover ? (
        <VariantRow
          concept={concept}
          index={index}
          variants={variants}
          forceHover
          rowMode="hover"
          showModeLabel
        />
      ) : null}
    </section>
  );
}
