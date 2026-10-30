"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import StaticFigure from "@/components/dialogue/StaticFigure";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartDotPlot from "@/components/dialogue/product/chart/ChartDotPlot";
import ChartRankList from "@/components/dialogue/product/chart/ChartRankList";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import { formatChartPercent } from "@/components/dialogue/product/chart/chartSpec";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";

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
  points?: string;
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
      {points ? <p className="dialogue-lib__note" data-annotate-part={`points-${entryId}-${status}`}>{points}</p> : null}
    </div>
  );
}

/* Round P5 (Mudit OK Oct 27): two pairs, Hearthside data only. The Friday
   finding (225 of 300, P6 scale) is the hero's number; the segment counts (6 of 9,
   88 of 125) are the approved illustrative Hearthside comparison. */
const FRIDAY_TOTAL = 300;
const FRIDAY_ROWS = [
  { label: "Read it as this Friday", count: 225, focal: true },
  { label: "Unsure", count: 75, focal: false },
] as const;
const SEGMENTS = [
  { label: "First-time shoppers", count: 6, of: 9, focal: true },
  { label: "Repeat shoppers", count: 88, of: 125, focal: false },
] as const;

/** P14 item 10: extra Hearthside scenarios (Illustrative data). No line charts (TASTE cut). */
const DELIVERY_BY_TYPE = [
  { label: "New shoppers", count: 9, of: 14, focal: true },
  { label: "Repeat shoppers", count: 88, of: 125, focal: false },
] as const;
const TOP_ASKS = [
  { rank: 1, label: "Show an exact calendar date", value: 41 },
  { rank: 2, label: "Say which Friday it means", value: 28 },
  { rank: 3, label: "Warn when Friday slips", value: 17 },
  { rank: 4, label: "Offer a pickup option", value: 11 },
  { rank: 5, label: "Email the day before", value: 8 },
] as const;
const CONFIDENCE = [
  { label: "New shoppers", value: 2, display: "2 of 5 scale, 14 people", focal: true, detail: "of 14" },
  { label: "Repeat shoppers", value: 4, display: "4 of 5 scale, 125 people", detail: "of 125" },
] as const;

const ENTRIES = [
  {
    id: "coverage",
    badName: "Common chart",
    badPoints: "The axis and percents give the exact split, but the legend pulls the eye off the bar.",
    goodName: "My version",
    goodPoints: "225 of 300 reads at a glance under its segment, though no percent is printed.",
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
          segments={FRIDAY_ROWS.map((r) => ({ label: r.label === "Unsure" ? "unsure" : "said it", value: r.count, display: String(r.count), focal: r.focal }))}
          note={`of ${FRIDAY_TOTAL} interviews`}
        />
      </ChartVizCard>
    ),
  },
  {
    id: "segments",
    badName: "Common chart",
    badPoints: "Percents put both rows on one scale, so 67% and 70% look alike though one rests on 9 people.",
    goodName: "My version",
    goodPoints: "Each row says how many people it rests on, which makes exact comparison a little slower.",
    name: "How segments differ",
    verdict: "Percents make 67% and 70% look alike, so each row counts people out of its own group: 6 of 9 first-time shoppers, 88 of 125 repeat.",
    tech: [
      ["Data shape", "one count per segment, out of that segment."],
      ["Encoding", "bar length against each segment's own size."],
      ["Tradeoff", "rows with different totals are not directly comparable."],
    ],
    caption:
      "Swapped the percents for counts out of each segment, and kept the cherry on the row the answer leads with.",
    bad: (
      <ChartVizCard title="Read ‘Arrives by Friday’ as this Friday, by segment">
        <ChartBarList
          rows={SEGMENTS.map((r) => ({ label: r.label, value: Math.round((r.count / r.of) * 100), display: formatChartPercent(Math.round((r.count / r.of) * 100)), focal: r.focal }))}
          max={100}
        />
      </ChartVizCard>
    ),
    good: (
      <ChartVizCard title="Read ‘Arrives by Friday’ as this Friday, by segment">
        <ChartBarList
          rows={SEGMENTS.map((r) => ({ label: r.label, value: r.count / r.of, display: `${r.count} of ${r.of}`, focal: r.focal }))}
          max={1}
        />
      </ChartVizCard>
    ),
  },
] as const;

/** Scenario cards (P14 item 10): single chosen specimens, Hearthside mock only. Line charts stay cut (TASTE). */
const SCENARIOS = [
  {
    id: "delivery-type",
    name: "Delivery promise by shopper type",
    note: "Each row is N of its own group. ChartBarList fits N-of-group; ChartGroupedBars hard-codes All/Mobile percent heads.",
    card: (
      <ChartVizCard title="Read Friday as this Friday, by shopper type">
        <ChartBarList
          rows={DELIVERY_BY_TYPE.map((r) => ({ label: r.label, value: r.count / r.of, display: `${r.count} of ${r.of}`, focal: r.focal }))}
          max={1}
        />
      </ChartVizCard>
    ),
  },
  {
    id: "top-asks",
    name: "Top asks after checkout",
    note: "Five asks ranked by how many shoppers raised them. Illustrative data.",
    card: (
      <ChartVizCard title="What shoppers asked for after checkout">
        <ChartRankList rows={[...TOP_ASKS]} />
      </ChartVizCard>
    ),
  },
  {
    id: "confidence",
    name: "Confidence in the delivery date",
    note: "Shoppers rated how sure they were of the delivery date on a 1–5 scale (1 = not sure, 5 = sure). Dot is the group median; the label is that score and how many people it rests on.",
    card: (
      <ChartVizCard title="How sure shoppers were about the delivery date">
        <ChartDotPlot
          rows={[...CONFIDENCE]}
          max={5}
          ticks={[1, 2, 3, 4, 5]}
          formatTick={(n) => String(n)}
          gridAt={[1, 2, 3, 4, 5]}
          note="1 = not sure, 5 = sure. Illustrative data."
        />
      </ChartVizCard>
    ),
  },
] as const;

/** The segment question that asks for the redesigned chart (data viz, one pair). */
const SEGMENT_QUESTION = "Do first-time and repeat shoppers read \u201cArrives by Friday\u201d the same way?";

/* P15 items 12, 13, 15, 16: one figure for the chart templates. The chips are Dialogue's follow-up chips;
   each template answers one Hearthside question and names the IBM Carbon chart it was adapted from. */
const TEMPLATES = [
  {
    id: "group",
    chip: "By group",
    question: "Do new and repeat shoppers read \u201cArrives by Friday\u201d the same way?",
    carbon: "Simple bar chart",
    change: "Each row counts people out of its own group.",
    callout: "Each row counts its own group",
    target: ".dp-chart-bars__row:last-of-type .dp-chart-bars__value",
    place: "below",
    card: (
      <ChartVizCard title="Read Friday as this Friday, by shopper type">
        <ChartBarList
          rows={DELIVERY_BY_TYPE.map((r) => ({ label: r.label, value: r.count / r.of, display: `${r.count} of ${r.of}`, pct: `${Math.round((r.count / r.of) * 100)}%`, focal: r.focal }))}
          max={1}
        />
      </ChartVizCard>
    ),
  },
  {
    id: "split",
    chip: "Split",
    question: "How do shoppers read \u201cArrives by Friday\u201d?",
    carbon: "Meter chart",
    change: "Counts sit under their segments, with no legend or axis.",
    callout: "Each side keeps its count",
    target: ".dp-chart-stack__labels",
    place: "below",
    card: (
      <ChartVizCard title="225 of 300 shoppers read \u2018Arrives by Friday\u2019 as this Friday.">
        <ChartStackedBar
          total={FRIDAY_TOTAL}
          segments={FRIDAY_ROWS.map((r) => ({ label: r.label, value: r.count, display: `${r.count} of ${FRIDAY_TOTAL}`, focal: r.focal }))}
        />
      </ChartVizCard>
    ),
  },
  {
    id: "ranked",
    chip: "Ranked",
    question: "What did shoppers ask for after checkout?",
    carbon: "Simple bar chart, sorted",
    change: "Asks read as words in rank order, with the count at the end.",
    callout: "Ranked by how many raised it",
    target: ".dp-chart-rank__row:last-child .dp-chart-rank__value",
    place: "below",
    card: (
      <ChartVizCard title="What shoppers asked for after checkout">
        <ChartRankList rows={[...TOP_ASKS]} />
      </ChartVizCard>
    ),
  },
  {
    id: "scale",
    chip: "1 to 5 scale",
    question: "How sure were shoppers about the delivery date?",
    carbon: "Lollipop chart",
    change: "A dot at each group\u2019s median, labelled with how many people it rests on.",
    callout: "Each dot is a group median",
    target: ".dp-chart-dots__dot:not(.dp-chart-dots__dot--focal)",
    place: "below",
    card: (
      <ChartVizCard title="How sure shoppers were about the delivery date">
        <ChartDotPlot
          rows={[...CONFIDENCE]}
          max={5}
          ticks={[1, 2, 3, 4, 5]}
          formatTick={(n) => String(n)}
          gridAt={[1, 2, 3, 4, 5]}
          note="1 = not sure, 5 = sure."
        />
      </ChartVizCard>
    ),
  },
] as const;

/** P15 item 3: a callout pinned to one element of the chart, measured after layout. */
function PinnedCallout({ text, target, place }: { text: string; target: string; place: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const measure = () => {
      const host = ref.current?.parentElement;
      const el = host?.querySelector<HTMLElement>(target);
      if (!host || !el) return;
      const h = host.getBoundingClientRect(), r = el.getBoundingClientRect();
      const x = place === "right" ? r.right : r.left + r.width / 2;
      const y = place === "right" ? r.top + r.height / 2 : place === "below" ? r.bottom : r.top;
      setPos({ x: x - h.left, y: y - h.top });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (ref.current?.parentElement) ro.observe(ref.current.parentElement);
    return () => ro.disconnect();
  }, [target, place]);
  return (
    <span ref={ref} className="dlg-callout" data-place={place} data-on={pos ? "" : undefined} style={pos ? ({ ["--x" as string]: `${pos.x}px`, ["--y" as string]: `${pos.y}px` } as CSSProperties) : undefined} aria-hidden>
      <span className="dlg-callout__text">{text}</span>
    </span>
  );
}

function ChartTemplates() {
  const [sel, setSel] = useState<(typeof TEMPLATES)[number]["id"]>("group");
  const t = TEMPLATES.find((x) => x.id === sel) ?? TEMPLATES[0];
  return (
    <div className="dialogue-rachel-frame dialogue-rachel-frame--solution dlg-templates">
      <div className={`dialogue-product-root dp-chat-panel-typography dlg-templates__panel dp-study-chat ${dialogueProductFontClassName}`} data-template={t.id}>
        <div className="dp-followups dlg-templates__chips" role="tablist" aria-label="Chart templates">
          {TEMPLATES.map((x) => (
            <button key={x.id} type="button" role="tab" aria-selected={x.id === sel} aria-pressed={x.id === sel} className="dp-followup-btn dlg-chip" onClick={() => setSel(x.id)}>{x.chip}</button>
          ))}
        </div>
        <div className="dlg-templates__answer" key={t.id}>
          <UserMessageBubble>{t.question}</UserMessageBubble>
          <div className="dlg-templates__chart">
            {t.card}
            <PinnedCallout text={t.callout} target={t.target} place={t.place} />
          </div>
        </div>
        <dl className="dlg-templates__meta">
          <div><dt>Adapted from IBM Carbon</dt><dd>{t.carbon}</dd></div>
          <div><dt>What I changed</dt><dd>{t.change}</dd></div>
        </dl>
      </div>
    </div>
  );
}

export default function DialogueChartLibrary({
  showTech = true,
  segmentsFirst = false,
  only,
  scenarios = false,
  templates = false,
}: {
  /** P15: the merged chart-templates figure (replaces the bars video and the specimen list on the page). */
  templates?: boolean;
  showTech?: boolean;
  segmentsFirst?: boolean;
  only?: "segments" | "coverage";
  /** P14 item 10: also render the extra Hearthside scenario cards. */
  scenarios?: boolean;
}) {
  if (templates) return <ChartTemplates />;
  const entries = only ? ENTRIES.filter((e) => e.id === only) : segmentsFirst ? [...ENTRIES].reverse() : ENTRIES;
  return (
    <div className="dialogue-lib">
      {entries.map((entry) => (
        <article key={entry.id} className="dialogue-lib__entry">
          <h3 className="dialogue-lib__name">{entry.name}</h3>
          <div className="dialogue-lib__pair">
            <Specimen entryId={entry.id} status="ruled-out" name={entry.badName} points={only ? undefined : entry.badPoints}>
              {entry.bad}
            </Specimen>
            <Specimen entryId={entry.id} status="chosen" name={only ? "My version, as the chat answers" : entry.goodName} points={only ? undefined : entry.goodPoints}>
              {only ? (
                <div className="dlg-specimen-chat">
                  <UserMessageBubble>{SEGMENT_QUESTION}</UserMessageBubble>
                  {entry.good}
                </div>
              ) : entry.good}
            </Specimen>
          </div>
          <p className="dialogue-lib__verdict" data-annotate-part={`verdict-${entry.id}`}>{entry.verdict}</p>
          {only ? null : <p className="dialogue-lib__reason" data-annotate-part={`reason-${entry.id}`}>{entry.caption}</p>}
          {showTech ? (
            <div className="dialogue-lib__tech">
              {entry.tech.map(([label, text]) => (
                <p key={label}>
                  <span>{label}:</span> {text}
                </p>
              ))}
            </div>
          ) : null}
        </article>
      ))}
      {scenarios
        ? SCENARIOS.map((s) => (
            <article key={s.id} className="dialogue-lib__entry">
              <h3 className="dialogue-lib__name">{s.name}</h3>
              <div className="dialogue-lib__single">
                <div className="dialogue-lib__col" data-status="chosen">
                  <figure className="dialogue-lib__specimen" data-status="chosen">
                    <StaticFigure
                      figure={`chart-${s.id}-chosen`}
                      className={`dialogue-lib__chart dialogue-product-root dp-chat-panel-typography ${dialogueProductFontClassName}`}
                    >
                      {s.card}
                    </StaticFigure>
                  </figure>
                  <p className="dialogue-lib__note" data-annotate-part={`points-${s.id}`}>{s.note}</p>
                </div>
              </div>
            </article>
          ))
        : null}
    </div>
  );
}
