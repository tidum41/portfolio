import ClipCard from "@/components/dialogue/product/ClipCard";
import StructuredAnswerFigure from "@/components/dialogue/product/scenarios/StructuredAnswerFigure";
import { CLIPS } from "@/lib/dialogue/product/sampleData";

/** Section-7 drawer: answer card + every supporting clip (not the hero 3:2 compose). */
export default function FullAnswerFigure() {
  return (
    <div className="dp-full-answer dialogue-product-root dp-chat-panel-typography">
      <div className="dp-full-answer__cluster" data-export-full-answer-drawer="true">
        <div className="dp-full-answer__answer">
          <StructuredAnswerFigure showClips={false} compact />
        </div>
        <aside
          className="dp-full-answer__drawer"
          aria-label="Clips from this answer"
          data-export-hero-clips-panel="true"
        >
          <div className="dp-full-answer__drawer-head">
            <p className="dp-full-answer__drawer-title">Clips from this answer</p>
            <p className="dp-full-answer__drawer-sub">9 moments from checkout interviews</p>
          </div>
          <div className="dp-full-answer__drawer-list">
            {CLIPS.map((clip) => (
              <ClipCard key={clip.id} clip={clip} />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
