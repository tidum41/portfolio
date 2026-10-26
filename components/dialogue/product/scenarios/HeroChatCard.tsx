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

/** The outline's hero question for the checkout study. */
export const HERO_QUESTION = "What slowed people down at checkout?";

/** Direction A hero chat card: one question, one answer sentence, one count
    bar, one quote card. The funnel is gone. */
export default function HeroChatCard({ composer = true }: { composer?: boolean }) {
  const [before, after] = CHECKOUT_FUNNEL.summary.split(CHECKOUT_FUNNEL.emphasis);
  return (
    <StudyChatShell compact hideComposer={!composer} evidence={24}>
      <UserMessageBubble>{HERO_QUESTION}</UserMessageBubble>
      <p className="dp-summary dp-text-body" data-annotate-part="summary">
        {before}
        <span className="dp-summary__emph">{CHECKOUT_FUNNEL.emphasis}</span>
        {after}
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
      <ClipCard clip={CLIPS[0]} />
    </StudyChatShell>
  );
}
