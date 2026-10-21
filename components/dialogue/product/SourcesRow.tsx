import { SOURCES } from "@/lib/dialogue/product/sampleData";

export default function SourcesRow() {
  return (
    <div className="dp-sources">
      {SOURCES.map((s) => (
        <span key={s.participant} className="dp-source-pill">
          {s.participant} · {s.time}
        </span>
      ))}
    </div>
  );
}
