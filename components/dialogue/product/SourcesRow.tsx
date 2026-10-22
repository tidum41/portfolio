import { SOURCES } from "@/lib/dialogue/product/sampleData";

type Props = {
  selectedParticipant?: string;
  selectedTime?: string;
};

export default function SourcesRow({ selectedParticipant, selectedTime }: Props) {
  return (
    <div className="dp-sources" aria-hidden>
      {SOURCES.map((s) => {
        const selected =
          selectedParticipant &&
          s.participant === selectedParticipant &&
          (!selectedTime || s.time === selectedTime);
        return (
          <span
            key={`${s.participant}-${s.time}`}
            className={["dp-source-pill", selected ? "dp-source-pill--selected" : ""]
              .filter(Boolean)
              .join(" ")}
          >
            {s.participant}, {s.time}
          </span>
        );
      })}
    </div>
  );
}
