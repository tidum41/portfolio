# P10 verification log

Gate: `node scripts/verify-dialogue-p10.mjs [base] [frames-dir]` (layout at 1440 and 390, accuracy, motion). Recorder: `node scripts/record-dialogue-live.mjs [base] [out] [base|toggles|picker] [height] [tag]`. Run the recorder, then the gate, before every push.

| Glitch caught | Where | Fix |
|---|---|---|
| Hero demo never showed the bar: the 300px crop hid the landed chart | hand-keyed hero demo | Replaced hand-keyed demos with the live recreation recorded as video; hero recorded at panel height 380 |
| Clip player read 01:39 of 11:45 while Mei's quote sits at 18:27 | DialogueInterviewPlayer | Player takes current and total; played bar follows them (18:27 of 42:10). Gate asserts player start equals the tapped quote |
| 'N of 300' check flagged the thin finding (2 of 300) and the caption's hypothetical (160 or 280) | gate | Gate allows the thin 2 and skips sentences with "could be" |
| Recording ran at 1x and upscaled (soft) | recorder | Stage rendered at zoom 2 in a 1120 viewport, so screencast frames are native 2x |
| Last 2 s of each take dropped (screencast emits no frames when idle) | recorder | Last frame holds until the stop time |
| Frame gap p95 40.8 ms while moving (PNG encode stalls) | recorder | JPEG 92 screencast; p95 now 30 ms (one dropped frame at most) |
| Lightbox close check failed: the only zoomable figure is interactive | check-dialogue-preview | Skip with n/a when no enlargeable figure exists |
| Problem h2 at 958px after the hero video went in | hero | Hero video capped at 312px tall (240 at 390); h2 bottom 891 at 1440x900 |
| Muted split heading at 3.34:1 | problem h2 | Uses --color-text-secondary |
| Hard-coded colours and radii in motion CSS | tokens check | Swapped for dp tokens |

Open: equal well padding passes at 0px everywhere; Rachel's 20px wells are not applied (would change every figure, flagged against the 640 lock). Loop seam: each video loops with a hard cut from the deepest state back to the empty chat, which matches the product's own hard swaps.

## Round 2 (Oct 28, after Mudit's P10 feedback)

Gate now also runs pixel checks at 1464x838, 1440x900 and 390x844: padding symmetry on notes, rows, cards and buttons; icon and first text line on one vertical centre; one gap between stacked cards; the play button 8px from the video's top right.

| Glitch caught | Fix |
|---|---|
| Play button 56px inside the video edge at desktop and 18px at 390: the wrapper and video widths disagreed | Wrapper takes the video's width (min(471px, 100%), hero 312px tall), video fills it with an explicit aspect ratio |
| Dark page corners showed around the rounded panel in every recording | Recorder runs in light theme and the video corner radius matches the panel's 24px as a share of the frame |
| The 75 tap target's ring covered the segment line and clipped the Unsure label | Segment line moved out of the bar; the hit area grows 6px past the bar on each side |
| Clicks in recordings had no hover or press | Every live control has hover, active and focus states in Dialogue's transition-colors (150 ms); the recorder rests 320 ms on the target, holds the press 140 ms, then releases |
| Gate flagged hover colour transitions as non-compositor motion | Split the rule: keyframed motion must be transform or opacity only, interaction transitions must be paint-only (no layout properties) |
| Low-signal note: muted grey with the icon 2px high | Warn surface restored from e662d57 (amber-100 on amber-700 tokens), medium weight, icon centred on the first line |
| Add to my plan swapped instantly | Icon and hint enter with Dialogue's tw-animate fade-in-50 over 300 ms; press and done states use the active fill |
