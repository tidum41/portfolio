# Dialogue product design tokens (DS parity)

Tokens live in `components/dialogue/product/tokens.ts` and `components/dialogue/product/tokens.css`.  
**Typeface:** **DM Sans** (Google Fonts) — matches Dialogue static export (`public/dev/dialogue-static`) and Paper frames (`/cursor/stores/bot/dialogue-sources/paper/dialogue-paper-frames-oct18.txt`). Portfolio case-study shell remains Helvetica Neue; only in-figure product UI uses DM Sans.

## Reference assets (source of truth)

| Asset | Role |
|-------|------|
| `public/dialogue/section-1.png` … `section-7.png` | Final case-study captures (fcc87a2) |
| `public/dialogue/review/blobs/fcc87a2--*.png` | Manifest-linked blobs (same pixels) |
| `public/dialogue/section-6a.png`, `section-6b.png` | Assistant empty / docked variants |
| `/cursor/stores/bot/dialogue-sources/paper/dialogue-paper-frames-oct18.txt` | Paper type scale + study chrome colors |
| `public/dev/dialogue-static/index.html` | Confirms `--font-dm-sans` in Dialogue export |

## Typography (measured)

| Token | Size / line | Weight | Source |
|-------|-------------|--------|--------|
| Chat title | 15px / 20px | 500 | `section-3.png` |
| Chat subtitle | 14px / 20px | 400 | `section-3.png` |
| Body / bubble | 14px / 20px | 400 | Paper + `section-3.png` |
| Summary | 16px / 22px | 400 (500 emphasis) | `section-3.png` |
| Meta / chart labels | 12px / 16px | 400–500 | Paper + `section-3.png` |
| Study nav | 12px / 16px | 400 | `section-6.png` |

## Color

| Token | Hex | Source |
|-------|-----|--------|
| `--dp-bg` | `#F8F6F3` | `section-3.png` canvas |
| `--dp-surface` | `#FCFBF9` | Paper study panels |
| `--dp-card` | `#FFFFFF` | Assistant shell |
| `--dp-ink` | `#1C1917` | Paper text primary |
| `--dp-muted` | `#57534D` | Paper secondary text |
| `--dp-border` | `#E7E5E4` | Paper borders |
| `--dp-warm` | `#F0EDEA` | User bubble `section-3.png` |
| `--dp-brand` | `#BE185D` | Focal bar + logo `section-3.png` |
| `--dp-funnel-track` | `#F1EEEA` | Funnel track `section-3.png` |
| `--dp-funnel-bar` | `#A8A29E` | Non-focal bars |

## Radii & shadow

| Token | Value | Source |
|-------|-------|--------|
| `--dp-radius` | 16px | Assistant outer shell `section-3.png` |
| `--dp-radius-sm` | 12px | Inner blocks, bubble |
| `--dp-radius-xs` | 10px | Study stat tiles Paper |
| `--shadow-chat` | soft dual shadow | `section-3.png` |

## Copy (canonical)

See `dialogueCopy` in `tokens.ts` — e.g. **Research assistant**, **Checkout usability, 24 interviews**, **Insights summary**, **Checkout usability study, Q3**, funnel footnotes.

## Parity QA

Run `npm run build && npm run start -- -p 3020`, then `node scripts/capture-dialogue-ds-parity.mjs`.  
Outputs: `/cursor/stores/self/ds-parity/*-compare.png` and `parity-report.md`.
