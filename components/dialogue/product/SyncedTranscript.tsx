type Row = {
  speaker: string;
  time?: string;
  text: string;
  active?: boolean;
};

const ROWS: Row[] = [
  { speaker: "", text: "Earlier they mentioned delivery dates felt like hidden fees." },
  {
    speaker: "Jordan M.",
    time: "01:38",
    text: "The apartment field kept clearing when I picked autocomplete.",
    active: true,
  },
  { speaker: "", text: "I almost closed the tab before payment." },
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
            {row.speaker ? (
              <span className="dp-synced-transcript__meta">
                <span className="dp-synced-transcript__speaker">{row.speaker}</span>
                {row.time ? (
                  <span className="dp-synced-transcript__time">{row.time}</span>
                ) : null}
              </span>
            ) : null}
            <span className="dp-synced-transcript__text">{row.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
