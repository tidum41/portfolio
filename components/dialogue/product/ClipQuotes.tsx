import { CLIPS } from "@/lib/dialogue/product/sampleData";
import { WaveformIcon } from "@/components/dialogue/product/icons";
import { annotateSlug } from "@/components/dialogue/annotate";

export type ClipQuoteRow = {
  id: string;
  participant: string;
  segment: string;
  transcript: string;
};

type Props = {
  /** Defaults to the hero ClipQuotes sample. */
  clips?: ClipQuoteRow[];
  /** Participant whose row carries the selected chrome. */
  selectedParticipant?: string | null;
  /** When set, rows are buttons so a parent can open the shared clip player. */
  onSelect?: (participant: string) => void;
};

const DEFAULT_ROWS: ClipQuoteRow[] = CLIPS.slice(0, 2).map((clip) => ({
  id: clip.id,
  participant: clip.participant,
  segment: clip.segment,
  transcript: clip.transcript,
}));

/** Hero aside: the quotes behind the chart, each with who said it and where. */
export default function ClipQuotes({
  clips = DEFAULT_ROWS,
  selectedParticipant = null,
  onSelect,
}: Props = {} as Props) {
  return (
    <div className="dp-clip-quotes" data-annotate-part="clip-quotes">
      {clips.map((clip) => {
        const selected =
          selectedParticipant === clip.participant ||
          (!selectedParticipant && !onSelect && clip.participant === "Priya K.");
        const className = ["dp-clip-quote", selected ? "dp-clip-quote--selected" : ""]
          .filter(Boolean)
          .join(" ");
        const body = (
          <>
            <p className="dp-clip-quote__who">
              <WaveformIcon className="dp-clip-quote__icon" />
              <span className="dp-clip-quote__name">{clip.participant}</span>
              <span className="dp-clip-quote__time">{clip.segment}</span>
            </p>
            <p className="dp-clip-quote__text">{clip.transcript}</p>
          </>
        );
        if (onSelect) {
          return (
            <button
              key={clip.id}
              type="button"
              className={className}
              data-annotate-part={`clip-quote-${annotateSlug(clip.participant)}`}
              aria-pressed={selectedParticipant === clip.participant}
              onClick={() => onSelect(clip.participant)}
            >
              {body}
            </button>
          );
        }
        return (
          <div
            key={clip.id}
            className={className}
            data-annotate-part={`clip-quote-${annotateSlug(clip.participant)}`}
          >
            {body}
          </div>
        );
      })}
    </div>
  );
}
