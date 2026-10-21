import StructuredAnswerFigure from "@/components/dialogue/product/scenarios/StructuredAnswerFigure";
import ClipCard from "@/components/dialogue/product/ClipCard";
import { CLIPS } from "@/lib/dialogue/product/sampleData";

export default function HeroStructuredFigure() {
  return (
    <div className="dp-hero-compose dialogue-product-root">
      <StructuredAnswerFigure compact showClips={false} />
      <div className="dp-hero-compose__clips">
        <p className="dp-hero-compose__clips-title">Clips from this answer</p>
        <p className="dp-text-meta" style={{ margin: "0 0 6px" }}>9 moments from checkout interviews</p>
        {CLIPS.map((clip) => (
          <ClipCard key={clip.id} clip={clip} />
        ))}
      </div>
    </div>
  );
}
