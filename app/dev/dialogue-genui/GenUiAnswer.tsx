"use client";

/* Dev only. Renders a validated pick with existing approved components only: ChartVizCard, ChartStackedBar,
   ChartBarList, DenominatorReveal (hover counts, the /dialogue figure), the thin-data flag and the quote rows
   (the same dp-clip-quote markup as ClipQuotes and QuoteListFigure). Numbers come from the dataset, never the model. */
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import { InfoCircleIcon, WaveformIcon } from "@/components/dialogue/product/icons";
import DenominatorReveal, { type DenominatorGroup } from "@/components/dialogue/depth/DenominatorReveal/DenominatorReveal";
import { THIN_FLAG } from "@/lib/dialogue/product/thinCopy";
import type { Dataset, Verdict } from "@/lib/dialogue/genui/catalog";

const thinCopy = (n: number) => (n === 2 ? THIN_FLAG : `Early signal from ${n} ${n === 1 ? "person" : "people"}.`);

function Body({ v }: { v: Extract<Verdict, { ok: true }> }) {
  const { pick } = v;
  const d = v.dataset as Dataset | null;
  if (pick.template === "text" || !d) return <p className="dp-text-body dlg-genui__text">{pick.text ?? "No chart for this one."}</p>;
  const focal = d.groups.some((g) => g.label === pick.focal) ? pick.focal : d.groups[0].label;
  if (pick.template === "split")
    return (
      <ChartVizCard title={d.title}>
        <ChartStackedBar lanes total={d.base} segments={d.groups.map((g) => ({ label: g.label, value: g.value, display: `${g.value} of ${d.base}`, focal: g.label === focal }))} />
      </ChartVizCard>
    );
  if (pick.template === "ranked") {
    const rows = [...d.groups].sort((a, b) => b.value - a.value);
    return (
      <ChartVizCard title={d.title}>
        <div className="dlg-answer--rows">
          <ChartBarList max={rows[0].value} rows={rows.map((g) => ({ label: g.label, value: g.value, display: `${g.value} of ${g.of ?? d.base}`, focal: g.label === focal }))} />
        </div>
      </ChartVizCard>
    );
  }
  if (pick.template === "compare") {
    const [a, b] = d.groups;
    const tone = (g: typeof a): DenominatorGroup["tone"] => (g.label === focal ? "focal" : "mid");
    const groups: [DenominatorGroup, DenominatorGroup] = [
      { label: a.label, count: a.value, of: a.of ?? d.base, tone: tone(a) },
      { label: b.label, count: b.value, of: b.of ?? d.base, tone: tone(b) },
    ];
    return <DenominatorReveal option="hover-counts" title={d.title} groups={groups} />;
  }
  if (pick.template === "flag") {
    const n = d.groups.reduce((s, g) => s + g.value, 0);
    return (
      <ChartVizCard title={d.title}>
        <div className="dp-low-signal">
          <InfoCircleIcon className="dp-low-signal__icon" />
          <p className="dp-low-signal__text">{thinCopy(n)}</p>
        </div>
      </ChartVizCard>
    );
  }
  /* quotes: the focal side first when the model named one. */
  const people = [...(d.people ?? [])].sort((p, q) => Number(q.side === focal) - Number(p.side === focal));
  return (
    <ChartVizCard title={d.title}>
      <div className="dp-clip-quotes">
        {people.map((p) => (
          <div key={p.name} className="dp-clip-quote">
            <p className="dp-clip-quote__who">
              <WaveformIcon className="dp-clip-quote__icon" />
              <span className="dp-clip-quote__name">{p.name}</span>
              <span className="dp-clip-quote__time">{p.time}</span>
            </p>
            <p className="dp-clip-quote__text">{p.quote}</p>
          </div>
        ))}
      </div>
    </ChartVizCard>
  );
}

export default function GenUiAnswer({ question, verdict }: { question: string; verdict: Verdict }) {
  return (
    <div className="dlg-genui__panel">
      <UserMessageBubble>{question}</UserMessageBubble>
      {verdict.ok ? (
        <Body v={verdict} />
      ) : (
        <p className="dp-text-body dlg-genui__text">No chart: the answer did not pass validation, so it falls back to text.</p>
      )}
    </div>
  );
}
