"use client";

import DialogueProductFigure from "@/components/dialogue/DialogueProductFigure";
import {
  CHART_RESEARCH_GRID,
  RESEARCH_INSIGHT,
} from "@/lib/dialogue/chartResearchCatalog";
import type { GalleryVariant } from "@/components/dialogue/product/scenarios/ChartGalleryFigure";

const THUMB_VARIANTS = new Set<GalleryVariant>([
  "funnel",
  "segment",
  "trend",
  "coverage",
]);

export default function DialogueChartResearch() {
  const chosen = CHART_RESEARCH_GRID.filter((i) => i.status === "chosen");
  const ruledOut = CHART_RESEARCH_GRID.filter((i) => i.status === "ruled-out");

  return (
    <div className="dialogue-chart-research">
      <p className="dialogue-caption dialogue-caption--block">
        <span className="dialogue-caption__label">What teams already use</span>
        <span className="dialogue-caption__sentence">{RESEARCH_INSIGHT}</span>
      </p>
      <div className="dialogue-chart-research__grid">
        {chosen.map((item) => (
          <div key={item.id} className="dialogue-chart-research__card dialogue-chart-research__card--chosen">
            <div className="dialogue-chart-research__thumb">
              {item.variant && THUMB_VARIANTS.has(item.variant) ? (
                <DialogueProductFigure
                  scenario={{ gallery: item.variant }}
                  title={item.chart}
                />
              ) : null}
            </div>
            <div className="dialogue-chart-research__copy">
              <p className="dialogue-chart-research__question">{item.question}</p>
              <p className="dialogue-chart-research__chart">{item.chart}</p>
              {item.reason ? (
                <p className="dialogue-chart-research__reason">{item.reason}</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      <div className="dialogue-chart-research__ruled">
        <p className="dialogue-chart-research__ruled-title">Ruled out for v1</p>
        <ul className="dialogue-chart-research__ruled-list">
          {ruledOut.map((item) => (
            <li key={item.id}>
              <span className="dialogue-chart-research__ruled-chart">{item.chart}</span>
              <span className="dialogue-chart-research__ruled-reason">{item.reason}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
