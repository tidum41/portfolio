/* Depth r4, item 6 (dev only). The stacked bar's labels at 2, 3, 4 and 5 segments, at the widths the bar really lives in:
   284 (the stepped strip's column on desktop), 336 (a compare column at 1440), 358 (a 390 phone), 423 (the /dialogue
   trial) and 471 (the stage panel). "Before" re-applies the old one-line legend in CSS so the fix shows side by side.
   Each case runs through the real parts: ChartStackedBar with lanes (the homepage card and chart library path) and
   AnswerCard (which picks bar or rows with answerLayout). Hearthside mock only (MOCK-DATA.md):
   2 = 4c (225 / 75 of 300); 3 = 4h badge preference (118 / 72 / 110 of 300); 4 = 4i where price doubt starts
   (8 / 21 / 47 / 18 of 94); 5 = 4a, 4e and 4g split by subtraction (9 / 5 / 88 / 37 / 161 of 300). */
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import { AnswerCard } from "@/components/dialogue/live/AnswerCard";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import "@/components/dialogue/product/dialogue-product.css";
import "./stack-stress.css";

type G = { label: string; value: number; focal?: boolean };
type Case = { n: number; source: string; title: string; total: number; groups: G[] };
const CASES: Case[] = [
  { n: 2, source: "MOCK-DATA 4c", title: "225 of 300 shoppers read ‘Arrives by Friday’ as this Friday.", total: 300, groups: [{ label: "Read it as this Friday", value: 225, focal: true }, { label: "Unsure", value: 75 }] },
  { n: 3, source: "MOCK-DATA 4h", title: "Which badge most changed confidence to add to cart, of 300.", total: 300, groups: [{ label: "Arrives by Friday", value: 118, focal: true }, { label: "Free delivery over $50", value: 72 }, { label: "Free returns for 30 days", value: 110 }] },
  { n: 4, source: "MOCK-DATA 4i", title: "47 of the 94 shoppers who doubted the price first hit it at cart.", total: 94, groups: [{ label: "Browse", value: 8 }, { label: "Product page", value: 21 }, { label: "Cart", value: 47, focal: true }, { label: "Checkout", value: 18 }] },
  { n: 5, source: "MOCK-DATA 4a, 4e, 4g", title: "How each screener group read ‘Arrives by Friday’, of 300.", total: 300, groups: [{ label: "New shoppers, this Friday", value: 9 }, { label: "New shoppers, other", value: 5 }, { label: "Repeat shoppers, this Friday", value: 88, focal: true }, { label: "Repeat shoppers, other", value: 37 }, { label: "Neither group", value: 161 }] },
];
const WIDTHS = [284, 336, 358, 423, 471] as const;
const fmt = (n: number) => n.toLocaleString("en-US");

function Panel({ w, children, before }: { w: number; children: React.ReactNode; before?: boolean }) {
  return (
    <figure className="dlgx-cell" data-w={w} data-before={before ? "" : undefined}>
      <figcaption className="dlgx-cap">{before ? `Before, ${w}px` : `${w}px`}</figcaption>
      <div className={`dialogue-product-root dp-chat-panel-typography dlg-live dlgx-panel ${dialogueProductFontClassName}`} data-w={w}>
        {children}
      </div>
    </figure>
  );
}

function Stack({ c }: { c: Case }) {
  return (
    <ChartVizCard title={c.title}>
      <ChartStackedBar lanes total={c.total} segments={c.groups.map((g) => ({ label: g.label, value: g.value, display: `${fmt(g.value)} of ${fmt(c.total)}`, focal: g.focal }))} />
    </ChartVizCard>
  );
}

export default function StackStress({ only }: { only?: number }) {
  const cases = only ? CASES.filter((c) => c.n === only) : CASES;
  return (
    <main className="dlgx-page dialogue-product-root" data-theme-scope="light">
      <h1 className="dlgx-title">Stacked bar labels at 2 to 5 segments</h1>
      <p className="dlgx-sub">Real ChartStackedBar and AnswerCard. Before re-applies the old one-line legend. Illustrative Hearthside data.</p>
      {cases.map((c) => (
        <section key={c.n} className="dlgx-case" data-n={c.n}>
          <h2 className="dlgx-h">{c.n} segments <span className="dlgx-src">{c.source}</span></h2>
          <p className="dlgx-part">ChartStackedBar, lanes (homepage card, chart library)</p>
          <div className="dlgx-row">
            <Panel w={336} before><Stack c={c} /></Panel>
            {WIDTHS.map((w) => <Panel key={w} w={w}><Stack c={c} /></Panel>)}
          </div>
          <p className="dlgx-part">AnswerCard (picks bar or rows by answerLayout)</p>
          <div className="dlgx-row">
            {WIDTHS.map((w) => <Panel key={w} w={w}><AnswerCard still answer={{ finding: c.title, total: c.total, groups: c.groups }} /></Panel>)}
          </div>
        </section>
      ))}
    </main>
  );
}
