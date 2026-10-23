import {
  ArrowDownIcon,
  CopyIcon,
  PersonIcon,
} from "@/components/dialogue/product/icons";

type Row = {
  speaker: string;
  time: string;
  text: string;
  active?: boolean;
  role: "dialogue" | "participant";
};

/** Paper section-5 transcript, as restored from 657337d. */
const ROWS: Row[] = [
  { speaker: "Dialogue", time: "01:04", text: "What made you hesitate before paying?", role: "dialogue" },
  {
    speaker: "Marcus W.",
    time: "01:38",
    text: "When the card failed, I didn't know if it was my bank or the site, so I hesitated before retrying.",
    active: true,
    role: "participant",
  },
  { speaker: "Dialogue", time: "01:42", text: "Did the error tell you what to fix?", role: "dialogue" },
];

export default function SyncedTranscript() {
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
          {ROWS.map((row, i) => (
            <li
              key={i}
              data-annotate-part={`transcript-row-${i + 1}`}
              className={[
                "dp-synced-transcript__row",
                row.active ? "dp-synced-transcript__row--active" : "",
              ]
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
