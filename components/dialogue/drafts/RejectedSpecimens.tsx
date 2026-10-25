"use client";

/**
 * Restored chart variants removed from the case study library.
 * Isolated for the dashboard; do not mount these on /dialogue.
 */

import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartDotPlot from "@/components/dialogue/product/chart/ChartDotPlot";
import ChartGroupedBars from "@/components/dialogue/product/chart/ChartGroupedBars";
import ChartLinePlot from "@/components/dialogue/product/chart/ChartLinePlot";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import {
 formatChartCount,
 formatChartDecimal,
 formatChartPercent,
} from "@/components/dialogue/product/chart/chartSpec";
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
const TOTAL = COVERAGE_ADDRESS.rows.reduce((n, r) => n + r.count, 0);
const EVENT_LABEL = "Autocomplete ships";

const GAP_PTS = (label: string) => {
 const mobile = GROUPS[0]!.pct;
 const g = GROUPS.find((r) => r.label === label)!;
 return `${mobile - g.pct} pts`;
};

/** 826bc80: area bubbles for drop-off. Ruled out. */
export function DraftBubbles() {
 return (
 <ChartVizCard title="Drop-off by step">
 <div className="dlg-draft-bubbles">
 {STEPS.map((s) => (
 <div key={s.label} className="dlg-draft-bubbles__cell">
 <span
 className={["dlg-draft-bubbles__mark", s.focal ? "dlg-draft-bubbles__mark--focal" : ""]
 .filter(Boolean)
 .join(" ")}
 style={{
 width: `calc(24px + ${s.pct} * 0.56px)`,
 height: `calc(24px + ${s.pct} * 0.56px)`,
 }}
 >
 {formatChartPercent(s.pct)}
 </span>
 <span className="dlg-draft-bubbles__label">{s.label}</span>
 </div>
 ))}
 </div>
 </ChartVizCard>
 );
}

/** 826bc80: donut for group compare. Ruled out. */
export function DraftDonut() {
 const total = GROUPS.reduce((sum, g) => sum + g.pct, 0);
 const r = 40;
 const circ = 2 * Math.PI * r;
 let acc = 0;
 return (
 <ChartVizCard title={SEGMENT_ADDRESS.title}>
 <svg viewBox="0 0 280 128" className="dlg-draft-donut" role="img" aria-label="Donut chart of segment rates">
 {GROUPS.map((g) => {
 const frac = g.pct / total;
 const dash = frac * circ;
 const mid = (acc + frac / 2) * 2 * Math.PI - Math.PI / 2;
 const focal = "focal" in g && g.focal;
 const el = (
 <g key={g.label}>
 <circle
 cx={140}
 cy={64}
 r={r}
 fill="none"
 className={focal ? "dlg-draft-donut__arc--focal" : "dlg-draft-donut__arc"}
 strokeWidth={22}
 strokeDasharray={`${dash} ${circ - dash}`}
 strokeDashoffset={-acc * circ}
 transform="rotate(-90 140 64)"
 />
 <text
 x={140 + Math.cos(mid) * 62 + (Math.cos(mid) >= 0 ? 8 : -8)}
 y={64 + Math.sin(mid) * 62 + 4}
 textAnchor={Math.cos(mid) >= 0 ? "start" : "end"}
 className="dlg-draft-donut__label"
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

/** 826bc80: loose dots with no shared axis. Ruled out. */
export function DraftLooseDots() {
 return (
 <ChartVizCard title="Sentiment by version">
 <div className="dlg-draft-loose">
 {ROUNDS.map((p) => (
 <div key={p.label} className="dlg-draft-loose__cell">
 <span className="dlg-draft-loose__value">{formatChartDecimal(p.value)}</span>
 <span className="dlg-draft-loose__dot" />
 <span className="dlg-draft-loose__label">{p.label}</span>
 </div>
 ))}
 </div>
 </ChartVizCard>
 );
}

/**
 * Triangle and dots marker style: same values as the loose-dots reject,
 * with a triangle on the peak and dots on the rest. Restored as a specimen.
 */
export function DraftTriangleDots() {
 const peak = Math.max(...ROUNDS.map((p) => p.value));
 return (
 <ChartVizCard title="Sentiment by version">
 <div className="dlg-draft-loose">
 {ROUNDS.map((p) => {
 const focal = p.value === peak;
 return (
 <div key={p.label} className="dlg-draft-loose__cell">
 <span
 className={[
 "dlg-draft-loose__value",
 focal ? "dlg-draft-loose__value--focal" : "",
 ]
 .filter(Boolean)
 .join(" ")}
 >
 {formatChartDecimal(p.value)}
 </span>
 <span
 className={focal ? "dlg-draft-loose__tri" : "dlg-draft-loose__dot"}
 data-focal={focal ? "" : undefined}
 aria-hidden
 />
 <span className="dlg-draft-loose__label">{p.label}</span>
 </div>
 );
 })}
 </div>
 </ChartVizCard>
 );
}

/** 826bc80: mention total that hides coverage. Ruled out. */
export function DraftMentionTotal() {
 return (
 <ChartVizCard title="Address friction">
 <div className="dlg-draft-mention">
 <span className="dlg-draft-mention__bar" />
 <span className="dlg-draft-mention__value">31 mentions</span>
 </div>
 </ChartVizCard>
 );
}

/** r24 / b056865: dense two-series drop-off. Rejected from library (Oct 25). */
export function DraftDropoffFullDetail() {
 return (
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
 );
}

/** r20 to r24 stacked coverage with legend and ticks. */
export function DraftCoverageStackFull() {
 return (
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
 );
}

/** r20 to r24 simplified stacked coverage. Replaced by diverging split in round K. */
export function DraftCoverageStackSimple() {
 return (
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
 );
}

/** r21 c224a44: lead compare used a mini funnel as a dot plot. */
export function DraftLeadDotPlot() {
 const mini = CHECKOUT_FUNNEL.steps.slice(0, 3);
 return (
 <ChartVizCard title="Checkout funnel, % still in flow">
 <ChartDotPlot
 rows={mini.map((step) => ({
 label: step.label,
 value: step.pct,
 display: formatChartPercent(step.pct),
 focal: "focal" in step && step.focal,
 }))}
 max={100}
 />
 </ChartVizCard>
 );
}

/** r19 near-miss: legend instead of direct labels. */
export function DraftNearMissLegend() {
 return (
 <ChartVizCard title="Drop-off by step">
 <div className="dlg-draft-nearmiss">
 <ChartBarList
 rows={STEPS.map((s) => ({
 label: s.label,
 value: s.pct,
 display: formatChartPercent(s.pct),
 }))}
 max={100}
 fillMode="index"
 />
 <div className="dlg-draft-nearmiss__legend">
 {STEPS.map((s, i) => (
 <span key={s.label} className="dlg-draft-nearmiss__item">
 <span className="dlg-draft-nearmiss__swatch" data-ramp={i + 1} aria-hidden />
 {s.label}
 </span>
 ))}
 </div>
 <p className="dlg-draft-nearmiss__note">Legend instead of direct labels</p>
 </div>
 </ChartVizCard>
 );
}

/** r19 near-miss: truncated baseline. */
export function DraftNearMissBaseline() {
 const baseline = 20;
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
 fillMode="index"
 note={`Axis starts at ${baseline}% (truncated)`}
 />
 </ChartVizCard>
 );
}

/** Current library: groups full-detail pair left side. */
export function DraftGroupsFullDetail() {
 return (
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
 );
}

/** Current library: groups simplified. */
export function DraftGroupsSimplified() {
 return (
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
 );
}

/** Current library: trend full detail. */
export function DraftTrendFullDetail() {
 return (
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
 );
}

/** Current library: trend simplified. */
export function DraftTrendSimplified() {
 return (
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
 );
}

/** Current library / round K: drop-off simplified only. */
export function DraftDropoffSimplified() {
 return (
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
 );
}

/** Round K: combined coverage split. */
export function DraftCoverageDiverging() {
 return (
 <ChartVizCard title="Address friction">
 <div className="dlg-draft-diverge">
 <div className="dlg-draft-diverge__labels">
 <span className="dlg-draft-diverge__label">Did not, 6 of 24, 25%</span>
 <span className="dlg-draft-diverge__label dlg-draft-diverge__label--focal">
 Raised it, 18 of 24, 75%
 </span>
 </div>
 <div
 className="dlg-draft-diverge__bar"
 role="img"
 aria-label="18 of 24 participants raised address friction, 6 did not"
 >
 <span className="dlg-draft-diverge__seg dlg-draft-diverge__seg--rest" style={{ width: "25%" }} />
 <span className="dlg-draft-diverge__seg dlg-draft-diverge__seg--focal" style={{ width: "75%" }} />
 </div>
 <p className="dlg-draft-diverge__note">Split of all 24 interviews in the checkout study</p>
 </div>
 </ChartVizCard>
 );
}

/** Round K worked example: themes by participants. */
export function DraftThemesWorked() {
 const themes = [
 { theme: "Could not find the invite link", participants: 13 },
 { theme: "First task was unclear", participants: 9 },
 { theme: "Settings hard to reach", participants: 6 },
 { theme: "Wanted a starting template", participants: 4 },
 ];
 const total = 20;
 return (
 <ChartVizCard title="The invite link slowed more people down than anything else">
 <p className="dlg-draft-mock-tag">Mock data</p>
 <ChartBarList
 rows={themes.map((row, i) => ({
 label: row.theme,
 value: row.participants,
 display: `${row.participants} of ${total}`,
 focal: i === 0,
 }))}
 max={total}
 fillMode="magnitude"
 />
 </ChartVizCard>
 );
}

/** Product theme ranking card content. */
export function DraftThemeRank() {
 const themes = [
 { rank: 1, label: "Address validation", value: 17 },
 { rank: 2, label: "Unexpected fees", value: 13 },
 { rank: 3, label: "Payment retry", value: 10 },
 ];
 return (
 <ChartVizCard title="Top themes by interview count" caption="Counts across 24 checkout interviews">
 <ol className="dp-chart-root dp-chart-rank">
 {themes.map((row) => (
 <li key={row.label} className="dp-chart-rank__row">
 <span className={["dp-chart-rank__num", row.rank === 1 ? "dp-chart-rank__num--focal" : ""].filter(Boolean).join(" ")}>
 {row.rank}
 </span>
 <span className="dp-chart-rank__label">{row.label}</span>
 <span className="dp-chart-rank__value">{formatChartCount(row.value)}</span>
 </li>
 ))}
 </ol>
 </ChartVizCard>
 );
}

/** Product segment bar list. */
export function DraftSegmentBars() {
 return (
 <ChartVizCard title={SEGMENT_ADDRESS.title} caption={SEGMENT_ADDRESS.caption}>
 <ChartBarList
 rows={SEGMENT_ADDRESS.rows.map((row) => ({
 label: row.label,
 value: row.pct,
 display: formatChartPercent(row.pct),
 focal: "focal" in row && row.focal,
 }))}
 max={100}
 fillMode="index"
 />
 </ChartVizCard>
 );
}
