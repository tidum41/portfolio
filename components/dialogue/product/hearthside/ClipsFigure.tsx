import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import { DialogueInterviewPlayer } from "@/components/dialogue/DialogueInterviewPlayer";
import { ArrowDownIcon, CopyIcon, PersonIcon } from "@/components/dialogue/product/icons";
import QuoteCardH from "@/components/dialogue/product/hearthside/QuoteCardH";
import {
  FRIDAY_QUESTION,
  FRIDAY_QUOTES,
  HEARTHSIDE_STUDY_SUBTITLE,
} from "@/lib/dialogue/product/hearthside";

const TRANSCRIPT = [
  { speaker: "Dialogue", time: "18:24", text: "What did you make of the delivery date?", role: "dialogue" as const },
  { speaker: "Mei", time: "18:27", text: "Friday which week?", role: "participant" as const, active: true },
  { speaker: "Dialogue", time: "18:51", text: "What did you do then?", role: "dialogue" as const },
];

/** A synced transcript in the restored markup, with Hearthside rows. The
    moderator's two questions are composed for the recreation; Mei's line
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

/** The turning point: Mei's quote card tapped open into the clip playing
    in the chat, with the transcript following and her line lit. */
export default function ClipsFigure() {
  return (
    <StudyChatShell subtitle={HEARTHSIDE_STUDY_SUBTITLE} hideComposer>
      <UserMessageBubble>{FRIDAY_QUESTION}</UserMessageBubble>
      <QuoteCardH quote={FRIDAY_QUOTES[0]} selected part="clips-quote-mei" />
      <DialogueInterviewPlayer />
      <TranscriptH />
    </StudyChatShell>
  );
}
