import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import { CHECKOUT_QUESTION, QUOTE_LIST } from "@/lib/dialogue/product/sampleData";
import { annotateSlug } from "@/components/dialogue/annotate";
import { WaveformIcon } from "@/components/dialogue/product/icons";

export type QuoteListRow = {
  participant: string;
  time: string;
  quote: string;
};

type Props = {
  focus?: "answer";
  /** Defaults to the Hearthside QUOTE_LIST used on the live Counts / Levels figures. */
  quotes?: QuoteListRow[];
  /** When set, that row gets the selected quote chrome (ClipQuotes language). */
  selectedParticipant?: string | null;
  /** When set, rows are buttons so a parent can open a clip without forking the markup. */
  onSelect?: (participant: string) => void;
};

export default function QuoteListFigure({
  focus,
  quotes = QUOTE_LIST,
  selectedParticipant = null,
  onSelect,
}: Props) {
  const list = (
    <div className="dp-clip-quotes">
      {/* Round P9: every quote row carries the Paper waveform row (same markup as ClipQuotes). */}
      {quotes.map((q) => {
        const selected = selectedParticipant === q.participant;
        const className = ["dp-clip-quote", selected ? "dp-clip-quote--selected" : ""]
          .filter(Boolean)
          .join(" ");
        const body = (
          <>
            <p className="dp-clip-quote__who">
              <WaveformIcon className="dp-clip-quote__icon" />
              <span className="dp-clip-quote__name">{q.participant}</span>
              <span className="dp-clip-quote__time">{q.time}</span>
            </p>
            <p className="dp-clip-quote__text">{q.quote}</p>
          </>
        );
        if (onSelect) {
          return (
            <button
              key={q.participant}
              type="button"
              className={className}
              data-annotate-part={`clip-quote-${annotateSlug(q.participant)}`}
              aria-pressed={selected}
              onClick={() => onSelect(q.participant)}
            >
              {body}
            </button>
          );
        }
        return (
          <div
            key={q.participant}
            className={className}
            data-annotate-part={`clip-quote-${annotateSlug(q.participant)}`}
          >
            {body}
          </div>
        );
      })}
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
