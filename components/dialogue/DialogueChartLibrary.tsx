"use client";

import type { ReactNode } from "react";
import { Check, Minus } from "@phosphor-icons/react/dist/ssr";
import StaticFigure from "@/components/dialogue/StaticFigure";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartGroupedBars from "@/components/dialogue/product/chart/ChartGroupedBars";
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
  MOBILE_FUNNEL_STEPS,
  SEGMENT_ADDRESS,
  SENTIMENT_LINE,
} from "@/lib/dialogue/product/sampleData";

const STEPS = CHECKOUT_FUNNEL.steps.slice(0, 4);
const GROUPS = SEGMENT_ADDRESS.rows;
const ROUNDS = SENTIMENT_LINE.points;

type Points = { pros: readonly string[]; cons: readonly string[] };

/** Phosphor, the icon set BruinLease uses; bold at 16px so the stroke holds up at this size. */
function Mark({ kind }: { kind: "pro" | "con" }) {
  const Icon = kind === "pro" ? Check : Minus;
  return (
    <span className="dialogue-lib__mark" data-kind={kind} aria-hidden>
      <Icon size={16} weight="bold" />
    </span>
  );
}

function Specimen({
  entryId,
  status,
  name,
  points,
  children,
}: {
  entryId: string;
  status: "ruled-out" | "chosen";
  name: string;
  points: Points;
  children: ReactNode;
}) {
  return (
    <div className="dialogue-lib__col" data-status={status}>
      <figure className="dialogue-lib__specimen" data-status={status}>
        <StaticFigure
          figure={`chart-${entryId}-${status}`}
          className={`dialogue-lib__chart dialogue-product-root dp-chat-panel-typography ${dialogueProductFontClassName}`}
        >
          {children}
        </StaticFigure>
      </figure>
      <p className="dialogue-lib__spec-name" data-annotate-part={`name-${entryId}-${status}`}>{name}</p>
      <ul className="dialogue-lib__points" data-annotate-part={`points-${entryId}-${status}`}>
        {points.pros.map((t) => (
          <li key={t}><Mark kind="pro" />{t}</li>
        ))}
        {points.cons.map((t) => (
          <li key={t}><Mark kind="con" />{t}</li>
        ))}
      </ul>
    </div>
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
    badName: "Full detail",
    badPoints: {"pros": ["All participants and mobile side by side", "A drop figure on every step"], "cons": ["Two series, a legend and gridlines compete for attention"]},
    goodName: "Simplified",
    goodPoints: {"pros": ["One bar per step, read straight off its length", "One cherry bar marks the step that matters"], "cons": ["Mobile and the size of each drop are not shown"]},
    name: "Drop-off between steps",
    verdict: "Bars show where people quit, so the one big drop has to stand out.",
    tech: [
      ["Data shape", "ordered steps, share still in flow."],
      ["Encoding", "length on a zero baseline, direct labels on every bar."],
      ["Tradeoff", "loses theme overlap."],
    ],
    caption:
      "Removed the mobile series, the legend, the gridlines and every drop figure. Kept one bar per step and gave the Address bar the one cherry accent, because it is the largest drop and the reader should find it first.",
    bad: (
      <ChartVizCard title="Drop-off by step">
        <ChartGroupedBars
          seriesNames={["All participants", "Mobile only"]}
          rows={STEPS.map((s, i) => ({
            label: s.label,
            all: s.pct,
            segment: MOBILE_FUNNEL_STEPS[i]!.pct,
            detail: "drop" in s ? `-${s.drop}` : "",
          }))}
          max={100}
        />
      </ChartVizCard>
    ),
    good: (
      <ChartVizCard title="Drop-off by step">
        <ChartBarList rows={STEP_ROWS} max={100} fillMode="index" />
      </ChartVizCard>
    ),
  },
  {
    id: "groups",
    badName: "Full detail",
    badPoints: {"pros": ["A gridline every 20% reads exact values", "Gap to Mobile on every row"], "cons": ["Dense for three groups"]},
    goodName: "Simplified",
    goodPoints: {"pros": ["Dots sit on one shared scale", "One line says Mobile is about twice Desktop"], "cons": ["Exact gaps are not printed"]},
    name: "How groups differ",
    verdict: "A dot plot puts each group on one shared axis, so the gap reads as distance.",
    tech: [
      ["Data shape", "one rate per group."],
      ["Encoding", "position on a zero-based axis, one dot per group."],
      ["Tradeoff", "no view of spread inside a group."],
    ],
    caption:
      "Removed the gridline every 20%, the 0 to 100 scale and the points-behind-Mobile figure on each row. Kept the dots on one shared scale and one line saying Mobile is about twice Desktop.",
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
          note="Right column: percentage points behind Mobile"
        />
      </ChartVizCard>
    ),
    good: (
      <ChartVizCard title={SEGMENT_ADDRESS.title}>
        <ChartDotPlot
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
    badName: "Full detail",
    badPoints: {"pros": ["Change between rounds is printed"], "cons": ["The shaded area and extra axis steps add noise"]},
    goodName: "Simplified",
    goodPoints: {"pros": ["Both ends are labeled", "A marker shows where autocomplete ships"], "cons": ["The middle value is not shown"]},
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
    badName: "Full detail",
    badPoints: {"pros": ["The count axis and shares give the exact split"], "cons": ["The legend pulls the eye away from the bar"]},
    goodName: "Simplified",
    goodPoints: {"pros": ["Counts sit directly under their segments", "18 of 24 reads at a glance"], "cons": ["No percent is printed"]},
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
          <div className="dialogue-lib__pair">
            <Specimen entryId={entry.id} status="ruled-out" name={entry.badName} points={entry.badPoints}>
              {entry.bad}
            </Specimen>
            <Specimen entryId={entry.id} status="chosen" name={entry.goodName} points={entry.goodPoints}>
              {entry.good}
            </Specimen>
          </div>
          <p className="dialogue-lib__verdict" data-annotate-part={`verdict-${entry.id}`}>{entry.verdict}</p>
          <p className="dialogue-lib__reason" data-annotate-part={`reason-${entry.id}`}>{entry.caption}</p>
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
