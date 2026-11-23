# Depth explorations: decisions (round depth-r1, 2026-11-22)

Spec: /workspace/dialogue-agent/ANALYSIS-2026-11-22.md section 4. Every component here is dev only and awaits Mudit's OK, except the one figure listed in STORY-CHANGES.md. Dev page: `/dev/dialogue-depth?ex=1|2&opt=a|b|c` (404 in production). Clips: `/workspace/dlg-depth-r1-shots/options/` (every option) and `/workspace/dlg-depth-r1-shots/out/` (chosen ones, reduced motion, page shot).

Quotes below are verbatim from pages fetched on 2026-11-22 (Sources, end of file). Anything marked paraphrase was not checked word for word. Lines marked inference are my reading, with no source.

---

## D1. Exploration 2: how the denominator shows up

**Question.** 64% and 70% look alike, but one rests on 14 people and the other on 125. What does the figure change to show that?

**Options** (`?ex=2`):
- a. Relabel in place. The bars keep their geometry (each row on its own full-width scale). Only the value cell cuts from 64% to 9 of 14.
- b. Track resizes to its group. Same label cut, then each track resizes to its group size on one people scale, so the 14-person track is about a ninth of the 125-person one.
- c. A dot per person. The percent bar is replaced by an icon array, 14 dots against 125, with 9 and 88 filled.

**Evidence.**
- Denominator neglect is real and measurable. Garcia-Retamero and Galesic 2009 found "many participants paid too much attention to numerators and insufficient attention to denominators" and "Icon arrays were an effective method for eliminating denominator neglect." (PMC2775772)
- NN/g, on small studies: "if 4 out of 5 test users do something, don't conclude that 80% of all users will do the same."
- CHART-RATIONALE.md, By group (d): "Each row is a full-width track with its own scale, so 9 of 14 and 88 of 125 are not forced onto one axis that would make 9 look tiny." This is the documented rationale for the kept product chart.

**Choice for /dialogue: a.** The figure ends on the chart the product draws (the kept By group template). The caption is Mudit's existing verdict line, so no new copy goes on the page.

**Why not b on the page.** b is the strongest teaching figure, and the research backs it (a denominator you can see as length). It also ends on the one-axis encoding that CHART-RATIONALE (d) rejected for the product, so the page would show a chart Dialogue does not draw. That is Mudit's call, logged in OPEN-QUESTIONS.md. Do not ship it without his OK.

**Why not c.** The icon array has the most direct research support (Garcia-Retamero and Galesic). 125 dots take five rows in a 448px panel, the empty dots are faint on the card fill, and icon arrays are not a Dialogue template. Keep it in dev.

**Frames.** `options/ex2-opt-a-sheet.png`, `options/ex2-opt-b-sheet.png`, `options/ex2-opt-c-sheet.png`, `options/ex2-all-final.png`. Chosen: `out/ex2-chosen-a-relabel.mp4`, `out/page-dataviz-denominator.png` (+ `-t0.png`).

---

## D2. Exploration 2: timing of the reveal (micro-interaction)

**Question.** Does the reveal move, and if so, in what order?

**Options.**
- Label cut at 0ms, with the track change after a 160ms gap over 400ms (staged, used by b).
- Label and track change together over 400ms.
- Label cut only, with no spatial change (a; nothing moves because nothing changes place).

**Evidence.**
- Heer and Robertson 2007: "Use staging for complex transitions ... For example, separating axis rescaling from value changes may help." They also found that "animated transitions can significantly improve graphical perception."
- Heer and Robertson: "Simple, direct transitions alleviate confusion, impose less memory burden, and improve predictability."
- NN/g: "the duration of most animations should be in the range of 100–500 ms".
- Carbon gives `duration-slow-01` 400ms to "large expansion" (Carbon motion overview, token table).
- Bostock, object constancy: "a graphical element that represents a particular data point ... can be tracked visually through the transition." The bars in b are the same groups before and after, so they may move. In c the marks change meaning (a rate becomes people), so they are replaced, never morphed. Heer and Robertson: "marks representing specific data points should not be reused to depict different data points across a transition."

**Choice.** Text cuts instantly in every option. Only b moves, staged: the value change first, then the scale change, 400ms on the system curve `cubic-bezier(0.2, 0, 0, 1)`. c swaps marks.

**Rejected.** Animating both together breaks the staging rule. A text cross-fade adds a beat where both numbers are half visible, and nothing spatial needs following.

---

## D3. Exploration 2: what starts the reveal on the page

**Options.** Plays once when 60% in view after a 900ms hold. Plays on tap. Plays on a loop.

**Evidence.**
- Emil Kowalski: "How often users will see an animation is a key factor in deciding whether to animate or not." A reader passes this figure once.
- ANALYSIS section 4 item 5 (risk): skim readers never discover interaction, so a tap-only figure shows nothing to most readers (inference from the spec, no study).
- Apple HIG: "Make motion optional." Reduced motion starts on the final state.

**Choice.** Once, in view, after a hold, then it rests on the counts. Hover or focus a row to see its percent again in the same cell (TASTE Round 18 item 5). A loop was rejected because it competes with the text beside it and with the takes.

---

## D4. Exploration 1: where the evidence goes

**Question.** Opening the 225 shows its people. Where do they go so the count never leaves view (the Levels first-try failure)?

**Options** (`?ex=1`):
- a. Layer. The people rise one elevation step over the answer, pinned under the bar. The answer does not move.
- b. Flow. The people grow below in the stream (the shipped Grow), and the panel scrolls so the bar holds the top.
- c. Header. The finding sentence drops, the bar becomes the header, and the people take the body. Same plane, instant.

**Evidence.**
- TASTE Round 16 item 1 (Mudit): "selecting a bar segment moves nothing, not one pixel." Only a keeps that: b scrolls the bar and c removes the sentence above it, so the bar jumps.
- Material (shared axis pattern): "This pattern uses a shared transformation on the x, y, or z axis to reinforce the relationship between elements." a puts depth on z.
- NN/g progressive disclosure: "defers advanced or rarely used features to a secondary screen". A layer is that secondary level without leaving the answer.
- NN/g animation in UX: "Animations can also prevent disorientation and telling people if they are on the same page or have moved on".

**Choice: a.** The count and the bar stay exactly where they were, and the people read as in front of the answer.

**Rejected.** b repeats the Levels failure mode in a smaller form (the stream moves under the reader). c is quick but the jump of the bar breaks Round 16.

**Risk kept open.** ANALYSIS warns a layer can read as a modal or a phone bottom sheet. It stays two elevations, never a third, and the sheet sits inside the panel with the panel's own radius.

**Frames.** `options/ex1-opt-a-sheet.png`, `options/ex1-opt-b-sheet.png`, `options/ex1-opt-c-sheet.png`, `options/ex1-all-open225.png`. Chosen: `out/ex1-chosen-a-layer-rise.mp4`.

---

## D5. Exploration 1: how the layer arrives (the lift)

**Options** (`?ex=1&opt=a&lift=`):
- rise: opacity plus 8px up, while the shadow steps from answer to evidence. 400ms in, 240ms out.
- reveal: unclips downward from the bar's edge, so the tapped bar is the origin.
- shadow: the sheet lands at once and only its shadow deepens.

**Evidence.**
- Heer and Robertson: "Perceptual research provides evidence that translation and divergence (expand/contract) motions are easier to understand than rotation".
- Apple HIG: "Aim for brevity and precision in feedback animations."
- TASTE motion line (Mudit, Oct 28): enters are 300ms, opacity 0.5 to 1, on the measured recording. rise is the same kind of enter.
- ANALYSIS section 4 item 1: shadows vanish on the dark well (#1b1e21), so a lift carried only by shadow has nothing to show there.

**Choice: rise.**

**Rejected.** shadow: in dark mode it would be a hard cut with no cue. reveal: the clip hides the shadow until the end, so the sheet looks flat while it moves (seen in `options/ex1-lift-compare-strip.png`, bottom row).

---

## D6. Sideways switches stay instant (225 to 75 while the layer is up)

**Evidence.**
- Emil Kowalski: "How often users will see an animation is a key factor in deciding whether to animate or not."
- NN/g: "the more frequent the animation, the more subtle and shorter you’ll want it to be."
- NN/g response times: "0.1 second is about the limit for having the user feel that the system is reacting instantaneously".
- Carbon gives button and toggle micro-interactions `duration-fast-01` 70ms.
- design/dialogue-explorations/research-selection-motion.md findings 1 to 5 reach the same answer for the homepage card.

**Choice.** `--dlg-motion-sideways-ms: 0ms`. The sheet stays up and only its people swap. check:dialogue-depth fails any sideways selector over 100ms, and fails the token above 100ms.

---

## D7. Elevation and timing tokens

- Two steps only: `--dlg-elev-answer-shadow` (the existing `--shadow-chat`) and `--dlg-elev-evidence-shadow`. This follows the hard rule that UI is separated from its background by its drop shadow.
- `--dlg-motion-deeper-ms` 400ms matches Carbon's `duration-slow-01` (400ms, "large expansion") and sits inside NN/g's 100 to 500ms band. The Doherty threshold page puts the limit at "a pace (<400ms) that ensures that neither has to wait on the other", so 400ms is a ceiling: no deeper move goes above it.
- `--dlg-motion-shallower-ms` 240ms (Carbon `duration-moderate-02`). Closing is shorter than opening. Carbon lists separate exit curves. The shorter exit is my inference.
- I could not fetch Material's elevation page (it renders in JavaScript), so no Material elevation quote is used.

## D8. Enforcement in code

Emil Kowalski's rule from CLAUDE.md: enforce the system in code. `scripts/check-dialogue-depth.mjs` (self-test of 18 bad and 2 good snippets) fails on raw colour, non-token shadow, blur, motion with no reduced-motion guard, sideways over 100ms, literal durations over 150ms, Lucide, teal, a missing README, className/style/any props, and an ungated dev page. It runs alone (`npm run check:dialogue-depth`) and inside `check:dialogue-system`.

---

## Sources (fetched 2026-11-22)

- NN/g, Executing UX Animations: Duration and Motion Characteristics. https://www.nngroup.com/articles/animation-duration/
- NN/g, Response Times: The 3 Important Limits. https://www.nngroup.com/articles/response-times-3-important-limits/
- NN/g, Progressive Disclosure. https://www.nngroup.com/articles/progressive-disclosure/
- NN/g, The Role of Animation and Motion in UX. https://www.nngroup.com/articles/animation-purpose-ux/
- NN/g, Don't Report Numbers from Small UX Studies (video page). https://www.nngroup.com/videos/numbers-small-ux-studies/
- Laws of UX, Doherty Threshold. https://lawsofux.com/doherty-threshold/
- Emil Kowalski, You Don't Need Animations. https://emilkowal.ski/ui/you-dont-need-animations
- IBM Carbon, Motion overview (productive and expressive, duration tokens, easing). https://carbondesignsystem.com/elements/motion/overview/ . Quote: "Productive motion creates a sense of efficiency and responsiveness, while remaining subtle and out of the way."
- IBM Carbon, Motion choreography. https://carbondesignsystem.com/elements/motion/choreography/ . Quote: "Depending on the number of staggered elements, the delay should be adjusted to ensure that total time is still within 500 ms."
- Material Components Android, Motion.md (container transform, shared axis). https://github.com/material-components/material-components-android/blob/master/docs/theming/Motion.md
- Apple HIG, Motion (JSON form of the page). https://developer.apple.com/tutorials/data/design/human-interface-guidelines/motion.json . Also: "Add motion purposefully, supporting the experience without overshadowing it."
- Heer, J. and Robertson, G. (2007). Animated Transitions in Statistical Data Graphics. IEEE TVCG 13(6), InfoVis 2007. https://homes.cs.washington.edu/~jheer/files/2007-AnimatedTrans-InfoVis.pdf (PDF text extracted and quoted directly).
- Bostock, M. (2012). Object Constancy. https://bost.ocks.org/mike/constancy/
- Garcia-Retamero, R. and Galesic, M. (2009). Am J Public Health. https://pmc.ncbi.nlm.nih.gov/articles/PMC2775772
- Not fetched, so not quoted: Garcia-Retamero, Galesic and Gigerenzer (2010), "Do icon arrays help reduce denominator neglect?", Medical Decision Making 30(6) 672-684 (record: https://econpapers.repec.org/RePEc:sae:medema:v:30:y:2010:i:6:p:672-684). Paraphrase from the record: icon arrays drew attention to denominators when the groups differed in size. Gigerenzer and Hoffrage (1995) on frequency formats: not reached.
- Not usable: Carbon simple charts has no bar rule to quote. Material 3 and Apple HIG HTML pages render in JavaScript.

---

## D9. Exploration 4: where the clip opens

**Question.** The clip is the deepest level. Where does it go so the count stays in view?

**Choice.** Inside exploration 1's layer, under the tapped person, and the layer scrolls inside itself to that person. A separate player surface would be a third elevation (ANALYSIS: keep two). Opening it in the stream repeats the first-try failure, where the player pushes the count away (TASTE P16 round 4).

## D10. Exploration 4: how the clip is born

**Options.** a zoom from the row (scale 0.94 to 1, 400ms). b cut with a path line. c the shipped Grow (height opens under the row).

**Evidence.**
- Heer and Robertson: "Perceptual research provides evidence that translation and divergence (expand/contract) motions are easier to understand than rotation", and "Complicated transforms with unpredictable motion paths or multiple simultaneous changes result in increased cognitive load."
- Material (container transform): "This pattern creates a visible connection between two UI elements." The tapped row is the origin in a and c.
- Emil Kowalski: "Before you start animating, ask yourself: what’s the purpose of this animation?" Here the purpose is to show where the clip came from. Opening a clip is a deliberate, occasional step, so it may animate. Switching clips is not, so it lands at once (D6).
- TASTE: the tapped element stays pinned while heights grow, and Grow is the approved height motion in the takes.

**Choice: c.** It reuses the approved motion and keeps the tapped row still while the clip opens under it.

**Rejected.** a scales the clip while the layer scrolls, so two things move at once, and it adds a new keyframe the system does not have. b keeps a written trail but nothing on screen shows where the clip came from. Its path line could join c later if Mudit wants the trail in words.

**Frames.** `options/ex4-opt-{a,b,c}-sheet.png`, `options/ex4-all-ana-clip.png`. Chosen: `out/ex4-chosen-c-grow.mp4`, `out/ex4-chosen-c-reduced-motion.mp4`.

---

## D11. Exploration 3: how the card changes template (round 2, 2026-11-22)

**Question.** One card answers three questions in turn: Split (225 and 75 of 300), Ranked (top five asks), Flag (2 of 300). How does it reshape?

**Options** (`?ex=3`):
- a. Cut. The question line changes and the card swaps whole. Height jumps.
- b. Marks travel (object constancy). One set of marks: the bar's segments travel into the ranked rows, then shrink into the flag (400ms).
- c. Staged fade. Old marks fade (110ms), then the card resizes (240ms) while new rows fade in 20ms apart. About 350ms.

**Evidence.**
- Heer and Robertson 2007, on semantic correspondence: "marks representing specific data points should not be reused to depict different data points across a transition. Thus some data schema changes should involve the removal and addition of marks even if the data graphic type remains unchanged." Each question here has different data, so b's 225 segment becoming "Show an exact calendar date" claims a link that does not exist.
- Heer and Robertson: "If objects occlude each other during a transition, they will be more difficult to track". In b the 75 segment passes over the 225 mid-move (`options/ex3-morph-strip-b-top-c-bottom.png`, top row).
- Heer and Robertson: "Use staging for complex transitions." c removes, resizes, then adds.
- Carbon choreography: "staggering the entrance of table content by 20 ms significantly reduces the cognitive load" and "total time is still within 500 ms". Carbon tokens: `duration-fast-02` 110ms (fade), `duration-moderate-02` 240ms (expansion).
- Material (container transform): "This pattern creates a visible connection between two UI elements." The card is the persistent container. Its contents are not.
- NN/g: "Motion can be used to indicate that the interface switched to a different state". In a, the height jump gives no such cue.

**Choice: c.** The card persists and visibly adapts, and no mark pretends to be a different data point.

**Rejected.** b is the most striking, and it is the one the research says misleads. It stays in dev as the cautionary option. a is honest but reads as three pictures, which is the catalog problem ANALYSIS names.

**Chooser.** `chooser: "model" | "rule"` decides the template (`rule` runs answerLayout plus the under-3 flag; `model` reads each step's `modelPick`). The dev page shows the framing as a visible [PLACEHOLDER]. Neither is asserted (OQ 13, 25).

**Frames.** `options/ex3-opt-{a,b,c}.mp4` and sheets, `options/ex3-all-step0.png`, `options/ex3-morph-strip-b-top-c-bottom.png`. Chosen: `out/ex3-chosen-c-staged.mp4`, `out/ex3-chosen-c-reduced-motion.mp4`.

## D12. Exploration 5: how the figure says it can be touched

**Options** (`?ex=5`):
- a. Container control. The take plays, as on the page today. A 44px pill on the well (top left, the play button's family) swaps in the live UI and back.
- b. First-view demo tap. The live UI is the default. On first view a demo pointer taps 225 once, holds the open layer, closes it and leaves. Any real touch ends it.

**Evidence.**
- NN/g (flat UI): "Many modern UIs have ripped out the perceptible cues that users rely on to understand what is clickable." A live figure that looks like the takes around it has no cue at all.
- NN/g (clickable elements): "interactive components must retain sufficient cues to suggest clickability."
- NN/g (instructional overlays): "users tend to dismiss them quickly and do not read thoroughly", and "Presenting hints one-by-one, at the right moment, makes it a lot easier for users to understand and learn instructions." This is the case for b: one demonstration, in context.
- TASTE hard rule: video controls live on the container, never on the product UI. a follows the existing pattern exactly. b draws a pointer over the product UI (as the takes do).
- ANALYSIS section 4 item 5: "A live figure that looks like a video confuses people. Mark it with the existing container-level control pattern".
- Apple HIG: "Make motion optional." Under reduced motion, b has no signal left and falls back to the poster. a still offers the control.

**Choice: a.** It is an explicit cue that sits off the product UI, and it works with reduced motion.

**Rejected.** b teaches by showing, which NN/g supports, but it opens the layer for the reader once without being asked. It also loses its only signal under reduced motion.

**Frames.** `options/ex5-opt-{a,b}.mp4` and sheets, `options/ex5-all-desktop.png`. Chosen: `out/ex5-chosen-a-control.mp4`, `out/ex5-chosen-a-reduced-motion.mp4`, `out/ex5-390-dev-page.png`.

## D13. Exploration 5: tap targets and fallbacks

- WCAG 2.5.5 (AAA): "The size of the target for pointer inputs is at least 44 by 44 CSS pixels". WCAG 2.5.8 (AA) sets the floor at "at least 24 by 24 CSS pixels". Apple HIG: "a button needs a hit region of at least 44x44 pt".
- Measured at 390px wide: 225 side 177x84, 75 side 67x84, people rows 228x86, control 139x44. All meet 44. The sides' hit areas extend to `--dlg-depth-hit-min` with no visual change.
- Fallbacks: no JavaScript gets a `<noscript>` poster. Viewports under 360px get the take. Reduced motion keeps the poster (a offers the control).

## D14. Exploration 4: closing a clip folds back

The close is a shallower move, so it folds with the shipped Grow on `--dlg-motion-shallower-ms` (240ms, Carbon `duration-moderate-02`) in place of a cut. A clip that replaced another (sideways) still lands open at once, but keeps its Grow so it can fold. Strip: `out/ex4-fold-strip.png`.

**Sources added in round 2 (fetched 2026-11-22):**
- https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
- https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- https://developer.apple.com/tutorials/data/design/human-interface-guidelines/buttons.json
- https://www.nngroup.com/articles/mobile-instructional-overlay/
- https://www.nngroup.com/articles/flat-ui-less-attention-cause-uncertainty/
- https://www.nngroup.com/articles/clickable-elements/
- Carbon choreography, the Material Motion.md file and Heer and Robertson are as listed in Sources above.
