# Remotion product-film workflow (JOOLA B2B, passes 1-12)

Reusable guide for animating a real HTML prototype into a portfolio-card film.

## 1. Pipeline
Repo: `/workspace/portfolio/remotion` (Remotion 4.0.534). Commit locally only with
`git -c user.name="Cursor Agent" -c user.email="cursoragent@cursor.com" commit`; never push from the box; never commit package-lock.
Chrome for everything (Remotion, Playwright): `/usr/bin/google-chrome`.

| Step | Script | What it does |
|---|---|---|
| Prototype source | `assets/joola-b2b/B2B quick order prototype.html` (+ copy at `public/dev/joola-proto/index.html`, keep identical) | the single source of UI truth; fix UI here, never in the film |
| Capture | `python3 scripts/capture-proto.py` | headless Chrome at 1920x1080, dumps the prototype CSS + each screen's rendered markup into `src/joola/proto.generated.ts` (mounted verbatim via dangerouslySetInnerHTML) |
| Measure | `python3 scripts/measure-proto.py` | element rects -> `src/joola/proto-rects.generated.ts` (film coords = page y - 48px nav). Re-run after any UI change |
| Timeline | `src/joola/timeline.ts` | all frames, easings (cubic-bezier), camera MOVES (a==b = hard cut), clampCam |
| Film | `src/JoolaB2B.tsx` | per-frame DOM state in useLayoutEffect (typing, qty, pill, credit), cursor, logo morph |
| Timing check | `node scripts/timeline-report.mjs out/timing.json` | camera velocity, worst zoom, overlaps of camera moves with UI animations |
| Render (draft, default) | `scripts/render-chunks.sh out.mp4 N [--draft]` | Fast full-length draft. Remotion renders at `--scale=0.375` (exact 720×540: `0.35` makes the height `503.99999999999994` and the encoder rejects it). The script then scales to 676×508. Do not pass `--width`/`--height`: that resizes the composition and crops this film, because the stage is hardcoded at 1440×1080. JPEG quality 60, CRF 28, x264 veryfast, concurrency = all cores. Layout variants are stills (`--scale=0.375`), not videos. |
| Render (final, once) | `scripts/render-chunks.sh out.mp4 N --final` | The single 1920×1440 delivery render. 42-frame chunks, concurrency 2 (`CONC=1` if memory is short), retries, lossless concat. Do this once, after draft review. |
| Verify | `python3 scripts/check-film.py film.mp4 outdir` | frame-diff jump/cut scan vs `_allowed_cuts`, freeze runs, loop seam, OCR of ledger numbers (`scripts/film-expect.json`: frame -> expected strings), forbidden strings (middle dot, old names), all-caps. Run on the final film. |
| Card size | `ffmpeg -i film.mp4 -vf scale=676:508:flags=lanczos ... film-card-size.mp4` | the real portfolio slot (676px wide at 1440 viewport; 327px on mobile) |
| Deploy prototype | Vercel MCP `create_deployment` to project `joola-proto` (inline index.html, reuse unchanged files by sha), then `get_access_to_vercel_url` for a share link |

Composition is 1920x1440 (4:3) so the prototype keeps its 1920px layout (min-width:1800px query); the stage is 1440x1080 scaled 4/3.
Readable size: screen px = CSS px x camera scale x 0.4698 at 676 wide. 14px text needs s >= 1.67; 12px needs ~1.95.

## 2. Review process (every pass)
1. `tsc --noEmit`, then draft stills of the frames being judged (`npx remotion still JoolaB2B f.png --frame=N --scale=0.375 --browser-executable=/usr/bin/google-chrome`). Layout variants are stills side by side, never extra videos. Do not override width or height.
2. Polish on drafts: `scripts/render-chunks.sh draft.mp4 N` (the default `--draft`). Save the first full-length draft to the artifacts folder as `draft-film.mp4` so it can be watched while later loops run. One `--final` 1920×1440 render only after the draft loops. Then check-film.py, and update film-expect.json when beats move (OCR frames + allowed cuts).
3. Card-size sheet (16 frames, 676px) and **zoomed crops** (PIL crop + 2x) of every value change, cursor rest, transition midpoint.
   Grids lie: tile boundaries make content look like it is in the wrong frame - open single frames when in doubt.
   Use unique /tmp names; the box is shared and other agents overwrite /tmp/c1.png etc.
4. Programmatic edge check when framing matters (no text ink within 24px of the card edge on reading beats).
5. Critic step: compare against references side by side (vs-ramp strip), list cruder moments, fix, and verify each fix on fresh frames - never claim a fix without re-looking.
6. Report beat timings (PT-free film seconds) and honest rough spots.

## 3. Motion references + spec
`/workspace/motion-refs/` - `report.md` (MOTION SPEC), ramp-procurement.mp4, linear dashboards, notion hero, strips/.
Spec essentials: cut on the click frame for screen changes; at most one zoom per screen, <=1.25x per move;
cursor moves first, camera follows; macOS arrow ~1.3% frame width, travel 0.35-0.55s cubic-bezier(0.3,0,0,1), click = 0.9 for 3f back over 4f, no ring;
appearing items fade + 6px rise over 200ms; badge 0.6->1 over 160ms, no overshoot; values swap instantly; holds 0.6s min, ~1.0s dense screens, ~1.2s confirmation.

## 4. Mudit's taste rules (accumulated)
- Never redesign the UI in the film. Fix the prototype, redeploy, recapture. Film = motion only.
- Show the real, full dashboard (it proves B2B tool work). No isolated floating components, no dimmed/greyed/blurred regions, no ghosting.
- Header, cart pill and buyer chip stay in place in the real header.
- Swift but fluid: ~11-12s total; cut slow beats (PO typing, qty typing) rather than speed up motion; give time to the beats that pay off.
- Hard cuts or smooth ease-outs only; no springs, bounce, overshoot, exaggerated scale; button press <=0.98.
- Instant value changes (qty, price tier, line total, badge count); only geometry eases.
- Zoom gently (<=1.25x per move); keep text >=11px at 676px by choosing framings, not by over-zooming.
- No layout jumps (lock button widths, reserve pill amount/badge space), no 1-3px shifts.
- Copy: no middle dots, no all-caps, no captions. Numbers must match ledger.js exactly.
- Logo: prefer a continuous move/morph into its real sidebar slot over a fade-through-colour card.

## 5. Lessons by pass
1-3 audit, rebuild, critic fixes: put every number in the ledger and OCR-check it.
4 separate camera and UI motion; never move the camera during a UI change.
5 measure the real card slot (676px) and design for it; 4:3.
6 cursor never covers digits being read; legibility of tier price.
7 "not swift enough": cut to ~11-12s; instant qty/price.
8 remove all overshoot; hard cut on Add; lock geometry; drop Messages.
9 adopt the written MOTION SPEC (zoom limits, cursor, fades). Chunked renders for memory.
10 Ramp-style framing tried with a spotlight dim - rejected later. Prototype fixes: hover darken not opacity, cart icon, single-colour credit bar, Upload CSV restored (removed in 737bee5).
11 isolated components on a backdrop - rejected: looked floating, lost the dashboard. Cut PO typing.
12 full dashboard again, search back, one-tap saved "Perseus restock, 120 units" reorder (real rail hover "Add"), header pan instead of floating pill, logo morphs into the sidebar slot (variant A dissolve, B rect reveal).

## Pass 13 lessons
- Layout shifts come from the prototype, not the film: fix them there and prove it with a Playwright bounding-box diff (0px) before and after each click. Root causes found: an inline "Added to cart" line inserted into the sticky footer (grew 72 to 103px, moving divider and button) and a hidden cart amount appearing (pill widened 75 to 182px, right-aligned, so everything slid left). Fix: absolutely position transient messages; always render values with a reserved min-width; use visibility instead of display for badges.
- Press feedback is colour only. No :active scale in the prototype, no scale in the film.
- Across a hard cut, keep the camera identical if the same element (e.g. header pill) is on both screens, or it jumps.
- Motion blur: SVG feGaussianBlur on the camera layer, std per axis proportional to camera velocity above 14 stage px/frame, capped at 2.2px, disabled within 1 frame of cuts. Text at rest is never blurred.
- Story beats should use different products (search Perseus, then apply Match kit template) and the prototype must offer the real choice (Add to order / Replace order) before the film shows it.
- Keep the cursor off text being typed (offset pointer right/below the digits).
- OCR expectations must only list text that is actually in frame at that camera.

## Pass 14 lessons
- Card-sheet tiles: when frames/step does not fill the grid, the empty tiles are black; pick the step so the tiles are full, then still check the real last frame.
- Loop: end on the exact frame-0 card. Fade the UI out to the card background first, then fade the logo in; never overlap them and never zoom the dashboard back out (the wide outro framed a floating panel next to the sidebar).
- Between two different layouts, use a staggered dissolve (A out over 5f, B in over the last 5f of 8f) so the two never read double. check-film flags these as cuts; list them as allowed.
- Click feedback lives in one place: the "Add 4 to cart" button keeps its label, width and colour (4f instant press tint only); the pill badge is the feedback. No inline success text, no disabled state.
- A popover must stay on screen through its button press (close 4f after), or the click reads as a jump.
- Long pans (>1000 stage px): symmetric curve (bezier .5,0,.4,1) plus a slight zoom dip (-0.3) cuts peak screen speed ~20% and reads as a continuous travel.
- Readability: push in 1.2x (1.75 -> 2.1) when the beat is about small metadata (rail meta, credit line) rather than restyling the UI.
- Read caches image paths: write review images to new filenames each time.

## Pass 15: locked wide plus push-in (the default from now on)
- Every screen is ONE locked wide shot of the full dashboard (Quick order + Cart: s 0.83, sidebar to rail edge + 24px; Order placed: s 1.07 sidebar + panel). The camera is still in the wide; no pans.
- Each micro-interaction gets exactly one push-in of ~1.15x (12f / 0.4s ease-in-out bezier .45,0,.55,1), holds while the change happens, then eases back. Never two moves in a row toward different targets; never move between beats.
- Clamp push-ins to the dashboard content box (x 0..1736), not the 1920 page, or a push toward a right-edge element turns into a sideways pan revealing empty margin. Consequence: at 1.15x from a full-dashboard wide, pushes cannot truly centre edge elements; the UI's own states (hover, press tint, popover, badge) carry the highlight.
- The cursor arrives LEAD = 6f before every click and is still during camera moves (keys hold screen position over the push).
- Screens change with short staggered dissolves (6f to Cart, 8f to Order placed); list those frames in film-expect _allowed_cuts.
- No motion blur when there are no pans. Fill outside the page with white (box-shadow on the camera layer) when the wide is taller than the page.
- Trade-off to report honestly: a full-dashboard wide at 676px puts 14px UI text at ~5.5px; only push-in frames and big numbers are legible.

## Pass 16: dense viewport, close shots, at most 3 story moves (supersedes p15's wide + push-in)
- Render the prototype at the smallest real viewport its layout supports: 1312x756 here (1312 = narrowest width where the Quick order table, min-content ~766px, clears the Reorder rail; 756 = shortest height where the sticky footer clears the template popover). capture-proto.py and measure-proto.py share VW/VH; width media queries are resolved for VW at capture time, because the Remotion page itself is wider.
- Frame shots on the story region, not the whole page: body text must read at 676px. card px = CSS px x s x 676/1440. Shot A 1.6x = 10.5px, shots B/C/D 1.9x = 12.5px (verified: the 121px Add button measures 108px on the card, 107.9 predicted).
- At most 3 camera moves, each motivated by the story (table -> rail, footer -> header pill). No push-in/pull-out pairs. Everything else holds still.
- Reuse one framing across a hard cut when the same element is on both screens (pill: Quick order -> Cart). Centre the subject optically: Order placed's panel sits centred in the content area.
- Fire a state change as the camera lands when the change is off-frame at click time (badge, 12f after the Add click).
- OCR misses white-on-blue button labels; verify them in the zoomed crops instead.
