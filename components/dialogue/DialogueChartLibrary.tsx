"use client";

import type { ReactNode } from "react";
import { Check, Minus } from "@phosphor-icons/react/dist/ssr";
import StaticFigure from "@/components/dialogue/StaticFigure";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import { formatChartPercent } from "@/components/dialogue/product/chart/chartSpec";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";

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

/* Round P5 (Mudit OK Oct 27): two pairs, Hearthside data only. The Friday
   finding (225 of 300, P6 scale) is the hero's number; the segment counts (6 of 9,
   88 of 125) are the approved illustrative Hearthside comparison. */
const FRIDAY_TOTAL = 300;
const FRIDAY_ROWS = [
  { label: "Read it as this Friday", count: 225, focal: true },
  { label: "Did not", count: 75, focal: false },
] as const;
const SEGMENTS = [
  { label: "First-time, free returns", count: 6, of: 9, focal: true },
  { label: "Repeat, arrives by Friday", count: 88, of: 125, focal: false },
] as const;

const ENTRIES = [
  {
    id: "coverage",
    badName: "Common chart",
    badPoints: { pros: ["The count axis and shares give the exact split"], cons: ["The legend pulls the eye away from the bar"] },
    goodName: "My version",
    goodPoints: { pros: ["Counts sit directly under their segments", "225 of 300 reads at a glance"], cons: ["No percent is printed"] },
    name: "How much of the study backs a finding",
    verdict: "One bar for all 300 interviews shows how much of the study backs the finding.",
    tech: [
      ["Data shape", "interviews that mention it, out of 300."],
      ["Encoding", "segment length against the whole study."],
      ["Tradeoff", "says nothing about how strong each quote is."],
    ],
    caption:
      "Removed the count axis, the legend and the percent inside each segment. Kept the two counts under their segments, because the reader needs 225 of 300 and nothing else.",
    bad: (
      <ChartVizCard title="Read ‘Arrives by Friday’ as this Friday">
        <ChartStackedBar
          showShare
          legend
          ticks={[0, 75, 150, 225, 300]}
          total={FRIDAY_TOTAL}
          segments={FRIDAY_ROWS.map((r) => ({ label: r.label, value: r.count, display: String(r.count), focal: r.focal }))}
        />
      </ChartVizCard>
    ),
    good: (
      <ChartVizCard title="Read ‘Arrives by Friday’ as this Friday">
        <ChartStackedBar
          total={FRIDAY_TOTAL}
          segments={FRIDAY_ROWS.map((r) => ({ label: r.label === "Did not" ? "did not" : "said it", value: r.count, display: String(r.count), focal: r.focal }))}
          note={`of ${FRIDAY_TOTAL} interviews`}
        />
      </ChartVizCard>
    ),
  },
  {
    id: "segments",
    badName: "Common chart",
    badPoints: { pros: ["Percents line the segments up on one scale"], cons: ["67% and 70% look alike, but one rests on 9 people and the other on 125"] },
    goodName: "My version",
    goodPoints: { pros: ["Each row says how many people it rests on", "Small segments read as small"], cons: ["The two rows are harder to compare exactly"] },
    name: "How segments differ",
    verdict: "A filtered segment can be small inside a big study, so each row says how many people it rests on.",
    tech: [
      ["Data shape", "one count per segment, out of that segment."],
      ["Encoding", "bar length against each segment's own size."],
      ["Tradeoff", "rows with different totals are not directly comparable."],
    ],
    caption:
      "Swapped the percents for counts out of each segment, and kept the cherry on the row the answer leads with.",
    bad: (
      <ChartVizCard title="Top reason to buy, by segment">
        <ChartBarList
          rows={SEGMENTS.map((r) => ({ label: r.label, value: Math.round((r.count / r.of) * 100), display: formatChartPercent(Math.round((r.count / r.of) * 100)), focal: r.focal }))}
          max={100}
        />
      </ChartVizCard>
    ),
    good: (
      <ChartVizCard title="Top reason to buy, by segment">
        <ChartBarList
          rows={SEGMENTS.map((r) => ({ label: r.label, value: r.count / r.of, display: `${r.count} of ${r.of}`, focal: r.focal }))}
          max={1}
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
