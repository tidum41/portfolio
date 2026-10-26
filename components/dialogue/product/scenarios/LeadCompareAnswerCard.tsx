import QuoteCard from "@/components/dialogue/product/QuoteCard";
import { PARAGRAPH_ANSWER_BRIEF, QUOTE_LIST } from "@/lib/dialogue/product/sampleData";

/** Start times for the quotes, from the address follow-up's clips. */
const QUOTE_TIMES: Record<string, string> = {
  "Jordan M.": "14:03",
  "Priya K.": "16:02",
  "Sam R.": "11:22",
};

export type LeadCompareVariant = "paragraphs" | "quotes" | "structured";

type Props = {
  variant: LeadCompareVariant;
};

/** Round O: the three formats built from the real quote card. The kept
    version adds only the count line and one 16:9 clip thumb to the quotes. */
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

  const quotes = (
    <div className="dp-lead-answer-card__quotes">
      {QUOTE_LIST.map((q) => (
        <QuoteCard
          key={q.participant}
          name={q.participant}
          time={QUOTE_TIMES[q.participant] ?? ""}
          text={q.quote}
        />
      ))}
    </div>
  );

  if (variant === "quotes") {
    return <div className="dp-lead-answer-card dp-lead-answer-card--quotes">{quotes}</div>;
  }

  return (
    <div className="dp-lead-answer-card dp-lead-answer-card--structured">
      <p className="dp-lead-answer-card__count" data-annotate-part="count-line">
        18 of 24 interviews
      </p>
      {quotes}
      <div className="dp-lead-answer-card__thumb" data-annotate-part="clip-thumb">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/dev/dialogue-static/clip-photos/clip-01.jpg" alt="" loading="eager" decoding="sync" />
        <span className="dp-lead-answer-card__thumb-time">14:03</span>
      </div>
    </div>
  );
}
