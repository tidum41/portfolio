"use client";

import ChartOnlyFigure from "@/components/dialogue/product/scenarios/ChartOnlyFigure";
import DialogueRachelFrame from "@/components/dialogue/DialogueRachelFrame";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
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
          <article key={row.variant} className="dialogue-chart-mapping__cell">
            <div className="dialogue-chart-mapping__copy">
              <p className="dialogue-chart-mapping__question">{row.question}</p>
              <p className="dialogue-chart-mapping__chart">{row.chart}</p>
            </div>
            <div className="dialogue-chart-mapping__thumb">
              <DialogueRachelFrame tone="system" className="dialogue-chart-mapping__frame">
                <div
                  className={`dialogue-chart-mapping__chart-only dialogue-product-root dp-chat-panel-typography ${dialogueProductFontClassName}`}
                  data-dialogue-asset-id={row.assetId}
                >
                  <ChartOnlyFigure variant={row.variant} />
                </div>
              </DialogueRachelFrame>
            </div>
          </article>
        ))}
      </div>
      <p className="dialogue-caption dialogue-chart-gallery__caption">
        <span className="dialogue-caption__label">Illustrative</span>
        <span className="dialogue-caption__sentence">Study data in these figures is illustrative.</span>
      </p>
    </div>
  );
}
