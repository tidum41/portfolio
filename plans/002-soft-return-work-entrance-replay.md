# 002 — Replay work entrance on about/archive → work

- **Status**: TODO
- **Commit**: 6f8d727
- **Severity**: HIGH
- **Category**: Purpose & frequency / Cohesion / Missed opportunity (feel-breaking gap)
- **Estimated scope**: 1–2 files (`PersistentWorkShell.tsx`, optionally `HeroText.tsx` comment only)

## Problem

Returning to `/` from about or archive via primary nav feels broken: **only the PS3 menu pill animates**. The keep-alive work hero + grid stay visually static because a “soft return” path forces `instant={true}` on every `EntranceItem`, skipping the same fade-up + stagger used on first reveal and on about/archive remounts.

Evidence — docblock promises orchestrated replay, but soft-return code cancels it:

```164:174:components/PersistentWorkShell.tsx
 *   - Case-study "Back" (peekInstantBack()): stays fully instant, exactly as
 *     before — this is the fix that avoids remounting PS3Silk's WebGL canvas.
 *   - Everything else (Nav "work" link, browser back from about/archive,
 *     etc.): hero settles in first, then the grid cascades in shortly after,
 *     replaying on every such arrival since hero/grid re-hide when you leave. */
```

```220:232:components/PersistentWorkShell.tsx
  // Soft return: after the first "/" visit, coming back from about/archive/
  // case studies skips entrance stagger (same feel as instant-back) so we
  // don't restack grid animations on top of silk wake + media resume.
  const softReturnRef = useRef(false);
  if (isWorkRoute && !wasWorkRouteRef.current) {
    instantArrivalRef.current = peekInstantBack();
    softReturnRef.current = hasEverBeenActive && !instantArrivalRef.current;
  }
  if (!isWorkRoute) {
    softReturnRef.current = false;
  }
  wasWorkRouteRef.current = isWorkRoute;
  const instant = instantArrivalRef.current || softReturnRef.current;
```

`heroInstant` inherits that skip:

```245:245:components/PersistentWorkShell.tsx
  const heroInstant = instant || (Boolean(isFirstLoadIntroRef.current) && !gridGateOpen);
```

Meanwhile `PS3ControlPanel` **remounts** on every `/` visit (`{hasEverBeenActive && isWorkRoute && <PS3ControlPanel />}`) and always plays its return fade (`RETURN_FADE_MS = 450`). That is why the pill alone moves.

Soft-nav (`markSoftNav` in `HalftoneNavLink`) only skips the **route opacity crossfade** in `AnimationProvider` — correct and unrelated. Do not conflate soft-nav with soft-return instant.

## Target

**Instant vs Orchestrated (this path):**

| Arrival at `/` | Route fade | Hero + grid `EntranceItem` | Full intro-replay (`data-intro` / HeroText timeline / silk intro) | PS3 pill |
| --- | --- | --- | --- | --- |
| Case-study **Back** (`peekInstantBack()`) | Skip (instant) | **Instant** (keep) | No | Remount return fade OK (secondary) |
| about / archive / nav “work” (not Back) | Skip (soft-nav) | **Orchestrated** ENTRANCE_DEFAULTS | No — keep-alive silk/media | Remount return fade, same vocabulary |
| Cold first load on `/` | N/A | Grid after `intro-done`; hero owns own timeline | Yes | After `intro-done` |

Exact motion values (already in `lib/motion.ts` — do not invent new curves):

```ts
// lib/motion.ts — keep these
EASE_Y = [0.22, 1, 0.36, 1]
ENTRANCE_DEFAULTS = { y: 20, duration: 0.45, stagger: 0.05, maxSpread: 0.4 }
```

Behavior after fix:

1. `instant === true` **only** when `peekInstantBack()` was true on this arrival (case-study Back).
2. Soft return (has visited `/` before, not instant-back) → `instant={false}` on hero + grid `EntranceItem`s so `active` false→true replays hidden→visible.
3. Do **not** dispatch `intro-replay` / do **not** reset `HeroText`’s `_animated` for soft return (that path is tab/BFCache only). Parent `EntranceItem` owns soft-return hero motion; inner `HeroText` stays settled.
4. Keep `display:none` keep-alive, silk canvas, embed portals, scroll restore — unchanged.

## Repo conventions to follow

- Entrance vocabulary: `EntranceItem` + `useEntranceDials()` / `ENTRANCE_DEFAULTS` in `lib/motion.ts`.
- Instant-back flag: `lib/instantNav.ts` `markInstantBack` / `peekInstantBack` — only CaseStudyTOC Back.
- Soft-nav flag: skips route fade only (`AnimationProvider` + `peekSkipRouteFade`).
- Exemplar of correct orchestrated remount entrance: `app/about/page.tsx` `EntranceStagger active` + nested `EntranceItem`s (about always remounts; work must **simulate** that feel while staying mounted).

## Steps

1. In `components/PersistentWorkShell.tsx`, **delete** the soft-return → instant coupling. Replace the arrival block so only instant-back sets instant:

```tsx
  const wasWorkRouteRef = useRef(isWorkRoute);
  const instantArrivalRef = useRef(false);
  if (isWorkRoute && !wasWorkRouteRef.current) {
    instantArrivalRef.current = peekInstantBack();
  }
  wasWorkRouteRef.current = isWorkRoute;
  const instant = instantArrivalRef.current;
```

Remove `softReturnRef` entirely (declaration, assignments, comments that say soft return skips stagger).

2. Update the component docblock (lines ~164–174 and any soft-return comments near the old ref) so it matches behavior:

   - Instant: case-study Back only (`peekInstantBack`).
   - Orchestrated: Nav work / about→work / archive→work / browser back from about|archive (not via instant-back): hero + grid `EntranceItem` replay.
   - Soft-nav: route fade skip only; does not imply content instant.

3. Leave `heroInstant` formula as-is **after** step 1 (`instant || first-load intro gate`). Soft return will no longer force hero instant.

4. Do **not** change `HeroText.tsx` `_animated` for this plan. Soft-return motion is the wrapping `EntranceItem` (`active={isWorkRoute} instant={heroInstant}`). Optionally add a one-line comment above `_animated` in `HeroText.tsx`:

```tsx
// Module-level: skips HeroText's *own* first-load timeline on remounts.
// Soft return to "/" is animated by PersistentWorkShell's EntranceItem wrapper,
// not by resetting this flag (intro-replay / tab return owns full HeroText replay).
```

5. Feel-check that leaving `/` still drives items to `hidden` (`active={false}`) so return has a from-state. Framer updates under `display:none` should already work; if soft-return entrance is a no-op (cards already at visible), then in a follow-up only: on `!isWorkRoute` force `initial`/controls to hidden before hide — **do not** invent that unless verification fails.

## Boundaries

- Do NOT remove keep-alive (`display` toggle, `hasEverBeenActive`, silk/embed persistence).
- Do NOT change `markInstantBack` / CaseStudyTOC Back behavior.
- Do NOT change `markSoftNav` / `AnimationProvider` skip-fade.
- Do NOT fire `intro-replay` on about/archive → work.
- Do NOT retune `ENTRANCE_DEFAULTS`, PS3Silk, or MuxAutoplayCard in this plan.
- Do NOT add dependencies.

## Verification

- **Mechanical**: `npx tsc --noEmit` (or project’s usual typecheck). No new lint on `PersistentWorkShell.tsx`.
- **Feel check**:
  1. Cold load `/` — intro + grid stagger still correct.
  2. `/` → about → click **work**: hero block fades/slides up; grid cards cascade (~50ms stagger, capped by maxSpread 0.4s); PS3 pill also fades — **chorus**, not pill-only.
  3. Same for archive → work.
  4. Open a case study → **Back**: grid/hero snap (instant); scroll restored; no stagger.
  5. Case study → click nav **work** (not Back): should **orchestrate** like about→work (not instant-back).
  6. DevTools Animations at ~10%: entrance uses ease-out settle (`cubic-bezier(0.22, 1, 0.36, 1)`), duration ~0.45s per card.
  7. `prefers-reduced-motion: reduce`: entrances collapse (EntranceItem already treats reduced like instant duration 0).
- **Done when**: about/archive → work never looks like “only the menu pill moved”; case-study Back remains snappy/instant.
