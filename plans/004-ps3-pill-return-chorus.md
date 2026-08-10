# 004 — Align PS3 pill return with work entrance chorus

- **Status**: TODO
- **Commit**: 6f8d727
- **Severity**: MEDIUM
- **Category**: Cohesion & tokens
- **Estimated scope**: 1 file (`components/PS3ControlPanel.tsx`)
- **Depends on**: Plan 002 (otherwise pill still “wins” alone and retuning is wasted)

## Problem

`PS3ControlPanel` intentionally remounts on every `/` visit and plays a return fade meant to match work re-entry:

```32:43:components/PS3ControlPanel.tsx
// This component unmounts whenever the user navigates off "/" (see the
// `isWorkRoute &&` gate in PersistentWorkShell.tsx) and remounts fresh on
// return — unlike PS3Silk/hero/the grid, which stay mounted the whole
// session and are only CSS-hidden. `_ps3cpHasLoaded` (module-level, so it
// survives the unmount) means every return trip takes the "not very first
// load" path below. Matches EntranceItem/hero's own re-entry animation
// (lib/motion.ts's EASE_Y + ENTRANCE_DEFAULTS.duration=0.45s) — used so the
// pill fades back in as part of the same "content sliding back into view"
// moment as everything else on the route, instead of popping in at full
// opacity with zero transition while its neighbors visibly re-enter.
const RETURN_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const RETURN_FADE_MS = 450;
```

After plan 002, neighbors will animate again — good. Remaining cohesion gaps:

1. Pill is **opacity (+ transform morph string)** only; EntranceItem is **opacity + translateY(20px)**. Pill can still read as a different family if it lacks a small settle translate.
2. Return path starts immediately on `posReady`; grid may still be mid-stagger. A **0–80ms** delay (within ENTRANCE stagger language) keeps the pill in the chorus without feeling late.
3. First-load path correctly waits for `intro-done` (`FADE_MS = 700`) — leave that alone.

## Target

On **return** remount only (`revealKindRef === "return"` / `!isVeryFirstLoad`):

```css
/* target feel — CSS transition on the portal root already uses morphT */
opacity: 0 → 1;
transform: translateY(12px) → translateY(0); /* or include in existing transform compose */
transition: opacity 450ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 450ms cubic-bezier(0.22, 1, 0.36, 1);
transition-delay: 0ms; /* optional: up to 50ms if grid hero should lead — DialKit or const RETURN_DELAY_MS = 40 */
```

Keep:

- `RETURN_FADE_MS = 450` (== `ENTRANCE_DEFAULTS.duration * 1000`)
- `RETURN_EASE = "cubic-bezier(0.22, 1, 0.36, 1)"` (== `EASE_Y`)

Prefer importing duration/ease from `lib/motion.ts` if the file already imports `ENTRANCE_DEFAULTS` (it does) — e.g. derive:

```ts
const RETURN_FADE_MS = Math.round(ENTRANCE_DEFAULTS.duration * 1000); // 450
// RETURN_EASE stays string form of EASE_Y — do not duplicate a third bezier
```

Do **not** change open/close morph (`OPEN_MS` 200 / `CLOSE_MS` 280 / Emil `cubic-bezier(0.23, 1, 0.32, 1)`).

## Repo conventions to follow

- Panel open language already uses Emil strong ease-out `cubic-bezier(0.23, 1, 0.32, 1)` — keep for open/close.
- Return entrance should match `EASE_Y` / EntranceItem, not the panel morph curve.
- Exemplar: EntranceItem visible transition in `components/ScrollReveal.tsx` (~223–227).

## Steps

1. Read the portal root style block where `opacity: shown && posReady ? 1 : 0` and `transition: morphT` are composed (~759–834).
2. For return reveals, ensure the pre-shown state includes a small `translateY` (8–12px; prefer **12** to stay under Entrance’s 20px so the floating pill doesn’t feel heavier than cards). Compose with any existing `transform` used for position — if position is `left/top` not transform, adding `translateY` on the same node is fine.
3. Wire `transition` so return fade animates **opacity + transform** with `RETURN_EASE` / `RETURN_FADE_MS`, without breaking morph open/close transitions (existing comment warns not to share a node with `.intro-hide` — heed that).
4. Optionally set `RETURN_DELAY_MS = 40` (within 30–80ms stagger band) before `setShown(true)` on the return path only.
5. Honor `prefers-reduced-motion`: if not already, snap shown with `transition: none` when `matchMedia("(prefers-reduced-motion: reduce)")` matches.

## Boundaries

- Do NOT keep the panel mounted off-route to “sync” with keep-alive (remount is intentional; portals to `document.body`).
- Do NOT change first-load `FADE_MS = 700` / `intro-done` gating.
- Do NOT change DialKit “PS3 Pill” geometry defaults unless required for transform compose.
- Do NOT touch silk / HeroText.

## Verification

- **Mechanical**: typecheck; no regression on drag/open/close.
- **Feel check**:
  1. about → work (after 002): pill and hero/grid start within ~1 stagger step; pill does not finish wildly before/after the hero block.
  2. Slow-mo 10%: pill eases out (fast start), no ease-in.
  3. Open/close panel still 200/280ms Emil ease-out; drag still live.
  4. Case-study Back: pill may still fade (remount) while grid is instant — acceptable; if it feels wrong, only then gate return fade when `peekInstantBack()` was set (optional stretch — default leave as-is).
  5. Reduced motion: pill appears without translate.
- **Done when**: soft return reads as one entrance family (hero, cards, pill), not three unrelated timings.
