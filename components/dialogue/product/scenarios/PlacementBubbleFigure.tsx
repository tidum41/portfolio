import PlacementStudyBackdrop from "@/components/dialogue/product/scenarios/PlacementStudyBackdrop";
import PlacementChatPreview from "@/components/dialogue/product/scenarios/PlacementChatPreview";

export default function PlacementBubbleFigure() {
  return (
    <div className="dialogue-product-root dp-placement-layer dp-placement-layer--bubble">
      <PlacementStudyBackdrop />
      <div className="dp-floating-chat" aria-label="Open chat">
        <PlacementChatPreview />
      </div>
      <div className="dp-bubble-launcher-inset" aria-hidden title="Collapsed launcher">
        ◐
      </div>
    </div>
  );
}
