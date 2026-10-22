import { SOURCES } from "@/lib/dialogue/product/sampleData";
import { annotateSlug } from "@/components/dialogue/annotate";

type Props = {
  selectedParticipant?: string;
  selectedTime?: string;
};

export default function SourcesRow({ selectedParticipant, selectedTime }: Props) {
  return (
    <div className="dp-sources" aria-hidden data-annotate-part="sources-row">
      {SOURCES.map((s) => {
        const selected =
          selectedParticipant &&
          s.participant === selectedParticipant &&
          (!selectedTime || s.time === selectedTime);
        return (
          <span
            key={`${s.participant}-${s.time}`}
            data-annotate-part={`source-pill-${annotateSlug(s.participant)}`}
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
