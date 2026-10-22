# Dialogue chart system (t385)

Asks covered: DLG-05, DLG-18

Charts are a Dialogue product feature. They must follow a **credible, documented data-viz system**, not ad-hoc styling.

**Primary source:** [IBM Carbon — Data visualization](https://carbondesignsystem.com/data-visualization/axes-and-labels/)  
([axes & labels](https://carbondesignsystem.com/data-visualization/axes-and-labels/), [legends](https://carbondesignsystem.com/data-visualization/legends/), [color palettes](https://carbondesignsystem.com/data-visualization/color-palettes/), [IBM Design Language — viz basics](https://www.ibm.com/design/language/data-visualization/design/basics/)).  
**Also cited:** Material Design data-viz (direct labeling, sparse gridlines); Atlassian Design (tabular numerals, right-aligned values).

**Dialogue binding:** type roles from t384 (`design/briefs/dialogue-ds-tokens.md`). Chart type was **not** in the live measured response; we use Dialogue’s small role for labels.

Code source of truth: `components/dialogue/product/chart/chartSpec.ts` (imported by all chart primitives).

---

## 1. Text roles (Dialogue tokens)

| Role | Token | Use |
|------|-------|-----|
| **Chart label** | `12 / 400 / 16` · `#57534d` (muted) | Category labels, axis tick labels, chart title inside viz card, legend/caption |
| **Chart value** | `12 / 400 / 16` · `#1c1917` (ink) · `font-variant-numeric: tabular-nums` · **right-aligned** | Percents, counts, point values |
| Focal value | same metrics · weight **600** · color cherry `#b43f7f` | Single highlighted datum only |

Do **not** use assistant-body 14/24 or header 14/20 inside the plot. Insight sentences above the chart stay assistant-body; the plot itself is chart roles only.

---

## 2. Color (Carbon categorical + Dialogue brand)

Carbon: prefer a short categorical sequence; use a **monochromatic / sequential** ramp for magnitude; reserve a strong accent for emphasis.  
Dialogue mapping:

| Role | Token |
|------|-------|
| Focal datum | **ONE** cherry accent `#b43f7f` (`--dp-chart-focal`) |
| Neutral stone ramp (non-focal bars, light → mid) | `#e7e5e4` → `#d6d3d1` → `#a8a29e` → `#78716c` → `#57534d` |
| Track / plot well | `#f1eeea` (warm) |
| Gridline | `#e7e5e4` at 60% opacity |
| Baseline / axis rule | `#e7e5e4` solid 1px |
| Line (single series) | Cherry when the series *is* the finding; else stone-600 `#57534d` with cherry on the peak/focal point only |

**Rule:** at most **one** cherry-colored mark per chart (one bar, one point, or the whole single-series line when every point is equally “the series”). Prefer cherry on the **focal** datum and stone on the rest (matches Carbon “deliberate hits of color with rich neutrals”).

---

## 3. Horizontal bars (funnel, distribution, quote frequency, segment)

Grounded in Carbon bar guidance: **numeric axis starts at zero**; default bar thickness capped (~**16px** max in Carbon Charts); prefer **direct labels** over a legend.

| Property | Value |
|----------|-------|
| Bar thickness (track height) | **8px** (within Carbon ≤16px max) |
| Track radius | 2px |
| Gap between bar rows | **10px** |
| Label column | **110px**, right-aligned, chart-label role, wrap allowed |
| Value column | **40px**, right-aligned, tabular chart-value role |
| Gutter label→track | 8px |
| Gutter track→value | 8px |
| Scale | Always **0 → max** (zero baseline). Width % of max category |
| Min chart width | **240px** |
| Max chart width | **100%** of viz-card content (~360px in 448 panel) |

Focal bar: cherry fill + focal value styling. Other bars: stone ramp by index or by descending magnitude (document choice per chart in the compliance table).

---

## 4. Line / trend / timeline

Carbon: line charts may crop the Y domain to show trend; **do not** interpolate gaps; keep increments consistent; prefer direct point labels when space allows; legends only if a single caption cannot name the series.

| Property | Value |
|----------|-------|
| Stroke width | **1.5px** |
| Dot radius | **3px** (focal peak **3.5px**) |
| Plot padding | 28px left (Y ticks) / 12px right / 20px top / 28px bottom |
| Y ticks | 3–4 max; chart-label role; optional |
| X labels | chart-label role, under baseline |
| Point values | chart-value role, above dots (omit if collision) |
| Gridlines | horizontal only, at Y ticks, 1px gridline color; **no** full cage |
| Baseline | 1px bottom axis rule |
| Y domain | Trend: pad ±10% of data range (Carbon: cropping OK for lines). Counts/timeline: start at **0** |
| Intrinsic SVG width | **320px** user units (= CSS px at 1:1); `max-width: 100%` — prevents axis type from upscaling past 12px |

---

## 5. Theme ranking

Not a geometric bar chart in product copy, but still a **ranked magnitude list**. Use chart-label for name, chart-value for count; rank index in cherry only for #1 (single accent); others stone-600.

| Property | Value |
|----------|-------|
| Row gap | 10px |
| Rank column | 16px, tabular |
| Count | right-aligned tabular (“18”) — unit word in caption, not every row |

---

## 6. Legend / caption / title

Carbon + IBM DL: **title states the insight**; prefer direct labels; legend only when needed.

| Element | Placement | Role |
|---------|-----------|------|
| Chart title | Top of viz card, above plot | chart-label |
| Series caption / legend | **Below** plot (never beside) | chart-label |
| Footnote (“Based on 24…”) | Below caption | chart-label |
| Insight summary | Outside viz card (assistant body) | assistant-body 14/24 |

Single-series charts: caption under plot replaces a color legend.

---

## 7. Number formatting

| Kind | Format |
|------|--------|
| Percents | `62%` (no space); right-aligned |
| Counts | integer, no thousands sep under 1000 |
| Decimals (sentiment) | one decimal (`3.6`) |
| Alignment | values column / SVG value anchors: end/right |
| Tabular nums | always on values |

---

## 8. Primitives (implementation)

All gallery charts compose these only:

| Primitive | File | Used by |
|-----------|------|---------|
| `chartSpec` | `chart/chartSpec.ts` | everyone |
| `ChartVizCard` | `chart/ChartVizCard.tsx` | framed plots |
| `ChartBarList` | `chart/ChartBarList.tsx` | funnel, segment, distribution, quote-freq, coverage companion |
| `ChartLinePlot` | `chart/ChartLinePlot.tsx` | trend, timeline |
| `ChartRankList` | `chart/ChartRankList.tsx` | theme ranking |

No chart may hard-code bar colors, label font sizes, or stroke widths outside `chartSpec`.

---

## 9. Gallery compliance checklist

For each of the 8 cards, verify: label role · value role · zero baseline (bars) · ≤1 cherry accent · bar 8 / gap 10 · line 1.5 / dot 3 · caption below · min width.
