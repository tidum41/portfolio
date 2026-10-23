"use client";

import type { ReactNode } from "react";
import StaticFigure from "@/components/dialogue/StaticFigure";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartLinePlot from "@/components/dialogue/product/chart/ChartLinePlot";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import {
  formatChartCount,
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

function Marker({ n = 1, part }: { n?: number; part?: string }) {
  return (
    <span className="dialogue-lib__marker" aria-hidden data-annotate-part={part ?? `marker-${n}`}>
      {n}
    </span>
  );
}

function Specimen({
  entryId,
  status,
  caption,
  children,
}: {
  entryId: string;
  status: "ruled-out" | "chosen";
  caption?: string;
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
      {caption ? (
        <figcaption className="dialogue-lib__caption">
          <Marker />
          <span>{caption}</span>
        </figcaption>
      ) : null}
    </figure>
  );
}

/** Same bars as the chosen chart, but a legend names them instead of direct labels. */
function LegendNearMiss() {
  return (
    <ChartVizCard title="Drop-off by step">
      <ChartBarList
        hideLabels
        rows={STEPS.map((s) => ({
          label: s.label,
          value: s.pct,
          display: formatChartPercent(s.pct),
        }))}
        max={100}
        fillMode="index"
      />
      <div className="dialogue-lib__legend" data-annotate-part="legend">
        <Marker part="legend-marker" />
        {STEPS.map((s, i) => (
          <span key={s.label} className="dialogue-lib__legend-item">
            <span className="dialogue-lib__swatch" data-ramp={i + 1} aria-hidden />
            {s.label}
          </span>
        ))}
      </div>
    </ChartVizCard>
  );
}

/** Same bars, but the baseline starts at 20% so the gaps look larger than they are. */
function TruncatedNearMiss() {
  return (
    <ChartVizCard title={SEGMENT_ADDRESS.title}>
      <ChartBarList
        rows={GROUPS.map((g) => ({
          label: g.label,
          value: g.pct,
          display: formatChartPercent(g.pct),
          focal: "focal" in g && g.focal,
        }))}
        max={100}
        baseline={20}
        fillMode="index"
        note={
          <span className="dialogue-lib__note-row" data-annotate-part="baseline-note">
            <Marker part="baseline-marker" />
            Axis starts at 20%
          </span>
        }
      />
    </ChartVizCard>
  );
}

/** Same line and axis, but a legend replaces the point values. */
function LegendLineNearMiss() {
  return (
    <ChartVizCard title="Sentiment by round">
      <ChartLinePlot points={ROUNDS} yMode="trend" hideValues seriesFocal={false} />
      <div className="dialogue-lib__legend dialogue-lib__legend--line" data-annotate-part="legend">
        <Marker part="legend-marker" />
        <span className="dialogue-lib__swatch dialogue-lib__swatch--line" aria-hidden />
        Sentiment score
      </div>
    </ChartVizCard>
  );
}

/** Same counts, but the scale ends at the largest bar instead of all 24 interviews. */
function LargestScaleNearMiss() {
  return (
    <ChartVizCard title="Address friction">
      <ChartBarList
        rows={COVERAGE_ADDRESS.rows.map((r) => ({
          label: r.label === "Mentioned it" ? "Said it" : "Did not",
          value: r.count,
          display: formatChartCount(r.count),
        }))}
        max={COVERAGE_ADDRESS.rows[0]!.count}
        fillMode="magnitude"
        note={
          <span className="dialogue-lib__note-row" data-annotate-part="scale-note">
            <Marker part="scale-marker" />
            Scale ends at the largest count
          </span>
        }
      />
    </ChartVizCard>
  );
}

const ENTRIES = [
  {
    id: "dropoff",
    name: "Drop-off between steps",
    verdict: "Bars show where people quit. A legend makes you look away to read them.",
    tech: [
      ["Data shape", "ordered steps, counts."],
      ["Encoding", "direct labels sit on the bar; length on a zero baseline is read precisely."],
      ["Tradeoff", "loses theme overlap."],
    ],
    bad: <LegendNearMiss />,
    badCaption: "Legend instead of direct labels: you match a shade to a name before you can read the drop.",
    good: (
      <ChartVizCard title="Drop-off by step">
        <ChartBarList
          rows={STEPS.map((s) => ({
            label: s.label,
            value: s.pct,
            display: formatChartPercent(s.pct),
            focal: Boolean(s.focal),
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
    verdict: "Bars line up so the gap is obvious. A cut baseline inflates it.",
    tech: [
      ["Data shape", "one rate per group."],
      ["Encoding", "one aligned bar per group, starting at zero so lengths compare honestly."],
      ["Tradeoff", "no view of spread inside a group."],
    ],
    bad: <TruncatedNearMiss />,
    badCaption: "Truncated baseline: the axis starts at 20%, so the gap between groups looks larger than it is.",
    good: (
      <ChartVizCard title={SEGMENT_ADDRESS.title}>
        <ChartBarList
          rows={GROUPS.map((g) => ({
            label: g.label,
            value: g.pct,
            display: formatChartPercent(g.pct),
            focal: "focal" in g && g.focal,
          }))}
          max={100}
          fillMode="index"
        />
      </ChartVizCard>
    ),
  },
  {
    id: "trend",
    name: "Change over sessions",
    verdict: "A line shows the climb. A legend without point values hides the size.",
    tech: [
      ["Data shape", "one score per round, in order."],
      ["Encoding", "slope shows direction; height on a shared axis shows size."],
      ["Tradeoff", "needs three or more rounds."],
    ],
    bad: <LegendLineNearMiss />,
    badCaption: "Legend instead of point values: you see the climb but have to estimate each round from the axis.",
    good: (
      <ChartVizCard title="Sentiment by round">
        <ChartLinePlot
          points={ROUNDS}
          yMode="trend"
          formatValue={(n) => formatChartDecimal(n)}
          seriesFocal={false}
        />
      </ChartVizCard>
    ),
  },
  {
    id: "coverage",
    name: "How much was covered",
    verdict: "Interview counts show how thin the proof is. A scale cut to the largest bar hides it.",
    tech: [
      ["Data shape", "interviews that mention it, out of 24."],
      ["Encoding", "counts against the full set show coverage."],
      ["Tradeoff", "says nothing about how strong each quote is."],
    ],
    bad: <LargestScaleNearMiss />,
    badCaption: "Scale ends at the largest count, not at 24: the top bar fills the track, so coverage looks complete.",
    good: (
      <ChartVizCard title="Address friction">
        <ChartBarList
          rows={COVERAGE_ADDRESS.rows.map((r) => ({
            label: r.label === "Mentioned it" ? "Said it" : "Did not",
            value: r.count,
            display: formatChartCount(r.count),
          }))}
          max={24}
          fillMode="magnitude"
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
            <Specimen entryId={entry.id} status="ruled-out" caption={entry.badCaption}>{entry.bad}</Specimen>
            <Specimen entryId={entry.id} status="chosen">{entry.good}</Specimen>
          </div>
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
