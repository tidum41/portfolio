import HeroChatCard from "@/components/dialogue/product/scenarios/HeroChatCard";

/** Direction A: the hero figure is the one chat card, nothing beside it. */
export default function HeroStructuredFigure() {
  return (
    <div className="dialogue-product-root">
      <HeroChatCard composer={false} />
    </div>
  );
}
