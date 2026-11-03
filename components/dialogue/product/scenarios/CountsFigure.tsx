import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import QuoteCard from "@/components/dialogue/product/QuoteCard";
import { ADDRESS_FOLLOWUP } from "@/lib/dialogue/product/sampleData";
import { HERO_QUESTION } from "@/components/dialogue/product/scenarios/HeroChatCard";

/** The counter-evidence quotes, as restored in the study's own block. */
const DID_NOT_QUOTES = [
  { name: "Elena R.", time: "08:12", text: "The address form just took it, no errors…" },
  { name: "Avery C.", time: "25:02", text: "Autocomplete filled my address in right…" },
  { name: "Alex P.", time: "18:22", text: "My address was already saved, so I skipped…" },
] as const;

/** Round O counts: the page's one bar. The 6 of 24 segment is outlined, and
    its real grey quote cards sit underneath the bar. */
export default function CountsFigure() {
  return (
    <StudyChatShell hideComposer>
      <UserMessageBubble>{HERO_QUESTION}</UserMessageBubble>
      <ChartVizCard title={ADDRESS_FOLLOWUP.summary}>
        <ChartStackedBar
          total={24}
          segments={[
            { label: "Raised it", value: 18, display: "18 of 24", focal: true },
            { label: "Did not", value: 6, display: "6 of 24", selected: true },
          ]}
        />
      </ChartVizCard>
      <p className="dp-counts__group-label" data-annotate-part="counts-group-label">
        6 of 24 did not
      </p>
      <div className="dp-clip-quotes" data-annotate-part="counts-quotes">
        {DID_NOT_QUOTES.map((q) => (
          <QuoteCard key={q.name} name={q.name} time={q.time} text={q.text} />
        ))}
      </div>
    </StudyChatShell>
  );
}
