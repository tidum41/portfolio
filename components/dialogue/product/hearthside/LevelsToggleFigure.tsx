import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import QuoteCardH from "@/components/dialogue/product/hearthside/QuoteCardH";
import { FRIDAY_FINDING, FRIDAY_QUESTION, FRIDAY_QUOTES, HEARTHSIDE_STUDY_SUBTITLE } from "@/lib/dialogue/product/hearthside";

const STEPS = ["Text only", "Direct quotes", "Answer and evidence"] as const;

/** Levels of detail as one 448 panel: a three-step toggle over the depths,
    shown at the deepest step. The panel is the same height whichever step
    a reader stops at, the 6 segment is ringed (Mei's side), and nothing
    scrolls sideways at any width. */
export default function LevelsToggleFigure() {
  return (
    <StudyChatShell subtitle={HEARTHSIDE_STUDY_SUBTITLE} hideComposer>
      <UserMessageBubble>{FRIDAY_QUESTION}</UserMessageBubble>
      <div className="dp-hs-toggle" role="group" aria-label="Answer depth" data-annotate-part="levels-toggle">
        {STEPS.map((step) => (
          <span
            key={step}
            className="dp-hs-toggle__item"
            data-active={step === "Answer and evidence" ? "true" : undefined}
            aria-pressed={step === "Answer and evidence"}
          >
            {step}
          </span>
        ))}
      </div>
      <ChartVizCard title={FRIDAY_FINDING}>
        <ChartStackedBar
          total={24}
          segments={[
            { label: "Read it as this Friday", value: 18, display: "18 of 24", focal: true },
            { label: "Did not", value: 6, display: "6 of 24", selected: true },
          ]}
        />
      </ChartVizCard>
      <div className="dp-compare-rows__media">
        <QuoteCardH quote={FRIDAY_QUOTES[0]} selected part="levels-quote-mei" />
        <div className="dp-hs-thumb dp-hs-thumb--small" data-annotate-part="levels-clip">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/dev/dialogue-static/clip-photos/clip-01.jpg" alt="" className="dp-hs-thumb__img" />
          <span className="dp-hs-thumb__time">18:27</span>
        </div>
      </div>
    </StudyChatShell>
  );
}
