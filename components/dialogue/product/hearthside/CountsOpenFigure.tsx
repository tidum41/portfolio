import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import QuoteCardH from "@/components/dialogue/product/hearthside/QuoteCardH";
import {
  FRIDAY_FINDING,
  FRIDAY_QUESTION,
  FRIDAY_QUOTE_18,
  FRIDAY_QUOTES,
  HEARTHSIDE_STUDY_SUBTITLE,
} from "@/lib/dialogue/product/hearthside";

/** Counts with both sides open: the bar (the 6 of 24 segment outlined,
    its side shown open), then each segment's quote under its count label.
    Owen checked the date, so his card sits on the 6 side. */
export default function CountsOpenFigure() {
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
      <p className="dp-hs-group-label" data-annotate-part="counts-group-18">18 of 24</p>
      <QuoteCardH quote={FRIDAY_QUOTE_18} />
      <p className="dp-hs-group-label" data-annotate-part="counts-group-6">6 of 24 did not</p>
      <QuoteCardH quote={FRIDAY_QUOTES[1]} />
    </StudyChatShell>
  );
}
