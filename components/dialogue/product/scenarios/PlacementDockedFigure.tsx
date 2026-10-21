import PlacementStudyBackdrop from "@/components/dialogue/product/scenarios/PlacementStudyBackdrop";
import PlacementChatPreview from "@/components/dialogue/product/scenarios/PlacementChatPreview";

export default function PlacementDockedFigure() {
  return (
    <div className="dialogue-product-root dp-placement-layer">
      <PlacementStudyBackdrop />
      <div className="dp-docked-chat">
        <PlacementChatPreview />
      </div>
    </div>
  );
}
