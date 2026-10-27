import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import QuoteCardH from "@/components/dialogue/product/hearthside/QuoteCardH";
import { AISHA_QUOTE, BEFORE_TABLE, HEARTHSIDE_STUDY_SUBTITLE } from "@/lib/dialogue/product/hearthside";

const THEMES = [
  { emoji: "🏷️", label: "Delivery fee at cart", line: "a fee showed up late in the order." },
  { emoji: "📅", label: "Unclear Friday promise", line: "the delivery date was hard to pin down." },
] as const;

/** The chat as it was, recreated with invented data: an emoji theme list
    and one quote card, a follow-up question the chat could not answer, and
    a raw-text summary table of names. On phones the table clamps to one row. */
export default function BeforeChatFigure() {
  return (
    <StudyChatShell subtitle={HEARTHSIDE_STUDY_SUBTITLE} hideComposer>
      <UserMessageBubble>What are the main themes?</UserMessageBubble>
      <div className="dp-before-themes" data-annotate-part="before-themes">
        {THEMES.map((t) => (
          <p key={t.label} className="dp-before-themes__row">
            <span aria-hidden>{t.emoji}</span> <strong>{t.label}</strong>: {t.line}
          </p>
        ))}
      </div>
      <QuoteCardH quote={AISHA_QUOTE} part="before-quote-aisha" />
      <UserMessageBubble>How many mentioned this?</UserMessageBubble>
      <p className="dp-summary dp-text-body" data-annotate-part="before-deflection">
        Could you clarify which specific pain point you&rsquo;re referring to?
      </p>
      <table className="dp-before-table" data-annotate-part="before-table">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Theme</th>
          </tr>
        </thead>
        <tbody>
          {BEFORE_TABLE.map((row) => (
            <tr key={row.name}>
              <td>{row.name}</td>
              <td>{row.theme}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </StudyChatShell>
  );
}
