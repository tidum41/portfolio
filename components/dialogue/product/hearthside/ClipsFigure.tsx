import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import { DialogueInterviewPlayer } from "@/components/dialogue/DialogueInterviewPlayer";
import { ArrowDownIcon, CopyIcon, PersonIcon } from "@/components/dialogue/product/icons";
import QuoteCardH from "@/components/dialogue/product/hearthside/QuoteCardH";
import {
  AISHA_QUOTE,
  HEARTHSIDE_STUDY_SUBTITLE,
  PRICE_QUESTION,
  PRICE_SPLIT,
} from "@/lib/dialogue/product/hearthside";

const TRANSCRIPT = [
  { speaker: "Dialogue", time: "15:38", text: "What happened when you reached the cart?", role: "dialogue" as const },
  { speaker: "Aisha", time: "15:40", text: AISHA_QUOTE.text, role: "participant" as const, active: true },
  { speaker: "Dialogue", time: "16:04", text: "Did the total match what you expected?", role: "dialogue" as const },
];

/** A synced transcript in the restored markup, with Hearthside rows. The
    moderator's two questions are composed for the recreation; Aisha's line
    is the mock data's verbatim quote. */
function TranscriptH() {
  return (
    <div className="dp-synced-transcript" aria-hidden data-annotate-part="transcript">
      <div className="dp-synced-transcript__head" data-annotate-part="transcript-head">
        <p className="dp-synced-transcript__label" data-annotate-part="transcript-title">Transcript</p>
        <span className="dp-synced-transcript__copy" data-annotate-part="transcript-copy">
          <CopyIcon />
        </span>
      </div>
      <div className="dp-synced-transcript__viewport" data-annotate-part="transcript-viewport">
        <ul className="dp-synced-transcript__list">
          {TRANSCRIPT.map((row, i) => (
            <li
              key={row.time}
              data-annotate-part={`transcript-row-${i + 1}`}
              className={["dp-synced-transcript__row", row.active ? "dp-synced-transcript__row--active" : ""]
                .filter(Boolean)
                .join(" ")}
            >
              <span
                className={[
                  "dp-synced-transcript__avatar",
                  row.role === "dialogue"
                    ? "dp-synced-transcript__avatar--dialogue"
                    : "dp-synced-transcript__avatar--participant",
                ].join(" ")}
                data-annotate-part={`transcript-avatar-${i + 1}`}
              >
                {row.role === "dialogue" ? null : (
                  <PersonIcon className="dp-synced-transcript__person-icon" />
                )}
              </span>
              <span className="dp-synced-transcript__content">
                <span className="dp-synced-transcript__meta">
                  <span className="dp-synced-transcript__speaker">{row.speaker}</span>
                  <span className="dp-synced-transcript__time">{row.time}</span>
                </span>
                <span className="dp-synced-transcript__text">{row.text}</span>
              </span>
            </li>
          ))}
        </ul>
        <span className="dp-synced-transcript__scroll" data-annotate-part="transcript-scroll-button">
          <ArrowDownIcon />
        </span>
      </div>
    </div>
  );
}

/** The turning point: the price-doubt answer with its segment split, and
    Aisha's quote card tapped open into the clip playing in the chat, its
    transcript line lit. */
export default function ClipsFigure() {
  return (
    <StudyChatShell subtitle={HEARTHSIDE_STUDY_SUBTITLE} hideComposer>
      <UserMessageBubble>{PRICE_QUESTION}</UserMessageBubble>
      <ChartVizCard title="Price doubt at the cart made 9 of 24 shoppers hesitate.">
        <ChartBarList rows={PRICE_SPLIT.map((r) => ({ ...r }))} max={24} />
      </ChartVizCard>
      <QuoteCardH quote={AISHA_QUOTE} selected part="clips-quote-aisha" />
      <DialogueInterviewPlayer />
      <TranscriptH />
    </StudyChatShell>
  );
}
