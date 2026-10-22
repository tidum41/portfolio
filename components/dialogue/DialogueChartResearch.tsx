"use client";

import ChartOnlyFigure from "@/components/dialogue/product/scenarios/ChartOnlyFigure";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import {
  CHART_RESEARCH_GRID,
  RESEARCH_INSIGHT,
} from "@/lib/dialogue/chartResearchCatalog";

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
          <article key={item.id} className="dialogue-chart-research__card">
            <div
              className={`dialogue-chart-research__thumb dialogue-product-root dp-chat-panel-typography ${dialogueProductFontClassName}`}
            >
              {item.variant ? <ChartOnlyFigure variant={item.variant} /> : null}
            </div>
            <div className="dialogue-chart-research__copy">
              <p className="dialogue-chart-research__question">{item.question}</p>
              <p className="dialogue-chart-research__chart">{item.chart}</p>
              {item.reason ? (
                <p className="dialogue-chart-research__reason">{item.reason}</p>
              ) : null}
            </div>
          </article>
        ))}
        {ruledOut.map((item) => (
          <article
            key={item.id}
            className="dialogue-chart-research__card dialogue-chart-research__card--ruled"
          >
            <div
              className={`dialogue-chart-research__thumb dialogue-chart-research__thumb--muted dialogue-product-root dp-chat-panel-typography ${dialogueProductFontClassName}`}
            >
              {item.variant ? <ChartOnlyFigure variant={item.variant} /> : null}
              <span className="dialogue-chart-research__ruled-tag">Ruled out</span>
            </div>
            <div className="dialogue-chart-research__copy">
              <p className="dialogue-chart-research__question">{item.question}</p>
              <p className="dialogue-chart-research__chart">{item.chart}</p>
              {item.reason ? (
                <p className="dialogue-chart-research__reason">{item.reason}</p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
      <div className="dialogue-chart-research__iterations">
        <p className="dialogue-chart-research__iterations-title">Alternatives we tried</p>
        <ul className="dialogue-chart-research__iterations-list">
          {chosen.map((item) => (
            <li key={item.id}>
              <span className="dialogue-chart-research__iterations-chart">{item.chart}</span>
              <span className="dialogue-chart-research__iterations-note">{item.iteration}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
