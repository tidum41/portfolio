# 001 — ThemeToggle icon crossfade

- **Status**: DONE
- **Commit**: 1324e41
- **Severity**: LOW
- **Category**: 7. Cohesion & tokens / 3. Physicality & origin
- **Estimated scope**: 1 file

## Problem

`components/ThemeToggle.tsx:67` — the toggle renders only the active icon; the
other icon is unmounted entirely. Switching themes causes a hard visual cut:

```tsx
{isDark ? <SunIcon /> : <MoonIcon />}
```

The button already communicates state via `aria-label`; the icon swap is purely
presentational — but a hard cut on a nav-level control is jarring because the
user's eye tracks the nav and the instant swap reads as a glitch rather than a
deliberate switch.

## Target

Both icons stay in the DOM, stacked via `position: absolute`. The active icon
animates to `opacity: 1, scale: 1, filter: blur(0px)`; the outgoing icon
animates to `opacity: 0, scale: 0.25, filter: blur(4px)`. Spring config matches
the repo convention from `PortfolioCard.tsx`: `{ type: "spring", duration: 0.3, bounce: 0 }`.

Reduced-motion branch: drop scale and blur, keep a `150ms` opacity crossfade
so the swap still reads without any movement.

```tsx
const visibleAnim = { opacity: 1, scale: 1,    filter: "blur(0px)" };
const hiddenAnim  = { opacity: 0, scale: 0.25, filter: "blur(4px)" };

<motion.span initial={false} animate={isDark ? visibleAnim : hiddenAnim} transition={spring}>
  <SunIcon />
</motion.span>
<motion.span initial={false} animate={isDark ? hiddenAnim : visibleAnim} transition={spring}>
  <MoonIcon />
</motion.span>
```

`initial={false}` prevents a mount animation (the icon should be static on
first render; only the toggle interaction should animate).

## Repo conventions to follow

- Spring config: `{ type: "spring", duration: 0.3, bounce: 0 }` — matches
  `PortfolioCard.tsx:48` (just updated this session).
- `useReducedMotion()` from framer-motion — same pattern as `ScrollReveal.tsx:23`.
- `aria-hidden` on both `<motion.span>` wrappers — the button's `aria-label`
  carries the state; the icons are decorative.

## Steps

1. Add `motion`, `useReducedMotion` imports from `"framer-motion"`.
2. Remove `{isDark ? <SunIcon /> : <MoonIcon />}` conditional.
3. Set `position: relative; width: 15; height: 15` on the `<button>` to give
   the stacked absolute children a containing block.
4. Render both icons as `<motion.span style={{ position: "absolute", inset: 0, display: "flex", ... }}>`.
5. Drive `animate` from `isDark` state; `initial={false}` on both.
6. Reduced-motion branch: `scale: 1`, `filter: "blur(0px)"` on the hidden icon,
   `duration: 0.15` linear transition.

## Boundaries

- Do NOT change `toggle()` logic or localStorage/DOM writes.
- Do NOT change `aria-label` on the button.
- Do NOT add any new CSS classes.

## Verification

- **Mechanical**: `tsc --noEmit` passes; dev server starts without error.
- **Feel check**: Click the toggle — sun and moon crossfade through a blurred
  mid-point rather than cutting. In DevTools Animations panel at 10% speed,
  confirm both icons animate simultaneously (not sequentially). Toggle rapidly
  three times — the spring should retarget smoothly, never restart from zero
  (`initial={false}` guarantees this).
- **Reduced-motion**: Enable "Prefer reduced motion" in System Preferences (or
  Chrome Rendering panel). Toggle — only opacity should change, no scale or blur.
- **Done when**: No hard cut on theme switch; reduced-motion branch confirmed.
