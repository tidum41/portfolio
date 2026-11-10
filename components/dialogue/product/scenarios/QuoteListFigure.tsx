import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import { CHECKOUT_QUESTION, QUOTE_LIST } from "@/lib/dialogue/product/sampleData";
import { annotateSlug } from "@/components/dialogue/annotate";
import { WaveformIcon } from "@/components/dialogue/product/icons";

export default function QuoteListFigure({ focus }: { focus?: "answer" }) {
  const list = (
    <div className="dp-clip-quotes">
      {/* Round P9: every quote row carries the Paper waveform row (same markup as ClipQuotes). */}
      {QUOTE_LIST.map((q) => (
        <div key={q.participant} className="dp-clip-quote" data-annotate-part={`clip-quote-${annotateSlug(q.participant)}`}>
          <p className="dp-clip-quote__who">
            <WaveformIcon className="dp-clip-quote__icon" />
            <span className="dp-clip-quote__name">{q.participant}</span>
            <span className="dp-clip-quote__time">{q.time}</span>
          </p>
          <p className="dp-clip-quote__text">{q.quote}</p>
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
