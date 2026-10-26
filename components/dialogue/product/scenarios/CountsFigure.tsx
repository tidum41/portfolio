import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import CounterEvidence from "@/components/dialogue/product/CounterEvidence";
import {
  ADDRESS_FOLLOWUP,
  QUOTE_LIST,
} from "@/lib/dialogue/product/sampleData";

/** Direction A, section 5: one count bar for address friction, counts in
    front of percents, with the quotes behind each side kept open under it.
    The 18 side shows the study's quotes; the 6 side is the study's own
    counter-evidence block. */
export default function CountsFigure() {
  return (
    <ChartVizCard title={ADDRESS_FOLLOWUP.summary}>
      <ChartStackedBar
        total={24}
        segments={[
          { label: "Raised it", value: 18, display: "18 of 24", focal: true },
          { label: "Did not", value: 6, display: "6 of 24" },
        ]}
      />
      <div className="dp-evidence">
        <p className="dp-evidence__label">Quotes behind 18 of 24</p>
        {QUOTE_LIST.map((q) => (
          <p key={q.participant} className="dp-evidence__quote">
            <span className="dp-evidence__name">{q.participant}</span>
            {q.quote}
          </p>
        ))}
      </div>
      <CounterEvidence />
    </ChartVizCard>
  );
}
