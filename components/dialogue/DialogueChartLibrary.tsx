"use client";

import type { ReactNode } from "react";
import { Check, Minus } from "@phosphor-icons/react/dist/ssr";
import StaticFigure from "@/components/dialogue/StaticFigure";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartDotPlot from "@/components/dialogue/product/chart/ChartDotPlot";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import { formatChartPercent } from "@/components/dialogue/product/chart/chartSpec";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import {
  ADDRESS_FOLLOWUP,
  QUOTE_LIST,
  SEGMENT_ADDRESS,
} from "@/lib/dialogue/product/sampleData";

const GROUPS = SEGMENT_ADDRESS.rows;

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

/** Worked example. Every number in this block is mock data from a mock
    study of 15 participants, marked as mock in the figure itself. Round L
    set the study size to 15 so its counts read "N of 15", the form the
    answer uses. */
const MOCK_THEMES = [
  { theme: "Could not find the invite link", short: "Invite link", participants: 10, clips: 16 },
  { theme: "First task was unclear", short: "First task", participants: 7, clips: 11 },
  { theme: "Settings hard to reach", short: "Settings", participants: 5, clips: 7 },
  { theme: "Wanted a starting template", short: "Template", participants: 3, clips: 5 },
] as const;
const MOCK_TOTAL = 15;

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

/** The mock study's coding, person by person. Filled sets are chosen so each
    column adds up to the theme counts the bars above show. */
const MATRIX_FILLED: readonly (readonly number[])[] = [
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  [1, 2, 3, 5, 6, 8, 11],
  [2, 4, 6, 9, 12],
  [1, 7, 13],
];

function ThemeMatrix() {
  const people = Array.from({ length: MOCK_TOTAL }, (_, i) => i + 1);
  return (
    <div className="dp-matrix">
      <span className="dp-worked__mock-tag">Mock data</span>
      <table className="dp-matrix__table">
        <thead>
          <tr>
            <th scope="col">
              <span className="dp-matrix__corner">Participant</span>
            </th>
            {MOCK_THEMES.map((t) => (
              <th key={t.theme} scope="col">
                {t.short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {people.map((p) => (
            <tr key={p}>
              <th scope="row">P{p}</th>
              {MOCK_THEMES.map((t, ci) => (
                <td key={t.theme}>
                  {MATRIX_FILLED[ci]!.includes(p) ? (
                    <span
                      className={
                        ci === 0 ? "dp-matrix__cell dp-matrix__cell--focal" : "dp-matrix__cell"
                      }
                    />
                  ) : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">Raised it</th>
            {MOCK_THEMES.map((t) => (
              <td key={t.theme}>
                {t.participants} of {MOCK_TOTAL}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
      <p className="dp-matrix__note">
        The same mock study as the themes chart above: onboarding interviews, {MOCK_TOTAL}{" "}
        participants.
      </p>
    </div>
  );
}

/** Sentiment as a split, not a score: the frustrated count grows left from
    the center line, the happy count grows right, and the mixed count is
    named under the axis instead of being averaged in. Mock data. */
const MOCK_SENTIMENT = { frustrated: 9, mixed: 4, happy: 2 } as const;

function SentimentSplit() {
  const side = (n: number) => `${(n / MOCK_TOTAL) * 100}%`;
  return (
    <div className="dp-sentiment">
      <span className="dp-worked__mock-tag">Mock data</span>
      <div className="dp-sentiment__labels">
        <span className="dp-sentiment__label">Frustrated, {MOCK_SENTIMENT.frustrated} of {MOCK_TOTAL}</span>
        <span className="dp-sentiment__label dp-sentiment__label--focal">Happy, {MOCK_SENTIMENT.happy} of {MOCK_TOTAL}</span>
      </div>
      <div
        className="dp-sentiment__track"
        role="img"
        aria-label={`Frustrated ${MOCK_SENTIMENT.frustrated} of ${MOCK_TOTAL}, mixed ${MOCK_SENTIMENT.mixed} of ${MOCK_TOTAL}, happy ${MOCK_SENTIMENT.happy} of ${MOCK_TOTAL}`}
      >
        <span className="dp-sentiment__half dp-sentiment__half--left">
          <span className="dp-sentiment__bar dp-sentiment__bar--rest" style={{ width: side(MOCK_SENTIMENT.frustrated) }} />
        </span>
        <span className="dp-sentiment__axis" aria-hidden />
        <span className="dp-sentiment__half">
          <span className="dp-sentiment__bar dp-sentiment__bar--focal" style={{ width: side(MOCK_SENTIMENT.happy) }} />
        </span>
      </div>
      <p className="dp-sentiment__note">
        Mixed, {MOCK_SENTIMENT.mixed} of {MOCK_TOTAL}, sits on the center line and is counted in
        neither bar.
      </p>
    </div>
  );
}

/** The address bar with its evidence open: the study's real quotes and the
    clips behind the count, in place under the bar. */
function EvidenceBars() {
  return (
    <ChartVizCard title="Address friction, with its evidence open">
      <ChartBarList
        rows={[
          {
            label: "Raised address friction",
            value: 18,
            display: "18 of 24",
            focal: true,
          },
        ]}
        max={24}
        fillMode="magnitude"
      />
      <div className="dp-evidence">
        <p className="dp-evidence__label">Quotes behind the count</p>
        {QUOTE_LIST.map((q) => (
          <p key={q.participant} className="dp-evidence__quote">
            <span className="dp-evidence__name">{q.participant}</span>
            {q.quote}
          </p>
        ))}
        <p className="dp-evidence__label">Clips behind the count</p>
        <div className="dp-evidence__clips">
          {ADDRESS_FOLLOWUP.clips.map((clip) => (
            <span key={clip.id} className="dp-evidence__chip">
              {clip.participant} · {clip.segment}
            </span>
          ))}
        </div>
      </div>
    </ChartVizCard>
  );
}

type Entry = {
  id: string;
  name: string;
  verdict: string;
  why: string;
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

const PLAIN_TECH = {
  themes: [
    ["What goes in", "the themes from one study, with one count per theme: how many participants raised it."],
    ["How it reads", "horizontal bars sorted biggest first, the count written on each bar, and the study size inside every count."],
    ["Where it falls short", "a count says how many people raised a theme, not how much it mattered to them."],
  ],
  coverage: [
    ["What goes in", "the interviews that mention a point, out of the 24 in the study."],
    ["How it reads", "one bar split where the two sides meet, cherry for the side the answer is about and stone for the rest."],
    ["Where it falls short", "it shows the divide and nothing about the reasons behind it."],
  ],
  groups: [
    ["What goes in", "one rate per group: how often autocomplete reset a saved address on each device."],
    ["How it reads", "one dot per group on a single scale that starts at zero, so the gap between dots is the gap between groups."],
    ["Where it falls short", "it hides how people spread out inside a group. The matrix below shows that person by person."],
  ],
  matrix: [
    ["What goes in", "one row per participant and one column per theme, coded from what each person said."],
    ["How it reads", "a filled square means that participant raised that theme, and the footer repeats the count each column adds up to."],
    ["Where it falls short", "it shows who raised a theme, not how strongly they felt it. The quotes carry that."],
  ],
  sentiment: [
    ["What goes in", "how the mock study's participants felt about their first session, counted on each side."],
    ["How it reads", "two bars grow out of one center line, frustrated to the left and happy to the right, each with its count written out."],
    ["Where it falls short", "it is a snapshot of one question. It says nothing about how feelings move, and it is not averaged into a score."],
  ],
  evidence: [
    ["What goes in", "the same kind of bar as the themes chart, drawn over the checkout study's real counts."],
    ["How it reads", "the bar opens in place, and the quotes and clips behind its count sit directly under it."],
    ["Where it falls short", "the evidence proves the count. The summary sentence above the chart still has to earn its wording."],
  ],
} as const;

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
    why: "Why it is here: NN/g's reporting guidance is to give the count itself, \u201c1 out of the 6 participants,\u201d not a percent, and MeasuringU makes the same point for small samples: raw numbers let a reader judge how common a theme really was.",
    tech: PLAIN_TECH.themes,
    caption:
      "One question, run through the default: the prompt as it was typed, the data behind it, and the chart the answer carries. The study in this example is a mock study, and its numbers are marked as mock wherever they appear.",
    single: <WorkedExample />,
  },
  {
    id: "coverage",
    name: "Who raised it, and who did not",
    singleName: "Combined",
    singlePoints: {"pros": ["Counts first: 18 of 24 and 6 of 24, percents second", "Both sides of the split in one bar"], "cons": ["Says nothing about how strong each quote is"]},
    verdict: "One bar for the split: who raised the point, and who did not.",
    why: "Why it is here: the count comes before the percent, so a reader sees 18 of 24 before they see 75% and can weigh the study size for themselves.",
    tech: PLAIN_TECH.coverage,
    caption:
      "The pair this replaces showed the same split twice, once with a legend and an axis, once without. Combined into one bar: 18 of 24 raised address friction and 6 of 24 did not, with the counts kept in front of the percents.",
    single: (
      <ChartVizCard title="Address friction">
        <DivergingSplit />
      </ChartVizCard>
    ),
  },
  {
    id: "groups",
    name: "Comparing groups",
    singleName: "One shared scale",
    singlePoints: {"pros": ["Dots sit on one shared scale, so gaps read as distance", "One line sums it up: Mobile is about twice Desktop"], "cons": ["Exact gaps are not printed"]},
    verdict: "To compare groups, put each group on one shared axis and let the gap read as distance.",
    why: "Why it is here: a segment comparison only reads honestly when every group sits on the same scale, so the distance between the dots is the difference itself.",
    tech: PLAIN_TECH.groups,
    caption:
      "Groups get dots because the comparison is the point here, and dots on one scale make it without a legend or a second series. Bars return in the matrix below, where the unit is a person instead of a rate.",
    single: (
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
    id: "matrix",
    name: "Participant by theme matrix",
    singleName: "The coding, visible",
    singlePoints: {
      pros: ["Every theme count can be checked against the people behind it", "A theme carried by two people reads differently from one carried by ten"],
      cons: ["It takes more room than the bars it backs up"],
    },
    verdict: "The matrix sits behind the themes chart: the same counts, opened up person by person.",
    why: "Why it is here: NN/g describes thematic analysis as coding what people said and clustering the codes into themes. The matrix is that coding, left visible instead of hidden behind the totals.",
    tech: PLAIN_TECH.matrix,
    caption:
      "Each column adds up to the count on the matching bar of the themes chart, so the two views can be checked against each other. The first column is cherry because the invite link is the theme the answer leads with.",
    single: (
      <ChartVizCard title="Who raised which theme">
        <ThemeMatrix />
      </ChartVizCard>
    ),
  },
  {
    id: "sentiment",
    name: "Sentiment as a split",
    singleName: "Two ends, counted",
    singlePoints: {
      pros: ["Disagreement stays visible instead of averaging away", "Both ends carry their counts, so the split can be weighed"],
      cons: ["The mixed middle needs its own line, or it disappears"],
    },
    verdict: "Sentiment ships as a split with counts on both ends, never as one averaged score.",
    why: "Why it is here: an average would turn nine frustrated people and two happy ones into a single mild number. The split keeps both ends in view, counted.",
    tech: PLAIN_TECH.sentiment,
    caption:
      "Studies do not run in rounds, so there is no line of sentiment over time in this library. What a team needs from sentiment is the shape of the disagreement on one question, and that is a split.",
    single: (
      <ChartVizCard title="How the first session felt">
        <SentimentSplit />
      </ChartVizCard>
    ),
  },
  {
    id: "evidence",
    name: "Every bar opens its evidence",
    singleName: "The bar, opened",
    singlePoints: {
      pros: ["The quotes and clips behind a count are one tap away, in place", "A reader can check the count without leaving the answer"],
      cons: ["An opened bar takes room the answer may not have"],
    },
    verdict: "A rule, not a chart type: any bar in an answer can open the quotes and clips behind its count.",
    why: "Why it is here: User Interviews' State of User Research 2025 found 80% of researchers use AI in their work and 91% worry about accuracy and hallucinations. A bar that opens its own evidence is how an AI answer answers that worry.",
    tech: PLAIN_TECH.evidence,
    caption:
      "Shown with the checkout study's address bar, the strongest count in the study. The quotes and clips under it are the study's own, the same ones the answer card carries.",
    single: <EvidenceBars />,
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
          <p className="dialogue-lib__why" data-annotate-part={`why-${entry.id}`}>{entry.why}</p>
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
