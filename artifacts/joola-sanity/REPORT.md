# JOOLA Sanity preview — verification report

## Branch

- `review/joola-sanity` → draft **PR #192** (do not merge)

## Architecture (iframe isolation)

- Vite static embeds: `public/joola-proto/round5/`, `public/joola-proto/qo/`
- Build: `npm run joola:build-proto` (also runs on `npm run prebuild`)
- Embeds use `embed=1` + `HashRouter`; no login; `EmbedBootstrap` seeds buyer/admin + review cart
- Case study figures: `components/joola/JoolaProtoIframe.tsx` (uniform scale, reserved height, URL toggles)
- Pixel harness (same-origin, same chrome + iframe sizing as the React wrapper): `public/joola-embed-harness.html`
- Dev single-figure bench: `/joola/parity?figure=…` (`SANITY_PREVIEW_DRAFTS=1`)

## Pixel diff (<0.5% target)

```bash
SANITY_PREVIEW_DRAFTS=1 npm run dev
npm run joola:pixel-diff
```

Reference: standalone static app at the hash URL. Portfolio capture: `joola-embed-harness.html` (matches `JoolaProtoIframe` slot; avoids Next global shell compositor noise). Optional audit: `JOOLA_PIXEL_HOST=next npm run joola:pixel-diff` (~2% on `/joola/parity` in Playwright).

| Figure id | Diff % |
|-----------|--------|
| quick-order-portal | 0.000 |
| qo-compact | 0.000 |
| qo-cases | 0.000 |
| qo-reorder | 0.000 |
| qo-stock | 0.000 |
| review-checkout | 0.000 |
| approval-split | 0.000 |
| approval-ledger | 0.000 |

Artifacts: `artifacts/joola-sanity/pixel-diff/*-{proto,portfolio,diff}.png`, `figures/diff-table.json`.

## Preview screenshots

- `artifacts/joola-sanity/joola-preview-1440-{light,dark}.png`
- `artifacts/joola-sanity/joola-preview-390-{light,dark}.png`
- `artifacts/joola-sanity/joola-production-1440.png` (NDA-only)

## Verify

```bash
npm run joola:build-proto
SANITY_PREVIEW_DRAFTS=1 npm run dev
npm run typecheck && npm run build
npm run joola:pixel-diff
```
