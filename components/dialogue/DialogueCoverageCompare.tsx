"use client";

import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import CoverageCallout from "@/components/dialogue/product/CoverageCallout";
import { formatChartCount } from "@/components/dialogue/product/chart/chartSpec";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";

const QUESTION = "Why do people hesitate at payment?";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`dialogue-cov__card dialogue-product-root dp-chat-panel-typography ${dialogueProductFontClassName}`}
      aria-hidden
    >
      <p className="dialogue-cov__question">{QUESTION}</p>
      {children}
    </div>
  );
}

function Sources() {
  return (
    <div className="dp-sources">
      <span className="dp-source-pill">Jordan M., 21:08</span>
      <span className="dp-source-pill">Marcus W., 22:41</span>
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
          <Card>
            <p className="dp-summary dp-text-body">
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
          <Card>
            <CoverageCallout headline="2 of 24 interviews" detail="Only a few interviews match." />
            <p className="dp-summary dp-text-body">
              Two interviews mention payment retry. Treat it as a lead, not a trend.
            </p>
            <Sources />
          </Card>
        </figure>
      </div>
      <div className="dialogue-lib__tech">
        <p>
          <span>Why it matters:</span> a finding from 2 interviews must not reach a roadmap as a trend.
        </p>
      </div>
    </div>
  );
}
