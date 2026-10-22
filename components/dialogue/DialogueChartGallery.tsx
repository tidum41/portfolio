"use client";

import DialogueProductFigure from "@/components/dialogue/DialogueProductFigure";
import DialogueRachelFrame from "@/components/dialogue/DialogueRachelFrame";
import type { GalleryVariant } from "@/components/dialogue/product/scenarios/ChartGalleryFigure";

type MapRow = {
  variant: GalleryVariant;
  question: string;
  chart: string;
  assetId?: string;
};

const MAP_ROWS: MapRow[] = [
  { variant: "funnel", question: "Where do people drop?", chart: "Drop-off by step", assetId: "D-09" },
  { variant: "segment", question: "How do segments differ?", chart: "Segment comparison" },
  { variant: "trend", question: "How did sentiment change?", chart: "Trend over rounds" },
  { variant: "coverage", question: "How many interviews agree?", chart: "Coverage callout" },
];

export default function DialogueChartGallery() {
  return (
    <div className="dialogue-chart-gallery-wrap">
      <div className="dialogue-chart-mapping">
        {MAP_ROWS.map((row) => (
          <div key={row.variant} className="dialogue-chart-mapping__row">
            <div className="dialogue-chart-mapping__copy">
              <p className="dialogue-chart-mapping__question">{row.question}</p>
              <p className="dialogue-chart-mapping__chart">{row.chart}</p>
            </div>
            <div className="dialogue-chart-mapping__thumb">
              <DialogueRachelFrame tone="system" className="dialogue-chart-mapping__frame">
                <DialogueProductFigure
                  scenario={{ gallery: row.variant }}
                  title={row.chart}
                  assetId={row.assetId}
                />
              </DialogueRachelFrame>
            </div>
          </div>
        ))}
      </div>
      <p className="dialogue-caption dialogue-chart-gallery__caption">
        <span className="dialogue-caption__label">Illustrative</span>
        <span className="dialogue-caption__sentence">Study data in these figures is illustrative.</span>
      </p>
    </div>
  );
}
