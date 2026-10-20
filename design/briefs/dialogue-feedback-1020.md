# Dialogue case study, Mudit feedback, Oct 20 2026

Baseline: graphics = render repo commit 483274f (round 18). Never regenerate UI design on your own; change only what is listed.

## Global
G1. Framing: every graphic is too zoomed out. The UI must fill the frame. Target ~6-8% background margin max. The page column is narrow, so the UI must read at that width and at 390.
G2. No letterboxing: images render at their own intrinsic aspect ratio (no contain bars, no forced boxes, no cropping).
G3. Lightbox: click any image to open it isolated over a blurred background, X top-right, click-off or Esc closes, smooth ~200ms, returns to prior scroll. Respect reduced motion.
G4. Weights max 500 everywhere, including inside graphics.

## Per image
D-01 hero: too much padding. New direction needed (JOOLA B2B hero language, Ruth Zhao-inspired). Brief and directions first, not built in this pass.
D-02/D-03: tighter zoom; Before/After labels overlapped by the UI. Fix.
D-04-06: zoomed out; story unclear. Propose clearer copy, run by Mudit first.
D-07: tighter zoom; make clips visibly correspond to the Address step; 38% weight to 500.
D-08: nearly perfect; refine positioning, tighter zoom; remove the Sources/Summary/Query chart/Timestamped clips/Follow-ups caption.
D-09: good. Proposal only for more Dialogue chart types (e.g. pie) that make UX insights easier.
D-10-D-14: apply G1, G2 and readability.
D-15: less background, bigger UI.

## Live components playground
Lightweight static HTML export of the round-18 /export routes, iframed beside each image on the canvas, responsive, no extra runtime. ABC Areal never committed.
