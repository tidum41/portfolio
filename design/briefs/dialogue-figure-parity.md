# Dialogue case study figure parity (t380 audit)

Asks covered: DLG-04, DLG-12, DLG-19

**Rule:** `/dialogue` figures must **compose** approved product UI from `components/dialogue/product/` (and Paper/static export references), scaled responsively—never re-layout at arbitrary column widths.

**Reference anchors in git**

| Anchor | SHA / route | What it established |
|--------|-------------|---------------------|
| Approved chat graphics + placement | `fcc87a2` (Oct 19) | Bubble vs sidebar, study chrome |
| Paper recreations | `5bfaa4b` → removed; port `7d3ec33` | Static export HTML/CSS parity |
| In-tree product figures | `1f7e8c4` (Oct 21) | `components/dialogue/product/*`, scenarios D-01–D-15 |
| DS parity harness | `/dialogue/ds-parity`, `51819d6` | 392/400px chat slices for capture |
| Static export library | `public/dev/dialogue-static/export/visual-*` | Trend, theme, timeline, coverage cells |

---

## Drift register (pre–t380 fix)

### Global / chrome

| ID | Drift | Fix |
|----|-------|-----|
| G-1 | Figures interactive (hover/focus) in case study | `dialogue-product-block--static`: `pointer-events: none`, `user-select: none`, `aria-hidden` |
| G-2 | Rachel frames used lilac/blue-grey/beige outliers | **Three near-neutral stone surfaces** (~2–4% lightness steps), chunked by figure role (see below) |
| G-3 | Section labels inconsistent (13px, mixed color) | `12px/500` muted caption, `12px` spacing below label |
| G-4 | Chat panels stretched to ~900px content column | `ScaledChatViewport` at **392px** inner width, uniform `transform: scale()` |

### D-02 / D-04–D-06 — Lead with the answer

| ID | Drift | Fix |
|----|-------|-----|
| L-1 | Decision compare ~230px effective width, word-per-line wrap | `DialogueLeadAnswerCompare` + 392px scale, desktop `maxScale: 0.58` |
| L-2 | Unequal panel heights / no shared crop | Fixed crop **468px** + bottom fade on all three |
| L-3 | Missing format labels | Labels: Wall of text / Quotes only / Answer + evidence |
| L-4 | Mobile stacked without full-width scale | `<600px` vertical stack, each panel full column width |

### D-01 Hero

| ID | Drift | Fix |
|----|-------|-----|
| H-1 | Main chat column `min(420px, 48vw)` not 392 | `dp-hero-compose__main` locked to **392px** |
| H-2 | Compose not scaled as one unit in hero frame | `ScaledChatViewport` inner **726px** (392 + clips column) |

### D-08 Anatomy (1–5)

| ID | Drift | Fix |
|----|-------|-----|
| A-1 | Callout type scaled separately from chat card | Whole scene **562px** (122 + **48** gutter + 392) scaled together |
| A-2 | Numbers plain text, weak hierarchy | Cherry **18px** circle, `font-weight: 500` |
| A-3 | Clip thumbs unreadable | Real `still-thumb-*` with blur/saturate on `dp-clip-thumbs__img` |
| A-4 | No selected source → clip state | **Priya K. · 15:47** pill selected; thumb `15:47` focal |

### D-09 gallery — Trend, theme, quote freq, timeline, coverage

| ID | Drift | Fix |
|----|-------|-----|
| C-1 | Trend `LineChart` stretched; SVG labels looked oversized | 392px scaled shell (native chart component unchanged) |
| C-2 | Theme ranking ad-hoc `dp-quote-list` | `ThemeRankingCard` in `dp-viz-card` |
| C-3 | Quote frequency reused full answer figure | `QuoteFrequencyCard` (funnel row geometry) |
| C-4 | Coverage plain meta line | `CoverageCallout` + compact funnel |
| C-5 | Gallery cells on blue-grey chart tone | `DialogueRachelFrame` **system** surface |

### D-10 Clip player

| ID | Drift | Fix |
|----|-------|-----|
| P-1 | Transcript active row indented vs plain rows | `SyncedTranscript` rows: speaker + time, full-width active highlight |
| P-2 | Player still (prior fix) | Unchanged: blurred still + centered play |

### D-13 / D-14 Placement

| ID | Drift | Fix |
|----|-------|-----|
| PL-1 | Launcher `◐` placeholder | `DialogueLauncherButton` + `DialogueAsteriskIcon` (Paper `section-6`) |

### D-15 Full answer

| ID | Drift | Fix |
|----|-------|-----|
| F-1 | Drawer + answer not scaled as designed width | `ScaledChatViewport` **742px** inner |

### Typography

| ID | Drift | Fix |
|----|-------|-----|
| T-1 | `38%` emphasis at `font-weight: 600` | `dp-summary__emph` → **500** (Dialogue token) |

---

## Figure surface system (item 7 — Rachel Chen reference)

**Reference:** [Rachel Chen — 1Password](https://www.rachelchen.tech/projects/1password) chunks figure wells with `bg-surface-muted` (~**4%** `color-mix` of `#32404f` on white, ≈ **10%** apparent fill). Dialogue uses the same idea on **warm stone**: three tokens, no hue outliers.

| Token | Hex | Role (~L vs white) |
|-------|-----|---------------------|
| `--dp-figure-surface-system` | `#f5f5f4` | Structure, charts, anatomy, hero well, gallery |
| `--dp-figure-surface-problem` | `#efeeed` | Problem framing, rejected alternatives |
| `--dp-figure-surface-solution` | `#f8f7f6` | Solution framing, chosen pattern |

**Per-figure map (case study)**

| Asset / block | Surface |
|---------------|---------|
| D-01 Hero (`cs-hero-media-frame`) | system |
| D-02 Problem paragraphs | problem |
| D-04 Wall of text (decision) | problem |
| D-05 Quotes only (decision) | problem |
| D-06 Answer + evidence (decision, chosen) | solution |
| D-08 Anatomy (1–5) | system |
| D-09 Gallery (all variants) | system |
| D-10 Clip player (`Solution:` label) | solution |
| D-13 Placement docked sidebar | problem |
| D-14 Placement floating bubble | solution |
| D-15 Full answer drawer (`Solution:` label) | solution |

CSS: `dialogue-rachel-frame--{system|problem|solution}` in `app/globals.css`; tokens duplicated in `components/dialogue/product/tokens.css` for product roots.

---

## Verification

- Prod build: `npm run build && npm run start -- -p 3020`
- Round 35 harness: `ROUND35_PORT=3020 node scripts/verify-dialogue-round35-sections.mjs`
- Round 36 parity PNGs: `ROUND36_PORT=3020 node scripts/capture-dialogue-round36-parity.mjs` → `/cursor/stores/self/round36/parity/`

## Out of scope (this branch)

- **Case study pager alignment** — measured on `review/case-nav` only (see agent report).
