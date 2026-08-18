# Design Principles Audit

**Scope:** Mudit Mahajan portfolio vs Josef Müller-Brockmann grid doctrine, Swiss / International Typographic Style habits, and contemporary portfolio + editorial craft (UX / design-engineering).  
**Date:** 2026-07-29  
**Code baseline:** tokens in `app/globals.css` `@theme`, layouts in `components/` + case-study pages.

---

## 1. Audit lenses

### Müller-Brockmann / modular grid
1. Start from format + type size; derive columns, gutters, margins from those — not from taste alone.
2. One coherent underlying structure that allows variation without chaos.
3. Modules sized so baselines and image edges share the same horizontal divisions.
4. Hierarchy comes from position and scale on the grid, not from decoration.
5. Consistency across pages > one-off optical patches.

### Typography / Swiss habits
1. Few faces, clear roles (sans for UI/body; display sparingly).
2. Tight scale with intentional steps; readable measure (~45–75 characters).
3. Alignment over ornament; tracking used for labels, not body.
4. Contrast via weight/size/space, not color noise.

### UX / design-engineering (Kowalski-adjacent)
1. Unseen details compound; frequent actions stay fast or unanimated.
2. Motion needs a purpose (feedback, spatial continuity, state) — not “looks cool.”
3. Ease-out / springs for UI; durations usually &lt; 300ms for chrome.
4. Hit targets, reduced-motion, and optical tweaks that don’t break the system.

---

## 2. Reference sites — what they actually teach

| Reference | Pattern to steal | Pattern *not* to copy blindly |
|---|---|---|
| **liumichelle.com/about** | Sectioned personal narrative; clear “who / experience / lore” rhythm; editorial voice + structured lists | Heavy CMS-driven blocks that can feel empty while loading; don’t turn About into a dashboard of widgets |
| **meganphi.com** | Numbered chapters / strong one-line thesis; project list as quiet index (title + one line); confidence through restraint | Emoji-forward branding; numbered chrome that becomes gimmick if overused |
| **christinaraganit.xyz/lore** | Long-form personality page with typographic hierarchy (caps labels, education/awards as structured meta); lore as *voice*, not scrapbook clutter | Dense award stacks without visual rest |
| **justinzwu.com** | Strong brand mark as hero signal; playful system (themes, controls) that still feels authored; media-forward work | Interaction density that competes with work; orange/theme theatrics without an equivalent brand system here |
| **leofu.ca** | Essay-first home; work as a dated index under a clear thesis; extreme clarity of intent (“cool 2D things”) | Recruiting-form homepage only works if that *is* the product |
| **postarchivefaction** | Fashion-archive gravity: product as archive, sparse type, image primacy, “collections” as taxonomy | Luxury e-comm chrome (cart, announcement bars) |
| **ssense.com (+ editorial)** | Editorial grid discipline; category + date + headline hierarchy; image as plane; whitespace as structure | Catalog scale and ad density |
| **ritawangarchive.com/info** | Name as brand hero; short bio + place imagery as emotional proof; contact as single CTA | Location-photo essays that dilute a product-design portfolio |

**Cross-cutting lesson from the set:** the best refs pick *one* organizing idea per surface (essay, index, lore, archive, shop) and let type + image carry it. They don’t mix “case-study CMS,” “bento personality,” and “interactive toy shelf” on the same first viewport.

---

## 3. This site — system inventory (facts)

| Token / structure | Value |
|---|---|
| Page gutter | `--page-px: 24px` (fixed across breakpoints) |
| Outer frame | `--grid-max-w: 1440px` |
| Reading column | `--content-max-w: 750px` (~ ideal measure at 15px) |
| Section rhythm (CS) | `--section-gap: 80` / `--section-pb: 64` (mobile 48 / 32) |
| Work grid | 2-col, col-gap 24, row-gap `--card-gap: 48` |
| Case study | `.cs-layout`: `1fr \| 750px \| 1fr` → 160px TOC + content @ ≤1100 → 1-col @ ≤767 |
| Body | HN 15 / 400 / lh 1.72 |
| Display | Georgia on home hero + about titles; **HN Medium** on case-study heroes |
| Radii | 2 / 4 / 6 / 8 / 14 / 24 — cards sit at 4 |
| Motion | Route opacity ~160–180ms; entrances y+fade; card hover spring scale 0.97 |

**Surfaces**
- **Work (`/`)**: full-bleed silk hero → 2-col project grid + interactive embeds  
- **About**: 750px column; Georgia titles; bio + bento  
- **Archive**: fixed viewport gallery (4-col, gap 12, aspect 1.25), footer docked  
- **Case studies**: TOC + 750px narrative column  

---

## 4. What’s working (keep)

1. **Reading measure** — 750px at 15/1.72 is Müller-Brockmann-compatible: format + type size actually drive the column.
2. **Asymmetric case-study grid** — `1fr | content | 1fr` is a legitimate modular choice: content modules stay centered; TOC lives in the margin field like a Swiss side note.
3. **Constant page padding** — fixed 24px gutters avoid the “padding catch-up” jitter common on responsive portfolios.
4. **Work card quietude** — image + title + one subline (Megan Phi / Leo index energy) without badge clusters.
5. **Motion discipline (mostly)** — route fades are short; reduced-motion paths exist; hover press-in has a clear feedback purpose.
6. **Archive as its own idea** — full-bleed zoomable plane is closer to PAF/SSENSE image primacy than a second project grid. Correct separation of concerns.
7. **WCAG-aware muted tokens** — tertiary/muted were darkened for real body use; system honesty over pure aesthetics.
8. **Brand-adjacent craft** — HN + Georgia pairing, soft `#FBFBFB` field, lilac accent used sparingly: closer to editorial Swiss than generic “AI purple SaaS.”

---

## 5. Violations & tensions (ranked)

### P0 — Structure / consistency (grid doctrine)

| ID | Finding | Why it fails the lenses | Where |
|---|---|---|---|
| **G1** | **No shared modular baseline** across Work / About / Archive / CS. Each surface invents its own vertical rhythm (hero 56/48, about section 80, CS 80/64, archive gap 12). | MB: one system with variation. Here: four systems that happen to share 24px side padding. | `@theme`, page shells |
| **G2** | **Optical `translateX` patches** (`--cs-align-*`: −6 / −2px) instead of fixing the box model. | Grid alignment should come from margins/columns, not per-glyph nudges that DialKit can override with `!important`. | `.cs-hero-*`, DialKit |
| **G3** | **Typography role split is inconsistent**: Georgia home + about; HN Medium case-study H1. Same “page title” job, two faces. | Swiss: roles are stable. Readers learn a language; CS titles feel like a different site. | `HeroText`, about, CS heroes |
| **G4** | **Home hero is a different grid** (full-bleed silk, no 1440 content lock on the silk plane) while the work grid snaps to 1440. | Fine if intentional “bleed then settle,” but the settle isn’t modularly related to the silk (no shared column edges). | `PersistentWorkShell` |

### P1 — Hierarchy / editorial craft (refs)

| ID | Finding | Ref contrast | Where |
|---|---|---|---|
| **H1** | **Work first viewport competes**: silk atmosphere + hero copy + interactive toys (CD / habit) + project cards nearby. | Megan/Leo: one thesis + index. Justin: brand mark wins. PAF: product image wins. | `/` |
| **H2** | **About lacks a single organizing sentence** at hero weight; bento can outrank bio on mobile (`order`). | Michelle/Christina/Rita: name or thesis first; images support. | `/about` |
| **H3** | **Archive captions / chrome** (hint pill, zoom panel, edge fades) risk becoming UI theater over archive gravity. | SSENSE editorial / PAF: chrome recedes; image taxonomy leads. | `/archive` |
| **H4** | **Case studies are strong narratively** but meta grids, phone mockup % widths (77%, magic max-widths), and reflection grids introduce **local grids** that don’t snap to the 750 module. | MB modular images span N modules — not arbitrary % widths. | CS pages, `.pm-*` |

### P2 — Design-engineering / UX polish

| ID | Finding | Why |
|---|---|---|
| **E1** | Entrance y:20 @ 0.45s on frequent route visits is on the long side for “portfolio browsing.” | Prefer shorter / smaller travel for repeated navigation (Emil frequency rule). |
| **E2** | Custom cursor + silk + embeds = high ambient cost; must stay subordinate to content. | Beauty is leverage only while content remains primary. |
| **E3** | Mobile work `order` hard-codes project IDs via `display: contents`. | Fragile; breaks when CMS order changes — system should encode order in data, not CSS exceptions. |
| **E4** | Dead CSS (polaroid scrapbook, unused TOC track) implies abandoned systems still in the cascade. | Noise in the design system; delete or wire. |

### P3 — Taste risks (conscious, not always wrong)

- Lilac accent `#9590C2` sits near the “AI purple” cluster — currently restrained; keep it label/link-only.
- Card radius 4 + soft gray field is tasteful; avoid drifting into cream/terracotta or broadsheet hairlines (both called out in site design rules).
- Interactive embeds are a differentiator vs pure static refs — keep them, but **below** the first calm read of name/role/work.

---

## 6. Page-by-page scorecard

| Page | Grid | Type | Hierarchy | Motion | Verdict |
|---|---|---|---|---|---|
| **Work** | B+ (2-col clear; hero disconnected) | A− (HN/Georgia clear) | B− (busy first screen) | B+ | Strong craft; calm the hero composition |
| **About** | B (750 aligned with CS) | A− (Georgia titles) | B (bento vs bio) | B | Good; sharpen thesis, demote bento on mobile |
| **Archive** | B (own module OK) | B | B (chrome vs image) | A− (zoom is purposeful) | Keep as archive plane; quiet chrome |
| **Case studies** | A− (best MB alignment) | B+ (HN-only break from marketing pages) | A− | B+ | Unify title face with site; retire align hacks |

---

## 7. Prioritized recommendations

### Do next (high leverage, low drama)

1. **Unify page-title typography**  
   Pick one rule: e.g. *Georgia for person/brand surfaces (home, about); HN Medium for project/documentation (CS, archive UI)*. Document it in tokens (`--font-page-title` vs `--font-doc-title`) so it stops being accidental.

2. **Replace `--cs-align-*` with real inset**  
   Adjust padding/margin on `.cs-back` / title wrappers so optical alignment is in the box model. Kill DialKit live `translateX` for production.

3. **Define a vertical module**  
   Publish a small scale derived from body leading — e.g. base unit **8px**, section = **10×** (80), card row = **6×** (48), already almost true. Explicitly map About / Work hero / CS to that ladder; stop inventing 56/40/32 orphans unless named.

4. **Work hero budget**  
   First viewport: brand/name signal + one line + one CTA-or-scroll affordance + silk. Defer CD/habit visual weight until scroll into the grid (or keep embeds but ensure they don’t read as equal heroes beside the H1).

5. **About mobile order**  
   Bio/thesis before bento (`order` swap). Rita/Michelle pattern: words first, images as proof.

6. **Case-study media widths**  
   Replace 77% / magic max-widths with fractions of the 750 column (e.g. 100%, 2/3, 1/2) so mockups sit on modules.

### Do when touching those files

7. Encode mobile project order in data, not CSS.  
8. Shorten repeated route entrance travel (y 12 / 300ms or opacity-only).  
9. Delete unused polaroid + TOC track CSS.  
10. Archive: default chrome opacity lower; reveal controls on intent (hover/focus), SSENSE-quiet.

### Do not do (false lessons from refs)

- Don’t clone Justin’s control density or Leo’s hiring form.  
- Don’t turn About into Michelle’s full CMS widget wall.  
- Don’t force Archive back into a 2-col project grid — its job is image archive.  
- Don’t add cards, pill clusters, or stat strips to the work hero to “match” SaaS portfolios.

---

## 8. Principle → site mapping (summary)

| Principle | Site status |
|---|---|
| Grid from type + format | **Partial** — 750/15 is solid; vertical + cross-page modules weak |
| One system, many layouts | **Weak** — four surface dialects |
| Hierarchy via position/scale | **Good on CS**; mixed on Work/About |
| Few type roles | **Mostly**; CS H1 is the main inconsistency |
| Measure & leading | **Strong** |
| Image as plane (archive/editorial) | **Strong on Archive**; Work silk helps |
| Motion with purpose | **Mostly**; entrance length is the soft spot |
| Invisible details | **Strong** (optical, a11y, embeds) — sometimes *too* many systems |

---

## 9. Suggested north star (one sentence)

**A Swiss reading column (750) and 24px gutter as law; Georgia for “who,” HN for “what I built”; Work as calm index + craft toys on the second beat; Archive as image plane; Case studies as modular documentation — no optical translates, no orphan spacing.**

---

*This audit is advisory. No code was changed for these findings.*
