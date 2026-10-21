"use client";

import DialogueProductFigure from "@/components/dialogue/DialogueProductFigure";
import DialogueRachelFrame from "@/components/dialogue/DialogueRachelFrame";
import type { GalleryVariant } from "@/components/dialogue/product/scenarios/ChartGalleryFigure";

const CHART_EXPORTS: { variant: GalleryVariant; label: string; assetId?: string }[] = [
  { variant: "trend", label: "Trend over rounds", assetId: "D-09" },
  { variant: "funnel", label: "Drop-off by step" },
  { variant: "segment", label: "Segment comparison" },
  { variant: "distribution", label: "Distribution" },
  { variant: "theme", label: "Theme ranking" },
  { variant: "quote-freq", label: "Quote frequency" },
  { variant: "timeline", label: "Timeline of moments" },
  { variant: "coverage", label: "Coverage callout" },
];

export default function DialogueChartGallery() {
  return (
    <div className="dialogue-chart-gallery">
      {CHART_EXPORTS.map((item) => (
        <div key={item.label} className="dialogue-chart-gallery__cell">
          <DialogueRachelFrame label={item.label} tone="chart">
            <DialogueProductFigure
              scenario={{ gallery: item.variant }}
              title={item.label}
              assetId={item.assetId}
            />
          </DialogueRachelFrame>
        </div>
      ))}
    </div>
  );
}
