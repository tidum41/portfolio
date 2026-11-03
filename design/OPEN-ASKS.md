# Open asks

Mudit's checklist of open requests. Status is open or verified. Mark verified only after checking it on a production build.

| Ask | Asked | Status |
| --- | --- | --- |
| Footer Email copy: chain-link icon with "Copied", equal gaps to neighbors in both states, calm slide (about 220ms ease-out), natural width at rest | Oct 20-21 | verified |
| Case study pager: Previous flush to the content column's left edge, Next flush to its right edge, lone Next flush right at all widths including tablet | Oct 21 | verified |
| Dialogue case study: quieter in-figure text | Oct 21 | open |
| Dialogue case study: solutions laid out horizontally with the chosen one obvious | Oct 21 | open |
| Dialogue case study: no divider under "Study chat" | Oct 21 | open |
| Dialogue case study: equal-height figures at 8px radius on a calm background | Oct 21 | open |
| Dialogue case study: natural chart mapping | Oct 21 | open |
| Dialogue case study: fixed caption | Oct 21 | open |
| Dialogue case study: real interview frame with heavy face blur, plus the Dialogue icon and the viewer avatar | Oct 21 | open |
| Dialogue case study: refined floating vs docked comparison | Oct 21 | open |
| Dialogue case study: clear closing | Oct 21 | open |
| Dialogue case study: data-viz library section | Oct 21 | open |
| Dialogue case study: Ruth Zhao-style collage hero | Oct 21 | open |
| Hero line: pick pending | Oct 21 | open |
| Archive minimap contrast | Oct 21 | verified (merged to main, build passes) |
| About page without org icons | Oct 21 | verified (merged to main, build passes) |
| Mobile: lock horizontal panning so cut-off patterns never read as a bug (Mudit: "on mobile breakpoint prevent people from moving the webpage left and right so it doesn't look like a bug when the pattern or elements get cut off, intentionally lock you in to that scroll") | Oct 22 | open |
| Mobile autoplay: videos follow scroll at 600px and below, a tap affects only its own element (Mudit: "my autoplay logic is broken on mobile, it stops playing everything after smth is clicked near - can you just make no autoplay logic on mobile, or maybe pause logic based on where you're scrolling to?"). Several muted loops may play at once; play at 50% visible or more, pause below 20% after 300ms, resume from currentTime | Oct 22 | open |
| PS3 silk drift: clearly visible within ~1-2s of moving, still eased, no snapping (Mudit: "the wave is now not responsive enough and you can hardly tell its reactive") | Nov 2 | in progress (PR #162) |
| PS3 silk perf: smooth, cheap, no slowdown of other animations, same pattern and look (Mudit: "optimize its performance cohesively with the rest of the page, its not really smooth rn and slows down some other animations and elements and costs a lot") | Nov 2 | in progress (PR #162) |
| Hero scrim: cheap, no banding (including load-in), only behind the hero lines and sized to them (Mudit: "any way to fix banding fully and prevent it from messing up any other areas, while also making it responsive to adjusting to being a shadow behind my hero lines?") | Nov 2 | in progress (PR #162) |
| PS3 silk drift as a small physics model (damped spring + influence radius) with a lean set of DialKit dials: strength, radius, stiffness, damping, relax; reactive within 1-2s, eased, no snapping | Nov 3 | in progress (PR #162) |
| PS3 silk: no jitter or skipped frames in the first couple of seconds after it loads (1440, Mac) | Nov 3 | in progress (PR #162) |
| HOM-01 PS3 menu intro fail-safe: if intro-done never reveals the panel, show it anyway after 3000ms with the same fade; keep inert/aria-hidden until then; `check:intro-panel` gates regressions (Mudit: "Add and merge") | Oct 22 | in progress |
