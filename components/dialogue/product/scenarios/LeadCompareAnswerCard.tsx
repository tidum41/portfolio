import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import { PARAGRAPH_ANSWER_BRIEF, QUOTE_LIST } from "@/lib/dialogue/product/sampleData";
import { annotateSlug } from "@/components/dialogue/annotate";
import SourcePill from "@/components/dialogue/product/SourcePill";

/** Hearthside mock data (illustrative), the same Friday finding as the hero. */
const MINI_SOURCES = [
  { participant: "Mei L.", time: "18:27" },
  { participant: "Owen P.", time: "07:12" },
] as const;

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
      </div>
    );
  }

  return (
    <div className="dp-lead-answer-card dp-lead-answer-card--structured">
      <p className="dp-lead-answer-card__summary dp-text-body" data-annotate-part="summary">
        <span><span className="dp-summary__emph">225 of 300</span> shoppers read &lsquo;Arrives by Friday&rsquo; as this Friday.</span>
      </p>
      <div className="dp-lead-answer-card__funnel" data-annotate-part="chart">
        <ChartStackedBar
          total={300}
          segments={[
            { label: "This Friday", value: 225, display: "225 of 300", focal: true },
            { label: "Unsure", value: 75, display: "75" },
          ]}
        />
      </div>
      <div className="dp-sources dp-lead-answer-card__sources" data-annotate-part="sources-row">
        {MINI_SOURCES.map((s) => (
          <SourcePill key={s.participant} name={s.participant} time={s.time} selected={false} />
        ))}
      </div>
    </div>
  );
}
