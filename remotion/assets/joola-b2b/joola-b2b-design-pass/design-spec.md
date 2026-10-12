# JOOLA B2B portal — design tokens (round 5 · less but better)

Customer-facing wholesale portal only. Enforce via CSS variables + `check-prototype.mjs`.

## Principles

- **Less but better:** one rail, one credit surface, stock only when not in stock.
- **One family:** FK Grotesk Neue only (logo images for brand marks). Money uses the same family + `tabular-nums`.
- **Tight type:** 4 sizes, 2 weights, 3 greys. No 700 in chrome.

## Fonts

| Role | Face | Weight | Where |
| --- | --- | --- | --- |
| Brand mark | `joola-logo.png` | — | Sidebar brand, message JOOLA marks |
| Retailer mark | `engage-logo.png` | — | Account pill (24px) |
| UI / body | **FK Grotesk Neue** | 400 | Body, table cells, meta, inputs |
| UI / emphasis | FK Grotesk Neue | 500 | Nav active, buttons, h1, org name, totals |

`@font-face` must load 400 + 500 (`document.fonts.check`). Computed `font-family` on body, nav, and money totals must start with `FKGroteskNeue` — never a system fallback alone.

## Type scale (4)

| Token | Size | Weight | Use |
| --- | --- | --- | --- |
| `--text-title` | 24px | 500 | Page `h1` |
| `--text-body` | 14px | 400/500 | Body, totals, product names |
| `--text-ui` | 13px | 400/500 | Nav, pills, buttons, table primary |
| `--text-meta` | 12px | 400 | SKU, hints, section labels, secondary |

Footer total uses `--text-title` (24px / 500) + tnum — same family as body.

## Greys (3) + accent

| Token | Value | Use |
| --- | --- | --- |
| `--ink` | `#1a1a1a` | Primary text |
| `--muted` | `#5c5c66` | Secondary |
| `--faint` | `#8a8a96` | Tertiary / placeholders / section labels |
| `--blue` | `#2c3ee0` | Single accent |

## Icons (Lucide-like)

| Token | Value |
| --- | --- |
| `--icon-slot` | **16px** |
| `--icon-size` | **16px** |
| `--icon-stroke` | **1.5** |
| Nav gap | **8px** |
| Nav row | **32px** height, padding `0 8px` (active = hover padding) |

ViewBox `0 0 24 24`, stroke icons, no fill. Labels share one x (slot + gap).

## Spacing / sizes

| Token | Value | Use |
| --- | --- | --- |
| `--pill-h` | 32px | Account chip **and** cart pill |
| `--avatar` | 24px | Retailer logo in account chip |
| `--chip-gap` | 8px | Avatar→text, name→role stack uses 4px |
| `--sidebar-w` | 220px | Sidebar |
| Wholesale | Text chip under logo (no blue dot) | |
| Store link | Quiet bottom link `Shop joola.com ↗` | |

## Account chip (8pt grid)

- Height 32; padding `0 12px 0 4px`; gap 8 between logo and text.
- Name: 13/500, line-height 14. Role: 12/400 faint, line-height 12. Stack gap 2px (optical) within 8pt rhythm.
- Logo: 24×24 rounded (6px), object-fit contain, band background.

## Quick Order IA

- No page lede; no “Lines” heading.
- One **Reorder** rail (recent + saved templates merged).
- Search types **product name** (e.g. `Perseus`); results show name · SKU · price.
- Qty presets: **≤3**, category-aware (paddles `6/12/24`, balls `12/48/100`, bags `1/3/6`). Stepper kept.
- Row meta: SKU always; availability only when not “In stock”.
- Footer: label + total stack (4px/8px); no “Not in cart yet” chip.
- Credit: cart summary only (not sidebar).

## Checks

`pixel-nits` + `type-scale` + `fonts-loaded` + search-by-name + presets-max-3 + single-rail + no-sidebar-credit.
