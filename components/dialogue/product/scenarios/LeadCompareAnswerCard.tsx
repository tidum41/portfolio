import ChartDotPlot from "@/components/dialogue/product/chart/ChartDotPlot";
import { formatChartPercent } from "@/components/dialogue/product/chart/chartSpec";
import ClipThumbnails from "@/components/dialogue/product/ClipThumbnails";
import { CHECKOUT_FUNNEL, PARAGRAPH_ANSWER_BRIEF, QUOTE_LIST } from "@/lib/dialogue/product/sampleData";
import { annotateSlug } from "@/components/dialogue/annotate";
import SourcePill from "@/components/dialogue/product/SourcePill";

const MINI_FUNNEL = CHECKOUT_FUNNEL.steps.slice(0, 3);

const MINI_SOURCES = [
  { participant: "Jordan M.", time: "14:03" },
  { participant: "Priya K.", time: "15:47" },
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
      <div className="dp-lead-answer-card__funnel" data-annotate-part="funnel">
        <p className="dp-chart-title dp-lead-answer-card__funnel-title" data-annotate-part="chart-title">Checkout funnel, % still in flow</p>
        <ChartDotPlot
          className="dp-lead-answer-card__bars"
          rows={MINI_FUNNEL.map((step) => ({
            label: step.label,
            value: step.pct,
            display: formatChartPercent(step.pct),
            focal: "focal" in step && step.focal,
          }))}
          max={100}
        />
      </div>
      <div className="dp-sources dp-lead-answer-card__sources" data-annotate-part="sources-row">
        {MINI_SOURCES.map((s) => (
          <SourcePill key={s.participant} name={s.participant} time={s.time} selected={s.participant === "Priya K."} />
        ))}
      </div>
      <ClipThumbnails selectedTime="15:47" />
    </div>
  );
}
