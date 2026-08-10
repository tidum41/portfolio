# 005 — Cohesion pass: scroll-reveal duration + dead blur claim

- **Status**: TODO
- **Commit**: 6f8d727
- **Severity**: LOW
- **Category**: Cohesion & tokens / Easing & duration
- **Estimated scope**: 2 files (`components/ScrollReveal.tsx`, optionally `lib/motion.ts` comment)

## Problem

Site personality is crisp portfolio with a deliberate **marketing-length** first-load intro, then a shared **Entrance** vocabulary (`y: 20`, `duration: 0.45`, `stagger: 0.05`). Two siblings drift:

1. **`StaggerItem`** hardcodes `duration: 0.7` (about experience list) while Entrance uses `0.45` and ScrollReveal dials default `yDuration: 0.95` / `opacityDuration: 0.75` — scroll reveals can feel like a second product.

```81:88:components/ScrollReveal.tsx
export function StaggerItem({ children, style, className }: { children: ReactNode; style?: CSSProperties; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      variants={{
        hidden:  { opacity: 0, transform: "translateY(16px)" },
        visible: { opacity: 1, transform: "translateY(0px)", transition: { duration: reduced ? 0 : 0.7, ease: PS3_EASE } },
```

2. **`EntranceStagger` comment claims mid-flight blur** that is not implemented:

```97:104:components/ScrollReveal.tsx
// ── Entrance — reveal-on-route-arrival, not scroll-into-view ────────────────
// Same fade-up + slide-up shape as StaggerReveal/StaggerItem, but triggered
// by an explicit `active` flag instead of `whileInView`. For above-the-fold
// content that should animate the instant its page becomes current (work
// grid, about page) rather than when scrolled to. Adds a brief mid-flight
// blur on top of opacity/y — barely perceptible, gone by the time the item
// is at rest. Shares the "Entrance" dialkit panel with BentoGallery's plain-
```

No `filter` / blur appears in `EntranceItem` variants. Either implement a subtle blur or delete the claim — lying comments cause future agents to “preserve” nonexistent behavior.

## Target

**A — StaggerItem duration** (prefer reduce, not lengthen Entrance):

```ts
// StaggerItem visible transition
duration: reduced ? 0 : 0.45, // match ENTRANCE_DEFAULTS.duration
ease: PS3_EASE,               // already EASE_Y [0.22, 1, 0.36, 1]
```

Optionally import `ENTRANCE_DEFAULTS.duration` instead of magic `0.45`.

**B — ScrollReveal defaults**: treat as **scroll marketing** (AUDIT allows longer). Cap defaults closer to Entrance without making scroll feel identical to route entrance:

```ts
yDuration:      [0.55, 0.1, 2.5],  // was 0.95
opacityDuration:[0.45, 0.1, 2.5],  // was 0.75
```

Feel-check on about page; if too snappy for long sections, land at `0.65` / `0.5` instead — do not exceed previous 0.95.

**C — Blur claim**: **delete the blur sentences** from the Entrance comment (preferred). Do **not** add blur in this plan (perf on work grid + Safari; AUDIT blur is for imperfect crossfades, not every entrance).

## Repo conventions to follow

- Shared easings: `EASE_Y` / `EASE_OPACITY` from `lib/motion.ts`.
- DialKit panels already expose live tuning — changing defaults updates DialKit ranges’ middle values.
- Exemplar: `EntranceItem` duration from dials / `ENTRANCE_DEFAULTS`.

## Steps

1. Change `StaggerItem` duration `0.7` → `ENTRANCE_DEFAULTS.duration` (import already has `ENTRANCE_DEFAULTS` in file via dials helper — ensure import list includes it).
2. Adjust `ScrollReveal` dial defaults as in Target B.
3. Edit Entrance comment block: remove blur claims; state opacity + translateY only.
4. Do not change BentoGallery CSS entrance (already reads `ENTRANCE_DEFAULTS`).

## Boundaries

- Do NOT change route fade durations (`DURATION.routeEnterFast` / `routeExit`).
- Do NOT change first-load `introTimings` (hero 0.8s etc. are rare delight — allowed).
- Do NOT add `filter: blur` to EntranceItem in this plan.
- Do NOT retune Halftone nav morph (separate personality; hover tens/day — leave).

## Verification

- **Mechanical**: typecheck.
- **Feel check**:
  1. about → scroll experience list: stagger feels same family as about hero entrance, not sluggish 700ms.
  2. about → scroll CD / sections: still readable, not teleporting; if harsh, bump yDuration toward 0.65.
  3. work grid entrance unchanged numerically if DialKit “Entrance” panel untouched.
  4. Reduced motion: durations 0 still.
- **Done when**: no comment claims blur on Entrance; about list stagger ≤ Entrance duration; scroll reveal defaults no longer ~1s by default.
