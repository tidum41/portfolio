import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import { DialogueInterviewPlayer } from "@/components/dialogue/DialogueInterviewPlayer";
import QuoteCardH from "@/components/dialogue/product/hearthside/QuoteCardH";
import {
  FRIDAY_FINDING,
  FRIDAY_QUESTION,
  FRIDAY_QUOTES,
  HEARTHSIDE_STUDY_SUBTITLE,
} from "@/lib/dialogue/product/hearthside";

/** The hero answer, layered: question bubble, the answer sentence as the
    chart title, the 18 of 24 stacked bar, and Mei's quote card tapped open
    into the player clip beneath it. */
export default function HeroLayeredFigure() {
  return (
    <StudyChatShell subtitle={HEARTHSIDE_STUDY_SUBTITLE}>
      <UserMessageBubble>{FRIDAY_QUESTION}</UserMessageBubble>
      <ChartVizCard title={FRIDAY_FINDING}>
        <ChartStackedBar
          total={24}
          segments={[
            { label: "Read it as this Friday", value: 18, display: "18 of 24", focal: true },
            { label: "Did not", value: 6, display: "6 of 24" },
          ]}
        />
      </ChartVizCard>
      <QuoteCardH quote={FRIDAY_QUOTES[0]} selected part="hero-quote-mei" />
      <DialogueInterviewPlayer />
    </StudyChatShell>
  );
}
