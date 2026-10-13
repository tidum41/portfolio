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
| Render | `scripts/render-chunks.sh out.mp4 N [CompId]` | 42-frame chunks, concurrency 2 (CONC=1 if the shared box is short on memory), retries, lossless concat |
| Verify | `python3 scripts/check-film.py film.mp4 outdir` | frame-diff jump/cut scan vs `_allowed_cuts`, freeze runs, loop seam, OCR of ledger numbers (`scripts/film-expect.json`: frame -> expected strings), forbidden strings (middle dot, old names), all-caps |
| Card size | `ffmpeg -i film.mp4 -vf scale=676:508:flags=lanczos ... film-card-size.mp4` | the real portfolio slot (676px wide at 1440 viewport; 327px on mobile) |
| Deploy prototype | Vercel MCP `create_deployment` to project `joola-proto` (inline index.html, reuse unchanged files by sha), then `get_access_to_vercel_url` for a share link |

Composition is 1920x1440 (4:3) so the prototype keeps its 1920px layout (min-width:1800px query); the stage is 1440x1080 scaled 4/3.
Readable size: screen px = CSS px x camera scale x 0.4698 at 676 wide. 14px text needs s >= 1.67; 12px needs ~1.95.

## 2. Review process (every pass)
1. `tsc --noEmit`, then stills of key frames (`npx remotion still JoolaB2B f.png --frame=N --scale=0.3523`) in a grid before rendering.
2. Full render, check-film.py, update film-expect.json when beats move (OCR frames + allowed cuts).
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
