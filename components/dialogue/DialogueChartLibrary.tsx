"use client";

import type { ReactNode } from "react";
import StaticFigure from "@/components/dialogue/StaticFigure";
import { annotateSlug } from "@/components/dialogue/annotate";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import {
  formatChartCount,
  formatChartPercent,
} from "@/components/dialogue/product/chart/chartSpec";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import DialogueRachelFrame from "@/components/dialogue/DialogueRachelFrame";
import { CHECKOUT_FUNNEL, COVERAGE_ADDRESS } from "@/lib/dialogue/product/sampleData";

const STEPS = CHECKOUT_FUNNEL.steps.slice(0, 4);

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

function CoverageBars() {
  return (
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
  );
}

/** Coverage stands alone in the thin data section: the count is the evidence. */
export function DialogueCoverageFigure() {
  return (
    <figure className="cs-figure dialogue-live-block">
      <DialogueRachelFrame
        label="Coverage: 18 of 24 interviews mention address friction, so this finding can carry a chart."
        tone="system"
      >
        <div
          className={`dialogue-lib__chart dialogue-product-root dp-chat-panel-typography ${dialogueProductFontClassName}`}
        >
          <CoverageBars />
        </div>
      </DialogueRachelFrame>
    </figure>
  );
}

const ENTRIES = [
  {
    id: "dropoff",
    name: "Drop-off between steps",
    verdict:
      "Bars show where people quit, and the address step is marked because its drop is the largest. Bubbles make you guess at sizes, which costs the reader the one comparison that matters.",
    tech: [
      ["First reach", "bubbles, because the steps felt like sizes, and bubbles show size."],
      ["Why it failed", "area cannot be compared at a glance, so the largest drop hides until you read every number."],
      ["Tradeoff", "bars rank the steps and nothing more; why people quit still has to come from the clips."],
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
