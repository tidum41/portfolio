import type { ConceptDefinition, ConceptVariant } from "../concepts/types";

/**
 * Shared lab shell for one concept: section head, equal-weight variant
 * columns, card stage, and generated spec line.
 */
export default function ConceptSection({
  concept,
  index,
  variants,
}: {
  concept: ConceptDefinition;
  /** 1-based section index for data-cl-section / legacy data-cl-direction. */
  index: number;
  variants: ConceptVariant[];
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
      <div className="card-lab__row" data-cl-row>
        {variants.map((v) => (
          <div
            key={String(v.id)}
            className="card-lab__variant"
            data-cl-variant-cell
            data-cl-concept={concept.id}
            data-cl-kind={concept.kind}
            data-cl-direction={String(index)}
            data-cl-variant={String(v.id)}
          >
            <div className="card-lab__stage" data-cl-stage>
              {concept.render(v)}
              <p className="card-lab__spec" data-cl-spec>
                {concept.label(v)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
