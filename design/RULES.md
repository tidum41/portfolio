# Dialogue case study rules

Standing rules: sentence case, no em dashes, site weight cap 500 (Dialogue UI keeps its real 600). Figures stay the approved components with no hover state. Clicking a figure opens a lightbox (see below). Do not commit fonts, Dialogue screenshots, or unblurred frames.

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
- Figure wells use one calm neutral surface (`#eeedeb`, token `--dp-figure-surface-system`) on the `#fbfbfb` page, with a 1px border at 4% black, for every Rachel frame including JOOLA and BruinLease. Do not change frame background to signal emphasis; use outline or a small in-frame tag instead. UI cards inside stay on Paper `--dp-surface`.
- Comparison rows (solutions, chart mapping) top-align cards at their natural height; do not stretch cards or pad them to match. Stacked cards at 390 hug their content. This supersedes the equal-height rule for those rows.
- Hero is a straight, grid-aligned product preview with no rotation and no scattered overlap (dialogue-v2 brief; supersedes the collage rule). At 390 it is a separate deliberate composition, not a shrunk desktop. Chart library pairs are equal-size and grid-aligned, each with a plain verdict line and a muted technical line.
- Figure lightbox (DLG-13, DLG-23): every Dialogue figure opens a lightbox on click. It never fills the viewport (max 900px wide and 80vh tall, scrolls inside), has a visible labeled "Close" button, and closes on Esc and backdrop click. Fade about 200ms, none under prefers-reduced-motion. At 600px and below the lightbox is disabled (no trigger, default cursor) because it adds nothing there; the sticky contents list is hidden while it is open. It reuses `CaseStudyLightbox`, the same one the JOOLA and BruinLease image figures use. Supersedes the earlier "static, no click" rule.
- Restores: a restore is a git checkout of the pinned sha plus a diff in the report. Never rewrite a pinned file from memory (Misses M5).
- Figure wells use `--figure-well` with `--figure-well-border` in both themes (light #eeedeb, dark #1b1e21), on every case study frame.
- Preview gate: a round is not done until `npm run check:dialogue-preview -- <archive-team preview url of the tip>` passes (real-click Close at scrollY 0 in both themes, whole-page contrast sweep in both themes, open-lightbox contrast sweep, no zoom triggers at 600 and 390) and its output is pasted in the report. Figure captions use `--caption-ink`.
