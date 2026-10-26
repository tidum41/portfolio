import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import { annotateSlug } from "@/components/dialogue/annotate";
import {
  CHECKOUT_QUESTION,
  PARAGRAPH_ANSWER_BRIEF,
  QUOTE_LIST,
} from "@/lib/dialogue/product/sampleData";

/** The problem answer as it was: a prose paragraph with the study's cited
    quote cards under it, and no count anywhere (direction A, section 1). */
export default function ParagraphAnswerFigure({
  focus,
  citedQuotes = false,
}: {
  focus?: "answer";
  citedQuotes?: boolean;
}) {
  const prose = (
    <div
      className={focus === "answer" ? "dp-text-prose-sm" : "dp-text-prose-sm dp-text-prose-light"}
      style={{ display: "flex", flexDirection: "column", gap: 8 }}
    >
      {PARAGRAPH_ANSWER_BRIEF.map((p) => (
        <p key={p.slice(0, 24)} style={{ margin: 0 }}>{p}</p>
      ))}
    </div>
  );
  if (focus === "answer") return prose;
  return (
    <StudyChatShell hideComposer>
      <UserMessageBubble>{CHECKOUT_QUESTION}</UserMessageBubble>
      {prose}
      {citedQuotes ? (
        <div className="dp-lead-answer-card__quotes" data-annotate-part="cited-quotes">
          {QUOTE_LIST.map((q) => (
            <div
              key={q.participant}
              className="dp-lead-answer-card__quote"
              data-annotate-part={`quote-${annotateSlug(q.participant)}`}
            >
              <strong>{q.participant}</strong>
              {q.quote}
            </div>
          ))}
        </div>
      ) : null}
    </StudyChatShell>
  );
}
