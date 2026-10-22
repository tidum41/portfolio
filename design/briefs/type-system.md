# Type system

Asks covered: STD-05

Approved scope: Oct 20 2026. Branch: `review/type-system`.
Update (same day): shelve ABC Areal — Mudit prefers Helvetica Neue.

## Sans

| Role | Family | Notes |
|------|--------|-------|
| Sans | Helvetica Neue | Token: `"Helvetica Neue", Helvetica, Arial, sans-serif` |
| Sans medium | same @ 500 | Helvetica Neue Medium |
| Serif | Georgia | Unchanged |
| Embeds | Geist | Habit tracker (+ CD mono accents) |

Local `@font-face` binds Regular (400) and Medium (500) only. No Areal / Blob / env font loading.

## Scale tokens (`--fs-*` / `--lh-*` / `--ls-*`)

| Token | Size | Line-height | Tracking | Role |
|-------|------|-------------|----------|------|
| `--fs-caption` | 12px | 1.4 | 0 | Captions |
| `--fs-sm` | 13px | 1.55 | 0 | Small notes |
| `--fs-meta` | 14px | 1.45 | -0.1px | Meta, TOC |
| `--fs-body` | 15px | 1.72 | 0 | Body (HN retune) |
| `--fs-lg` | 18px | 1.35 | -0.15px | Card titles |
| `--fs-xl` | 24px | 1.25 | -0.25px | Large UI |
| `--fs-h2` | 30px | 1.15 | -0.25px | Section titles |
| `--fs-display` / `--fs-hero` | 48 / clamp | — | -0.5px | Display / CS hero |
| `--fs-home-hero` | clamp(26–36) | 1.2 | -0.5px | Home hero |
| `--fs-stat` | 44px | 1 | -0.5px | Stat numerals |

Weights **≤500** site-wide.

## Spacing

| Token | Value |
|-------|-------|
| `--cs-section-gap` | 144px |
| `--cs-h2-mb` | 24px |
| `--cs-para-gap` | 16px |
| About H1→intro | ≥16px |
| Home @390 card row-gap | 48px (uniform) |

**Out of scope:** Case-study measure / long line length.
