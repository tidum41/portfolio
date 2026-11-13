# JOOLA cart / vendor research (portfolio only)

**Date:** 2026-11-12 · **Branch:** `review/joola-sanity` · **No vendor UI edits in this commit.**

## (a) Cart reference crops

| Asset | Source | Notes |
|--------|--------|--------|
| `cart-compare-mux-crop.png` | Mux playback `gX4z7zlxZK85I7oNjrxK00ty3zVZtXmrxohRte00hCYs00` | `ffmpeg` frame at **t=6s** from 720p HLS (`image.mux.com/...?time=2.5` is white during fade-in). Crop ≈ `(595,153,540×84)` on 1440×1080 frame. Shows **$4,908.66**, blue badge **4**, stroke cart icon. |
| `cart-compare-hero-crop.png` | `public/images/joola/hero-ruth-2.png` | Composite mockup; crop from 1200px-wide scaled ref at `(720,38,260×48)`. Same cart semantics as video / INV-1042 demo. |
| `cart-compare.png` | Side-by-side | Labels + crops above. Regenerate: `node scripts/joola-cart-compare.mjs` (research; no Playwright embed). |

**Embed cart today (read-only):** round5 quick-order with `DEFAULT_CART` shows **$8,467.08** and count **204** (sum of units, dark badge) — differs from Mux/hero **$4,908.66** / **4 lines** / blue badge. Fix belongs in **tidum41/joola-b2b-casestudy**, then re-vendor.

---

## (b) Cart alignment “playground”

| Where | Repo / route | What it is |
|--------|----------------|------------|
| **Product (canonical)** | `tidum41/joola-b2b-casestudy` (private), `live/` app | **DialKit playground**: bottom panel; query e.g. `?view=portal&screen=quick-order` or `screen=cart`. `src/components/PlaygroundDial.tsx` drives view/screen/state. **`scripts/measure.ts`** encodes cart layout rules (e.g. `cart-numeric-align`, `cart-summary-copy`, `.cart-pill` in measure list). Run: `cd live && npm run dev`. |
| **Vendored snapshot** | Portfolio commit **`3f28b8b`** | Tarballs documented in that run: **round5** `cursor/round5-states-hierarchy-6235` @ **`d96a273`**, **qo** `cursor/qo-line-playground` @ **`38041d6`**. Same measure/playground code lives under `vendor/joola-b2b-live/`. |
| **Portfolio design cycle** | `components/joola/DecisionCycle.tsx` + `cycles/CycleStages.tsx` (`IdentityStage`) | Public **iteration playground** for chrome/cart (v7 badge+total beside bag; v11–13 cart pill variants). Used on legacy `JoolaBody` case study, **not** the Sanity preview iframes. Data: `lib/caseStudies/joolaCycles.ts` slug `identity`. |
| **Parity bench** | `/joola/parity?figure=…` (`JoolaParityBench.tsx`) | Dev iframe harness for pixel parity; not a cart-specific UI lab. |
| **Legacy portal CSS** | `components/joola/joola-portal.css` | Old in-repo `.joola-portal` cart meter rules (pre–live vendoring); superseded by static embeds for preview. |

Mudit’s “whole playground” for cart alignment is almost certainly the **product repo DialKit + measure.ts** workflow on **`d96a273`** (and later commits on `cursor/round5-states-hierarchy-6235`), not a separate route inside portfolio.

---

## (c) Buyer sidebar icons & vendoring

### Vendored from (documented)

| Slice | Branch | Commit | Subject (from SOURCE tarballs) |
|--------|--------|--------|--------------------------------|
| Portal + approval prototypes | `cursor/round5-states-hierarchy-6235` | `d96a273be3c9dc6e2c68bfa87d72e08e48746b0a` | Add case study draft captures and typography spec |
| Quick-order row | `cursor/qo-line-playground` | `38041d65e6544ab0f06532e698776d7d275b1b3b` | Move quick-order playground controls into DialKit |

Portfolio import: **`3f28b8b`** (`vendor/joola-b2b-live/`). Portfolio-only follow-ups: **`5647ad1`** (added `NavIcon` **cart** + cart pill chrome), **`873a76a`** (`publicAsset()` for logo).

### Why nav icons look “missing”

1. **QO embeds (hero, Decision 2)** — `prototypes/quick-order-row/shared.tsx` **`proto-shell__nav` is text-only** (`<span>Quick order</span>` …). Only the cart uses `NavIcon`. This is intentional scaffold chrome, not `BuyerShell`.
2. **Round5 portal embed** — `BuyerShell` **does** render `NavIcon` on every nav item. Local capture (`/joola-proto/round5/…#/quick-order?embed=1&clean=1…`) shows icons present (see `joola-sidebar-research.png` in agent artifacts).
3. **Shield icon** — `NavIcon` **`shield`** is wired in **`AdminShell.tsx`** for **Approvals** (`/prototypes/approval-queue`), not buyer nav. Buyer shell has no Approvals item.
4. **`public/icons.svg`** (copied at vendoring) is **social/marketing symbols**, not sidebar nav; nav art is inline in `NavIcon.tsx` (paths from product `prototype/index.html` `icon()` helper per file comment).
5. If preview still shows label-only sidebar on **portal** figures, compare against **`d96a273`** source in product repo (later round5 commits may differ); re-vendor from the branch that has the icon set Mudit expects.

**Branch to check for full buyer + admin icons:** same product repo, **`cursor/round5-states-hierarchy-6235`** at or after **`d96a273`** (and any newer round5 branch Mudit names when re-vendoring).

---

## (d) Case-pack copy in case-study embed paths

| Location | When it appears | Copy / UI |
|----------|------------------|-----------|
| **Qo embed v=2 (Cases)** | `JoolaCaseStudyContent` Decision 2 toggle → `qoRowUrl("2")`; pixel figure `qo-cases` | `CasesVariant` → `CaseField`; product block **`Case of {pack}`** (`.qo-case`) unless `packNamedInTitle`; aria **case of N**, **Cases for …, N units each**; case stepper suffix **case/cases**. |
| **Qo embed v=1 (Compact)** | Hero `qoHeroCompactUrl()`, compare default v=1 | `QtyField` only; **no** “Case of” line when title embeds pack (e.g. HC-40 Balls (3-Pack)) via `packNamedInTitle`; else **`Case of {pack}`**. |
| **Qo v=3 Reorder / v=4 Stock** | Compare toggles | Compact-style qty; same `ProductBlock` / `hideCaseMeta` rules as v=1. |
| **Round5 quick-order portal** | `quick-order-portal` iframe | Full `QuickOrderPage` table — **no** “Case of” chip row; case packs via qty presets / stepper only (no `.qo-case` in portal table). |
| **Built CSS** | `public/joola-proto/qo/assets/*.css` | `.qo-case`, `.qo-caseqty`, Cases stepper styles. |
| **Legacy (not Sanity iframe)** | `JoolaQuickOrderCompare.tsx`, `JoolaQuickOrderLine.tsx` | PR #181-era React: **`X per case`**, `is-cases` mode — **not** used by current `JoolaCaseStudyContent` iframes. |

**Sanity-visible “Cases” mode:** only **Decision 2** segmented control labeling + **qo embed `v=2`** URL (`variant=2` in harness).

---

## Commands

```bash
node scripts/joola-cart-compare.mjs   # refresh Mux + hero crops + cart-compare.png
```

## Evidence files (this run)

- `/opt/cursor/artifacts/joola-sidebar-research.png` — round5 embed sidebar with icons
- `/opt/cursor/artifacts/hero-ruth-2-scaled-reference.png` — layout ref for hero cart crop
