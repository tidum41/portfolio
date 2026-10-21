# Dialogue case study figure parity (t380 audit)

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
| G-2 | Rachel frames used unrelated lilac/blue/beige per section | Neutral `rgb(244,241,236)` for all figures; **problem/solution** tones kept only for labeled problem/solution pairs |
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
| C-5 | Gallery cells on blue-grey chart tone | `DialogueRachelFrame` **neutral** surface |

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

## Verification

- Prod build: `npm run build && npm run start -- -p 3020`
- Round 35 harness: `ROUND35_PORT=3020 node scripts/verify-dialogue-round35-sections.mjs`
- Round 36 parity PNGs: `ROUND36_PORT=3020 node scripts/capture-dialogue-round36-parity.mjs` → `/cursor/stores/self/round36/parity/`

## Out of scope (this branch)

- **Case study pager alignment** — measured on `review/case-nav` only (see agent report).
