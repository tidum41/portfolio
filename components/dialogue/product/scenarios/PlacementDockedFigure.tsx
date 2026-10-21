import StudyPageChrome from "@/components/dialogue/product/StudyPageChrome";
import PlacementChatPreview from "@/components/dialogue/product/scenarios/PlacementChatPreview";

export default function PlacementDockedFigure() {
  return (
    <div className="dialogue-product-root dp-placement-layer">
      <div className="dp-placement-study-wrap">
        <StudyPageChrome placement />
      </div>
      <div className="dp-docked-chat">
        <PlacementChatPreview />
      </div>
    </div>
  );
}
