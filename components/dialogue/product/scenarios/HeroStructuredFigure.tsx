import ClipCard from "@/components/dialogue/product/ClipCard";
import StructuredAnswerFigure from "@/components/dialogue/product/scenarios/StructuredAnswerFigure";
import { CLIPS } from "@/lib/dialogue/product/sampleData";

/** 3:2 hero: answer card + clip moments (JOOLA-style filled frame). */
export default function HeroStructuredFigure() {
  const heroClips = CLIPS.slice(0, 2);
  return (
    <div className="dp-hero-compose dialogue-product-root">
      <div className="dp-hero-compose__cluster">
        <div className="dp-hero-compose__main">
          <StructuredAnswerFigure hero showClips={false} />
        </div>
        <aside className="dp-hero-compose__clips" aria-label="Clips from this answer">
          <p className="dp-hero-compose__clips-title">Clips from this answer</p>
          <p className="dp-hero-compose__clips-sub">9 moments from checkout interviews</p>
          <div className="dp-hero-compose__clips-stack">
            {heroClips.map((clip) => (
              <ClipCard key={clip.id} clip={clip} />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
