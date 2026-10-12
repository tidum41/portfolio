# JOOLA B2B portal — design tokens (pixel pass)

Customer-facing wholesale portal only. Enforce via CSS variables + `check-prototype.mjs`.

## Fonts

| Role | Face | Weight | Where |
| --- | --- | --- | --- |
| Brand mark | Logo asset (`joola-logo.png`) | — | Sidebar brand, message JOOLA marks |
| UI / body | **FK Grotesk Neue** | 400 | Body, table cells, meta, inputs |
| UI / emphasis | FK Grotesk Neue | 500 | Nav active, buttons, h1, org name, totals |
| UI / strong | FK Grotesk Neue | 700 | Reserved; avoid in tables/controls |

**Rule:** No second “brand font” in UI chrome. The JOOLA wordmark lives only in the logo image. Page titles use FK Grotesk 500 at the title size — never a display face in tables, pills, or form controls.

## Type scale

| Token | Size | Weight | Line | Use |
| --- | --- | --- | --- | --- |
| `--text-title` | 28px | 500 | 1.15 | Page `h1` |
| `--text-body` | 14px | 400 | 1.4 | Default |
| `--text-ui` | 13px | 400/500 | 1.3 | Nav, pills, buttons, table primary |
| `--text-meta` | 12px | 400 | 1.35 | SKU, credit, hints |
| `--text-micro` | 11px | 500 | 1.2 | Uppercase section labels, badge |

## Colour

| Token | Value | Use |
| --- | --- | --- |
| `--ink` | `#1a1a1a` | Primary text |
| `--muted` | `#5c5c66` | Secondary text |
| `--faint` | `#8a8a96` | Tertiary / placeholders |
| `--line` | `#e6e8ef` | Borders |
| `--line-soft` | `rgba(112,115,147,0.12)` | Row rules |
| `--band` | `#f4f5f7` | Fills / hover wash |
| `--sidebar-bg` | `#fbfcfd` | Sidebar |
| `--page` | `#ffffff` | Main surface |
| `--blue` | `#2c3ee0` | Primary accent only |
| `--blue-soft` | `rgba(44,62,224,0.08)` | Active nav fill |

## Radii

| Token | Value | Use |
| --- | --- | --- |
| `--radius-pill` | 999px | Account chip, cart pill, search field |
| `--radius-control` | 8px | Buttons, inputs, nav items |
| `--radius-panel` | 12px | Cards, rails, summary |
| `--radius-status` | 4px | Status pills |

## Spacing / sizes

| Token | Value | Use |
| --- | --- | --- |
| `--topbar-h` | 48px | Top bar |
| `--pill-h` | 32px | Account chip **and** cart pill (matched) |
| `--avatar` | 24px | Account chip avatar |
| `--icon-slot` | 20px | Nav / search icon box |
| `--icon-size` | 16px | Glyph inside slot (search uses 14px in 20px slot) |
| `--row-h` | 50px | Data rows |
| `--head-h` | 40px | Sticky table heads |
| `--control-h` | 40px | Primary/outline buttons, inputs |
| `--sidebar-w` | 220px | Sidebar |

## Icon + label

Every icon+text pair: `display: inline-flex; align-items: center; gap: 8–10px`. Icon sits in a fixed `--icon-slot` box, glyph `--icon-size`, optically centred. Label baseline shares the flex cross-axis center with the slot.
