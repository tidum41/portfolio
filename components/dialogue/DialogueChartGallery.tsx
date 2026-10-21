"use client";

import DialogueProductFigure from "@/components/dialogue/DialogueProductFigure";
import DialogueRachelFrame from "@/components/dialogue/DialogueRachelFrame";
import type { GalleryVariant } from "@/components/dialogue/product/scenarios/ChartGalleryFigure";

/** Four strong cards on the page. The mapping table covers the rest. */
const GALLERY_CARDS: { variant: GalleryVariant; label: string; assetId?: string }[] = [
  { variant: "funnel", label: "Drop-off by step", assetId: "D-09" },
  { variant: "segment", label: "Segment comparison" },
  { variant: "trend", label: "Trend over rounds" },
  { variant: "coverage", label: "Coverage callout" },
];

const QUESTION_CHART_MAP: { question: string; chart: string }[] = [
  { question: "Where do people drop?", chart: "Drop-off by step" },
  { question: "How do segments differ?", chart: "Segment comparison" },
  { question: "How did sentiment change?", chart: "Trend over rounds" },
  { question: "How many interviews agree?", chart: "Coverage callout" },
  { question: "What themes come up most?", chart: "Theme ranking" },
  { question: "How often was X mentioned?", chart: "Quote frequency" },
  { question: "When in the session?", chart: "Timeline of moments" },
  { question: "How is the spread?", chart: "Distribution" },
];

export default function DialogueChartGallery() {
  return (
    <div className="dialogue-chart-gallery-wrap">
      <div className="dialogue-chart-map" aria-label="Question type to chart type">
        <div className="dialogue-chart-map__head">
          <span>Question type</span>
          <span>Chart</span>
        </div>
        {QUESTION_CHART_MAP.map((row) => (
          <div key={row.question} className="dialogue-chart-map__row">
            <span>{row.question}</span>
            <span>{row.chart}</span>
          </div>
        ))}
      </div>
      <div className="dialogue-chart-gallery">
        {GALLERY_CARDS.map((item) => (
          <div key={item.label} className="dialogue-chart-gallery__cell">
            <DialogueRachelFrame label={item.label} tone="system">
              <DialogueProductFigure
                scenario={{ gallery: item.variant }}
                title={item.label}
                assetId={item.assetId}
              />
            </DialogueRachelFrame>
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
