import { DialogueAsteriskIcon } from "@/components/dialogue/product/icons";

type Row = {
  speaker: string;
  time: string;
  text: string;
  active?: boolean;
  role?: "dialogue" | "participant";
};

/** Paper section-5 synced transcript — every row has speaker + timestamp. */
const ROWS: Row[] = [
  {
    speaker: "Dialogue",
    time: "01:04",
    text: "What made you hesitate before paying?",
    role: "dialogue",
  },
  {
    speaker: "Jordan M.",
    time: "01:38",
    text: "The apartment field kept clearing when I picked autocomplete.",
    active: true,
    role: "participant",
  },
  {
    speaker: "Dialogue",
    time: "01:42",
    text: "Did the error tell you what to fix?",
    role: "dialogue",
  },
];

export default function SyncedTranscript() {
  return (
    <div className="dp-synced-transcript" aria-hidden data-annotate-part="transcript">
      <p className="dp-synced-transcript__label">Synced transcript</p>
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
            <span className="dp-synced-transcript__meta">
              <span
                className={[
                  "dp-synced-transcript__avatar",
                  row.role === "dialogue"
                    ? "dp-synced-transcript__avatar--dialogue"
                    : "dp-synced-transcript__avatar--participant",
                ].join(" ")}
                aria-hidden
              >
                {row.role === "dialogue" ? (
                  <DialogueAsteriskIcon className="dp-synced-transcript__avatar-icon" />
                ) : (
                  <span className="dp-synced-transcript__person-icon" aria-hidden />
                )}
              </span>
              <span className="dp-synced-transcript__speaker">{row.speaker}</span>
              <span className="dp-synced-transcript__time">{row.time}</span>
            </span>
            <span className="dp-synced-transcript__text">{row.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
