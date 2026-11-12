# Design rules

Standing rules for the portfolio. Builders read this with `design/OPEN-ASKS.md` before changing UI.

## Standing

- Intro elements that start hidden must have a fail-safe reveal so a missed `intro-done` (or equivalent gate) cannot leave them stuck at opacity 0 with controls inert forever (HOM-01). Prefer the same fade as the normal path; clear the timer when the normal reveal runs and on unmount so the reveal never runs twice.

## Site grid (Nov 11, 2026, shared outer edges)

- One shared grid for Nav, Footer, the home grid (hero + masonry) and case studies: 12 columns, gap `--grid-gutter` (24), side margin `--page-px` (24, constant at every width), band capped at `--site-max-w: 2200px` and centred beyond that. Tokens in `app/globals.css`: `--site-cols: 12`, `--site-max-w: 2200px`. Callers use `--site-max-w`; `--grid-max-w` (1440) stays only for the Archive `BentoGallery` canvas and the dev nav-morph page. Do not repoint it.
- Structural breakpoints are only 768 and 1200 (matches rachelchen.tech). At or below 1440 the band equals the viewport minus margins, so nav, footer and home grid are unchanged there.
- Case studies at >=1200: TOC = cols 1-2 (far left, same x as nav/home/footer edge); content lane = cols 3-10 (2/3 vw - 40px, never under 760px), lane cap 1600px; hero and figures fill the lane. Prose keeps its 40rem cap, left-aligned in the lane. The hero is capped by width so it never exceeds ~80vh tall (`max-width: min(100%, max(750px, 80vh * --cs-hero-ar))`, with `--cs-hero-ar` = width/height set on the hero frame; no letterboxing).
- Case study body size is `--fs-body` 15px, 16px at >=1920 and 17px at >=2560, scoped to `.cs-layout` only.
- Tablet 768-1199: TOC hidden; everything except the hero stays in a centred 750px lane; the hero runs full width between the margins. Mobile (<=767) is one column at 24px margins, unchanged.
- Case-study media `sizes` live in `lib/caseStudyLayout.ts` (`CASE_STUDY_MEDIA_SIZES`); keep them in step with the lane math above.

## Latest verdict (Nov 10, 2026, native-aspect masonry)

- Homepage order: BruinLease, JOOLA, Dialogue, All in One demo, sviz, then the Habit phone demo. Only live case studies go in CASE_STUDY_PAGES; Dialogue stays out until /dialogue ships.
- CD/music player removed from the homepage grid and About.
- Each home-grid card uses its source media's native ratio, in a 2-column masonry: equal column widths, heights vary with the media. Reading order is left-right then down (left: BruinLease, Dialogue, sviz; right: JOOLA, All in One, Habit). Mobile (max-width 767px) is one column in that same order, each card full width at its native ratio. Ratios: BruinLease 6:5, JOOLA 4:3, Dialogue 4:3, sviz 1572:1080, All in One 1362:1080, Habit stays a 4:3 frame (that frame is the card's original media, not a crop). Media is object-fit contain (no cover crop, no BruinLease letterbox). (Mudit, Nov 10, 2026; supersedes the same-day justified-rows note and the Nov 5 "every tile 4:3" lockstep rule.)
- Dialogue card: approved "option 3 · the panel" (#FCFBF9 panel on shadow, 8px chips, no divider, no "Illustrative" label) with a small "Preview" tag top right, DM Sans, and the user prompt bubble. Title "Generative answers for UX research" (working, not locked), no outcome claims.
- Grid hover pill: fine pointers only, follows the cursor below/right, never replaces the OS cursor. Opaque lilac (`--color-lilac` / `--color-lilac-ink`), 8px radius, light `--shadow-pill`. Copy: "Case Study" on case studies, "Coming Soon" on Dialogue, "Demo" on Habit and All in One.
- Dialogue tap: opacity crossfade to a statically blurred media duplicate; centred rose pill (`--color-tap-rose`) reading "Case Study Coming Soon"; aria-live polite; ~2s dismiss.
