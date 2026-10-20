# Type system

Approved scope: Oct 20 2026. Branch: `review/type-system`.

## Current state (before)

- **Sans:** Local `@font-face "HN"` binding to system Helvetica Neue (weights 100–700), with fallbacks `Helvetica Neue, Helvetica, Arial, sans-serif`. Hardcoded Helvetica stacks remain in TOC, BentoGallery, QuarterPicker, cursor, CD player, etc.
- **Serif:** Georgia (unchanged; page titles / about H1).
- **Embeds:** Geist Sans/Mono via `next/font/google` for habit tracker + CD player mono labels.
- **Size sprawl:** ~20 sizes in use (10, 10.5, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 24, 26–36 clamp, 30, 32, 38, 44, 48). Tokens exist but many call sites hardcode px.
- **Body 15px:** Line-heights 1.6 / 1.72 / 1.87 (~24 / 25.8 / 28.05px) and tracking 0 / 0.1 / 0.3 mixed.
- **Weights:** Cap intended at 500 for site UI; 600/700 still appear in CD player chrome, habit tracker, VinylPlayer MM-7, PhoneMockupDevPanel, and BentoGallery uses 300.
- **Spacing:** Case-study sections use `--section-pb` (64) + `--section-gap` (80) ≈ 144 effective; some pages drift. About H1→intro is 4px. Home mobile card stack can show uneven row gaps when empty video shells participate in the grid.

## Target

### Fonts

| Role | Family | Notes |
|------|--------|-------|
| Sans | ABC Areal | Hosted on Vercel Blob; never committed. `NEXT_PUBLIC_AREAL_URL` (+ optional Regular/Medium statics). |
| Sans medium | ABC Areal @ 500 | Same family; `font-weight: 500`. |
| Serif | Georgia | Unchanged. |
| Embeds | Geist | Habit tracker (and CD mono accents) stay on purpose. |

Fallback after Areal: `Arial, Helvetica, sans-serif`. Site UI weights **400–500 only**.

### Scale tokens (`--fs-*` / `--lh-*` / `--ls-*`)

| Token | Size | Line-height | Tracking | Role |
|-------|------|-------------|----------|------|
| `--fs-caption` | 12px | `--lh-caption` 1.4 | `--ls-caption` 0 | Captions, fine UI (absorbs 10/10.5/11) |
| `--fs-sm` | 13px | `--lh-sm` 1.55 | `--ls-sm` 0 | Small notes, tool labels |
| `--fs-meta` | 14px | `--lh-meta` 1.45 | `--ls-meta` -0.1px | Meta, TOC, footer-adjacent |
| `--fs-body` | 15px | `--lh-body` 1.72 | `--ls-body` 0.1px | Body (one lh + tracking everywhere) |
| `--fs-lg` | 18px | `--lh-lg` 1.35 | `--ls-lg` -0.2px | Card titles, reflection heads (absorbs 17/19/20) |
| `--fs-xl` | 24px | `--lh-xl` 1.25 | `--ls-xl` -0.3px | Large UI / former H3 band |
| `--fs-h2` | 30px | `--lh-h2` 1.1 | `--ls-h2` -0.3px | Section titles (absorbs 32) |
| `--fs-display` | 48px | — | `--ls-hero` -0.5px | Display cap |
| `--fs-hero` | `clamp(32px, 6vw, 48px)` | — | `--ls-hero` | Case-study hero title |
| `--fs-home-hero` | `clamp(26px, 2.8vw, 36px)` | 1.2 | `--ls-hero` | Home hero |
| `--fs-stat` | 44px | 1 | -0.5px | Stat numerals |

Aliases: `--fs-section-label` → body; `--fs-card-title` → lg; `--fs-label` → body; `--fs-h3` → xl.

Optical note: Areal runs slightly wider than Helvetica Neue. Prefer integer px; nudge ±0.5 only if a role clearly overflows after visual check.

### Spacing rules

| Token | Value | Use |
|-------|-------|-----|
| `--cs-h2-mt` | 48px | Space above H2 when it opens a block (gentle; not a re-layout) |
| `--cs-h2-mb` | 24px | Below H2 (unchanged) |
| `--cs-para-gap` | 16px | Paragraph / prose gap |
| `--cs-section-gap` | 144px | One section separation (replaces 64+80 and 64–176 drift) |
| About H1→intro | ≥16px | Was 4px |
| About H2→body | 24px | Match case-study H2 below |
| Home @ 390 | Uniform row-gap | Fix empty video-shell / alternating gaps |

**Out of scope:** Case-study text column / measure (`--content-max-w` / long line length). No copy rewrites. No production merge.

## Delivery

Push once to `review/type-system`. Verify locally (`next build && next start` + Playwright). Preview for `/`, `/about`, `/archive`, `/ucla-sublease`.
