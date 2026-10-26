import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import QuoteCardH from "@/components/dialogue/product/hearthside/QuoteCardH";
import {
  FRIDAY_FINDING,
  FRIDAY_QUESTION,
  FRIDAY_QUOTES,
  HEARTHSIDE_STUDY_SUBTITLE,
} from "@/lib/dialogue/product/hearthside";

/** Counts with both sides open: the bar (the 6 of 24 segment outlined), then
    each segment's evidence under its own count label. */
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
      <div className="dp-clip-quotes">
        {FRIDAY_QUOTES.map((q) => (
          <QuoteCardH key={q.name} quote={q} />
        ))}
      </div>
      <p className="dp-hs-group-label" data-annotate-part="counts-group-6">6 of 24 did not</p>
      <p className="dp-hs-restate" data-annotate-part="counts-restate">
        Did not read it as this Friday.
      </p>
    </StudyChatShell>
  );
}
