# PROGRESS: Dialogue depth round r1

Branch review/dialogue-depth-r1. Spec: /workspace/dialogue-agent/ANALYSIS-2026-11-22.md section 4. Dev page: /dev/dialogue-depth (?ex=1|2, ?opt=a|b|c, ?lift=rise|reveal|shadow, ?auto=1).

## Done
- Research fetched and quoted (see design/dialogue-explorations/DECISIONS.md, Sources).
- Tokens: styles/dialogue-tokens.css section 10 (motion deeper/shallower/sideways, elevation answer/evidence).
- Exploration 2 (denominator reveal): DenominatorReveal a relabel / b rescale / c units. Chosen b. On /dialogue Data viz after the Carbon sentence.
- Exploration 1 (evidence layer): EvidenceLayer a layer / b flow / c header, lifts rise / reveal / shadow. Chosen a + rise. Dev only.
- Gate: scripts/check-dialogue-depth.mjs (self-test), npm check:dialogue-depth, wired into check:dialogue-system.
- Recorder: scripts/record-dialogue-depth.mjs. Clips in /workspace/dlg-depth-r1-shots/options and /out.

- Docs done: design/dialogue-explorations/DECISIONS.md (D1-D8 + sources), ex1/ex2 files, STORY-CHANGES.md (page figure + proposals P1-P5), /workspace/dialogue-agent/OPEN-QUESTIONS.md items 27-32. Dev page ?ex=story shows proposals.
- Page figure switched from b to a after finding CHART-RATIONALE By group (d) rejects the one-axis end state (OQ 28).
- Gates clean: check:dialogue-system, check:thumbnail-card, check:dialogue-depth, tsc, eslint on changed files.

- Exploration 4 (claim to moment): EvidenceLayer `clip` prop, options a zoom / b cut / c grow, chosen c. Dev only. Docs: ex4-zoom-claim-to-moment.md, DECISIONS D9-D10.

## Round 2 (2026-11-22)
- Exploration 3: ChartChosen (cut / constancy / staged), chooser model|rule, framing [PLACEHOLDER]. Chosen staged (D11).
- Exploration 5: LiveFigure (container control / first-view demo tap), poster fallback for no JS, under 360px and reduced motion. Chosen control (D12, D13). 390px tap targets all at or above 44.
- Exploration 4: closing a clip folds back on the 240ms token (D14).
- Tokens added: fade 110, resize 240, stagger 20, ghost and control tokens, hit-min 44.
- Docs: DECISIONS D11-D14, ex3/ex5 files, STORY-CHANGES P6-P9, OPEN-QUESTIONS 34-36, SYSTEM-COMPONENTS pending line (not allowlisted).

## Next
- Waiting on Mudit: OQ 13/25 (chooser framing), 27-36.
- If approved: move EvidenceLayer, ChartChosen or LiveFigure up into the allowlist and onto /dialogue. Re-record live-side.mp4 in ramp B before a live figure ships.

## Session end, round 2 (2026-11-22)
Gates: check:dialogue-system OK (93 files), check:thumbnail-card OK, check:dialogue-depth OK (16 files, self-test 18 bad + 2 good), check:dialogue-tokens 6 (the pre-existing six, none added), tsc clean, eslint 0 problems on every changed file. Repo-wide `eslint .` reports 263 errors and 4987 warnings, all in files this round did not touch (public/dev, components/embeds, Footer and others), so they don't match the "1 error + 1 warning" baseline. Dev server on 3127 stopped.

## Round 3 (2026-11-22, after Mudit's review)
- Ex2 hover take rebuilt: DenominatorReveal `hover-counts` (a, chosen, on /dialogue) and `hover-percents` (b, flagged as OQ 37). Stage `/dev/dialogue-depth?ex=hover&opt=a|b`. Recorder `scripts/record-dialogue-depth-hover.mjs` (take pointer, 600ms glide, 2.5x). Outputs in /workspace/dlg-depth-r1-shots/out/ex2-hover-*. DECISIONS D15.
- Ex1 and ex4 marked Not approved. Review in design/dialogue-explorations/ex1-ex4-review.md (recommend: cut ex1, fold the ex4 idea into Levels as a caption-level idea only).
- Ex3 left as is (Mudit likes the staged fade).
- Next: Mudit's calls on OQ 37 and the ex1/ex4 recommendation. If ex1 is cut, LiveFigure (ex5) still uses EvidenceLayer's layer, so revisit ex5's live UI before it ships.
Dev server on 3127 stopped.
