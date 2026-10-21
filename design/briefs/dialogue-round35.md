# Dialogue case study, round 35 brief

**Status:** Brief only. No visual implementation until Mudit confirms this doc.  
**Branch target:** `review/dialogue-canvas`  
**Baseline:** Round 34 rasters and static export under `public/dev/dialogue-static/`; case study at `/dialogue`, review canvas at `/dev/dialogue-canvas-v2`.  
**Prior feedback:** `design/briefs/dialogue-feedback-1020.md` (Oct 20, morning). This round incorporates **Mudit feedback Oct 20, 4:48pm** (verbatim intent below).

---

## Mudit feedback (Oct 20, 4:48pm), captured as requirements

1. **Hero:** Not the current hero. Match the **Ruth Zhao-inspired visual language** of the **JOOLA B2B hero** (`/joola`, asset `public/images/joola/hero-ruth-2.png`). The generated graph-forward hero is uninteresting.
2. **Problem / solution pair:** Today two captions reuse the **same** raster (`section-1.png`). Use **one image per column** only where the story needs two; here **two distinct purpose-made visuals** (problem vs solution). Stop reusing exports across unrelated sections.
3. **Decision block ("Lead with the answer…"):** Render **paragraphs, quote list, and structured answer** as **real chat UI**, not tiny dimmed PNG thumbs. **Identical aspect ratio, chat width, and type size** across all three so comparison is 1:1.
4. **Lightbox:** Zoomed images fill the viewport and look soft. **Cap** zoomed media at about **80vh** and **1100px** wide with **visible margin**. Replace invisible close control with a **labeled "Close"** button (Esc), **top-right inside safe margin**, strong contrast.
5. **"Every answer gets one fixed structure":** Concept is right; **80% width** fights the next full-width figure. Adopt **one figure-width system** for the whole page.
6. **"The chart fits the question":** Ship **many more chart response types**, each in **real Dialogue chat UI** and in the **case-study figure**. Cover funnel, trend over rounds, segment comparison, distribution, theme ranking, quote frequency, timeline of moments, using **only** the real Dialogue design system (no invented chart chrome).
7. **Sidebar vs floating bubble:** Current side-by-side is "just ok." **Propose a better layout-alternatives treatment** using measured rules from **References** (you will supply; see below).
8. **Keep:** **"One answer, start to finish"** drawer graphic (`D-15` / `section-7.png`).
9. **Aspect ratios for the page, not the render:** Ratios are chosen for how figures sit on **`/dialogue`**, not for a standalone export artboard. Use a **small allowed set** tied to figure tier (below). **Author every visual at its final placed width** so UI reads at real scale (**chat body text ≥ 12px** when measured on the live case study at **1440** viewport). **No letterboxing, no dead space.** QA is **in place** on `/dialogue` at **1440** and **390**, not by inspecting an isolated PNG or iframe alone.
10. **Live React by default:** Case-study figures use **live React** that **shares code with the real Dialogue study chat UI**, not PNGs. See **Live React figures** below.

**General (all sections):** **Areal**, weight **≤ 500**, **sentence case**, **no em dashes**, **no invented icons**, **face/clip blur only for privacy**. Raster/video only where listed in Live React figures (clips, optional hero).

---

## Measured rules (this site)

### This portfolio (`muditm.com` case-study shell)

| Token / rule | Measured value | Source |
|--------------|----------------|--------|
| Content column | `750px` max (`--content-max-w`) | `app/globals.css` |
| Page horizontal padding | `24px` (`--page-px`) | `app/globals.css` |
| Figure corner radius | `8px` (`--radius-control`) on `.cs-hero-media-frame`, `.cs-figure-media` | `app/globals.css` |
| Hero / full figure `sizes` | `(max-width: 767px) calc(100vw - 48px), 750px` | `DialogueCaseStudyContent.tsx`, `ProductCaseStudy.tsx` |
| Pair figure `sizes` | `(max-width: 767px) calc(50vw - 30px), 375px` | `DialogueCaseStudyContent.tsx` |
| Decision option `sizes` (today) | `(max-width: 767px) calc(50vw - 30px), **240px**` | `DecisionBlock.tsx` (too small for 1:1 chat comparison) |
| Anatomy figure (today) | Wrapper `width: 80%` | `DialogueCaseStudyContent.tsx` (drop in round 35 build) |
| Lightbox (today) | Image `max-width: 92vw`, `max-height: 88vh`; close is **×** glyph | `app/globals.css`, `CaseStudyLightbox.tsx` |
| Lightbox (round 35 target) | Media `max-width: min(1100px, calc(100vw - 48px))`, `max-height: 80vh`; backdrop padding ≥ `24px`; **"Close"** text button top-right `16–24px` from edges; Esc + backdrop click | Mudit Oct 20 |
| UI fill in export frames | Target **≥ 92%** of frame area for product UI (≤ 8% margin) | Carries G1 from `dialogue-feedback-1020.md` |
| Hero intrinsic ratio (JOOLA ref) | **2400 × 1600 (3:2)** on `/joola` only; Dialogue figures use **allowed ratios** below, not ad hoc artboards | `hero-ruth-2.png` |
| In-page type floor (Dialogue UI in figures) | **≥ 12px** computed font size on chat copy at **1440** viewport, figure in final layout | Mudit, round 35 |
| Figure QA viewports | **1440** and **390**, `/dialogue` with TOC layout, not standalone asset review | Mudit, round 35 |

### JOOLA B2B hero (Ruth Zhao-inspired language on this site)

- **What it is:** One **full-column** product screen, edge-to-edge inside the 8px rounded frame, **no letterboxing**, subtle inset border, UI reads at **750px** column width and at **390** viewport.
- **What it is not:** Abstract charts, floating diagrams, or wide empty margins.
- **Dialogue hero direction:** Same treatment: **one flagship study-chat answer** (structured answer with summary + chart + clips), cropped tight like wholesale UI on JOOLA, **not** a standalone funnel graphic as the hero subject.

---

## References

<!-- Mudit: paste measured rules from external case studies here (e.g. Rachel Chen Notion, Ruth Zhao, Aditya Currents, others). Round 35 placement and layout-alternatives treatment should follow this section once filled. -->

---


## Proposed figure-width system (round 35 implementation)

One system for **case study page**, **static export frames**, and **canvas iframes**. **Width tier picks the allowed aspect ratio**; do not pick a ratio in Figma or export first and scale it into the column later.

### Allowed aspect ratios (by tier)

| Tier | Placed width @ 1440 (column 750) | Placed width @ 390 (`sizes`) | **Allowed ratio** | Placed height (examples) |
|------|----------------------------------|------------------------------|-------------------|---------------------------|
| **Full** | **750px** | **342px** (`100vw - 48px`) | **16:10** only | 750×**469** / 342×**214** |
| **Pair** | **~369px** each (`(750 - 12) / 2`) | **~165px** each (`calc(50vw - 30px)`) | **4:5** or **1:1** (pick per pair; both columns in a row share one ratio) | 4:5 → 369×**461**; 1:1 → 369×**369** |
| **Trio** | **~242px** each (`(750 - 24) / 3`) | stack full width on small breakpoints | **4:5** only (portrait chat) | 242×**303** @ 1440; if 12px type cannot be held, **change layout** (e.g. stack or reduce to two-up), do not shrink type |
| **Gallery** | Full column; cell = Full or Pair tier per cell | same | Inherit cell tier ratio | Grid obeys per-cell tier |

**Authoring rule:** Build **live React** at **placed CSS width** (750, 369, or 242 for desktop tier), with height from the ratio above. UI is composed to **fill the frame** (≥ 92% UI area, no letterboxing). Optional **2× PNG** only for Agentation email review; the source of truth is **in-page** React at 1× placed width.

**Scale rule:** Chat and UI typography in a figure must match Dialogue product sizes at that **placed** width. At **1440**, verify **≥ 12px** on primary chat copy in DevTools while scrolled to the figure on `/dialogue`. At **390**, re-check the same figure after responsive layout (pair/trio may stack).

**Rules:**

- Remove the anatomy **80%** wrapper; **D-08** uses **Full** tier like adjacent sections.
- **Never** point two `D-*` IDs at the same PNG path (see asset map).
- **Canvas:** prefer the same `DialogueStudyFigure` as `/dialogue`; iframes are interim only.
- PNG fallback only for Agentation or email review, not for normal `/dialogue` rendering.
- **Verification:** Existing Playwright scripts plus **in-page** checks at 1440 and 390 on `/dialogue` (overflow, min font size, no letterboxing in figure box). Canvas-only screenshots are supplementary.

---

## Per-section plan (asset IDs)

| ID | Section | Round 35 action |
|----|---------|-----------------|
| **D-01** | Hero | **Replace.** `DialogueStudyFigure` **Full / 16:10**, JOOLA-tight study chat; scenario fixture; image fallback optional only. |
| **D-02** | Problem pair left | React scenario `problem-dense`: three paragraphs, **no sources**; **Pair** tier, same ratio as D-03. |
| **D-03** | Problem pair right | React scenario `problem-structured`: one claim, one chart, linked moments; **Pair** tier; distinct fixture from D-02. |
| **D-04** | Decision: paragraphs | React **Trio / 4:5**; same question fixture base as D-05/D-06. |
| **D-05** | Decision: quote list | React, identical tier/ratio/type scale as D-04. |
| **D-06** | Decision: structured | React, identical tier/ratio; chosen state in caption only, **not** opacity dimming of media. |
| **D-07** | Bar → clips | React structured answer, bar selected, clips visible; `mode: "demo"` if bar highlight is interactive. |
| **D-08** | Fixed structure | React anatomy callouts; **Full** width tier; no extra caption chrome under frame. |
| **D-09** | Chart fits question | **8–12** React scenarios in gallery grid; one chart type per scenario. |
| **D-10** | Clips solution | Keep narrative; ensure pair/problem placeholders get matching exports when built. |
| **D-11** | Messy research | Still candidate; **out of scope** for first build pass unless Mudit prioritizes. |
| **D-12** | Copy as card | Still candidate; **out of scope** for first build pass unless Mudit prioritizes. |
| **D-13 / D-14** | Placement | **Redesign treatment** (see below); likely **one** interactive or toggle frame + optional strip, not two static equal PNGs only. |
| **D-15** | One answer drawer | **Keep**; minor polish (fill, margin) only. |

### Chart / question matrix (D-09+)

Each row = **one real user question** + **one chart type** in Dialogue UI (summary line + chart + clips slot). Add one **scenario fixture** per row, rendered via `DialogueStudyFigure`.

| Question type | Chart / visual | Example question (placeholder ok until copy pass) |
|---------------|----------------|--------------------------------------------------|
| Funnel | Step funnel | Where do people drop in checkout? |
| Trend over rounds | Line or round-indexed bars | How did sentiment change across interview rounds? |
| Segment comparison | Grouped bars | How do novices vs experts differ on onboarding? |
| Distribution | Histogram or dot strip | How long do people spend on the pricing page? |
| Theme ranking | Horizontal bar rank | What themes come up most for trust? |
| Quote frequency | Count bars per theme | How often do people mention shipping cost? |
| Timeline of moments | Time axis with markers | When in the session do people mention the paywall? |
| Part-to-whole | Stacked bar or segmented single bar | What share of users hit each error type? |

Use **only** Dialogue tokens, chart components, and spacing from the export design system. No new icon sets.

### Decision block UX (D-04–D-06)

- **Desktop:** Three **Trio / 4:5** columns at placed width **~242px**; **no** `opacity: 0.55` on unchosen **media** (optional subtle border on chosen only). If **12px** chat type fails at that width, adjust layout per tier table (stack or fewer columns), not export scale.
- **Mobile:** Stack three frames; same order; each uses **Full** placed width (**342px**) with **4:5** height unless a single stacked ratio is defined in References.
- **Implementation preference:** `DecisionBlock` renders `DialogueStudyFigure` per option (shared product components + scenario ids).
- **Remove** reuse of `section-1`, `section-2`, `section-4` paths across decision + problem sections.

### Placement section (D-13 / D-14), proposed treatment

**Problem with today:** Side-by-side static PNGs at **Pair** tier read as "two small screenshots," not a design argument.

**Direction (finalize after References are filled; pick one in build after Mudit ok):**

1. **Option A:** One **Full**-tier live frame of the study page with in-frame control to switch **sidebar vs bubble** (export HTML or lightweight React). One caption for the decision. Optional labeled variant strip above the main frame if References call for it.
2. **Option B:** Two **equal** half-column live exports at **750px** logical width each, identical scale, plus short decision prose (why bubble). Only if References support side-by-side exploration at readable size.

Deprecate reusing `section-6` for bubble if it is also hero language unless hero moves off `section-6`.

---

## Engineering touchpoints (for implementation pass)

| Area | Files |
|------|--------|
| Case study layout | `components/dialogue/DialogueCaseStudyContent.tsx`, `components/DecisionBlock.tsx` |
| Live figures | `components/dialogue/DialogueStudyFigure.tsx`, `lib/caseStudies/dialogueScenarios/*` |
| Product UI (vendored) | `components/dialogue/product/*` (sync from Dialogue app; mirrors `StudyChatShell` export bundle) |
| Lightbox | `components/CaseStudyLightbox.tsx`, `app/globals.css` (`.cs-lightbox-*`) |
| Asset map | `lib/caseStudies/dialogue.ts`, `dialogueCanvasCatalog.ts` (`scenarioId` + optional `fallbackPng`) |
| Static export (parity) | `public/dev/dialogue-static/export/*.html`, shared product import when rebuilt |
| Canvas review | `app/dev/dialogue-canvas-v2/*` |

---

## Verification (round 35 brief commit)

Run locally with `npm run dev` (not `next start`):

| Script | Purpose |
|--------|---------|
| `node scripts/verify-dialogue-canvas-iframe-audit.mjs` | Iframe fill, 390 overflow |
| `node scripts/verify-dialogue-live-frame-parity.mjs` | PNG vs iframe samples |
| `node scripts/verify-dialogue-canvas-local.mjs` | Full-page canvas + `/dialogue` screenshots |
| `node scripts/verify-dialogue-story-map-preview.mjs` | Story map preview readiness |

**In-page (round 35 build):** At **1440** and **390** on `/dialogue`, per figure: no horizontal overflow, no letterboxing inside `.cs-figure-media`, chat copy **≥ 12px**, UI fill ≥ 92% of figure box, **no network** from figure subtrees (DevTools). Lazy figures mount when scrolled into view. Capture screenshots **with surrounding section context**, not cropped standalone assets.

**Snapshot at brief time:** iframe audit **passed** (no horizontal overflow at 390; iframe fill metrics recorded under `/cursor/stores/bot/dialogue-canvas-verify/`). Live parity shots written for D-04, D-06, D-09. Re-run full suite after visual build.

---

## Out of scope (until a follow-up brief or explicit ask)

- Implementing hero, exports, DecisionBlock live UI, lightbox CSS, or placement toggle.
- Filling **CaseStudyPlaceholder** copy (quotes, outcome, reflection).
- **D-11** / **D-12** first visuals.
- Publishing Dialogue on the homepage or removing `noindex`.
- Committing **ABC Areal** binaries (continue `NEXT_PUBLIC_AREAL_URL`).
- Regenerating the round-18 baseline aesthetic without approval.
- Vercel promotion beyond `review/dialogue-canvas` preview.

---

## Confirmation gate

Mudit: reply **go** (or edits to this brief) before any visual/code implementation on round 35.
