# Design rules

Standing rules for the portfolio. Builders read this with `design/OPEN-ASKS.md` before changing UI.

## Standing

- Intro elements that start hidden must have a fail-safe reveal so a missed `intro-done` (or equivalent gate) cannot leave them stuck at opacity 0 with controls inert forever (HOM-01). Prefer the same fade as the normal path; clear the timer when the normal reveal runs and on unmount so the reveal never runs twice.

## Latest verdict (Nov 10, 2026, native-aspect masonry)

- Homepage order: BruinLease, JOOLA, Dialogue, All in One demo, SViz, then the Habit phone demo. Only live case studies go in CASE_STUDY_PAGES; Dialogue stays out until /dialogue ships.
- CD/music player removed from the homepage grid and About.
- Each home-grid card uses its source media's native ratio, in a 2-column masonry: equal column widths, heights vary with the media. Reading order is left-right then down (left: BruinLease, Dialogue, SViz; right: JOOLA, All in One, Habit). Mobile (max-width 767px) is one column in that same order, each card full width at its native ratio. Ratios: BruinLease 6:5, JOOLA 4:3, Dialogue 4:3, SViz 1572:1080, All in One 1362:1080, Habit stays a 4:3 frame (that frame is the card's original media, not a crop). Media is object-fit contain (no cover crop, no BruinLease letterbox). (Mudit, Nov 10, 2026; supersedes the same-day justified-rows note and the Nov 5 "every tile 4:3" lockstep rule.)
- Dialogue card: approved "option 3 · the panel" (#FCFBF9 panel on shadow, 8px chips, no divider, no "Illustrative" label) with a small "Preview" tag top right, DM Sans, and the user prompt bubble. Title "Generative answers for UX research" (working, not locked), no outcome claims.
- Grid hover pill: fine pointers only, follows the cursor below/right, never replaces the OS cursor. Opaque lilac (`--color-lilac` / `--color-lilac-ink`), 8px radius, light `--shadow-pill`. Copy: "Case Study" on case studies, "Coming Soon" on Dialogue, "Demo" on Habit and All in One.
- Dialogue tap: opacity crossfade to a statically blurred media duplicate; centred rose pill (`--color-tap-rose`) reading "Case Study Coming Soon"; aria-live polite; ~2s dismiss.
