import StudyPageChrome from "@/components/dialogue/product/StudyPageChrome";
import PlacementChatPreview from "@/components/dialogue/product/scenarios/PlacementChatPreview";

export default function PlacementBubbleFigure() {
  return (
    <div className="dialogue-product-root dp-placement-layer">
      <div className="dp-placement-study-wrap">
        <StudyPageChrome placement />
      </div>
      <div className="dp-floating-chat" aria-label="Open chat">
        <div className="dp-floating-chat__scale">
          <PlacementChatPreview />
        </div>
      </div>
      <div className="dp-bubble-launcher-inset" aria-hidden title="Collapsed launcher">
        ◐
      </div>
    </div>
  );
}
