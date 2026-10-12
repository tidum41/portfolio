# Round 5 — Issues now / clutter removed / why

For Mudit. Goal: **less but better**.

## Issues now (fixed)

| # | Issue | Fix |
| --- | --- | --- |
| 1 | Font looked off / money felt like another face | Verified `document.fonts.check` 400+500; forced `font-family` on totals; title 24px (not 30); same family + tnum |
| 2 | Sidebar icons vs labels | Lucide-style 24-viewBox, **16px** glyph in **16px** slot, **8px** gap, row 32, active padding = hover |
| 3 | Wholesale dot spacing | Replaced with a small **Wholesale** text chip under the logo |
| 4 | Footer Ready / chip / total awkward | Label → total stack (4px gap); dropped “Not in cart yet” chip |
| 5 | Account chip spacing | 8pt grid: gap 8, logo 24, name 13/14 + role 12/12; height matched to Cart |
| 6 | “E” initial | Real Engage mark (`engage-logo.png` from engagepickleball.com) |
| 7 | Search SKU-only | Default query **Perseus**; live results = name · SKU · price |
| 8 | Too many presets | Max **3**, category-aware: paddles 6/12/24, balls 12/48/100, bags 1/3/6 |
| 9 | No way back to DTC | Quiet sidebar footer: `Shop joola.com ↗` |

## Clutter removed

| Removed / merged | Why |
| --- | --- |
| Templates + Reorder → one **Reorder** rail | Two rails competed with the main task |
| QO lede + “Lines” heading | Redundant with the h1 and table head |
| Sidebar credit block | Credit once, in cart summary (where it matters) |
| “In stock” on every row | Keep SKU; show availability only when *not* in stock |
| Ready-chip in footer | Chip fought the total; stack is enough |
| Extra type sizes (10/11/17/19/28…) | Tight scale: **12 / 13 / 14 / 24**, weights 400/500, greys ink/muted/faint |
| “Save as template” beside Add all | Competed with the primary CTA |
| Cart lede | Same filler already cut from Quick Order |

## Kept on purpose (subtraction critic disagreed)

| Kept | Why |
| --- | --- |
| `Shop joola.com ↗` | Mudit #9 — quiet escape hatch back to DTC |
| `Ready · N lines` footer label | Mudit #4 — label/value stack (Ready vs In cart) |
| Returns link on cart | Buyer portal requirement (warranty / RMA path) |

## Type counts (QO)

| | Greys | Sizes | Weights |
| --- | ---: | ---: | ---: |
| Before (r4) | 5 | 8 | 2 |
| After (r5) | **3** | **4** | **2** |
| Target | 3 | 4 | 2 |

## Checks

`105/105` including `fonts-loaded`, `type-scale`, `less-better`, name-search value, single rail, store link, no sidebar credit.
