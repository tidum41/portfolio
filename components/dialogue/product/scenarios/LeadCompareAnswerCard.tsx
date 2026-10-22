import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import { formatChartPercent } from "@/components/dialogue/product/chart/chartSpec";
import ClipThumbnails from "@/components/dialogue/product/ClipThumbnails";
import { CHECKOUT_FUNNEL, QUOTE_LIST } from "@/lib/dialogue/product/sampleData";

const MINI_FUNNEL = CHECKOUT_FUNNEL.steps.slice(0, 3);

const MINI_SOURCES = [
  { participant: "Jordan M.", time: "14:03" },
  { participant: "Priya K.", time: "15:47" },
] as const;

export type LeadCompareVariant = "paragraphs" | "quotes" | "structured";

type Props = {
  variant: LeadCompareVariant;
};

/** Same answer-only layout for all three lead options (no study chat chrome). */
export default function LeadCompareAnswerCard({ variant }: Props) {
  const summary = (
    <p className="dp-lead-answer-card__summary dp-text-body">
      {CHECKOUT_FUNNEL.summary.split(CHECKOUT_FUNNEL.emphasis)[0]}
      <span className="dp-summary__emph">{CHECKOUT_FUNNEL.emphasis}</span>
      {CHECKOUT_FUNNEL.summary.split(CHECKOUT_FUNNEL.emphasis)[1] ?? ""}
    </p>
  );

  return (
    <div className="dp-lead-answer-card">
      {variant === "paragraphs" ? (
        <div className="dp-lead-answer-card__prose dp-text-prose-sm">
          <p>Most participants hesitated at shipping address, delivery, and payment.</p>
          <p>Nothing in the thread linked quotes back to footage or funnel steps.</p>
        </div>
      ) : null}
      {variant === "quotes" ? (
        <div className="dp-lead-answer-card__quotes">
          {QUOTE_LIST.map((q) => (
            <div key={q.participant} className="dp-lead-answer-card__quote">
              <strong>{q.participant}</strong>
              {q.quote}
            </div>
          ))}
        </div>
      ) : null}
      {variant === "structured" ? summary : null}

      <div className="dp-lead-answer-card__funnel">
        <p className="dp-lead-answer-card__funnel-title">Checkout funnel, % still in flow</p>
        <ChartBarList
          className="dp-lead-answer-card__bars"
          rows={MINI_FUNNEL.map((step, i) => ({
            label: step.label,
            value: step.pct,
            display: formatChartPercent(step.pct),
            focal: "focal" in step && step.focal,
          }))}
          max={100}
          fillMode="index"
        />
      </div>

      <div className="dp-sources dp-lead-answer-card__sources">
        {MINI_SOURCES.map((s) => (
          <span
            key={s.participant}
            className={[
              "dp-source-pill",
              s.participant === "Priya K." ? "dp-source-pill--selected" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {s.participant} · {s.time}
          </span>
        ))}
      </div>

      <ClipThumbnails selectedTime="15:47" />
    </div>
  );
}
