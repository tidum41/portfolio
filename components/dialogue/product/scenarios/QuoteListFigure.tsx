import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import LineChart from "@/components/dialogue/product/LineChart";
import { CHECKOUT_QUESTION, QUOTE_LIST } from "@/lib/dialogue/product/sampleData";

export default function QuoteListFigure() {
  return (
    <StudyChatShell compact>
      <UserMessageBubble>{CHECKOUT_QUESTION}</UserMessageBubble>
      <div className="dp-quote-list">
        {QUOTE_LIST.map((q) => (
          <div key={q.participant} className="dp-quote-item">
            <strong>{q.participant}</strong>
            {q.quote}
          </div>
        ))}
      </div>
      <LineChart />
    </StudyChatShell>
  );
}
