import ChartOnlyFigure from "@/components/dialogue/product/scenarios/ChartOnlyFigure";
import HeroChatCard from "@/components/dialogue/product/scenarios/HeroChatCard";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";

/** Hero: chat card plus three library chart thumbnails on a calm surface. */
export default function HeroStructuredFigure() {
  const miniClass = `dp-hero-collage__chart dialogue-product-root dp-chat-panel-typography ${dialogueProductFontClassName}`;
  return (
    <div className="dp-hero-collage dialogue-product-root">
      <div className="dp-hero-collage__surface" aria-hidden={false}>
        <div className="dp-hero-collage__chat">
          <HeroChatCard />
        </div>
        <div className="dp-hero-collage__charts" aria-hidden>
          <div className={`${miniClass} dp-hero-collage__chart--funnel`}>
            <ChartOnlyFigure variant="funnel" />
          </div>
          <div className={`${miniClass} dp-hero-collage__chart--segment`}>
            <ChartOnlyFigure variant="segment" />
          </div>
          <div className={`${miniClass} dp-hero-collage__chart--trend`}>
            <ChartOnlyFigure variant="trend" />
          </div>
        </div>
      </div>
    </div>
  );
}
