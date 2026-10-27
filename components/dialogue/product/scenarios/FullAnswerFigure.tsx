import ClipCard from "@/components/dialogue/product/ClipCard";
import ChartDotPlot from "@/components/dialogue/product/chart/ChartDotPlot";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import QuerySearchStep from "@/components/dialogue/product/QuerySearchStep";
import SourcesRow from "@/components/dialogue/product/SourcesRow";
import { formatChartPercent } from "@/components/dialogue/product/chart/chartSpec";
import { MOBILE_FOLLOWUP } from "@/lib/dialogue/product/sampleData";

const MOBILE_STEPS = [
  { label: "Cart", pct: 100 },
  { label: "Address", pct: 48, focal: true },
  { label: "Delivery", pct: 41 },
  { label: "Payment", pct: 33 },
] as const;

/** Section-7 drawer: follow-up filtered answer + every supporting clip (not the hero funnel). */
export default function FullAnswerFigure() {
  return (
    <div className="dp-full-answer dialogue-product-root dp-chat-panel-typography">
      <div className="dp-full-answer__cluster" data-export-full-answer-drawer="true">
        <div className="dp-full-answer__answer" data-annotate-part="answer">
          <StudyChatShell evidence={24} compact hideComposer>
            <UserMessageBubble>{MOBILE_FOLLOWUP.question}</UserMessageBubble>
            <QuerySearchStep searched={24} found={6} />
            <p className="dp-summary" data-annotate-part="summary">{MOBILE_FOLLOWUP.summary}</p>
            <ChartVizCard title="Mobile checkout, % still in flow">
              <ChartDotPlot
                rows={MOBILE_STEPS.map((row) => ({
                  label: row.label,
                  value: row.pct,
                  display: formatChartPercent(row.pct),
                  focal: "focal" in row && row.focal,
                }))}
                max={100}
              />
            </ChartVizCard>
            <SourcesRow selectedParticipant="Jordan M." selectedTime="14:03" />
          </StudyChatShell>
        </div>
        <aside
          className="dp-full-answer__drawer"
          data-annotate-part="clips-drawer"
          aria-label="Clips from this answer"
          data-export-hero-clips-panel="true"
        >
          <div className="dp-full-answer__drawer-head">
            <p className="dp-full-answer__drawer-title" data-annotate-part="clips-drawer-title">Clips from this answer</p>
            <p className="dp-full-answer__drawer-sub">{MOBILE_FOLLOWUP.drawerSub}</p>
          </div>
          <div className="dp-full-answer__drawer-list">
            {MOBILE_FOLLOWUP.clips.map((clip) => (
              <ClipCard key={clip.id} clip={clip} />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
