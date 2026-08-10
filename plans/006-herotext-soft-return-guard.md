# 006 — Guard HeroText soft-return double-motion (verify-only + comment)

- **Status**: TODO
- **Commit**: 6f8d727
- **Severity**: MEDIUM
- **Category**: Purpose & frequency / Interruptibility
- **Estimated scope**: 1 file (`components/HeroText.tsx`) — comment + verify; code change only if feel-check fails
- **Depends on**: Plan 002

## Problem

`HeroText` uses a module flag so its **long first-load timeline** does not re-run on keep-alive:

```9:22:components/HeroText.tsx
// Module-level: false on fresh page load, true after first mount.
// Persists across client-side navigation — same pattern as PS3Silk._hasMounted.
let _animated = false;

export default function HeroText() {
  const instant = typeof window !== "undefined" && _animated;
  // ...
  useEffect(() => {
    _animated = true;

    if (instant) return;
```

Full timeline (`introTimings.heroDelay` 0.8s, `heroDuration` 0.8s, subtitle up to 1.5–1.9s) is correct for **cold load / intro-replay** only.

After plan 002, soft return animates the **wrapping** `EntranceItem` in `PersistentWorkShell` while `_animated` keeps inner H1/subtitle settled. That is the intended split:

- Soft return → short Entrance settle on the wrapper (0.45s).
- Tab/BFCache → `intro-replay` resets `_animated` and replays the long hero timeline.

Risk: someone “fixes” soft return by resetting `_animated` on every `/` show → double motion (wrapper Entrance + long HeroText) or a 0.8s delayed hero on every about→work.

## Target

Document and verify the split. **Default: no code change.**

If feel-check after 002 shows the hero **does not move** (wrapper `heroInstant` still true, or EntranceItem no-op):

1. Confirm `heroInstant` is false on soft return (plan 002).
2. Confirm wrapper `EntranceItem` goes `hidden` when `!isWorkRoute` (opacity 0) before return.
3. Only if wrapper motion is insufficient: add an explicit soft-return path that runs a **short** H1 settle matching Entrance — not `introTimings`:

```ts
// ONLY if verification fails — short settle, not introTimings
h1Controls.set({ opacity: 0, transform: "translateY(20px)" });
h1Controls.start({
  opacity: 1,
  transform: "translateY(0px)",
  transition: {
    duration: 0.45,
    ease: EASE_Y, // [0.22, 1, 0.36, 1]
    delay: 0,
  },
});
```

Do **not** set `_animated = false` for soft return. Do **not** listen to pathname here if the wrapper already works.

## Repo conventions to follow

- Long intro owned by `lib/introTimings.ts` + `intro-replay` event from `PersistentWorkShell`.
- Short route entrance owned by `EntranceItem` / `ENTRANCE_DEFAULTS`.

## Steps

1. After 002, run feel-check: about → work, watch hero headline.
2. Add comment above `_animated` documenting Instant/Orchestrated Layer B vs Layer C (see plan 003).
3. Stop if wrapper motion is visible and intentional.
4. If not, investigate shell `heroInstant` / hidden state before adding HeroText short settle.

## Boundaries

- Do NOT reset `_animated` on soft primary nav.
- Do NOT call `intro-replay` from about/archive navigation.
- Do NOT change subtitle 1.5s / 1.9s first-load timings.

## Verification

- **Feel check**: about → work — hero participates in entrance (~0.45s settle), no 0.8s dead wait, no double fade.
- Case-study Back — hero does not animate (instant shell).
- Tab away/back on `/` — full intro-replay still works.
- **Done when**: comment exists; soft return hero feels intentional without long intro; no double-motion.
