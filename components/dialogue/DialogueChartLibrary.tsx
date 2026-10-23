"use client";

import type { ReactNode } from "react";
import StaticFigure from "@/components/dialogue/StaticFigure";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartDotPlot from "@/components/dialogue/product/chart/ChartDotPlot";
import ChartLinePlot from "@/components/dialogue/product/chart/ChartLinePlot";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import {
  formatChartDecimal,
  formatChartPercent,
} from "@/components/dialogue/product/chart/chartSpec";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import {
  CHECKOUT_FUNNEL,
  COVERAGE_ADDRESS,
  SEGMENT_ADDRESS,
  SENTIMENT_LINE,
} from "@/lib/dialogue/product/sampleData";

const STEPS = CHECKOUT_FUNNEL.steps.slice(0, 4);
const GROUPS = SEGMENT_ADDRESS.rows;
const ROUNDS = SENTIMENT_LINE.points;

function Specimen({
  entryId,
  status,
  children,
}: {
  entryId: string;
  status: "ruled-out" | "chosen";
  children: ReactNode;
}) {
  return (
    <figure className="dialogue-lib__specimen" data-status={status}>
      <span className="dialogue-lib__tag">{status === "chosen" ? "Chosen" : "Ruled out"}</span>
      <StaticFigure
        figure={`chart-${entryId}-${status}`}
        className={`dialogue-lib__chart dialogue-product-root dp-chat-panel-typography ${dialogueProductFontClassName}`}
      >
        {children}
      </StaticFigure>
    </figure>
  );
}

const STEP_ROWS = STEPS.map((s) => ({
  label: s.label,
  value: s.pct,
  display: formatChartPercent(s.pct),
  focal: Boolean(s.focal),
}));

const GAP_PTS = (label: string) => {
  const mobile = GROUPS[0]!.pct;
  const g = GROUPS.find((r) => r.label === label)!;
  return `${mobile - g.pct} pts`;
};

const EVENT_LABEL = "Autocomplete ships";
const TOTAL = COVERAGE_ADDRESS.rows.reduce((n, r) => n + r.count, 0);

const ENTRIES = [
  {
    id: "dropoff",
    name: "Drop-off between steps",
    verdict: "Bars show where people quit, so the one big drop has to stand out.",
    tech: [
      ["Data shape", "ordered steps, share still in flow."],
      ["Encoding", "length on a zero baseline, direct labels on every bar."],
      ["Tradeoff", "loses theme overlap."],
    ],
    caption:
      "Removed the quarter gridlines and the drop on every row. Kept the drop on Address only and gave that bar the one cherry accent, because it is the largest and the reader should find it first.",
    bad: (
      <ChartVizCard title="Drop-off by step">
        <ChartBarList
          gridlines
          rows={STEPS.map((s) => ({
            label: s.label,
            value: s.pct,
            display: formatChartPercent(s.pct),
            detail: "drop" in s ? `-${s.drop}` : "",
          }))}
          max={100}
          fillMode="index"
        />
      </ChartVizCard>
    ),
    good: (
      <ChartVizCard title="Drop-off by step">
        <ChartBarList
          rows={STEP_ROWS.map((r, i) => ({
            ...r,
            detail: r.focal ? `-${STEPS[i]!.drop}` : "",
          }))}
          max={100}
          fillMode="index"
        />
      </ChartVizCard>
    ),
  },
  {
    id: "groups",
    name: "How groups differ",
    verdict: "A dot plot puts each group on one shared axis, so the gap reads as distance.",
    tech: [
      ["Data shape", "one rate per group."],
      ["Encoding", "position on a zero-based axis, one dot per group."],
      ["Tradeoff", "no view of spread inside a group."],
    ],
    caption:
      "Removed the gridline every 20% and the points-behind-Mobile figure on each row. Kept the axis ends, so the zero baseline is still there, and one line saying Mobile is about twice Desktop.",
    bad: (
      <ChartVizCard title={SEGMENT_ADDRESS.title}>
        <ChartDotPlot
          gridAt={[0, 20, 40, 60, 80, 100]}
          ticks={[0, 50, 100]}
          rows={GROUPS.map((g) => ({
            label: g.label,
            value: g.pct,
            display: formatChartPercent(g.pct),
            focal: "focal" in g && g.focal,
            detail: g.label === "Mobile" ? "" : GAP_PTS(g.label),
          }))}
          max={100}
        />
      </ChartVizCard>
    ),
    good: (
      <ChartVizCard title={SEGMENT_ADDRESS.title}>
        <ChartDotPlot
          ticks={[0, 100]}
          rows={GROUPS.map((g) => ({
            label: g.label,
            value: g.pct,
            display: formatChartPercent(g.pct),
            focal: "focal" in g && g.focal,
          }))}
          max={100}
          note="Mobile is about twice Desktop"
        />
      </ChartVizCard>
    ),
  },
  {
    id: "trend",
    name: "Change over sessions",
    verdict: "A line shows the climb, and one marker says why it climbed.",
    tech: [
      ["Data shape", "one score per round, in order."],
      ["Encoding", "slope shows direction; height on a shared axis shows size."],
      ["Tradeoff", "needs three or more rounds."],
    ],
    caption:
      "Removed the shaded area, the extra axis steps, the change between rounds and the middle value. Kept both ends labeled and the marker where autocomplete ships, because that event explains the climb.",
    bad: (
      <ChartVizCard title="Sentiment by round">
        <ChartLinePlot
          points={ROUNDS}
          yMode="trend"
          tickCount={5}
          area
          deltas
          annotation={{ index: 1, label: EVENT_LABEL }}
          formatValue={(n) => formatChartDecimal(n)}
          seriesFocal={false}
        />
      </ChartVizCard>
    ),
    good: (
      <ChartVizCard title="Sentiment by round">
        <ChartLinePlot
          points={ROUNDS}
          yMode="trend"
          valueIndices={[0, ROUNDS.length - 1]}
          annotation={{ index: 1, label: EVENT_LABEL }}
          formatValue={(n) => formatChartDecimal(n)}
          seriesFocal={false}
        />
      </ChartVizCard>
    ),
  },
  {
    id: "coverage",
    name: "How much was covered",
    verdict: "One bar for all 24 interviews shows how much of the set backs the finding.",
    tech: [
      ["Data shape", "interviews that mention it, out of 24."],
      ["Encoding", "segment length against the full set."],
      ["Tradeoff", "says nothing about how strong each quote is."],
    ],
    caption:
      "Removed the count axis, the legend and the percent inside each segment. Kept the two counts printed directly under their segments, because the reader needs 18 of 24 and nothing else.",
    bad: (
      <ChartVizCard title="Address friction">
        <ChartStackedBar
          showShare
          legend
          ticks={[0, 6, 12, 18, 24]}
          total={TOTAL}
          segments={COVERAGE_ADDRESS.rows.map((r) => ({
            label: r.label === "Mentioned it" ? "Said it" : "Did not",
            value: r.count,
            display: String(r.count),
            focal: Boolean(r.focal),
          }))}
        />
      </ChartVizCard>
    ),
    good: (
      <ChartVizCard title="Address friction">
        <ChartStackedBar
          total={TOTAL}
          segments={COVERAGE_ADDRESS.rows.map((r) => ({
            label: r.label === "Mentioned it" ? "said it" : "did not",
            value: r.count,
            display: String(r.count),
            focal: Boolean(r.focal),
          }))}
          note={`of ${TOTAL} interviews`}
        />
      </ChartVizCard>
    ),
  },
] as const;

export default function DialogueChartLibrary() {
  return (
    <div className="dialogue-lib">
      {ENTRIES.map((entry) => (
        <article key={entry.id} className="dialogue-lib__entry">
          <h3 className="dialogue-lib__name">{entry.name}</h3>
          <p className="dialogue-lib__verdict">{entry.verdict}</p>
          <div className="dialogue-lib__pair">
            <Specimen entryId={entry.id} status="ruled-out">{entry.bad}</Specimen>
            <Specimen entryId={entry.id} status="chosen">{entry.good}</Specimen>
          </div>
          <p className="dialogue-lib__caption" data-annotate-part={`caption-${entry.id}`}>{entry.caption}</p>
          <div className="dialogue-lib__tech">
            {entry.tech.map(([label, text]) => (
              <p key={label}>
                <span>{label}:</span> {text}
              </p>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
