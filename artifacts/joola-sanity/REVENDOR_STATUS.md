# JOOLA vendor status

**Vendored SHA:** `8936d4f` (`vendor/joola-b2b-live/VENDOR_SHA`)

**Source:** User-provided `git archive` of product `live/` @ `8936d4f2e330f838b973d18594179b9b77c556b3`.

**Re-vendor:**

```bash
PRODUCT_ROOT=/path/to/live npm run joola:revendor -- 8936d4f
npm run joola:build-proto
npm run joola:grep-embed-case
npm run joola:pixel-diff
```

Product `live/` @ `8936d4f` ships a **scaffold-only** `prototypes/quick-order-row/`; portfolio overlay restores the full QO prototype tree from `scripts/joola-vendor-overlay/src/prototypes/quick-order-row/` (Compact / Reorder / Stock; Cases mode omitted in embed).

**Case study rules (portfolio):**

- Hero: Compact `v=1`, five rows, no preset chips.
- Decision 2: **Compact**, **Reorder**, **Stock status** (Cases removed).
- `cs=1`: interaction lock, `publicAsset()` BASE_URL, ready gates, image guards, CSS hides `.qo-case` / `.qo-caseqty`.
