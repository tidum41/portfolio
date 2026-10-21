import StructuredAnswerFigure from "@/components/dialogue/product/scenarios/StructuredAnswerFigure";

/** 3:2 hero: one answer card with full funnel through Confirm + footnote. */
export default function HeroStructuredFigure() {
  return (
    <div className="dp-hero-compose dp-hero-compose--solo dialogue-product-root">
      <StructuredAnswerFigure hero showClips={false} />
    </div>
  );
}
