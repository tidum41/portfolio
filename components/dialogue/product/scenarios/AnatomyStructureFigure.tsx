import StructuredAnswerFigure from "@/components/dialogue/product/scenarios/StructuredAnswerFigure";
import { ANATOMY_LABELS } from "@/lib/dialogue/product/sampleData";

export default function AnatomyStructureFigure() {
  return (
    <div className="dp-anatomy dialogue-product-root">
      <div className="dp-anatomy__markers">
        {ANATOMY_LABELS.map((label, i) => (
          <div key={label} className="dp-anatomy__marker">{i + 1}. {label}</div>
        ))}
      </div>
      <StructuredAnswerFigure />
    </div>
  );
}
