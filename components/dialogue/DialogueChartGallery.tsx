"use client";

import DialogueLiveFigure from "@/components/dialogue/DialogueLiveFigure";

const CHART_EXPORTS: { route: string; title: string }[] = [
  { route: "section-2", title: "Funnel and multi-shape answers" },
  { route: "visual-1", title: "Chart response variant 1" },
  { route: "visual-2", title: "Chart response variant 2" },
  { route: "visual-3", title: "Chart response variant 3" },
  { route: "visual-4", title: "Chart response variant 4" },
  { route: "visual-5", title: "Chart response variant 5" },
  { route: "visual-6", title: "Chart response variant 6" },
  { route: "section-4", title: "Structured answer with chart and clips" },
];

export default function DialogueChartGallery() {
  return (
    <div className="dialogue-chart-gallery">
      {CHART_EXPORTS.map((item, i) => (
        <div key={item.route} className="dialogue-chart-gallery__cell">
          <div className="cs-figure-media dialogue-live-figure-shell">
            <DialogueLiveFigure
              exportRoute={item.route}
              title={item.title}
              tier="pair"
              assetId={i === 0 ? "D-09" : undefined}
            />
          </div>
        </div>
      ))}
      <p className="cs-figcaption dialogue-chart-gallery__caption">
        Eight question types, eight chart shapes in study chat
      </p>
    </div>
  );
}
