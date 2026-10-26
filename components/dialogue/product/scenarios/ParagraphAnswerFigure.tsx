import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import { WaveformIcon } from "@/components/dialogue/product/icons";
import { annotateSlug } from "@/components/dialogue/annotate";
import {
  CHECKOUT_QUESTION,
  PARAGRAPH_ANSWER_BRIEF,
  QUOTE_LIST,
} from "@/lib/dialogue/product/sampleData";

/** The problem answer as it was: a prose paragraph with the study's quote
    cards under it. In the round N problem state the cards are collapsed and
    greyed, with a single annotation: no count. */
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
        <>
          <div className="dp-problem-quotes" data-annotate-part="cited-quotes">
            {QUOTE_LIST.map((q) => (
              <div
                key={q.participant}
                className="dp-problem-quotes__row"
                data-annotate-part={`quote-${annotateSlug(q.participant)}`}
              >
                <WaveformIcon className="dp-problem-quotes__wave" />
                <strong>{q.participant}</strong>
                <span className="dp-problem-quotes__text">{q.quote}</span>
              </div>
            ))}
          </div>
          <p className="dp-problem-note" data-annotate-part="no-count-note">No count</p>
        </>
      ) : null}
    </StudyChatShell>
  );
}
