"use client";

import DialogueReactFigure from "@/components/dialogue/DialogueReactFigure";
import DialogueRachelFrame from "@/components/dialogue/DialogueRachelFrame";

const CHART_EXPORTS: { route: string; title: string; label: string }[] = [
  { route: "section-2", title: "Funnel and multi-shape answers", label: "Funnel" },
  { route: "visual-1", title: "Chart response variant 1", label: "Trend over rounds" },
  { route: "visual-2", title: "Chart response variant 2", label: "Segment comparison" },
  { route: "visual-3", title: "Chart response variant 3", label: "Distribution" },
  { route: "visual-4", title: "Chart response variant 4", label: "Theme ranking" },
  { route: "visual-5", title: "Chart response variant 5", label: "Quote frequency" },
  { route: "visual-6", title: "Chart response variant 6", label: "Timeline of moments" },
  { route: "section-3a", title: "Chart-led answer variant", label: "Coverage callout" },
];

export default function DialogueChartGallery() {
  return (
    <div className="dialogue-chart-gallery">
      {CHART_EXPORTS.map((item, i) => (
        <div key={item.route} className="dialogue-chart-gallery__cell">
          <DialogueRachelFrame label={item.label} tone="chart">
            <DialogueReactFigure
              exportRoute={item.route}
              title={item.title}
              assetId={i === 0 ? "D-09" : undefined}
            />
          </DialogueRachelFrame>
        </div>
      ))}
    </div>
  );
}
