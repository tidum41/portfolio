# Review (round 11b, Nov 2 2026)

Base 5b36d3f on review/round-p15. Two fixes; the thin-data A placeholder is untouched.

## 1. Pointer rests
The recorder now audits itself: `DLG_AUDIT=1 node scripts/record-dialogue-motion.mjs <url> <out> <demo>` replays each take and reports every stretch where the pointer is still for 60 ms or more with its glyph over visible text. Before the fix it found rests on text in every take with a pointer:
- thin: the chip tap landed on 'repeat', and the chat then scrolled the next chip's text under the pointer.
- the 75 and 225 legend (hero, every, side): the pointer faded in 60 px below the bar, on the legend numbers.
- toggles: the tab taps landed on Chart, Source and Insight, and when the chart grew above the tabs they slid down while the pointer stayed behind, so legend text ran under it.
- every and clip: the scroll that follows a quote tap slid the legend under the resting pointer.

Fixes, all in the recorder, so no UI changed:
- Bar taps rest on the bar segment itself (no text), and the pointer fades in level with its target, never below it.
- Tab taps rest on the tab's blank right side. The start and end rest on Insight match, so the loop seam is the same frame.
- The thin chip tap rests in the blank after the chip's last word. The pointer then fades out before the chat scrolls, so no text slides under it.
- After a tap the pointer keeps its spot on what it tapped while the page moves (tabs, quote rows, the fold), so nothing slides under it. Hero fades the pointer out before its scroll.
Re-audit of all 12 takes (6 demos, desktop and phone): 0 rests on text. All 24 videos re-recorded, light and dark.

## 2. Phone Levels first try
- The count now holds, fully in view, from the first frame through the tap on the 75 and the glide to Mei (about 2.5 s) before the player opens and scrolls.
- The old take could not finish its scroll on the phone card: the content ended first, so a sliver of the bar stayed under the card's top edge. The phone take gets 160 px of scroll room (`[data-mobile] .dlg-stage--every`), so the open player carries the count fully out of view.
- Poster is 5.0 s (light and dark): the open player at the top, the count gone, nothing cropped. The take is 8.7 s (limit 9).

## Poster times re-set
The retimed takes moved the held frames, so the pinned times were re-set from the new videos: Levels kept 3.6 s desktop and 3.5 s phone (the Source state before Ana's tap, the pointer on blank row space, nothing cropped); clip desktop 3.5 s (player open).

## Checks
typecheck clean; check:dialogue-system OK; motion checker 24 of 24; clip audit 0 at 1440, 390 and 360, light and dark.

## Known limit
The phone clip poster (live-clip-m) still crops the top of the bar. Its scroll is the same one the first try had; not changed here.
