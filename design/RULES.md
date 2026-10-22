# Dialogue case study rules

Standing rules: sentence case, no em dashes, site weight cap 500 (Dialogue UI keeps its real 600). Figures stay the approved components, static, with no hover or click. Do not commit fonts, Dialogue screenshots, or unblurred frames.

## 2026-10-21

- One caption style: a 13px label plus at most one sentence, below the figure, with a 24px gap.
- Running text and captions max out at 640px.
- No text inside a figure under 11px at 1440 or 390.
- On mobile, crop a figure to the region that matters instead of scaling it below about 0.85.
- Mobile figures: crop on the right or bottom at a deliberate edge, never mid-word on the left.
- Verify text size and clipping with a script that walks the DOM, not by eye.
- Mobile fixes are scoped to the mobile breakpoint; diff desktop before and after.
- Contents labels use the full section headings.
- Spacing uses Paper tokens; never stack paragraph margin with row gap.
- Assistant content is left-aligned from the column edge; only user bubbles sit right.

## 2026-10-22

- Dot separators (·) are not a default. Use them only where two short metadata values truly sit inline in product UI; otherwise use layout, weight, or a line break. Remove them from case study captions and labels (for example "Answer + evidence, Chosen" not "Answer + evidence · Chosen").
- Case study figure containers use the same corner radius as JOOLA and BruinLease media frames (`var(--radius-control)`, 8px). Read the token from `app/globals.css`, do not guess.
- Figures in a comparison row share one height (stretch the frame, not the caption).
- Figure wells use one calm neutral surface (`#f2f1f0`, token `--dp-figure-surface-system`) for every Rachel frame. Do not change frame background to signal emphasis; use outline or a small in-frame tag instead. UI cards inside stay on Paper `--dp-surface`.
- Comparison rows (solutions, chart mapping) top-align cards at their natural height; do not stretch cards or pad them to match. Stacked cards at 390 hug their content. This supersedes the equal-height rule for those rows.
- Hero is a scattered collage of library charts (160-280px, rotations within 4deg) overlapping the chat card, all fully inside the frame with one-line titles. At 390 show chat plus two complete charts.
