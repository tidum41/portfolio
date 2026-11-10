import QuoteListFigure, {
  type QuoteListRow,
} from "@/components/dialogue/product/scenarios/QuoteListFigure";
import SourcePill from "@/components/dialogue/product/SourcePill";

/**
 * Round P8: the quotes behind one side of a count, shown as a sample of that side.
 * Composed from Paper-derived primitives only: the quote list (QuoteListFigure) and
 * the source pill row (SourcePill inside .dp-sources). Hearthside mock data by default.
 */
export default function SideSample({
  label,
  total,
  shown = 2,
  quotes,
  selectedParticipant = null,
  onSelectQuote,
}: {
  label: string;
  total: number;
  shown?: number;
  quotes?: QuoteListRow[];
  selectedParticipant?: string | null;
  onSelectQuote?: (participant: string) => void;
}) {
  const visible = quotes ? quotes.length : shown;
  return (
    <div className="dp-side-sample" data-annotate-part="side-sample">
      <p className="dp-side-sample__head dp-text-body">
        <span className="dp-summary__emph">{total}</span> {label}, {visible} shown
      </p>
      <QuoteListFigure
        focus="answer"
        quotes={quotes}
        selectedParticipant={selectedParticipant}
        onSelect={onSelectQuote}
      />
      <div className="dp-sources">
        <SourcePill name={`+${Math.max(0, total - visible)} more`} time="" />
      </div>
    </div>
  );
}
