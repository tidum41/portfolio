# Explorations 1 and 4: honest review (round 3, 2026-11-22)

Status: **Not approved** (Mudit, round 3: "ui on the one labeled layer over the answer looks so funky and weird ... same for grow in place ... what were we even trying to show here? how is this important to story?"). The code stays dev only (`/dev/dialogue-depth?ex=1`, `?ex=4`). Nothing from either is on /dialogue.

## Defects in the recorded sheets (round 1 and 2)
Sources: `/workspace/dlg-depth-r1-shots/options/ex1-*`, `ex4-*` and `out/ex1-chosen-*`, `out/ex4-chosen-*`.

1. **The evidence panel overlaps the answer card's bottom edge and is wider than the card.** The sheet starts 8px under the bar, so it covers the card's bottom padding and border. It is inset 12px from the panel, not from the card, so it runs past the card on both sides. It reads as a bug, not a layer.
2. **The panel is clipped by the stage bottom.** The sheet is pinned to the panel's bottom and scrolls inside itself, so "+223 more" and the player sit cut off at the edge in most held frames.
3. **The tapped segment shows no selected state.** The live AnswerCard marks nothing on the open side (OQ 29), so a reader can't tell which side the people belong to without reading the sheet header.
4. **Text is tiny.** The recordings run at 1x in a 1500px viewport with three cells side by side. The quotes are about 11px in the clip, unreadable at page size. The round 3 ex2 take fixes this with 2.5x zoom and one card.
5. **The ex4 "video" is a flat grey gradient with a waveform icon.** `DialogueInterviewPlayer` renders its placeholder still, so the deepest level, the proof, shows nothing.
6. **The row header vanishes mid-take.** When the layer scrolls to the tapped person, the side header ("Read it as this Friday 225") scrolls out, so the trail it was meant to keep breaks.
7. **The close leaves ghost text fading.** The sheet's exit fades its contents over 240ms on top of the answer, so for a few frames faint quote text floats over the bar's legend.
8. **Inconsistent with the system.** The sheet border, the inset and the internal scroll are new chrome. None of it comes from Dialogue's real panel, so it fights TASTE's "match the real product".

## What each was meant to show
- **Ex1 (evidence layer):** opening a side keeps the count in view, by putting the people on a layer above the answer. It was meant to make the Levels reversal (the count scrolls away) a spatial fix.
- **Ex4 (claim to moment):** 225, then Ana, then her clip from 04:10, each level opened from the last, as an audit trail from claim to evidence.

## Does either add anything Levels does not already prove?
- **Ex1: no.** Levels already shows the failure (the first-try take, where the count is pushed out) and the kept answer (depth is optional, with Insight, Chart and People toggles). The Counts take already shows a side opening in place with the count visible. Ex1 is a third way to show the same thing, with new chrome Dialogue doesn't have.
- **Ex4: barely.** The hero already ends on Ana's row with her source pill at 04:10, and the clip still sits in Levels. The only new part is the continuous chain, and with a placeholder player it proves nothing.

## Recommendation
| | Recommendation | Reason |
|---|---|---|
| Ex1 | **Cut** | It duplicates what Levels and Counts prove, adds chrome the real product doesn't have, and its defects (1, 2, 3, 7) are structural, not polish |
| Ex4 | **Fold into Levels, as a caption-level idea only** | The chain (count, person, clip) is worth one sentence in Levels if Mudit wants it, carried by the existing hero and clip still. No new figure until a real clip frame exists |

Code is kept, not deleted: `components/dialogue/depth/EvidenceLayer/` (also used by exploration 5's live UI) and the `?ex=1` and `?ex=4` cells. Both stay dev only and are marked Not approved in DECISIONS.md (D4, D5, D9, D10, D14).

## Update, review/dialogue-reset-r1 (Nov 23 2026)
The `?ex=1` and `?ex=4` cells are cut from the dev lab (`app/dev/dialogue-depth/DepthLab.tsx`), with their storyboards and lift links. `components/dialogue/depth/EvidenceLayer/` stays because exploration 5's LiveFigure renders it. Revert: `git revert` the reset-r1 cut commit.
