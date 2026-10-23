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

## 2026-10-22 (r17)

- Chart titles: every chart has one, at 12/16, weight 500, muted, with a fixed 12px gap above the plot. No chart without a title, no per-figure overrides.
- Compared specimens (cards in one comparison) use equal columns, the same padding and radius, one type scale and weights 400 and 500 only. Scale, crop or extra weight is never used to flatter the winner.
- Source pill format: name at weight 500, time at weight 400 in muted color with tabular-nums, a 6px gap, no comma or dot.
- A restyle never removes trust signals. Every answer card keeps its evidence footer ("Based on N of 24 interviews"), and a low-signal answer keeps the amber warning on its lead.
- The Oct 19-20 components (`5bfaa4b` through `f6a5192`, and `657337d`) are the visual baseline. No round may regress them; restore from those commits, do not reinterpret.
- Dialogue components use DS tokens strictly. Colors, type sizes, weights, radii and strokes come from role tokens in `styles/dialogue-tokens.css`. Deviations live only in that file's documented case-study extension block, each with its reason. Components never reference the raw `--ds-*` layer. `npm run check:dialogue-tokens` enforces it.

## Review workflow (local first)

- Mudit watches locally. His dev server on his Mac fast-forwards from `origin/review/dialogue-figure-parity-b9b1` every 15s and hot-reloads. Push small, frequent commits to that branch so he sees progress live. Never merge to main.
- Vercel builds are off by default. `vercel.json` `ignoreCommand` builds `main` always, builds `review/*` only when the commit message contains `[preview]`, and skips every other branch. Commit messages without `[preview]` never trigger a build.
- Put `[preview]` in a commit message only when Mudit explicitly asks for a phone preview. Do not add it otherwise.
- Checks (`check:dialogue-preview`, `check:annotate`, `check:site-mobile`, `check:dialogue-tokens`) run against a local `next build && next start` on the VM (`rm -rf .next` first, then `git checkout lib/caseStudies/dialogueReviewManifest.json`). Do not wait for or require a Vercel preview to finish a round. Paste the local output in the report.
- When a `[preview]` build is requested, the account rule below applies.

## Preview account

- Previews and share links come only from the Vercel account `archive14photo-4965`, from its deployments of `review/dialogue-figure-parity-b9b1`. The old account `mudits-projects-d560e6b3` is disabled (402 Payment required). Never create, open or report links from it, including older entries in the iteration log. If the new account is not reachable from the Vercel tools, say so; do not substitute an old-account URL.

## Agentation annotate ids (STD-09)

Preview and local builds mount `<Agentation />` (never production). Annotatable case-study graphics and home cards must be real DOM targets: no blocking overlays, no `pointer-events: none` on the selectable part itself (decorative layers such as phone chrome or posters may stay non-interactive).

Use stable `data-annotate="<figure>/<part>"` on every figure part so copied markdown still resolves after minification:

| Surface | Figure id examples | Parts |
| --- | --- | --- |
| Home work cards | `home-card/joola`, `home-card/cd` | `root`, `media`, `media-wrap`, `slot` |
| Case study image figures | `bruinlease-problem`, `cs-figure` | `root`, `media`, `caption`, `zoom`, `lightbox-*` |
| Case study heroes | `cs-hero`, `joola-hero` | `wrap`, `media` |
| Phone mockups | `phone-<instanceKey>` | `root`, `frame`, `screen` |
| Decision card columns | `d1-card-<label>` | `root`, `media`, `caption` |

For image or video figures, tag the **container** (`…/media`), not only the inner `<img>` / `<video>`. Pass `annotate` into `CaseStudyFigure` when the default `cs-figure` is too generic. Dialogue live figures must adopt the same `figure/part` shape when that branch rebases.

Agentation is configured with `identifyingAttributes` including `data-annotate` so the attribute appears in copied output.

## Dialogue r19 rules

- Chart titles are their own block row: 12/16, weight 500, muted, 12px to the chart, 16px from any paragraph above. Never inline with body text.
- Figures in ProductFigureBlock stay at 640px tall or less at desktop. Scale content down; never crop it. The lightbox is uncapped.
- Ruled-out chart specimens are near-misses of the chosen chart: same data and type scale, one or two marked details (numbered marker plus a one-sentence caption) that make the chosen version better. If a pair cannot be made clear, drop it.
- Compare surfaces use `--dp-compare-surface` and `--dp-compare-quote-bg` (extension block 9); DS paper-10/50 are too close to the figure well.
- No left accent bars on cards. Separate with the DS surface and a border.
- Figures with real controls mark them `data-interactive`; StaticFigure keeps them clickable and the zoom trigger steps aside.
- Hero and study chat footers match: "Based on N of 24 interviews", no icon.

## Dialogue r20 rules

- Anything that measures rects inside a scaled figure divides by the scale (rect width over offsetWidth). Callouts and leader lines must track the UI at every scale.
- The quote player is the Paper export (file 01M58MSRB3KSVHQR7762JKXVX7, node 597-0), static. Skip back is skip forward mirrored (scaleX(-1)), with its 10 label mirrored. The Paper source file is never committed.
- Chart library pairs: ruled out is the richer first-draft chart from the same data (gridlines, per-row detail, area, legend, shares); chosen is that chart simplified, keeping one or two details quietly. The caption says in plain words what was removed, what was kept and why. No strawmen, no invented numbers (derived differences only).
- Chart variety: use a dot plot, line or stacked proportion bar where the data fits. Plain bars stay at about 40% of the charts on the page or less (currently 5 of 12).
- Buttons in figures follow the DS default: 36px tall, 8px 16px padding, 8px radius, 14/20 at 500, 16px icon, 8px gap. Spacing around them is the DS stack gap.
- The composer box hugs its content. No fixed 96 or 128px heights.
- Icon-internal glyph labels copied from the source UI may go below 11px.

## Dialogue r22 rules

- Library pairs have no status chips. Both specimens share one frame; a plain sentence-case name sits under each, then pros (brand check square) and cons (quiet outline minus square), icons 1.05em, 8px gap, 4px between rows. Under the pair: one medium-weight verdict sentence and one tertiary reason line.
- Skip "10" labels are centred on the arrow circle (7,7 in the 14px icon). Back and forward are mirrors.
- Full answer hierarchy comes from size, weight and spacing steps, not color: lead paragraph 16/24 at 500, supporting 14 and 12, quotes 14/20.
- Chart colors are frozen unless a round says otherwise (r23 was such a round).

## Dialogue r23 rules

- Charts use only Dialogue palette colors: stone ramp, cherry #B43F7F for the highlight; no invented fills. Graphical fills must reach 3:1 against their background.
- Muted data fills are stone-500 #79716b only. Stone-200, 300 and 400 are tracks, gridlines and baselines, never data fills. Stacked segments alternate stone-500 and stone-600 (cherry for the highlight) with white labels (4.5:1 or better).
- In light mode the library chart card is separated from the figure well by a 1px stone-200 border, not a new fill.
- Product figures show the redesigned designed charts, never Dialogue's real text-chart. (This case study shows the redesign; the r23 text-chart swap was rejected.)

## Dialogue r24 rules

- Chart titles are 14/20 at 500 in primary ink with a 1px stone-200 hairline under them (8px above the rule, 12px below); they must read as titles at a glance, one step above the 12px muted labels.
- Library pairs: both specimens share one height (subgrid rows), and the chart card radius is the frame radius minus the frame padding (concentric). The library's pros and cons use Phosphor Check and Minus (the BruinLease icon set) at 16px bold, brand accent for pros.
- A "before" specimen must be genuinely busier than the "after" (two series, legend, gridlines, extra number columns), so the simplification is a real edit.
- Compare answers sit under the user's question bubble, so it is clear they answer a statistic question. The question uses only existing copy words.
- Anatomy callout labels are 14px and are counter-scaled to their real size (13px or more at 1440 even when the figure is scaled down). The figure may zoom in only as far as the 720px height cap.
- Lightbox figures scale to fit the viewport (width and height), never scroll.
- Transcript Dialogue rows use the original Paper avatar (the Dialogue mark in a 48px circle, public/dialogue/dialogue-avatar.svg).
- Plain bars stay at about 40 to 45% of charts; 6 of 13 is accepted where Mudit asks for bars (lead compare).

