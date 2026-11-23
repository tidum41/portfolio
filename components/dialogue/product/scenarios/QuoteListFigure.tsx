import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import { CHECKOUT_QUESTION, QUOTE_GROUPS, QUOTE_LIST } from "@/lib/dialogue/product/sampleData";
import { annotateSlug } from "@/components/dialogue/annotate";
import { WaveformIcon } from "@/components/dialogue/product/icons";
import SourcePill from "@/components/dialogue/product/SourcePill";

/* Consult r1 (STATES S4): quotes grouped by reading, a count in type on each group head, no chart. Only labelled Hearthside people are
   named; the rest of each side is one +N remainder (count minus the names shown). */
function GroupedQuoteList() {
  return (
    <div className="dialogue-product-root dp-chat-panel-typography dlg-qgroups">
      <StudyChatShell compact hideComposer hideHeader>
        <UserMessageBubble>Show me who said that</UserMessageBubble>
        {QUOTE_GROUPS.map((g) => (
          <section key={g.id} className="dlg-qgroup" data-group={g.id} aria-label={`${g.label}, ${g.count}`}>
            <p className="dlg-hero-head">
              <span className="dlg-sample-key" aria-hidden />
              <span>{g.label}</span>
              <span className="dlg-hero-head__count">{g.count}</span>
            </p>
            <div className="dp-clip-quotes">
              {g.rows.map((q) => (
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
            <div className="dp-sources"><SourcePill name={`+${g.count - g.rows.length} more`} time="" /></div>
          </section>
        ))}
      </StudyChatShell>
    </div>
  );
}

export default function QuoteListFigure({ focus, grouped }: { focus?: "answer"; grouped?: boolean }) {
  if (grouped) return <GroupedQuoteList />;
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
