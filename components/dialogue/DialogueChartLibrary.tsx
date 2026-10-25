"use client";

import type { ReactNode } from "react";
import VerdictMark from "@/components/case-study/VerdictMark";
import StaticFigure from "@/components/dialogue/StaticFigure";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartDotPlot from "@/components/dialogue/product/chart/ChartDotPlot";
import ChartLinePlot from "@/components/dialogue/product/chart/ChartLinePlot";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import {
  formatChartDecimal,
  formatChartPercent,
} from "@/components/dialogue/product/chart/chartSpec";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import {
  CHECKOUT_FUNNEL,
  SEGMENT_ADDRESS,
  SENTIMENT_LINE,
} from "@/lib/dialogue/product/sampleData";

const STEPS = CHECKOUT_FUNNEL.steps.slice(0, 4);
const GROUPS = SEGMENT_ADDRESS.rows;
const ROUNDS = SENTIMENT_LINE.points;

type Points = { pros: readonly string[]; cons: readonly string[] };

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
          <li key={t}><VerdictMark kind="pro" />{t}</li>
        ))}
        {points.cons.map((t) => (
          <li key={t}><VerdictMark kind="con" />{t}</li>
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

/** Round K worked example. Every number in this block is mock data from a
    mock study, marked as mock in the figure itself. */
const MOCK_THEMES = [
  { theme: "Could not find the invite link", participants: 13, clips: 21 },
  { theme: "First task was unclear", participants: 9, clips: 14 },
  { theme: "Settings hard to reach", participants: 6, clips: 9 },
  { theme: "Wanted a starting template", participants: 4, clips: 6 },
] as const;
const MOCK_TOTAL = 20;

function WorkedExample() {
  return (
    <div className="dp-worked">
      <div className="dp-worked__prompt">
        <span className="dp-worked__prompt-label">Prompt, as typed</span>
        <p className="dp-worked__bubble">What slowed people down in their first session?</p>
      </div>
      <div className="dp-worked__data">
        <span className="dp-worked__mock-tag">Mock data</span>
        <table className="dp-worked__table">
          <thead>
            <tr>
              <th scope="col">Theme</th>
              <th scope="col">Participants</th>
              <th scope="col">Clips</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_THEMES.map((row) => (
              <tr key={row.theme}>
                <td>{row.theme}</td>
                <td>
                  {row.participants} of {MOCK_TOTAL}
                </td>
                <td>{row.clips}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="dp-worked__data-note">Mock study: onboarding interviews, {MOCK_TOTAL} participants.</p>
      </div>
      <ChartVizCard title="The invite link slowed more people down than anything else">
        <ChartBarList
          rows={MOCK_THEMES.map((row, i) => ({
            label: row.theme,
            value: row.participants,
            display: `${row.participants} of ${MOCK_TOTAL}`,
            focal: i === 0,
          }))}
          max={MOCK_TOTAL}
          fillMode="magnitude"
        />
      </ChartVizCard>
    </div>
  );
}

/** One bar for a two-sided split: stone for the rest, cherry for the side the
    answer is about, split where the two sides meet. Counts in front of
    percents, denominator always in view. */
function DivergingSplit() {
  return (
    <div className="dp-diverge">
      <div className="dp-diverge__labels">
        <span className="dp-diverge__label dp-diverge__label--rest">Did not, 6 of 24, 25%</span>
        <span className="dp-diverge__label dp-diverge__label--focal">Raised it, 18 of 24, 75%</span>
      </div>
      <div className="dp-diverge__bar" role="img" aria-label="18 of 24 participants raised address friction, 6 did not">
        <span className="dp-diverge__seg dp-diverge__seg--rest" style={{ width: "25%" }} />
        <span className="dp-diverge__seg dp-diverge__seg--focal" style={{ width: "75%" }} />
      </div>
      <p className="dp-diverge__note">Split of all 24 interviews in the checkout study</p>
    </div>
  );
}

type Entry = {
  id: string;
  name: string;
  verdict: string;
  tech: readonly (readonly [string, string])[];
  caption: string;
  badName?: string;
  badPoints?: Points;
  bad?: ReactNode;
  goodName?: string;
  goodPoints?: Points;
  good?: ReactNode;
  singleName?: string;
  singlePoints?: Points;
  single?: ReactNode;
};

const ENTRIES: Entry[] = [
  {
    id: "themes",
    name: "Themes by participants",
    singleName: "Worked example",
    singlePoints: {
      pros: [
        "Counts of participants, sorted, are the first read of a study",
        "Every bar traces back to its quotes and clips",
      ],
      cons: ["A count says how many raised it, not how much it mattered"],
    },
    verdict: "The default chart: what came up, counted by the participants who raised it.",
    tech: [
      ["Data shape", "themes from one study, counted by participant."],
      ["Encoding", "sorted horizontal bars, counts on the marks, the denominator in every label."],
      ["Tradeoff", "a theme under 3 participants is an anecdote, and the answer flags it as a lead."],
    ],
    caption:
      "One question, run through the default: the prompt as it was typed, the data behind it, and the chart the answer carries. The study in this example is a mock study, and its numbers are marked as mock wherever they appear.",
    single: <WorkedExample />,
  },
  {
    id: "dropoff",
    name: "Drop-off between steps",
    singleName: "Simplified",
    singlePoints: {"pros": ["One bar per step, read straight off its length", "One cherry bar marks the step that matters"], "cons": ["Mobile and the size of each drop are not shown"]},
    verdict: "A funnel is kept only when the answer is about a task flow. Checkout is one, so this funnel stays.",
    tech: [
      ["Data shape", "ordered steps, share still in flow."],
      ["Encoding", "length on a zero baseline, direct labels on every bar."],
      ["Tradeoff", "says nothing about themes; a theme question gets the bars above instead."],
    ],
    caption:
      "The fuller first draft (two series, a legend, gridlines, a drop figure on every step) is out of the library: it showed everything and pointed at nothing. What ships is one bar per step, with the Address bar in cherry because it is the largest drop and the reader should find it first.",
    single: (
      <ChartVizCard title="Drop-off by step">
        <ChartBarList rows={STEP_ROWS} max={100} fillMode="index" />
      </ChartVizCard>
    ),
  },
  {
    id: "groups",
    badName: "Full detail",
    badPoints: {"pros": ["A gridline every 20% makes exact values easy to read", "Each row shows its gap to Mobile"], "cons": ["Dense for three groups"]},
    goodName: "Simplified",
    goodPoints: {"pros": ["Dots sit on one shared scale, so gaps read as distance", "One line sums it up: Mobile is about twice Desktop"], "cons": ["Exact gaps are not printed"]},
    name: "Comparing groups",
    verdict: "To compare groups, put each group on one shared axis and let the gap read as distance.",
    tech: [
      ["Data shape", "one rate per group."],
      ["Encoding", "position on a zero-based axis, one dot per group."],
      ["Tradeoff", "no view of spread inside a group; for participant-level splits, a participant by theme matrix is the clearer form."],
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
    badPoints: {"pros": ["The change between versions is printed"], "cons": ["The shaded area and extra axis steps add noise"]},
    goodName: "Simplified",
    goodPoints: {"pros": ["Both ends are labeled", "A marker shows the moment autocomplete shipped"], "cons": ["The middle value is not shown"]},
    name: "Change over time",
    verdict: "A line shows the climb, and one marker says what caused it.",
    tech: [
      ["Data shape", "one score per version, in order."],
      ["Encoding", "slope shows direction; height on a shared axis shows size."],
      ["Tradeoff", "needs three or more versions."],
    ],
    caption:
      "Removed the shaded area, the extra axis steps and the printed change between versions. Kept both ends labeled and the marker where autocomplete ships, because that event explains the climb.",
    bad: (
      <ChartVizCard title="Sentiment over time">
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
      <ChartVizCard title="Sentiment over time">
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
    name: "Who raised it, and who did not",
    singleName: "Combined",
    singlePoints: {"pros": ["Counts first: 18 of 24 and 6 of 24, percents second", "Both sides of the split in one bar"], "cons": ["Says nothing about how strong each quote is"]},
    verdict: "One bar for the split: who raised the point, and who did not.",
    tech: [
      ["Data shape", "interviews that mention it, out of 24."],
      ["Encoding", "one bar split where the two sides meet, cherry for the side the answer is about, stone for the rest."],
      ["Tradeoff", "shows the divide, not the reasons behind it."],
    ],
    caption:
      "The pair this replaces showed the same split twice, once with a legend and an axis, once without. Combined into one bar: 75% of the set raised address friction and 25% did not, with the counts kept in front of the percents.",
    single: (
      <ChartVizCard title="Address friction">
        <DivergingSplit />
      </ChartVizCard>
    ),
  },
];

export default function DialogueChartLibrary() {
  return (
    <div className="dialogue-lib">
      {ENTRIES.map((entry) => (
        <article key={entry.id} className="dialogue-lib__entry">
          <h3 className="dialogue-lib__name">{entry.name}</h3>
          {entry.single ? (
            <div className="dialogue-lib__single">
              <Specimen entryId={entry.id} status="chosen" name={entry.singleName!} points={entry.singlePoints!}>
                {entry.single}
              </Specimen>
            </div>
          ) : (
            <div className="dialogue-lib__pair">
              <Specimen entryId={entry.id} status="ruled-out" name={entry.badName!} points={entry.badPoints!}>
                {entry.bad}
              </Specimen>
              <Specimen entryId={entry.id} status="chosen" name={entry.goodName!} points={entry.goodPoints!}>
                {entry.good}
              </Specimen>
            </div>
          )}
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
