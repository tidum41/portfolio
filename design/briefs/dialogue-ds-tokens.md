# Dialogue product design tokens (Paper source of truth)

Tokens: `components/dialogue/product/tokens.ts` + `tokens.css`.  
**Typeface:** **DM Sans** on in-figure product UI (`app/dialogue/layout.tsx`). Case-study shell stays Helvetica Neue.

## Paper / static inventory (authoritative markup)

| Path | Role |
|------|------|
| `/cursor/stores/bot/dialogue-sources/paper/dialogue-paper-frames-oct18.txt` | Paper frame notes (Oct 18) |
| `/cursor/stores/bot/dialogue-sources/paper/player-controls-paper-5SR-0.tsx.txt` | Player controls export |
| `/cursor/stores/bot/dialogue-sources/paper/player-dialog-paper-597-0.txt` | Player dialog export |
| `public/dev/dialogue-static/_next/static/css/fde99ba4c3e111ce.css` | CSS variables (`--text-body-size: 14px`, `--brand: #b43f7f`, stone palette) |
| `public/dev/dialogue-static/export/section-3.html` | Chat panel, viz-card, funnel, clip thumbs, follow-ups |
| `public/dev/dialogue-static/export/section-6.html` | Study app shell (188px sidebar, tabs, stat skeletons, Key insights) |
| `public/dev/dialogue-static/export/storyboard/answer.html` | Storyboard answer variant |
| `public/dev/dialogue-static/export/visual-6.html` | Visual export companion |
| `public/dev/dialogue-static/clip-photos/still-thumb-{1,2,3}.jpg` | Clip thumbnail stills |

Case-study PNGs (`public/dialogue/section-*.png`) are **secondary** for QA crops only; parity harness screenshots the static HTML selectors above.

## Typography (from static CSS / section-3)

| Role | Size / line | Weight |
|------|-------------|--------|
| Body (`text-body`) | 14px / 20px | 400 |
| Meta (`text-meta`) | 12px / 16px | 400–500 |
| Summary emphasis | 14px / 20px | **600** ink (not brand color) |
| Sidebar nav | 10px | 400 |
| Study title | 12px | 500 |

## Color (static export)

| Token | Hex |
|-------|-----|
| `--dp-brand` | `#B43F7F` |
| `--dp-brand-icon` | `#B03A78` |
| `--dp-ink` | `#1C1917` |
| `--dp-muted` | `#57534D` |
| `--dp-muted-light` | `#78716C` |
| `--dp-border` | `#E7E5E4` |
| `--dp-surface` | `#FCFBF9` |
| `--dp-warm` | `#F1EEEA` |
| Funnel bars | `#D6D3D1`, `#B43F7F`, `#57534D`, `#A8A29E` |

## Components (React)

Icons: `components/dialogue/product/icons.tsx` (asterisk logo, chevron from export SVG paths).  
Shell: `StudyChatShell` (`data-export-chat-panel`), `StudyPageChrome` (`data-export-app-shell`).  
Answer: `FunnelChart` + `dp-viz-card`, `ClipThumbnails`, `FollowUpChips` (`h-9` rounded-lg buttons).

## Parity QA

```bash
npm run build && npm run start -- -p 3020
node scripts/capture-dialogue-ds-parity.mjs
node scripts/verify-dialogue-round35-sections.mjs
```

Outputs: `/cursor/stores/self/ds-parity/*-{ref,live,compare,overlay}.png`, `parity-report.md`.  
Live panel width: **400px** (Paper chat panel).
