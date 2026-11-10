"use client";

import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import { Grow } from "@/components/dialogue/live/Grow";
import { answerLayout, type AnswerGroup } from "@/lib/dialogue/product/answerLayout";

const FINDING = "225 of 300 shoppers read \u2018Arrives by Friday\u2019 as this Friday, whatever day they ordered.";

export type SideWhich = "friday" | "unsure" | false;
export type AnswerData = { finding: string; total: number; groups: AnswerGroup[] };
const HEARTHSIDE_ANSWER: AnswerData = {
  finding: FINDING,
  total: 300,
  groups: [{ label: "Read it as this Friday", value: 225, focal: true }, { label: "Unsure", value: 75 }],
};
const share = (n: number) => n.toLocaleString("en-US");

/* Round 17: the template is picked per answer (lib/dialogue/product/answerLayout.ts). Two short groups keep the tappable bar;
   three or more groups, or a label too long for the lane, return one named row per group. */
export function AnswerCard({ segment = false, onSide, sideOpen = false, chart = true, answer = HEARTHSIDE_ANSWER, still = false }: { segment?: boolean; onSide?: (w: "friday" | "unsure") => void; sideOpen?: SideWhich; chart?: boolean; answer?: AnswerData; still?: boolean }) {
  const { finding, total, groups } = answer;
  const rows = answerLayout(groups) === "rows";
  const lead = Math.round((groups[0].value / total) * 10000) / 100;
  const bar = rows ? (
    <div className="dlg-answer--rows" data-layout="rows">
      <ChartBarList max={total} rows={groups.map((g) => ({ label: g.label, value: g.value, display: `${share(g.value)} of ${share(total)}`, pct: `${Math.round((g.value / total) * 100)}%`, focal: g.focal }))} />
    </div>
  ) : (
      <div className="dlg-live__bar" data-layout="bar" data-side={sideOpen || undefined}>
        <ChartStackedBar lanes
          total={total}
          segments={groups.map((g) => ({ label: g.label, value: g.value, display: `${share(g.value)} of ${share(total)}`, focal: g.focal }))}
        />
        {/* P14 items 1+7: both segments tappable; focal segment carries data-target for the recorder. */}
        <button type="button" className="dlg-live__side dlg-live__side--friday" style={{ width: `calc(${lead}% + 12px)` }} data-target="side-friday" aria-label={`Open ${groups[0].label}, ${share(groups[0].value)} of ${share(total)}`} aria-expanded={sideOpen === "friday"} onClick={() => onSide?.("friday")} />
        <button type="button" className="dlg-live__side dlg-live__side--unsure" style={{ width: `calc(${100 - lead}% + 12px)` }} data-target="side" aria-label={`Open ${groups[1].label}, ${share(groups[1].value)} of ${share(total)}`} aria-expanded={sideOpen === "unsure"} onClick={() => onSide?.("unsure")} />
      </div>
  );
  return (
    <ChartVizCard title={finding}>
      {still ? bar : <Grow open={chart} className="dlg-grow--gap">{bar}</Grow>}
      {segment ? (
        <p className="dlg-segment">
          Repeat shoppers: <span className="dp-summary__emph">88 of 125</span> read it as this Friday
        </p>
      ) : null}
    </ChartVizCard>
  );
}
