import StudyPageChrome from "@/components/dialogue/product/StudyPageChrome";
import StructuredAnswerFigure from "@/components/dialogue/product/scenarios/StructuredAnswerFigure";

export default function PlacementDockedFigure() {
  return (
    <div className="dialogue-product-root dp-placement-layer">
      <StudyPageChrome />
      <div className="dp-docked-chat">
        <StructuredAnswerFigure compact showClips={false} />
      </div>
    </div>
  );
}
