import type { ReactNode } from "react";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import { InfoCircleIcon } from "@/components/dialogue/product/icons";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import "@/components/dialogue/product/dialogue-product.css";

export const metadata = { title: "Data viz section: simpler options", robots: { index: false } };

const ASKS = [
  { label: "Show an exact calendar date", value: 41 },
  { label: "Say which Friday it means", value: 28 },
  { label: "Warn when Friday slips", value: 17 },
  { label: "Offer a pickup option", value: 11 },
  { label: "Email the day before", value: 8 },
];

function Panel({ children }: { children: ReactNode }) {
  return <div className={`dialogue-product-root dp-chat-panel-typography dlg-templates__panel dlg-mini ${dialogueProductFontClassName}`}>{children}</div>;
}
const SplitCard = () => (
  <Panel>
    <ChartVizCard title="225 of 300 shoppers read ‘Arrives by Friday’ as this Friday.">
      <ChartStackedBar lanes total={300} segments={[{ label: "Read it as this Friday", value: 225, display: "225 of 300", focal: true }, { label: "Unsure", value: 75, display: "75 of 300" }]} />
    </ChartVizCard>
  </Panel>
);
const RankedCard = () => (
  <Panel>
    <ChartVizCard title="What shoppers asked for after checkout, top five">
      <ChartBarList max={ASKS[0].value} rows={ASKS.map((r, i) => ({ label: r.label, value: r.value, display: `${r.value} of 300`, focal: i === 0 }))} />
    </ChartVizCard>
  </Panel>
);
const ThinCard = () => (
  <Panel>
    <ChartVizCard title="Two of 300 shoppers said they missed a delivery.">
      <div className="dp-low-signal">
        <InfoCircleIcon className="dp-low-signal__icon" />
        <p className="dp-low-signal__text">Early signal, 2 people. A chart needs 3 or more.</p>
      </div>
    </ChartVizCard>
  </Panel>
);

function Row({ ask, name, card, line }: { ask: string; name: string; card: ReactNode; line: string }) {
  return (
    <div className="dlg-match" role="listitem">
      <div className="dlg-match__why">
        <p className="dlg-match__ask">{ask}</p>
        <p className="dlg-match__name"><ArrowRight size={14} weight="bold" aria-hidden />{name}</p>
      </div>
      <div className="dlg-match__chart">
        {card}
        <p className="dlg-edge__then">{line}</p>
      </div>
    </div>
  );
}

/** Option 1: three rows, each one question and the chart it gets, one line under each chart. */
function OptionOne() {
  return (
    <div className="dialogue-rachel-frame dialogue-rachel-frame--solution dlg-templates dlg-templates--pairs">
      <p className="dlg-flow">The shape of the question picks the chart. Fewer than 3 people gets a flag instead.</p>
      <div className="dlg-matches" role="list">
        <Row ask="How many read it which way?" name="Split" card={<SplitCard />} line="Each side shows its count out of 300." />
        <Row ask="What did people ask for?" name="Ranked" card={<RankedCard />} line="Longest bar first, each count out of 300." />
        <Row ask="Did anyone miss a delivery?" name="Flag" card={<ThinCard />} line="Two people is too few for a chart, so it says so." />
      </div>
    </div>
  );
}

/** Option 2: one worked mapping, then the other templates as one text line each. */
function OptionTwo() {
  return (
    <div className="dialogue-rachel-frame dialogue-rachel-frame--solution dlg-templates dlg-templates--pairs">
      <p className="dlg-flow">The shape of the question picks the chart. Here is one.</p>
      <div className="dlg-matches" role="list">
        <Row ask="How many read it which way?" name="Split" card={<SplitCard />} line="Each side shows its count out of 300." />
      </div>
      <ul className="dlg-index">
        <li><span>What did people ask for?</span><span>Ranked bars</span></li>
        <li><span>How do groups compare?</span><span>By group bars</span></li>
        <li><span>How sure were they, 1 to 5?</span><span>Median dots</span></li>
        <li><span>Fewer than 3 people?</span><span>A flag, no chart</span></li>
      </ul>
    </div>
  );
}

export default function Page() {
  return (
    <main className="dialogue-case-study dlg-viz-options">
      <section id="option-1"><p className="dlg-viz-options__tag">Option 1. Three rows, three charts</p><OptionOne /></section>
      <section id="option-2"><p className="dlg-viz-options__tag">Option 2. One worked example, then an index</p><OptionTwo /></section>
    </main>
  );
}
