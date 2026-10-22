import ClipCard from "@/components/dialogue/product/ClipCard";
import ChartOnlyFigure from "@/components/dialogue/product/scenarios/ChartOnlyFigure";
import StructuredAnswerFigure from "@/components/dialogue/product/scenarios/StructuredAnswerFigure";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import { CLIPS } from "@/lib/dialogue/product/sampleData";

/** Hero collage: chat plus clips, with chart library thumbs on the calm surface. */
export default function HeroStructuredFigure() {
  const heroClips = CLIPS.slice(0, 2);
  const miniClass = `dp-hero-compose__mini-chart dialogue-product-root dp-chat-panel-typography ${dialogueProductFontClassName}`;
  return (
    <div className="dp-hero-compose dp-hero-compose--collage dialogue-product-root">
      <div className="dp-hero-compose__backdrop" aria-hidden>
        <div className={`dp-hero-compose__mini dp-hero-compose__mini--funnel ${miniClass}`}>
          <ChartOnlyFigure variant="funnel" />
        </div>
        <div className={`dp-hero-compose__mini dp-hero-compose__mini--coverage ${miniClass}`}>
          <ChartOnlyFigure variant="coverage" />
        </div>
        <div className={`dp-hero-compose__mini dp-hero-compose__mini--segment ${miniClass}`}>
          <ChartOnlyFigure variant="segment" />
        </div>
        <div className={`dp-hero-compose__mini dp-hero-compose__mini--trend ${miniClass}`}>
          <ChartOnlyFigure variant="trend" />
        </div>
      </div>
      <div className="dp-hero-compose__cluster">
        <div className="dp-hero-compose__main">
          <StructuredAnswerFigure hero showClips={false} compact />
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
