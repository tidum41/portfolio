import type { ReactNode } from "react";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartStackedBar, { type ChartStackSegment } from "@/components/dialogue/product/chart/ChartStackedBar";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import "@/components/dialogue/product/dialogue-product.css";

export const metadata = { title: "Answer card stress test", robots: { index: false } };

type Group = { label: string; value: number; focal?: boolean };
type Case = { id: string; name: string; query: string; finding: string; total: number; groups: Group[] };

/** Hearthside only. Counts are mock; the tiny and huge cases only stretch the same study to stress the layout. */
const CASES: Case[] = [
  { id: "base", name: "Baseline", query: "How do shoppers read \u2018Arrives by Friday\u2019?", finding: "225 of 300 shoppers read \u2018Arrives by Friday\u2019 as this Friday, whatever day they ordered.", total: 300, groups: [{ label: "Read it as this Friday", value: 225, focal: true }, { label: "Unsure", value: 75 }] },
  { id: "long-query", name: "Very long query", query: "Across everyone we interviewed about the delivery date shown at checkout, including repeat shoppers, first orders and people who ordered on a weekend, how do they read \u2018Arrives by Friday\u2019 and does it change what they expect?", finding: "225 of 300 shoppers read \u2018Arrives by Friday\u2019 as this Friday, whatever day they ordered.", total: 300, groups: [{ label: "Read it as this Friday", value: 225, focal: true }, { label: "Unsure", value: 75 }] },
  { id: "long-sentence", name: "Long answer sentence", query: "How do shoppers read \u2018Arrives by Friday\u2019?", finding: "225 of 300 shoppers read \u2018Arrives by Friday\u2019 as this Friday, whatever day they ordered, and most of them said the date on the order page was the one they planned around, even when the order was placed late in the week and the next Friday was closer than they expected.", total: 300, groups: [{ label: "Read it as this Friday", value: 225, focal: true }, { label: "Unsure", value: 75 }] },
  { id: "tiny", name: "Tiny count", query: "Did anyone miss a delivery over \u2018Arrives by Friday\u2019?", finding: "2 of 300 shoppers said they missed a delivery after reading it as this Friday.", total: 300, groups: [{ label: "Missed a delivery", value: 2, focal: true }, { label: "Did not", value: 298 }] },
  { id: "huge", name: "Huge counts", query: "How do shoppers read \u2018Arrives by Friday\u2019?", finding: "12,480 of 48,200 shoppers read \u2018Arrives by Friday\u2019 as this Friday, whatever day they ordered.", total: 48200, groups: [{ label: "Read it as this Friday", value: 12480, focal: true }, { label: "Unsure", value: 35720 }] },
  { id: "long-labels", name: "Long group labels", query: "How do shoppers read \u2018Arrives by Friday\u2019?", finding: "225 of 300 shoppers read \u2018Arrives by Friday\u2019 as this Friday, whatever day they ordered.", total: 300, groups: [{ label: "Read it as the Friday of the week they ordered, whichever day that was", value: 225, focal: true }, { label: "Unsure which Friday it meant or whether it meant a weekday at all", value: 75 }] },
  { id: "groups", name: "Four groups", query: "Which Friday do shoppers expect?", finding: "140 of 300 shoppers expect this Friday, and 160 expect something else or are unsure.", total: 300, groups: [{ label: "This Friday", value: 140, focal: true }, { label: "Next Friday", value: 60 }, { label: "Unsure", value: 75 }, { label: "Other", value: 25 }] },
];

const fmt = (n: number) => n.toLocaleString("en-US");
const segs = (c: Case): ChartStackSegment[] => c.groups.map((g) => ({ label: g.label, value: g.value, display: `${fmt(g.value)} of ${fmt(c.total)}`, focal: g.focal }));
/** The rule behind option B: two short groups keep the bar; three or more groups, or a long label, switch to rows. */
const crowded = (c: Case) => c.groups.length > 2 || c.groups.some((g) => g.label.length > 28);

function Panel({ children, width }: { children: ReactNode; width: number }) {
  return (
    <div className={["dp-study-chat dlg-live dlg-live--bare dlg-stress__panel", dialogueProductFontClassName].join(" ")} style={{ width }}>
      <div className="dlg-stage__body dlg-stress__body">{children}</div>
    </div>
  );
}

/** Current layout: the stacked bar with its legend lanes in one row. */
function Current({ c }: { c: Case }) {
  return (
    <>
      <UserMessageBubble>{c.query}</UserMessageBubble>
      <ChartVizCard title={c.finding}><ChartStackedBar lanes total={c.total} segments={segs(c)} /></ChartVizCard>
    </>
  );
}
/** A. Patch: the bar stays; lanes stack in a column when crowded, labels wrap, and a segment never draws under 8px. */
function OptionA({ c }: { c: Case }) {
  return (
    <>
      <UserMessageBubble>{c.query}</UserMessageBubble>
      <ChartVizCard title={c.finding} className="dlg-stress--fit">
        <div data-crowded={crowded(c) ? "" : undefined}><ChartStackedBar lanes total={c.total} segments={segs(c)} /></div>
      </ChartVizCard>
    </>
  );
}
/** B. Switch: two short groups keep the bar; a crowded query returns one row per group. */
function OptionB({ c }: { c: Case }) {
  if (!crowded(c)) return <OptionA c={c} />;
  return (
    <>
      <UserMessageBubble>{c.query}</UserMessageBubble>
      <ChartVizCard title={c.finding} className="dlg-stress--rows">
        <ChartBarList max={c.total} rows={c.groups.map((g) => ({ label: g.label, value: g.value, display: `${fmt(g.value)} of ${fmt(c.total)}`, focal: g.focal }))} />
      </ChartVizCard>
    </>
  );
}
/** C. Replace: one layout for every query, a row per group scaled to the whole. */
function OptionC({ c }: { c: Case }) {
  return (
    <>
      <UserMessageBubble>{c.query}</UserMessageBubble>
      <ChartVizCard title={c.finding} className="dlg-stress--rows">
        <ChartBarList max={c.total} rows={c.groups.map((g) => ({ label: g.label, value: g.value, display: `${fmt(g.value)} of ${fmt(c.total)}`, focal: g.focal }))} />
      </ChartVizCard>
    </>
  );
}

const OPTIONS = [
  { key: "current", name: "Current", Comp: Current },
  { key: "a", name: "A. Patch the bar", Comp: OptionA },
  { key: "b", name: "B. Bar, or rows when it crowds", Comp: OptionB },
  { key: "c", name: "C. Rows every time", Comp: OptionC },
] as const;

export default async function Page({ searchParams }: { searchParams: Promise<{ w?: string; only?: string }> }) {
  const { w, only } = await searchParams;
  const width = w === "phone" ? 320 : 471;
  const cases = only ? CASES.filter((c) => only.split(",").includes(c.id)) : CASES;
  return (
    <main className="dialogue-product-root dp-chat-panel-typography dlg-stress">
      {cases.map((c) => (
        <section key={c.id} id={`case-${c.id}`} className="dlg-stress__case">
          <h2 className="dlg-stress__name">{c.name}</h2>
          <div className="dlg-stress__row">
            {OPTIONS.map(({ key, name, Comp }) => (
              <div key={key} className="dlg-stress__col">
                <p className="dlg-stress__tag">{name}</p>
                <Panel width={width}><Comp c={c} /></Panel>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
