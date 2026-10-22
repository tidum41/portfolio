"use client";

import StaticFigure from "@/components/dialogue/StaticFigure";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import CoverageCallout from "@/components/dialogue/product/CoverageCallout";
import { formatChartCount } from "@/components/dialogue/product/chart/chartSpec";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";

const QUESTION = "Why do people hesitate at payment?";

function Card({ figure, children }: { figure: string; children: React.ReactNode }) {
  return (
    <StaticFigure
      figure={figure}
      className={`dialogue-cov__card dialogue-product-root dp-chat-panel-typography ${dialogueProductFontClassName}`}
    >
      <p className="dialogue-cov__question" data-annotate-part="question">{QUESTION}</p>
      {children}
    </StaticFigure>
  );
}

function Sources() {
  return (
    <div className="dp-sources" data-annotate-part="sources-row">
      <span className="dp-source-pill" data-annotate-part="source-pill-marcus-w">Marcus W., 21:08</span>
      <span className="dp-source-pill" data-annotate-part="source-pill-hannah-l">Hannah L., 22:41</span>
    </div>
  );
}

/** Same question, same 2 matching interviews: confident chart versus a coverage note. */
export default function DialogueCoverageCompare() {
  return (
    <div className="dialogue-cov">
      <p className="dialogue-cov__verdict">Two people said it. The good one tells you that.</p>
      <div className="dialogue-cov__pair">
        <figure className="dialogue-lib__specimen dialogue-cov__specimen" data-status="ruled-out">
          <span className="dialogue-lib__tag">Ruled out</span>
          <Card figure="coverage-ruled-out">
            <p className="dp-summary dp-text-body" data-annotate-part="summary">
              Payment retry is <span className="dp-summary__emph">the top reason people hesitate</span>.
            </p>
            <ChartVizCard title="Themes by interview count">
              <ChartBarList
                rows={[
                  { label: "Payment retry", value: 2, display: formatChartCount(2), focal: true },
                  { label: "Address", value: 1, display: formatChartCount(1) },
                ]}
                max={2}
                fillMode="index"
              />
            </ChartVizCard>
            <Sources />
          </Card>
        </figure>
        <figure className="dialogue-lib__specimen dialogue-cov__specimen" data-status="chosen">
          <span className="dialogue-lib__tag">Chosen</span>
          <Card figure="coverage-chosen">
            <CoverageCallout headline="2 of 24 interviews" detail="Only a few interviews match." />
            <p className="dp-summary dp-text-body" data-annotate-part="summary">
              Two interviews mention payment retry. Treat it as a lead, not a trend.
            </p>
            <Sources />
          </Card>
        </figure>
      </div>
    </div>
  );
}
