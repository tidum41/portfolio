# Dialogue product tokens

**Precedence:** live app CSS (`research.dialogueai.com`) → Paper code → static export → screenshots.

Live CSS archive (agent store only — **not** in git): `/cursor/stores/self/dialogue-live-css/`

| File | Role |
|------|------|
| `1w9mr5dy3h8y1.css` | Tailwind `:root` — `--color-*`, `--paper-*`, `--cherry-*`, `--font-*`, `--radius-*`, `--sidebar-*` |
| `0foqked6n1lzo.css` | `@font-face` (DM Sans, DM Mono, Zilla Slab, …) |
| `290yvv_x3nxom.css` | `.media-default-skin` clip/player chrome |
| `root-vars.txt` | Extracted `:root` blocks |

Code maps live names in `components/dialogue/product/tokens.ts` + `tokens.css`.  
Wordmark: live `/images/logo.svg` → `public/dialogue/logo.svg` (asset only).

## Key live variables → portfolio `dp-*`

| Live | Value | `dp-*` / usage |
|------|-------|----------------|
| `--paper-50` | `#f8f6f3` | `--dp-bg`, `--background` |
| `--paper-10` | `#fcfbf9` | `--dp-surface`, `--card` |
| `--paper-100` | `#f1eeea` | `--dp-warm` |
| `--color-stone-900` | `#1c1917` | `--dp-ink` |
| `--color-stone-600` | `#57534d` | `--dp-muted` |
| `--color-stone-200` | `#e7e5e4` | `--dp-border` |
| `--color-cherry` / `--cherry-800` | `#b43f7f` | `--dp-brand` |
| `--font-sans` / `--font-product` | DM Sans | product UI |
| `--font-brand` | Zilla Slab | brand type (logo uses SVG) |
| `--radius-3xl` | `1.5rem` | chat shell |
| `--text-base` | `1rem` | default body |
| `--text-sm` | `0.875rem` | meta / chart labels |
| Chat panel override | `16px` / `24px` body, `14px` / `20px` meta | `.dp-chat-panel-typography` |
| Study sidebar | ~`252px` | `--dp-sidebar-width` |
| `--media-border-radius` | `2rem` | `.dp-player` |

## Parity QA

```bash
npm run build && npm run start -- -p 3020
node scripts/capture-dialogue-ds-parity.mjs
ROUND35_PORT=3020 node scripts/verify-dialogue-round35-sections.mjs
```

Outputs: `/cursor/stores/self/ds-parity/`
