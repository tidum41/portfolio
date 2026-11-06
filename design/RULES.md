# Design rules

Standing rules for the portfolio. Builders read this with `design/OPEN-ASKS.md` before changing UI.

## Standing

- Intro elements that start hidden must have a fail-safe reveal so a missed `intro-done` (or equivalent gate) cannot leave them stuck at opacity 0 with controls inert forever (HOM-01). Prefer the same fade as the normal path; clear the timer when the normal reveal runs and on unmount so the reveal never runs twice.

## Latest verdict (Nov 5, 2026, grid v3 preview)

- Homepage order: BruinLease, JOOLA, Dialogue, SViz, All in One demo, then the Habit phone demo. Only live case studies go in CASE_STUDY_PAGES; Dialogue stays out until /dialogue ships.
- CD/music player removed from the homepage grid and About.
- Every grid tile uses one 4:3 media ratio so the two columns stay in step.
- Dialogue card: approved "option 3 · the panel" (#FCFBF9 panel on shadow, 8px chips, no divider, no "Illustrative" label) with a small "Preview" tag top right, DM Sans, and the user prompt bubble. Title "Generative answers for UX research" (working, not locked), no outcome claims.
- Grid hover pill: fine pointers only, follows the cursor below/right, never replaces the OS cursor. Opaque lilac (`--color-lilac` / `--color-lilac-ink`), 8px radius, light `--shadow-pill`. Copy: "Case Study" on case studies, "Coming Soon" on Dialogue, "Demo" on Habit and All in One.
- Dialogue tap: opacity crossfade to a statically blurred media duplicate; centred rose pill (`--color-tap-rose`) reading "Case Study Coming Soon"; aria-live polite; ~2s dismiss.
