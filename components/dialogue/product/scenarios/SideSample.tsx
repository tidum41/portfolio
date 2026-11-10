import QuoteListFigure from "@/components/dialogue/product/scenarios/QuoteListFigure";
import SourcePill from "@/components/dialogue/product/SourcePill";

/**
 * Round P8: the quotes behind one side of a count, shown as a sample of that side.
 * Composed from Paper-derived primitives only: the quote list (QuoteListFigure) and
 * the source pill row (SourcePill inside .dp-sources). Hearthside mock data.
 */
export default function SideSample({
  label,
  total,
  shown = 2,
}: {
  label: string;
  total: number;
  shown?: number;
}) {
  return (
    <div className="dp-side-sample" data-annotate-part="side-sample">
      <p className="dp-side-sample__head dp-text-body">
        <span className="dp-summary__emph">{total}</span> {label}, {shown} shown
      </p>
      <QuoteListFigure focus="answer" />
      <div className="dp-sources">
        <SourcePill name={`+${total - shown} more`} time="" />
      </div>
    </div>
  );
}
