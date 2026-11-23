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

## Next
- Exploration 3 (watch the chart get chosen): build with `chooser: "model" | "rule"`, framing [PLACEHOLDER], never assert either (OQ 13, 25).
- Exploration 5 (one live tappable figure with video fallback).
- Ex4 known gap: closing a clip cuts in option c; keep Grow mounted per row for a folding close.
- Waiting on Mudit: OQ 27-33 in /workspace/dialogue-agent/OPEN-QUESTIONS.md.

## Session end (2026-11-22)
Gates: check:dialogue-system OK, check:thumbnail-card OK, check:dialogue-depth OK (self-test 18 bad + 2 good), check:dialogue-tokens 6 (pre-existing, none added), tsc clean, eslint clean on changed files. Dev server on 3127 stopped.
