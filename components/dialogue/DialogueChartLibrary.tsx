"use client";

import type { ReactNode } from "react";
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
  status,
  children,
}: {
  status: "ruled-out" | "chosen";
  children: ReactNode;
}) {
  return (
    <figure className="dialogue-lib__specimen" data-status={status}>
      <span className="dialogue-lib__tag">{status === "chosen" ? "Chosen" : "Ruled out"}</span>
      <div
        className={`dialogue-lib__chart dialogue-product-root dp-chat-panel-typography ${dialogueProductFontClassName}`}
        aria-hidden
      >
        {children}
      </div>
    </figure>
  );
}

function Bubbles() {
  return (
    <ChartVizCard title="Drop-off by step">
      <div className="dialogue-lib__bubbles">
        {STEPS.map((s) => (
          <div key={s.label} className="dialogue-lib__bubble-cell">
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

function Donut() {
  const total = GROUPS.reduce((sum, g) => sum + g.pct, 0);
  const r = 40;
  const circ = 2 * Math.PI * r;
  let acc = 0;
  const tones = ["#b33a7a", "#a8a29e", "#d6d3d1"];
  return (
    <ChartVizCard title={SEGMENT_ADDRESS.title}>
      <svg viewBox="0 0 280 128" className="dialogue-lib__donut" role="img" aria-label="Donut chart">
        {GROUPS.map((g, i) => {
          const frac = g.pct / total;
          const dash = frac * circ;
          const mid = (acc + frac / 2) * 2 * Math.PI - Math.PI / 2;
          const el = (
            <g key={g.label}>
              <circle
                cx={140}
                cy={64}
                r={r}
                fill="none"
                stroke={tones[i]}
                strokeWidth={22}
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeDashoffset={-acc * circ}
                transform="rotate(-90 140 64)"
              />
              <text
                x={140 + Math.cos(mid) * 62 + (Math.cos(mid) >= 0 ? 8 : -8)}
                y={64 + Math.sin(mid) * 62 + 4}
                textAnchor={Math.cos(mid) >= 0 ? "start" : "end"}
                className="dialogue-lib__svg-label"
              >
                {g.label} {formatChartPercent(g.pct)}
              </text>
            </g>
          );
          acc += frac;
          return el;
        })}
      </svg>
    </ChartVizCard>
  );
}

function Dots() {
  return (
    <ChartVizCard title={SENTIMENT_LINE.title.replace(" after autocomplete ships in round two.", " by round")}>
      <div className="dialogue-lib__dots">
        {ROUNDS.map((p) => (
          <div key={p.label} className="dialogue-lib__dot-cell">
            <span className="dialogue-lib__dot-value">{formatChartDecimal(p.value)}</span>
            <span className="dialogue-lib__dot" />
            <span className="dialogue-lib__bubble-label">{p.label}</span>
          </div>
        ))}
      </div>
    </ChartVizCard>
  );
}

function MentionTotal() {
  return (
    <ChartVizCard title="Address friction">
      <div className="dialogue-lib__total">
        <span className="dialogue-lib__total-bar" />
        <span className="dialogue-lib__total-value">31 mentions</span>
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
    verdict: "Bars line up so the gap is obvious. A donut hides it.",
    tech: [
      ["Data shape", "one rate per group."],
      ["Encoding", "aligned bar length beats angle for close values."],
      ["Tradeoff", "no part-to-whole reading."],
    ],
    bad: <Donut />,
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
    verdict: "A line shows the climb. Loose dots hide the direction.",
    tech: [
      ["Data shape", "one score per round, in order."],
      ["Encoding", "slope shows direction; height on a shared axis shows size."],
      ["Tradeoff", "needs three or more rounds."],
    ],
    bad: <Dots />,
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
    verdict: "Interview counts show how thin the proof is. Mention totals hide it.",
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
            <Specimen status="ruled-out">{entry.bad}</Specimen>
            <Specimen status="chosen">{entry.good}</Specimen>
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
