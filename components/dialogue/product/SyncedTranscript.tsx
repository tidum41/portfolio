type Row = {
  speaker: string;
  time: string;
  text: string;
  active?: boolean;
};

/** Paper section-5 synced transcript — every row has speaker + timestamp. */
const ROWS: Row[] = [
  {
    speaker: "Dialogue",
    time: "01:04",
    text: "What made you hesitate before paying?",
  },
  {
    speaker: "Jordan M.",
    time: "01:38",
    text: "The apartment field kept clearing when I picked autocomplete.",
    active: true,
  },
  {
    speaker: "Dialogue",
    time: "01:42",
    text: "Did the error tell you what to fix?",
  },
];

export default function SyncedTranscript() {
  return (
    <div className="dp-synced-transcript" aria-hidden>
      <p className="dp-synced-transcript__label">Synced transcript</p>
      <ul className="dp-synced-transcript__list">
        {ROWS.map((row, i) => (
          <li
            key={i}
            className={[
              "dp-synced-transcript__row",
              row.active ? "dp-synced-transcript__row--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="dp-synced-transcript__meta">
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
