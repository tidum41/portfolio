# JOOLA Sanity preview — verification report

## Branch

- `review/joola-sanity` → draft **PR #192** (do not merge)

## Environment

| Variable | Purpose |
|----------|---------|
| `SANITY_PREVIEW_DRAFTS=1` | Dev only: full case study from `drafts.joola` fixture or Sanity |
| `SANITY_API_WRITE_TOKEN` | Optional: live draft via `previewDrafts` |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` / `DATASET` | `9vl5qk61` / `production` |

Production (`SANITY_PREVIEW_DRAFTS` unset): `/joola` remains NDA-only.

## Live prototype source

Vendored from attached tarballs under `vendor/joola-b2b-live/` (round5 @ `d96a273` + qo overlay @ `38041d6`). Assets in `public/fonts`, `public/products`, `public/joola-logo.*`.

## Embeds (preview path)

| Figure `data-joola-figure` | Source |
|----------------------------|--------|
| `quick-order-portal` | `BuyerShell` + `QuickOrderPage` |
| `quick-order-row-search` | QO row Compact (`line=typed`, 1024) |
| `quick-order-row-compare` | Cases / Reorder / Stock toggles |
| `review-checkout` | `BuyerShell` + `ReviewPage` + cart preload |
| `approval-queue` | Split inbox / Ledger prototypes |

Wrapper: `components/joola/embed/*` (`JoolaUniformScale`, `JoolaLiveRoot`, `MemoryRouter` + `StoreProvider`).

## Pixel diff (vite vs portfolio)

**Command** (requires vite preview on `4173` and `SANITY_PREVIEW_DRAFTS=1` on port `3000`):

```bash
cd vendor/joola-b2b-live && npm ci && npx vite build && npx vite preview --port 4173
# separate terminal
SANITY_PREVIEW_DRAFTS=1 npm run dev
node scripts/joola-pixel-diff.mjs
```

**Target:** &lt;0.5% per figure. **This run:** not met (global CSS/render context; see notes).

| Figure id | Diff % | Compare size |
|-----------|--------|--------------|
| quick-order-portal | 42.437 | 1280×1057 |
| qo-compact | 28.811 | 1024×900 |
| qo-cases | 28.371 | 1024×900 |
| qo-reorder | 28.656 | 1024×1035 |
| qo-stock | 28.662 | 1024×900 |
| review-checkout | 42.423 | 1280×900 |
| approval-split | 43.080 | 1280×900 |
| approval-ledger | 42.998 | 1280×900 |

Artifacts: `artifacts/joola-sanity/pixel-diff/*-{proto,portfolio,diff}.png`, `figures/diff-table.json`.

### Not 1:1 yet

- Portfolio loads `app.css` globally in Next; prototype runs in an isolated `#root` — typography/subpixel and layout bleed remain.
- Dev parity mode hides DialKit chrome; parity script forces 1:1 scale and matches viewport width to design width.
- Sub-0.5% likely needs scoped CSS (shadow root or prefixed `app.css`) and production-build captures on both sides.

## Quality gates

- `npm run typecheck` — pass
- `npm run build` — pass (webpack; React dedupe via `react$` / `react-dom$` alias)

## Local preview

```bash
SANITY_PREVIEW_DRAFTS=1 npm run dev
open http://localhost:3000/joola
```
