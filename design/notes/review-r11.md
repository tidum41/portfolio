# Review (round 11, Nov 1 2026)

Base 0adf459 on review/round-p15. Audit items 1 to 4 from audit/paper-opportunities and audit/rachel-chen. Item 5 (chart route) is held until the model-versus-rules placeholder is settled.

## What changed
1. By group: the card is now a pair on the full figure width. The ruled-out percent card (64% and 70%, from the existing near-miss in `DialogueChartLibrary`) sits left of the kept counts (9 of 14, 88 of 125). Tapping the 9 still opens its people, full width under the pair. Both cards are neutral; the cherry stays on the 225 only.
2. Levels held frames: no new components. First try holds at 4.6 s (desktop) and 4.5 s (phone), when the open player has pushed the count out of view. Kept holds at 5.6 s (desktop) and 5.3 s (phone), the open Source state with the tab row and the quotes in one frame. Set through `OVERRIDE` in `scripts/pick-dialogue-posters.py`; the videos themselves did not change.
3. Thin data: the figure is a pair. A is a one-bar card for two people at full track width, with its total as a visible placeholder. B is the existing take with the refusal flag.
4. Awkward shapes: the definition list is four small frames in the product card, tie first (two equal bars, no cherry). Every frame is neutral. Counts that the page does not give are visible placeholders.

## Where Stageshow was used, and why
Used only as a principle set: crop to the decision, one focal per frame, a held frame that tells the story. Faux-UI kit parts were not used because new components need Mudit's OK. The frames reuse the product's own chart cards, so there is no new component, no bento grid, no motion-take callout and no people chip.

## Checks
- `npm run typecheck`: clean. `npm run check:dialogue-system`: OK.
- Motion checker: 24 of 24 pass. Clip audit at 1440, 390 and 360, light and dark: 0 clipped.
- Screenshots at desktop and phone, light and dark, in /opt/cursor/artifacts/screenshots/r11-*.

## Known limits
- The phone first-try poster is mid-scroll, so the card's top edge crops the count. The count never leaves the viewport fully on the phone take; 4.5 s is the frame where the player is open and most of the count is gone.
- The page is longer by the thin pair's A frame and the two-by-two edge frames; no existing figure or caption was added to.
