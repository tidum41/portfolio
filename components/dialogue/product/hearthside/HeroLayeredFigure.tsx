import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import QuoteCardH from "@/components/dialogue/product/hearthside/QuoteCardH";
import { FRIDAY_FINDING, FRIDAY_QUESTION, FRIDAY_QUOTES, HEARTHSIDE_STUDY_SUBTITLE } from "@/lib/dialogue/product/hearthside";

/** The hero: one answer up front. Question, the sentence as the chart
    title, the 18 of 24 bar with the 6 segment ringed (Mei's side), and
    Mei's quote card with its clip collapsed to a thumbnail. No composer,
    no player; the clips section carries the playing moment. */
export default function HeroLayeredFigure() {
  return (
    <StudyChatShell subtitle={HEARTHSIDE_STUDY_SUBTITLE} hideComposer>
      <UserMessageBubble>{FRIDAY_QUESTION}</UserMessageBubble>
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
        <QuoteCardH quote={FRIDAY_QUOTES[0]} selected part="hero-quote-mei" />
        <div className="dp-hs-thumb dp-hs-thumb--small" data-annotate-part="hero-clip">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/dev/dialogue-static/clip-photos/clip-01.jpg" alt="" className="dp-hs-thumb__img" />
          <span className="dp-hs-thumb__time">18:27</span>
        </div>
      </div>
    </StudyChatShell>
  );
}
