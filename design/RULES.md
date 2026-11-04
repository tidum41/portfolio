# Design rules

Standing rules for the portfolio. Builders read this with `design/OPEN-ASKS.md` before changing UI.

## Standing

- Intro elements that start hidden must have a fail-safe reveal so a missed `intro-done` (or equivalent gate) cannot leave them stuck at opacity 0 with controls inert forever (HOM-01). Prefer the same fade as the normal path; clear the timer when the normal reveal runs and on unmount so the reveal never runs twice.
