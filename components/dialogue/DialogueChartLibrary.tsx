"use client";

import { useState, type ReactNode } from "react";
import StaticFigure from "@/components/dialogue/StaticFigure";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartDotPlot from "@/components/dialogue/product/chart/ChartDotPlot";
import ChartRankList from "@/components/dialogue/product/chart/ChartRankList";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import SourcePill from "@/components/dialogue/product/SourcePill";
import { ChevronUpIcon, PlusIcon, WaveformIcon } from "@/components/dialogue/product/icons";
import { QUOTE_LIST_NEW } from "@/lib/dialogue/product/sampleData";
import { ArrowRight, Check, X } from "@phosphor-icons/react/dist/ssr";
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
   finding (225 of 300, P6 scale) is the hero's number; the segment counts (9 of 14,
   88 of 125) are the approved illustrative Hearthside comparison. */
const FRIDAY_TOTAL = 300;
const FRIDAY_ROWS = [
  { label: "Read it as this Friday", count: 225, focal: true },
  { label: "Unsure", count: 75, focal: false },
] as const;
const SEGMENTS = [
  { label: "New shoppers", count: 9, of: 14, focal: true, secondary: false },
  { label: "Repeat shoppers", count: 88, of: 125, focal: false, secondary: true },
] as const;

/** P14 item 10: extra Hearthside scenarios. No line charts (TASTE cut). */
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
  { label: "New shoppers", value: 2, display: "2", focal: true, detail: "14 people" },
  { label: "Repeat shoppers", value: 4, display: "4", secondary: true, detail: "125 people" },
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
        <ChartStackedBar lanes
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
        <ChartStackedBar lanes
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
    badPoints: "Percents put both rows on one scale, so 64% and 70% look alike though one rests on 9 people.",
    goodName: "My version",
    goodPoints: "Each row says how many people it rests on, which makes exact comparison a little slower.",
    name: "How segments differ",
    verdict: "Percents make 64% and 70% look alike, so each row counts people out of its own group: 9 of 14 new shoppers, 88 of 125 repeat.",
    tech: [
      ["Data shape", "one count per segment, out of that segment."],
      ["Encoding", "bar length against each segment's own size."],
      ["Tradeoff", "rows with different totals are not directly comparable."],
    ],
    caption:
      "Swapped the percents for counts out of each segment, and kept the cherry on the row the answer leads with.",
    bad: (
      <ChartVizCard title="Read ‘Arrives by Friday’ as this Friday, by group">
        <ChartBarList
          rows={SEGMENTS.map((r) => ({ label: r.label, value: Math.round((r.count / r.of) * 100), display: formatChartPercent(Math.round((r.count / r.of) * 100)), focal: r.focal, secondary: r.secondary }))}
          max={100}
        />
      </ChartVizCard>
    ),
    good: (
      <ChartVizCard title="Read ‘Arrives by Friday’ as this Friday, by segment">
        <ChartBarList
          rows={SEGMENTS.map((r) => ({ label: r.label, value: r.count / r.of, display: `${r.count} of ${r.of}`, focal: r.focal, secondary: r.secondary }))}
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
    note: "Five asks ranked by how many shoppers raised them.",
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
      <ChartVizCard title="How sure shoppers were about the delivery date, median score">
        <ChartDotPlot
          rows={[...CONFIDENCE]}
          max={5}
          ticks={[1, 2, 3, 4, 5]}
          formatTick={(n) => String(n)}
          gridAt={[1, 2, 3, 4, 5]}
          note="Each dot is a group’s median score. 1 = not sure, 5 = sure."
        />
      </ChartVizCard>
    ),
  },
] as const;

/** The segment question that asks for the redesigned chart (data viz, one pair). */
const SEGMENT_QUESTION = "Do new and repeat shoppers read \u2018Arrives by Friday\u2019 the same way?";

/* P15 items 11 to 16: one figure for the chart templates. The picker and the notes are case-study chrome; the panel
   holds only Dialogue's answer card. Each template names the IBM Carbon chart it was adapted from, with one pro and
   one con (P14's pros and cons). Group bars open their people on a tap (P14 bar tap) and show their percent on hover.
   Round 6: compact index maps question type to chart, with one ruled-out option and a one-line reason. */
type Template = {
  id: string; name: string; carbon: string; note: string; target: string;
  /** P16: the kind of question the AI matches to this template, so the figure's purpose reads at a glance. */
  ask: string;
  /** P16 round 4: the researcher's question that gets this template, shown above its chart. */
  question: string;
  /** Round 9: the cut this card counts out of, so no two cards read as one denominator. */
  cut: string;
  pro: string; con: string; card: (open: boolean, onOpen: (b: boolean) => void) => ReactNode;
  /** Round 11: the near-miss this template beat, drawn beside it. Only By group has one (percents on one scale). */
  foil?: ReactNode;
  /** What a tap opens under the card (By group opens its people). Shown only while open. */
  more?: (onOpen: (b: boolean) => void) => ReactNode;
};
const pctOf = (n: number, of: number) => `${Math.round((n / of) * 100)}%`;
const FIRST = SEGMENTS[0];
const FIRST_GROUP_OF = SEGMENTS[1].of;

function GroupChart({ open, onOpen }: { open: boolean; onOpen: (b: boolean) => void }) {
  return (
    <ChartVizCard title="Read ‘Arrives by Friday’ as this Friday, by group">
      <div className="dlg-live__bars">
        <ChartBarList
          rows={SEGMENTS.map((r) => ({ label: r.label, value: r.count / r.of, display: `${r.count} of ${r.of}`, pct: pctOf(r.count, r.of), focal: r.focal, secondary: r.secondary }))}
          max={1}
        />
        <button type="button" className="dlg-live__bar-hit" aria-label={`Open the ${FIRST.count} ${FIRST.label.toLowerCase()}`} aria-expanded={open} onClick={() => onOpen(!open)} />
      </div>
    </ChartVizCard>
  );
}

function GroupPeople({ onOpen }: { onOpen: (b: boolean) => void }) {
  return (
    <div className="dp-side-sample dlg-stage__sample dlg-templates__people" data-side="new">
      <p className="dp-side-sample__head dp-text-body">
        <span className="dlg-sample-key" aria-hidden /><span className="dp-summary__emph">{FIRST.count}</span> {FIRST.label.toLowerCase()}, {QUOTE_LIST_NEW.length} shown
        <button type="button" className="dlg-clip-collapse" data-shown="" aria-label="Fold the people back" onClick={() => onOpen(false)}><ChevronUpIcon /></button>
      </p>
      <div className="dp-clip-quotes">
        {QUOTE_LIST_NEW.map((q) => (
          <div key={q.participant} className="dp-clip-quote">
            <p className="dp-clip-quote__who"><WaveformIcon className="dp-clip-quote__icon" /><span className="dp-clip-quote__name">{q.participant}</span><span className="dp-clip-quote__time">{q.time}</span></p>
            <p className="dp-clip-quote__text">{q.quote}</p>
          </div>
        ))}
      </div>
      <div className="dp-sources"><SourcePill name={`+${FIRST.count - QUOTE_LIST_NEW.length} more`} time="" /></div>
    </div>
  );
}

const TEMPLATES: Template[] = [
  {
    id: "group",
    ask: "Compares groups of different sizes",
    question: SEGMENT_QUESTION,
    name: "By group",
    carbon: "simple bar chart",
    note: "Count out of each group",
    target: ".dp-chart-bars__row:first-child",
    cut: "14 new and 125 repeat shoppers, two groups within the 300, each out of its own size",
    pro: "Each row says how many people it rests on.",
    con: "Exact comparison across rows is a little slower.",
    card: (open, onOpen) => <GroupChart open={open} onOpen={onOpen} />,
    more: (onOpen) => <GroupPeople onOpen={onOpen} />,
    foil: ENTRIES[1].bad,
  },
  {
    id: "split",
    ask: "Splits everyone into two sides",
    question: "How do shoppers read \u2018Arrives by Friday\u2019?",
    name: "Split",
    carbon: "meter chart",
    note: "Count under each segment",
    target: ".dp-chart-stack__labels",
    cut: "all 300 shoppers",
    pro: "Each side’s count reads at a glance under its segment.",
    con: "No percent is printed.",
    card: () => (
      <ChartVizCard title="225 of 300 shoppers read ‘Arrives by Friday’ as this Friday.">
        <ChartStackedBar lanes
          total={FRIDAY_TOTAL}
          segments={FRIDAY_ROWS.map((r) => ({ label: r.label, value: r.count, display: `${r.count} of ${FRIDAY_TOTAL}`, focal: r.focal }))}
        />
      </ChartVizCard>
    ),
  },
  {
    id: "ranked",
    ask: "Ranks what people asked for",
    question: "What did shoppers ask for after checkout?",
    name: "Ranked",
    carbon: "simple bar chart, sorted",
    note: "Asks in rank order",
    target: ".dp-chart-rank__row:first-child",
    cut: "all 300 shoppers, top five asks. Bars scale to the top ask, 41; each count is out of 300",
    pro: "Bars run longest first, so the top ask reads first.",
    con: "Only the top five asks show.",
    card: () => (
      <ChartVizCard title="What shoppers asked for after checkout, top five">
        <ChartBarList
          rows={TOP_ASKS.map((r) => ({ label: r.label, value: r.value, display: `${r.value} of ${FRIDAY_TOTAL}`, focal: r.rank === 1 }))}
          max={TOP_ASKS[0].value}
        />
      </ChartVizCard>
    ),
  },
  {
    id: "scale",
    ask: "Asks people to rate from 1 to 5",
    question: "How sure were shoppers about the delivery date?",
    name: "1 to 5 scale",
    carbon: "lollipop chart, stems dropped",
    note: "Median score per group",
    target: ".dp-chart-dots__dot--focal",
    cut: "the same two groups, scored 1 to 5",
    pro: "Each dot is a group\u2019s median, with its people count beside it.",
    con: "A median hides how spread the scores are.",
    card: () => (
      <ChartVizCard title="How sure shoppers were about the delivery date, median score">
        <ChartDotPlot
          rows={[...CONFIDENCE]}
          max={5}
          ticks={[1, 2, 3, 4, 5]}
          formatTick={(n) => String(n)}
          gridAt={[1, 2, 3, 4, 5]}
          note="Each dot is a group’s median score. 1 = not sure, 5 = sure."
        />
      </ChartVizCard>
    ),
  },
];

function Reason({ t }: { t: Template }) {
  return (
    <div className="dlg-reason dlg-templates__reason">
      <p className="dlg-reason__row"><span className="dlg-reason__key dialogue-lib__mark" data-kind="pro" aria-hidden><Check size={16} weight="bold" /></span><span>{t.pro}</span></p>
      <p className="dlg-reason__row"><span className="dlg-reason__key dialogue-lib__mark" data-kind="con" aria-hidden><X size={16} weight="bold" /></span><span>{t.con}</span></p>
    </div>
  );
}
function TemplatePanel({ t, open, setOpen }: { t: Template; open: boolean; setOpen: (b: boolean) => void }) {
  return (
    <div className={`dialogue-product-root dp-chat-panel-typography dp-study-chat dlg-templates__panel ${dialogueProductFontClassName}`} data-template={t.id}>
      {t.card(open, setOpen)}
      {open && t.more ? t.more(setOpen) : null}
    </div>
  );
}

/** P16 (Mudit: "why?", cycling is mid): a direct picker. Every question type the AI matches is listed at once, each
 *  with its template name, and the chosen one shows its chart, Carbon source, pro and con. Explored and not kept: a 2x2
 *  grid of small multiples (cards clipped below their real width) and a full-size stack (four screens tall). */
function ChartTemplatesPicker() {
  const [sel, setSel] = useState(TEMPLATES[0].id);
  const [open, setOpen] = useState(false);
  const t = TEMPLATES.find((x) => x.id === sel) ?? TEMPLATES[0];
  return (
    <div className="dialogue-rachel-frame dialogue-rachel-frame--solution dlg-templates dlg-templates--picker">
      <div className="dlg-templates__list" role="radiogroup" aria-label="Question types">
        {TEMPLATES.map((x) => (
          <button key={x.id} type="button" role="radio" aria-checked={x.id === sel} className="dlg-templates__row" onClick={() => { setSel(x.id); setOpen(false); }}>
            <span className="dlg-templates__row-ask">{x.ask}</span>
            <span className="dlg-templates__row-name">{x.name}</span>
          </button>
        ))}
      </div>
      <div className="dlg-templates__side">
        <TemplatePanel t={t} open={open} setOpen={setOpen} />
        <p className="dlg-templates__carbon"><span>Adapted from IBM Carbon</span> {t.carbon}</p>
        <Reason t={t} />
      </div>
    </div>
  );
}

/* Round 8: the figure reads as one table. Each row is a question type, the chart it gets, the reason in one line, and
   the product's own chart card. The routing and the awkward shapes are short bands around it. Only the split chart
   keeps cherry (its 225 is the one encoding the whole page shares); the other three are neutral, and where a chart
   has a second group (By group, 1 to 5 scale) that group is teal (ramp C). */
function ChartFlow() {
  return (
    <div className="dlg-guide__block">
      <p className="dlg-guide__head dialogue-caption__label">How an answer reaches a chart, as concept</p>
      <p className="dlg-flow">The shape of the answer picks the template. A value with fewer than 3 people behind it gets a flag in place of a chart.</p>
    </div>
  );
}

/* Round 11 item 4: the awkward shapes are four small frames in the product's own card, tie first. Every frame is neutral:
   the figure already spends its one cherry on the split chart. The sentences are the page's existing captions. Counts that
   the page does not give stay visible placeholders. */
const OTHER_ASKS = TOP_ASKS.slice(3).reduce((n, r) => n + r.value, 0);

function EdgeFrame({ when, then, children }: { when: string; then: string; children: ReactNode }) {
  return (
    <div className="dlg-edge">
      <p className="dlg-edge__when">{when}</p>
      <div className={`dialogue-product-root dp-chat-panel-typography dlg-templates__panel dlg-mini dlg-edge__panel ${dialogueProductFontClassName}`} data-neutral="">
        {children}
      </div>
      <p className="dlg-edge__then">{then}</p>
    </div>
  );
}

function EdgeChip({ children, n }: { children: ReactNode; n?: number }) {
  return (
    <p className="dlg-edge__chip">
      <PlusIcon className="dlg-thin__chip-plus" />
      <span className="dlg-thin__chip-q">{children}</span>
      {n ? <span className="dlg-thin__chip-n" aria-hidden>{n}</span> : null}
    </p>
  );
}

function ChartEdges() {
  return (
    <div className="dlg-guide__block">
      <p className="dlg-guide__head dialogue-caption__label">When the shape is awkward</p>
      <div className="dlg-edges">
        <EdgeFrame when="Two values tie" then="No highlight, and the sentence says they tie.">
          <ChartVizCard title="Read ‘Arrives by Friday’ as this Friday">
            <ChartBarList
              rows={[
                { label: "Read it as this Friday", value: 1, display: "" },
                { label: "Unsure", value: 1, display: "" },
              ]}
              max={1}
              note={<>Both at <span className="dlg-ph">[PLACEHOLDER: tied count]</span></>}
            />
          </ChartVizCard>
        </EdgeFrame>
        <EdgeFrame when="Too many themes" then="The top rows show, and the rest roll into Other.">
          <ChartVizCard title="What shoppers asked for after checkout">
            <div className="dlg-edge__other">
              <ChartBarList
                rows={[
                  ...TOP_ASKS.slice(0, 3).map((r) => ({ label: r.label, value: r.value, display: `${r.value} of ${FRIDAY_TOTAL}` })),
                  { label: "Other", value: OTHER_ASKS, display: `${OTHER_ASKS} of ${FRIDAY_TOTAL}` },
                ]}
                max={TOP_ASKS[0].value}
              />
            </div>
          </ChartVizCard>
        </EdgeFrame>
        <EdgeFrame when="Nothing matches" then="The closest theme shows with its count, with a rephrase to try.">
          <ChartVizCard title="Closest theme">
            <ChartBarList
              rows={[{ label: TOP_ASKS[2].label, value: TOP_ASKS[2].value, display: `${TOP_ASKS[2].value} of ${FRIDAY_TOTAL}` }]}
              max={TOP_ASKS[0].value}
            />
          </ChartVizCard>
          <EdgeChip>What did shoppers ask for after checkout?</EdgeChip>
        </EdgeFrame>
        <EdgeFrame when="Two shapes in one answer" then="One chart leads, and the other becomes a follow-up.">
          <ChartVizCard title="225 of 300 shoppers read ‘Arrives by Friday’ as this Friday.">
            <ChartStackedBar lanes
              total={FRIDAY_TOTAL}
              segments={FRIDAY_ROWS.map((r) => ({ label: r.label === "Unsure" ? "Unsure" : "This Friday", value: r.count, display: `${r.count}`, focal: r.focal }))}
            />
          </ChartVizCard>
          <EdgeChip n={FIRST_GROUP_OF}>How did repeat shoppers read it?</EdgeChip>
        </EdgeFrame>
      </div>
    </div>
  );
}

function ChartMatches() {
  const [open, setOpen] = useState(false);
  return (
    <div className="dlg-matches" role="list">
      {TEMPLATES.map((t, i) => {
        const group = t.id === "group";
        const panel = (children: ReactNode, cls = "") => (
          <div className={`dialogue-product-root dp-chat-panel-typography dlg-templates__panel dlg-match__panel ${cls} ${dialogueProductFontClassName}`} data-neutral={i === 1 ? undefined : ""}>
            {children}
          </div>
        );
        return (
          <div key={t.id} className="dlg-match" role="listitem" data-template={t.id} data-pair={t.foil ? "" : undefined}>
            <div className="dlg-match__why">
              <p className="dlg-match__ask">{t.ask}</p>
              <p className="dlg-match__name"><ArrowRight size={14} weight="bold" aria-hidden />{t.name}</p>
              <p className="dlg-match__reason">{t.pro}</p>
            </div>
            <div className="dlg-match__chart">
              {t.foil ? (
                <div className="dlg-match__pair">
                  <div className="dlg-match__half">
                    <p className="dlg-match__tag">Ruled out: percents on one scale</p>
                    {panel(t.foil, "dlg-mini")}
                  </div>
                  <div className="dlg-match__half">
                    <p className="dlg-match__tag" data-kept>Kept: counts out of each group</p>
                    {panel(t.card(group && open, setOpen), "dlg-mini")}
                  </div>
                </div>
              ) : panel(t.card(false, setOpen))}
              {group && open && t.more ? panel(t.more(setOpen)) : null}
              <p className="dlg-match__carbon"><span>Cut: {t.cut}.</span> Adapted from Carbon&rsquo;s {t.carbon}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ChartTemplatesPairs({ layout }: { layout: "grid" | "stack" }) {
  return (
    <div className={`dialogue-rachel-frame dialogue-rachel-frame--solution dlg-templates dlg-templates--pairs dlg-templates--${layout}`}>
      <ChartFlow />
      <ChartMatches />
      <ChartEdges />
    </div>
  );
}

/* Round 11 item 3: the near-miss behind the thin flag. A bar for two people fills its track, so it reads as a finding.
   The total behind it is not on the page, so it stays a visible placeholder. Neutral, like every frame that is not the 225. */
function ThinNearMiss() {
  return (
    <StaticFigure figure="thin-bar" className="dlg-thin-miss">
      <div className={`dialogue-product-root dp-chat-panel-typography dlg-templates__panel dlg-mini dlg-edge__panel ${dialogueProductFontClassName}`} data-neutral="">
        <ChartVizCard title="Two shoppers missed a delivery after reading it as this Friday.">
          <ChartBarList
            rows={[{ label: "Missed a delivery", value: 2, display: "2", focal: true }]}
            max={2}
            note={<>Out of <span className="dlg-ph">[PLACEHOLDER: total behind this bar]</span></>}
          />
        </ChartVizCard>
      </div>
    </StaticFigure>
  );
}

/* Round 13: the two standard two-bar charts tried before the single bar, drawn in the 448px panel with the page's 225 and 75.
   Neutral, because the kept bar beside them (the take) carries the one cherry. */
function CountsExplored() {
  const rows = FRIDAY_ROWS.map((r) => ({ label: r.label, value: r.count, display: String(r.count), focal: r.focal }));
  const panel = (children: ReactNode) => (
    <div className={`dialogue-product-root dp-chat-panel-typography dlg-templates__panel dlg-mini dlg-edge__panel ${dialogueProductFontClassName}`} data-neutral="">
      <ChartVizCard title="Read ‘Arrives by Friday’ as this Friday">{children}</ChartVizCard>
    </div>
  );
  const note = `Out of ${FRIDAY_TOTAL} shoppers`;
  return (
    <StaticFigure figure="counts-explored" className="dlg-thin-miss dlg-counts-x">
      <div className="dlg-match__half">
        <p className="dlg-match__tag">Two bars, side by side</p>
        {panel(<ChartBarList vertical rows={rows} max={FRIDAY_TOTAL} note={note} />)}
      </div>
      <div className="dlg-match__half">
        <p className="dlg-match__tag">Two bars, stacked</p>
        {panel(<ChartBarList rows={rows} max={FRIDAY_TOTAL} note={note} />)}
      </div>
    </StaticFigure>
  );
}

export type TemplatesLayout = "picker" | "grid" | "stack";
export function ChartTemplates({ layout = "stack" }: { layout?: TemplatesLayout }) {
  return layout === "picker" ? <ChartTemplatesPicker /> : <ChartTemplatesPairs layout={layout} />;
}

export default function DialogueChartLibrary({
  showTech = true,
  segmentsFirst = false,
  only,
  scenarios = false,
  templates = false,
  thinNearMiss = false,
  countsExplored = false,
}: {
  /** P15: the merged chart-templates figure (replaces the bars video and the specimen list on the page). */
  templates?: boolean;
  /** Round 11: the two-person bar the thin flag replaces. */
  thinNearMiss?: boolean;
  /** Round 13: the two standard two-bar charts explored before the single bar. */
  countsExplored?: boolean;
  showTech?: boolean;
  segmentsFirst?: boolean;
  only?: "segments" | "coverage";
  /** P14 item 10: also render the extra Hearthside scenario cards. */
  scenarios?: boolean;
}) {
  if (templates) return <ChartTemplates />;
  if (thinNearMiss) return <ThinNearMiss />;
  if (countsExplored) return <CountsExplored />;
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
