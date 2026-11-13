# Thumbnail demo changelog

Changes to the Dialogue homepage card demo (the `states` bar treatment),
newest first. Each entry lists exactly what changed and how to revert it,
so any agent can undo a round without reconstructing intent.

## 2026-11-12 — Selected-state system v2 and the loop clearing

Approved in Paper first (file `01M58MSRB3KSVHQR7762JKXVX7`, Project card
page): boards "[Redesign] Bar / Hover polish" (W2), "[Redesign] Bar / W2
system strip", and "[Redesign] Bar / Frame fix and segments". Direction:
the legend row fill explored earlier is out; selection is the detached
frame plus legend muting plus the quote's voice icon in the open side's
color. The treatment is segment-agnostic: any segment matching the open
side takes the frame, and the legend already stacks one row per segment,
so three to five segment bars follow the same system (mock form studies
in the Paper board; the demo itself ships two segments).

### `dialogue-thumbnail.css`

1. Replaced the v1 selected-state rule. The old block (comment "States
   cut: the active segment carries a 2px ink ring inside its own box")
   set one declaration on the open and pressed segments:
   `box-shadow: inset 0 0 0 2px var(--dp-ink);`
   The new block sets, on the same selectors:
   - `box-shadow: 0 0 0 2px var(--dp-surface), 0 0 0 4px var(--dp-ink);`
     (a detached frame: 2px gap of panel, then a 2px ink ring, drawn over
     the bar so it crosses the shared edge in full)
   - `border-radius: calc(var(--ds-radius-md) - 0.125rem);` (6px, all
     four corners, concentric: segment radius plus the frame's gap)
   - `z-index: 1;`
2. Added a hover rule (W2, "hover previews the frame"): on
   `[data-hover="friday"]` / `[data-hover="unsure"]`, the hovered segment
   gets the same 6px radius and the frame at half strength,
   `box-shadow: 0 0 0 2px var(--dp-surface), 0 0 0 4px color-mix(in srgb, var(--dp-ink) 45%, transparent);`,
   plus `z-index: 1;`.
3. Added voice-icon rules: under `[data-bar-style="states"]`, the quote's
   `.dp-clip-quote__icon` is `var(--dp-chart-focal)` when the root's
   `data-side` is `friday` and `var(--dp-muted)` when `unsure`.
4. Extended the states segment transition from
   `transition: background-color var(--dlg-thumb-ease, 100ms) ease;`
   to also cover `border-radius 160ms cubic-bezier(0.2, 0, 0, 1)` and
   `box-shadow 160ms cubic-bezier(0.2, 0, 0, 1)`, so fill, radius and
   frame move together. The existing `[data-press]` rule still sets
   `transition: none`, so a press lands the full frame instantly.
5. Two ordering details that matter: the hover block sits BEFORE the
   open/press block in the file, so when a scrub frame carries hover and
   press together the press (full frame) wins over the hover preview;
   and the scrub-mode `transition: none` rule gained a states-scoped
   selector (`.dlg-thumb[data-scrub][data-bar-style="states"] ...`),
   because the states transition rule out-specifies the generic scrub
   rule and stepped frames were blending toward their states.

### `variants.ts`

- `ThumbnailFrameState` gains `clearMs: number | null`.
- New export `THUMBNAIL_CLEAR_MS = 240` and `thumbnailClearProgress`
  (the entrance ease, `dlgRiseEase`, over the clear window).
- `thumbnailStateAt`: the Friday payoff's last 240ms report `clearMs`
  (the side itself stays `friday`, so the people remain the Friday set
  while they leave). The trailing cursor-out beat now returns
  `side: "none"` (it returned `"friday"` before), because the clear has
  finished by then. Loop duration is unchanged (tight: 4,310ms).

### `DialogueThumbnailDemo.tsx`

- `ThumbPeople` gains an `exit` prop (eased 0..1): both the sources row
  and the quote get `opacity: 1 - p` and `translateY(6 * p px)`, the
  entrance's path reversed, applied as one gesture.
- Autoplay gains `clearing` and `exitP` state and an `animateClear`
  rAF helper mirroring the scrub math. The loop's Friday hold now waits
  `payoffMs - THUMBNAIL_CLEAR_MS`, runs the clear, then sets the side to
  `none` before the cursor fades out. The paused/reduced reset also
  clears both new state values.
- The render splits in two during the clear: `rBarSide` (root and bar
  `data-side`; `none` while clearing, so the frame eases out on the
  segment transition) and `rPeopleSide` (which people render; stays
  `friday` until the fade completes). `rClear` carries the exit progress
  in both modes. The scrub swap key is now keyed on `rPeopleSide` so the
  people do not remount mid-fade.

### Recording

`main-card-demo-v7.mp4` supersedes v6: same scrub-stepped method, 108
frames at 40ms, 25fps, 1042x722, one tight loop, now showing the hover
frame preview, the detached selected frame, and the clearing at the
loop point.

### Revert

- Whole round: `git revert` this commit on
  `review/homepage-dialogue-card`. The card returns to the v1 inset ring
  and a loop with no clearing; the dev `sel-*` prototype variants are
  unaffected (their rules come later in the stylesheet and override).
- CSS only: restore the v1 block quoted in item 1 above in place of the
  new frame block, and delete the hover and icon blocks from item 2
  and 3 and the two added transition lines from item 4.
- Clearing only: in `variants.ts` make the Friday payoff return
  `clearMs: null` and the cursor-out beat return `side: "friday"`; the
  demo's clearing state then never engages in either mode.

## 2026-11-11 — v1: inset ring and the first-open entrance

For lineage: commit `7a90f4f` replaced the legend-only selection with a
2px ink ring inset inside the open and pressed segments (since replaced
by v2 above; Mudit found it harsh and read it as part of the segment).
Commit `60b5ec0` added the first open's entrance (`enterMs`,
`thumbnailEnterProgress`, the swap's `data-enter` CSS animation), which
v2 does not touch. The dev-only selection prototypes (`sel-1` to
`sel-7`, commit `a7c989e`, detached surrounds at `0526c21`) explored the
directions v2 settles; they remain behind `data-sel-variant` on the
states playground route only.
