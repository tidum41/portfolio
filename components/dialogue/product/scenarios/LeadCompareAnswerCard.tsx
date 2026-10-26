import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ClipThumbnails from "@/components/dialogue/product/ClipThumbnails";
import { CHECKOUT_FUNNEL, COVERAGE_ADDRESS, PARAGRAPH_ANSWER_BRIEF, QUOTE_LIST } from "@/lib/dialogue/product/sampleData";
import { annotateSlug } from "@/components/dialogue/annotate";
import { ArrowUpRightIcon } from "@/components/dialogue/product/icons";
import SourcesScaleRow from "@/components/dialogue/product/scenarios/SourcesScaleRow";

export type LeadCompareVariant = "paragraphs" | "quotes" | "structured";

type Props = {
  variant: LeadCompareVariant;
};

/** Lead option content only (layout differs per variant). */
export default function LeadCompareAnswerCard({ variant }: Props) {
  if (variant === "paragraphs") {
    return (
      <div className="dp-lead-answer-card dp-lead-answer-card--paragraphs">
        <div className="dp-lead-answer-card__prose dp-text-prose-sm" data-annotate-part="prose">
          {PARAGRAPH_ANSWER_BRIEF.map((p) => (
            <p key={p.slice(0, 20)}>{p}</p>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "quotes") {
    return (
      <div className="dp-lead-answer-card dp-lead-answer-card--quotes">
        <div className="dp-lead-answer-card__quotes">
          {QUOTE_LIST.map((q) => (
            <div key={q.participant} className="dp-lead-answer-card__quote" data-annotate-part={`quote-${annotateSlug(q.participant)}`}>
              <strong>{q.participant}</strong>
              {q.quote}
            </div>
          ))}
        </div>
        <div className="dp-lead-answer-card__quote-actions">
          <span className="dp-lead-answer-card__view-session">
            View session
            <ArrowUpRightIcon className="dp-lead-answer-card__view-session-icon" />
          </span>
        </div>
      </div>
    );
  }

  const summary = (
    <p className="dp-lead-answer-card__summary dp-text-body" data-annotate-part="summary">
      {CHECKOUT_FUNNEL.summary.split(CHECKOUT_FUNNEL.emphasis)[0]}
      <span className="dp-summary__emph">{CHECKOUT_FUNNEL.emphasis}</span>
      {CHECKOUT_FUNNEL.summary.split(CHECKOUT_FUNNEL.emphasis)[1] ?? ""}
    </p>
  );

  return (
    <div className="dp-lead-answer-card dp-lead-answer-card--structured">
      {summary}
      <div className="dp-lead-answer-card__funnel" data-annotate-part="count-bar">
        <p className="dp-chart-title dp-lead-answer-card__funnel-title" data-annotate-part="chart-title">{COVERAGE_ADDRESS.headline}</p>
        <ChartBarList
          className="dp-lead-answer-card__bars dp-chart-bars--count"
          rows={[
            {
              label: "Address friction",
              value: 18,
              display: "18 of 24 interviews",
              focal: true,
            },
          ]}
          max={24}
          fillMode="magnitude"
        />
      </div>
      <SourcesScaleRow />
      <ClipThumbnails selectedTime="15:47" />
    </div>
  );
}
