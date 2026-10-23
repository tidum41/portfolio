import ClipCard from "@/components/dialogue/product/ClipCard";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import QuerySearchStep from "@/components/dialogue/product/QuerySearchStep";
import SourcesRow from "@/components/dialogue/product/SourcesRow";
import { formatChartPercent } from "@/components/dialogue/product/chart/chartSpec";
import { ADDRESS_FOLLOWUP, CHECKOUT_FUNNEL } from "@/lib/dialogue/product/sampleData";

/** Section-7 drawer: address step follow-up answer + every supporting clip. */
export default function FullAnswerFigure() {
  return (
    <div className="dp-full-answer dialogue-product-root dp-chat-panel-typography">
      <div className="dp-full-answer__cluster" data-export-full-answer-drawer="true">
        <div className="dp-full-answer__answer" data-annotate-part="answer">
          <StudyChatShell evidence={18} compact hideComposer>
            <UserMessageBubble>{ADDRESS_FOLLOWUP.question}</UserMessageBubble>
            <QuerySearchStep searched={24} found={18} />
            <p className="dp-summary" data-annotate-part="summary">{ADDRESS_FOLLOWUP.summary}</p>
            <ChartVizCard title="Checkout, % still in flow">
              <ChartBarList
                rows={CHECKOUT_FUNNEL.steps.map((row) => ({
                  label: row.label,
                  value: row.pct,
                  display: formatChartPercent(row.pct),
                  focal: Boolean(row.focal),
                }))}
                max={100}
                fillMode="index"
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
            <p className="dp-full-answer__drawer-sub">{ADDRESS_FOLLOWUP.drawerSub}</p>
          </div>
          <div className="dp-full-answer__drawer-list">
            {ADDRESS_FOLLOWUP.clips.map((clip) => (
              <ClipCard key={clip.id} clip={clip} />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
