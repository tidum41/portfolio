import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ClipCard from "@/components/dialogue/product/ClipCard";
import {
  CHECKOUT_FUNNEL,
  CLIPS,
  COVERAGE_ADDRESS,
} from "@/lib/dialogue/product/sampleData";
import { HERO_QUESTION } from "@/components/dialogue/product/scenarios/HeroChatCard";

/** Direction A, section 4: the same question in the per-interview chat,
    which can only quote the one interview it sits on, and in the study
    chat, which counts across all 24 interviews. */
export default function ScopeFigure() {
  return (
    <div className="dp-scope">
      <div className="dp-scope__panel">
        <p className="dp-scope__label">Per-interview chat</p>
        <StudyChatShell compact hideComposer>
          <UserMessageBubble>{HERO_QUESTION}</UserMessageBubble>
          <ClipCard clip={CLIPS[0]} />
        </StudyChatShell>
      </div>
      <div className="dp-scope__panel">
        <p className="dp-scope__label">Study chat, all 24 interviews</p>
        <StudyChatShell compact hideComposer evidence={24}>
          <UserMessageBubble>{HERO_QUESTION}</UserMessageBubble>
          <p className="dp-summary dp-text-body" data-annotate-part="summary">
            {CHECKOUT_FUNNEL.summary.split(CHECKOUT_FUNNEL.emphasis)[0]}
            <span className="dp-summary__emph">{CHECKOUT_FUNNEL.emphasis}</span>
            {CHECKOUT_FUNNEL.summary.split(CHECKOUT_FUNNEL.emphasis)[1] ?? ""}
          </p>
          <ChartVizCard title={COVERAGE_ADDRESS.headline}>
            <ChartBarList
              className="dp-chart-bars--count"
              rows={[
                {
                  label: "Address friction",
                  value: 18,
                  display: "18 of 24 interviews",
                  focal: true,
                },
              ]}
              max={24}
              fillMode="magnitude"
            />
          </ChartVizCard>
        </StudyChatShell>
      </div>
    </div>
  );
}
