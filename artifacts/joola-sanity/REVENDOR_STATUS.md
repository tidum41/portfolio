# Re-vendor @ `8530ba5` (blocked)

| Field | Value |
|-------|--------|
| **Product repo** | `tidum41/joola-b2b-casestudy` (private) |
| **Branch** | `cursor/joola-b2b-live-prototype-6235` |
| **Target SHA** | `8530ba5` |
| **Vendored SHA in `vendor/joola-b2b-live/`** | **not applied** — Cursor GitHub token cannot read the product repo (`404` on clone / archive) |

**Prior vendor baseline:** `3f28b8b` (round5 `d96a273` + qo `38041d6` tarballs), plus portfolio embed/copy patches through `579c62a` / `873a76a`.

**When product access is available:** attach `live/` tarball or grant the cloud agent read access, then:

```bash
PRODUCT_ROOT=/path/to/live npm run joola:revendor -- 8530ba5
npm run joola:build-proto
npm run joola:grep-embed-case
npm run joola:pixel-diff
```

Overlay files to re-apply after replace: `scripts/joola-vendor-overlay/`.

**Portfolio-only (this commit):** Decision 2 toggle drops **Cases**; `cs=1` embed CSS hides `.qo-case` / `.qo-caseqty`; pixel matrix drops `qo-cases`.

**Follow-up:** product cart badge accent blue (after next product commit) → second re-vendor.
