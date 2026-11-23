import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import { CHECKOUT_QUESTION, QUOTE_GROUPS, QUOTE_LIST, remainingCount } from "@/lib/dialogue/product/sampleData";
import SourcePill from "@/components/dialogue/product/SourcePill";
import { QuoteRow } from "@/components/dialogue/live/DialogueMotionStage";

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
                <QuoteRow key={q.participant} q={q} open={false} />
              ))}
            </div>
            <div className="dp-sources"><SourcePill name={`+${remainingCount(g.count, g.rows.length)} more`} time="" /></div>
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
      {QUOTE_LIST.map((q) => (
        <QuoteRow key={q.participant} q={q} open={false} />
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
