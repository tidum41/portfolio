import { SOURCES } from "@/lib/dialogue/product/sampleData";
import SourcePill from "@/components/dialogue/product/SourcePill";

type Props = {
  selectedParticipant?: string;
  selectedTime?: string;
};

export default function SourcesRow({ selectedParticipant, selectedTime }: Props) {
  return (
    <div className="dp-sources" aria-hidden data-annotate-part="sources-row">
      {SOURCES.map((s) => {
        const selected = Boolean(
          selectedParticipant &&
            s.participant === selectedParticipant &&
            (!selectedTime || s.time === selectedTime),
        );
        return (
          <SourcePill key={`${s.participant}-${s.time}`} name={s.participant} time={s.time} selected={selected} />
        );
      })}
    </div>
  );
}
