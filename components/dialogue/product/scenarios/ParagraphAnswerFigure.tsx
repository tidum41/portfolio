import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import QuoteCard from "@/components/dialogue/product/QuoteCard";
import {
  CHECKOUT_QUESTION,
  PARAGRAPH_ANSWER_BRIEF,
  QUOTE_LIST,
} from "@/lib/dialogue/product/sampleData";

/** Start times for the cited quotes, from the address follow-up's clips. */
const QUOTE_TIMES: Record<string, string> = {
  "Jordan M.": "14:03",
  "Priya K.": "16:02",
  "Sam R.": "11:22",
};

/** The answer as it was: a prose paragraph with the study's real grey quote
    cards cited underneath, and no count anywhere (round O). */
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
        <div className="dp-clip-quotes" data-annotate-part="cited-quotes">
          {QUOTE_LIST.map((q) => (
            <QuoteCard
              key={q.participant}
              name={q.participant}
              time={QUOTE_TIMES[q.participant] ?? ""}
              text={q.quote}
            />
          ))}
        </div>
      ) : null}
    </StudyChatShell>
  );
}
