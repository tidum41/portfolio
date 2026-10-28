# P7 loop log (review/round-p7 off 9284d4f)

## Options round (before loop 1)
- Problem before figure. A: the brief two-line prose (P6). B: the prose at study scale, two paragraphs of vague quantifiers. C: B answering "How many shoppers misread..." Picked C: the question asks for a count and the answer can only say many and some, so the pain is visible without a caption doing the work (Christine Liang's "AI failure as an observable symptom"). Compare: `shots/p7/opts/compare-problem-1440.png`.
- Levels. A: 2+1 with the chosen card last (P6). B: chosen card first at full width, ruled-out pair below. Picked B: the final answer leads, then the options it beat (Rachel Chen, "the final flows were simple, but..."). Compare: `shots/p7/opts/opt1-levels-1440.png` vs `opt2-levels-1440.png`.
- Data viz. A: two pairs with the Data shape, Encoding and Tradeoff rows. B: same without those rows. C: B with the segments pair first. Picked C: the rows were a list of three on every pair and duplicated the verdict; the segments pair is the call the body argues, and the coverage pair repeats the counts section, so it goes second. Compare: `shots/p7/opts/compare-data-viz-1440.png`.

## Loop 1
- Found: problem h2 below the 1440x900 fold (P4 and P6 mistake repeated). Fix: hero body cut to two sentences. Result: the problem h2 sits inside the fold (`shots/p7/loop1/fold-1440.png`).
- Found: at 390 the chosen Levels card still came last, because the round J phone rule forces version order. Fix: the chosen-first opt-in overrides it at every width.
- Found: at 390 the chosen card's bar label clipped to "75 of 300 D". Fix: shorter label "Unsure", which also matches what Mei and Owen say.
- Learned: every fold and clip fix has to be checked at 390 too; a desktop-only media query silently loses to an older phone rule.
