"use client";

import type { ReactNode } from "react";
import StaticFigure from "@/components/dialogue/StaticFigure";
import { annotateSlug } from "@/components/dialogue/annotate";
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

function Bubbles() {
  return (
    <ChartVizCard title="Drop-off by step">
      <div className="dialogue-lib__bubbles">
        {STEPS.map((s) => (
          <div key={s.label} className="dialogue-lib__bubble-cell" data-annotate-part={`bubble-${annotateSlug(s.label)}`}>
            <span
              className="dialogue-lib__bubble"
              style={{ width: 24 + s.pct * 0.56, height: 24 + s.pct * 0.56 }}
            >
              {formatChartPercent(s.pct)}
            </span>
            <span className="dialogue-lib__bubble-label">{s.label}</span>
          </div>
        ))}
      </div>
    </ChartVizCard>
  );
}

function Distribution() {
  const buckets = Array.from({ length: 10 }, (_, i) => ({
    lo: i * 10,
    count: GROUPS.filter((g) => g.pct >= i * 10 && g.pct < i * 10 + 10).length,
  }));
  return (
    <ChartVizCard title="Address resets, all interviews">
      <svg viewBox="0 0 280 110" className="dialogue-lib__dist" role="img" aria-label="Pooled distribution">
        <line x1="8" y1="84" x2="272" y2="84" className="dialogue-lib__axis" />
        {buckets.map((b, i) => (
          <g key={b.lo}>
            {b.count > 0 ? (
              <rect data-annotate-part={`dist-bar-${b.lo}`} x={12 + i * 26} y={84 - b.count * 36} width={20} height={b.count * 36} rx={3} className="dialogue-lib__dist-bar" />
            ) : null}
            {i % 2 === 0 ? (
              <text x={22 + i * 26} y={102} textAnchor="middle" className="dialogue-lib__svg-label">
                {b.lo}%
              </text>
            ) : null}
          </g>
        ))}
      </svg>
    </ChartVizCard>
  );
}

function Timeline() {
  return (
    <ChartVizCard title="Sentiment timeline">
      <svg viewBox="0 0 280 110" className="dialogue-lib__dist" role="img" aria-label="Timeline of rounds">
        <line x1="20" y1="50" x2="260" y2="50" className="dialogue-lib__axis" />
        {ROUNDS.map((p, i) => {
          const x = 20 + (i * 240) / Math.max(ROUNDS.length - 1, 1);
          return (
            <g key={p.label}>
              <circle data-annotate-part={`timeline-dot-${annotateSlug(p.label)}`} cx={x} cy={50} r={6} className="dialogue-lib__timeline-dot" />
              <text x={x} y={78} textAnchor="middle" className="dialogue-lib__svg-label">
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>
    </ChartVizCard>
  );
}

function MentionTotal() {
  return (
    <ChartVizCard title="Address friction">
      <div className="dialogue-lib__total">
        <span className="dialogue-lib__total-bar" data-annotate-part="total-bar" />
        <span className="dialogue-lib__total-value" data-annotate-part="total-value">31 quotes</span>
      </div>
    </ChartVizCard>
  );
}

const ENTRIES = [
  {
    id: "dropoff",
    name: "Drop-off between steps",
    verdict: "Bars show where people quit. Bubbles make you guess.",
    tech: [
      ["Data shape", "ordered steps, counts."],
      ["Encoding", "length on a zero baseline is read precisely; area is not."],
      ["Tradeoff", "loses theme overlap."],
    ],
    bad: <Bubbles />,
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
    verdict: "Bars line up so the gap is obvious. A pooled spread hides it.",
    tech: [
      ["Data shape", "one rate per group."],
      ["Encoding", "one aligned bar per group; a pooled spread drops the group names."],
      ["Tradeoff", "no view of spread inside a group."],
    ],
    bad: <Distribution />,
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
    verdict: "A line shows the climb. A bare timeline hides the size.",
    tech: [
      ["Data shape", "one score per round, in order."],
      ["Encoding", "slope shows direction; height on a shared axis shows size."],
      ["Tradeoff", "needs three or more rounds."],
    ],
    bad: <Timeline />,
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
    verdict: "Interview counts show how thin the proof is. Quote counts hide it.",
    tech: [
      ["Data shape", "interviews that mention it, out of 24."],
      ["Encoding", "counts against the full set show coverage."],
      ["Tradeoff", "says nothing about how strong each quote is."],
    ],
    bad: <MentionTotal />,
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
            <Specimen entryId={entry.id} status="ruled-out">{entry.bad}</Specimen>
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
