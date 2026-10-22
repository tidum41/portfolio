import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import { CHECKOUT_QUESTION, QUOTE_LIST } from "@/lib/dialogue/product/sampleData";

export default function QuoteListFigure({ focus }: { focus?: "answer" }) {
  const list = (
    <div className="dp-quote-list">
      {QUOTE_LIST.map((q) => (
        <div key={q.participant} className="dp-quote-item">
          <strong>{q.participant}</strong>
          {q.quote}
        </div>
      ))}
    </div>
  );
  if (focus === "answer") return list;
  return (
    <StudyChatShell compact hideComposer>
      <UserMessageBubble>{CHECKOUT_QUESTION}</UserMessageBubble>
      {list}
    </StudyChatShell>
  );
}
