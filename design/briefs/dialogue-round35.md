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
7. **Sidebar vs floating bubble:** Current side-by-side is "just ok." **Research** Rachel Chen (Notion agents), Ruth Zhao, Aditya Das (Currents), plus 2–3 strong product case studies; **propose a better layout-alternatives treatment**.
8. **Keep:** **"One answer, start to finish"** drawer graphic (`D-15` / `section-7.png`).

**General (all sections):** Prefer **live components** (static HTML export iframes or in-page React) over PNGs. **Areal**, weight **≤ 500**, **sentence case**, **no em dashes**, **no invented icons**, **face/clip blur only for privacy**.

---

## Measured rules (references + this site)

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
| Hero intrinsic ratio (JOOLA ref) | **2400 × 1600 (3:2)** | `hero-ruth-2.png`, `/joola` |

### JOOLA B2B hero (Ruth Zhao-inspired language on this site)

- **What it is:** One **full-column** product screen, edge-to-edge inside the 8px rounded frame, **no letterboxing**, subtle inset border, UI reads at **750px** column width and at **390** viewport.
- **What it is not:** Abstract charts, floating diagrams, or wide empty margins.
- **Dialogue hero direction:** Same treatment: **one flagship study-chat answer** (structured answer with summary + chart + clips), cropped tight like wholesale UI on JOOLA, **not** a standalone funnel graphic as the hero subject.

### Rachel Chen, [Notion Custom Agents](https://rachelchen.tech/projects/notion)

- **Exploration blocks:** Three **equal-weight** option cards in one row (desktop), each with **title + short line + large media** (video or UI), not thumbnails.
- **Problem → solution:** Full-width media per beat; autoplay loops with clear captions.
- **Decisions:** After explorations, **text-forward "key interaction decisions"** with numbered principles, not another duplicate screenshot.
- **Takeaway for Dialogue:** Decision block and placement explorations should use **equal full-bleed frames** within the 750px column, then prose decisions below.

### Aditya Das, [Currents](https://adityad.as/currents)

- **Rhythm:** Alternating **full-column** UI captures and short headings; media carries the story.
- **Modal:** Enlarged media is **not** edge-to-edge on the viewport; UI chrome stays visible around the asset.
- **Takeaway for Dialogue:** Lightbox behavior aligns with **modal-style caps** (80vh / 1100px), not immersive fullscreen bitmap.

### Ruth Zhao, [Ramp delegation](https://www.ruth-zhao.com/ramp)

- **Prototype strip:** Named variants in a **horizontal row** (calendar, toggle, banner) at **readable** scale before final screens.
- **Final screens:** Full-width solution frames per sub-problem.
- **Takeaway for Dialogue:** Placement section can use a **labeled variant strip** plus **one** full study-page frame for the chosen pattern.

### Additional references (layout alternatives)

| Reference | Pattern | Relevant measure / habit |
|-----------|---------|---------------------------|
| [Linear](https://linear.app/now/how-we-redesigned-the-linear-ui) (product stories) | Before/after or **toggle** on **one** canvas | Single viewport, state change, avoids two mismatched crops |
| [Stripe Sessions / design posts](https://stripe.com/blog) | **Annotated** screenshots, consistent artboard width | One artboard width per story, captions outside image |
| [Notion (Rachel)](https://rachelchen.tech/projects/notion) | **3-up** exploration grid | Equal columns, equal media height |

---

## Proposed figure-width system (round 35 implementation)

One system for **case study page**, **static export frames**, and **canvas iframes**:

| Tier | CSS width | Export frame width (logical) | Use |
|------|-----------|------------------------------|-----|
| **Full** | `100%` of column (`750px`) | **1500px** wide (2× for capture); height from content, prefer **3:2** for hero only | Hero, anatomy, chart gallery, drawer, single proof frames |
| **Pair** | `calc((100% - 12px) / 2)` (~**369px** each at 750) | **750px** per side in a **1500×H** combined export, or **two exports** at **750×H** each | Problem vs solution, clip problem/solution, placement (if kept as two) |
| **Trio** | `calc((100% - 24px) / 3)` (~**242px** min; at mobile stack) | Shared **chat column width 390px** inside each export, scaled down equally; fixed frame **390 × 680** (portrait chat) for all three decision options | Decision block only |
| **Gallery grid** | Full column; inner grid 2×N | **1500px** wide artboard, cells **750px** or **375px** per cell as needed | Multi-chart section |

**Rules:**

- Remove the anatomy **80%** wrapper; **D-08** uses **Full** tier like adjacent sections.
- **Never** point two `D-*` IDs at the same PNG path (see asset map).
- **Prefer live row on canvas:** iframe at export pixel size, scaled to column (existing `LiveExportIframe` pattern).
- PNG fallback only for Agentation or email review when iframes are blocked.

---

## Per-section plan (asset IDs)

| ID | Section | Round 35 action |
|----|---------|-----------------|
| **D-01** | Hero | **Replace.** New export `hero` (or new route `hero-ruth`): JOOLA-style tight **study chat** UI, 3:2 artboard, uiAreaFraction ≥ 0.92. Deprecate graph-only `section-6` as hero. |
| **D-02** | Problem pair left | **New export** `problem-dense`: three paragraphs, **no sources**, unique raster path. |
| **D-03** | Problem pair right | **New export** `problem-structured`: one claim, one chart, linked moments; **must not** share file with D-02. |
| **D-04** | Decision: paragraphs | **Live chat UI** at trio frame **390×680**; same question string as D-05/D-06. |
| **D-05** | Decision: quote list | **Live chat UI**, same frame and typography scale as D-04. |
| **D-06** | Decision: structured | **Live chat UI**, same frame; chosen state styling only in caption, **not** opacity dimming of media. |
| **D-07** | Bar → clips | **New crop** from structured answer export (bar selected, clips visible); do not reuse whole `section-4` if it duplicates D-06 hero crop. |
| **D-08** | Fixed structure | Tighten zoom; remove chrome caption list under image (per prior G1/G2); **Full** width tier. |
| **D-09** | Chart fits question | **Expand** to **8–12** examples (see chart matrix below); grid or vertical stack in **Full** tier; each cell its own export route. |
| **D-10** | Clips solution | Keep narrative; ensure pair/problem placeholders get matching exports when built. |
| **D-11** | Messy research | Still candidate; **out of scope** for first build pass unless Mudit prioritizes. |
| **D-12** | Copy as card | Still candidate; **out of scope** for first build pass unless Mudit prioritizes. |
| **D-13 / D-14** | Placement | **Redesign treatment** (see below); likely **one** interactive or toggle frame + optional strip, not two static equal PNGs only. |
| **D-15** | One answer drawer | **Keep**; minor polish (fill, margin) only. |

### Chart / question matrix (D-09+)

Each row = **one real user question** + **one chart type** in Dialogue UI (summary line + chart + clips slot). Implement in export app first, then case study grid.

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

- **Desktop:** Three **Trio** columns, **no** `opacity: 0.55` on unchosen **media** (optional subtle border on chosen only).
- **Mobile:** Stack three frames; same order; maintain **identical** frame dimensions per row.
- **Implementation preference:** `DecisionBlock` accepts `liveExportSrc` per option **or** embedded React from the same `/export` routes used on canvas.
- **Remove** reuse of `section-1`, `section-2`, `section-4` paths across decision + problem sections.

### Placement section (D-13 / D-14), proposed treatment

**Problem with today:** Side-by-side static PNGs at **Pair** tier read as "two small screenshots," not a design argument.

**Recommended direction (pick one in build after Mudit ok):**

1. **Primary: Single study canvas + toggle** (Linear-style): One **Full**-tier live frame of the study page; UI control switches **sidebar vs bubble** (state in export HTML or lightweight React). One caption line for the decision. **Optional** Ruth-style **strip** of two small labeled stills above, not below fold as the only content.
2. **Alternate: Rachel-style 2-up + decision prose:** Two **equal Full-half** mockups only if each is **unique** HTML export at **750px** width with identical scale; followed by a short "why bubble" bullet block (copy TBD).

Deprecate reusing `section-6` for bubble if it is also hero language unless hero moves off `section-6`.

---

## Engineering touchpoints (for implementation pass)

| Area | Files |
|------|--------|
| Case study layout | `components/dialogue/DialogueCaseStudyContent.tsx`, `components/DecisionBlock.tsx` |
| Lightbox | `components/CaseStudyLightbox.tsx`, `app/globals.css` (`.cs-lightbox-*`) |
| Asset map | `lib/caseStudies/dialogue.ts`, `dialogueCanvasCatalog.ts`, `dialogueRasterManifest.json` |
| Live exports | `public/dev/dialogue-static/export/*.html`, export frame manifest |
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
