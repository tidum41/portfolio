# JOOLA Sanity preview — verification report

## Branch and commit

- Branch: `review/joola-sanity`
- Commit: (see git log)

## Draft PR

Opened as **draft** from `review/joola-sanity` → `main` (see GitHub link in agent summary).

## Environment

| Variable | Purpose |
|----------|---------|
| `SANITY_PREVIEW_DRAFTS=1` | Local dev only: render full case study from draft |
| `SANITY_API_WRITE_TOKEN` | Optional with preview: live `drafts.joola` via `previewDrafts` perspective |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `9vl5qk61` (default in repo) |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |

Without `SANITY_API_WRITE_TOKEN`, preview uses committed fixture `fixtures/sanity/drafts.joola.json`.

Production build (`SANITY_PREVIEW_DRAFTS` unset): `/joola` unchanged (hero + metadata + NDA request only).

## Local commands for Mudit

```bash
# Production-like (default)
npm run dev
open http://localhost:3000/joola

# Sanity draft preview (fixture or token)
SANITY_PREVIEW_DRAFTS=1 npm run dev
open http://localhost:3000/joola

# Optional: live draft from Sanity (Editor token in .env.local)
# SANITY_API_WRITE_TOKEN=... 
# SANITY_PREVIEW_DRAFTS=1 npm run dev

npm run build
npm run typecheck
```

## Component map

| Section | Component |
|---------|-----------|
| Problem | `JoolaBeforeAfter` + pain points from draft |
| Solution | `JoolaQuickOrderHero` (portal shell + search-first quick order line) |
| Research | Copy only (draft placeholders visible) |
| Decision 1 | `JoolaQuickOrderLine` |
| Decision 2 | `JoolaQuickOrderCompare` (Compact / Cases / Reorder / Stock status) |
| Decision 3 | `JoolaCreditMeter` (Net 30 + credit in use) |
| Decision 4 | `JoolaApprovalCompare` (Split inbox vs Ledger) |

Core port from PR #181 (`components/joola/*`, `lib/caseStudies/joolaLedger.ts`). Volume pricing UI removed per brief (single `buyerPrice` per SKU).

## Pixel diff vs prototype

Prototype repo `https://github.com/tidum41/joola-b2b-casestudy` was **not accessible** in this environment (404 / gh clone failed). No vite side-by-side or pixelmatch baseline was possible.

| Figure | Diff % | Notes |
|--------|--------|-------|
| quick-order-hero | n/a | Portfolio capture only — see `figures/quick-order-hero-portfolio.png` |
| decision-1-line | n/a | idem |
| decision-2-compare | n/a | idem |
| decision-3-credit | n/a | idem |
| decision-4-approvals | n/a | Wide rep shell; portfolio scaled in figure chrome |

Mudit can run full diff locally after cloning prototype branches named in `design/briefs/joola-sanity-page.md`.

## Screenshots (this run)

- `joola-preview-1440-light.png`, `joola-preview-1440-dark.png`
- `joola-preview-390-light.png`, `joola-preview-390-dark.png`
- `joola-production-1440.png` (NDA-only, no `#decision-*` sections)
- `figures/*-portfolio.png`

## Checks

- `npm run build`: pass
- `npm run typecheck`: pass (pre-existing `PhoneEmbed` asset module errors on main unchanged)
- Console on preview with toggle clicks: no errors
- Typography: case-study chrome uses site Helvetica Neue; product UI uses scoped FK Grotesk inside `.joola-portal`

## Could not match 1:1

- No access to prototype Vite app for pixel parity or exact branch copies (`cursor/round5-states-hierarchy-6235`, `cursor/qo-line-playground`).
- Rep approval wide layout uses portfolio bleed (`joola-stage--wide`) rather than uniform scale wrapper tuned against vite width.
- Split inbox view is implemented from the rep queue patterns in-repo, not a direct file copy from prototype `/prototypes/approval-queue`.
