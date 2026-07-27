# Handoff: CD Player — remaining fixes + UX/design improvement opportunities

Habit Tracker is confirmed fixed and out of scope for this document. This
covers only `components/embeds/cd-player/`, `components/CDPlayer.tsx` /
`CdPlayerApp.tsx`, and `components/BentoGallery.tsx` (playground zoom, fixed
separately but noted below for completeness).

**Standing rule: do not commit or push without being explicitly asked.**
Nothing has been committed. Run `npx tsc --noEmit -p .` from repo root to
confirm typecheck before making further changes — clean as of this handoff.

---

## 1. Reference project — read this first

`/Users/m/Documents/claude code/improved-cdplayer/` is a **separate,
standalone Vite app that is the canonical source of truth** for the CD
Player's design. The portfolio's `components/embeds/cd-player/` is a manual
port of this project into Next.js/React. When in doubt about *any* spacing,
sizing, font, or animation value, **diff against this project's source
directly** — a large fraction of prior churn on this component came from
recalibrating values by eye/screenshot instead of just reading the
reference source, which has the exact numbers.

Key mappings:
- `src/App.tsx` / `src/App.module.css` → `components/embeds/cd-player/CdPlayerApp.tsx` / `.module.css`
- `src/components/VinylPlayer/*` → `components/embeds/cd-player/components/VinylPlayer/*`
- `src/components/AlbumGrid/*` → `components/embeds/cd-player/components/AlbumGrid/*`

There's also a live deployed reference: `https://cdplayer-peach.vercel.app/`
— treat the `improved-cdplayer/` **source code** as higher authority than
the live site if they ever disagree (the live site could be stale).

---

## 2. Fixed and verified this session

- **Layout-mode breakpoint** (`CdPlayerApp.tsx`, `mobileBreakpoint` dial):
  "work" variant raised to `1000` (from the site grid's 767px) since the
  3-column album grid needs more headroom than the rest of the page.
  "about" variant compares against the component's own container width
  (default `320`) since it sits in a narrow prose column.
- **Transport bar icon position**: `TransportBar.module.css`, `.btn svg {
  transform: translateY(52px); }` — **not** `padding-top`. See the root-
  cause bug below before touching this value.
- **Accent dot**: `.orangeDot { top: 22px; }` — matches reference exactly.
- **DateBadge**: `.badge { width: 237px; height: 108px; }`, `.display {
  padding: 0 18px; }` (symmetric — reverted from a drifted asymmetric
  version). Font-size dials `dateLine1FontSize`/`dateLine2FontSize` are
  `24`/`20`, matching reference.
- **Drag-to-play hint**: restored to match reference exactly — 3-ring disc
  SVG + arrow SVG, `dragHintSlideLeft`/`dragHintSlideUp` (disc slides 8px +
  scales to 1.14x) + `dragHintArrowFade` (opacity 0.3↔0.85), 2.6s
  ease-in-out infinite. A prior round wrongly removed the disc in favor of
  a static arrow — reverted.
- **Fonts**: "MM-7" label and drag-hint text use `var(--font-geist-mono)`
  (`next/font/google` `Geist_Mono`, set up in `app/layout.tsx`). This is a
  genuine user request, not from the reference (which uses IBM Plex Mono)
  — if the reference and an explicit user ask ever conflict, the explicit
  ask wins.
- **Modal open/close motion**: `data-player-sizer`'s width/height/transform
  transitions now share the exact duration+easing as `ProjectPopup.tsx`'s
  panel fade (`PANEL_DURATION.panel.enter` 0.26s, `EASE_OPACITY` from
  `lib/motion.ts`) instead of an independent `0.18s ease` or an instant
  snap. **Not re-verified live** — worth confirming it reads as one
  continuous motion, not two.
- **Playground zoom-anchor bug** (`BentoGallery.tsx`, separate component):
  `onPointerUp` now calls `snapToBounds("spring")` after drag-to-pan ends.

## 3. The root-cause bug behind repeated "still too high" reports

`CdPlayerApp.module.css` has a deliberate, documented reset:
```css
.layout, .layout *, .layout *::before, .layout *::after {
  box-sizing: border-box; margin: 0; padding: 0;
}
```
Ported from the original standalone app's global reset (it used to own the
whole document). This reset and `TransportBar.module.css`'s `.btn {
padding-top: Npx }` have **equal CSS specificity**, and Turbopack happens to
emit `CdPlayerApp.module.css` *after* `TransportBar.module.css` in the
compiled bundle — so the reset always won, silently. **`padding-top` on
`.btn` had done nothing since the original port**, confirmed via
`getComputedStyle(btn).paddingTop` returning `"0px"` despite the source
declaring a value. Multiple rounds of "buttons still too high" feedback
were all reacting to a value that was never applied.

Fix: moved the icon offset to `transform: translateY()` on the icon `<svg>`
(untouched by the reset), not to the reset or bundling order.

**If any spacing value in this component still looks wrong, suspect this
class of bug first.** Check whether the property is `margin` or `padding`
on something inside `.layout`, and verify via `getComputedStyle()` in
devtools before assuming the *value* (not the mechanism) is wrong.
`transform`, `top`/`left`/`right`/`bottom` on absolutely-positioned
elements, `width`, `height`, and `gap` are all unaffected and safe to trust.

## 4. Files not yet individually diffed against the reference

Diffed thoroughly this session: `CdPlayerApp.module.css`,
`TransportBar.module.css`, `DateBadge.module.css`, `VinylPlayer.module.css`,
`AlbumCard.module.css`, `AlbumGrid.module.css`, and the drag-hint markup in
both `.tsx` files. **Not yet diffed** — check these next if spacing issues
remain:
- `components/embeds/cd-player/components/VinylPlayer/Platter.tsx` / `.module.css`
- `components/embeds/cd-player/components/Disc/DragDisc.tsx` / `Disc.module.css`
- `components/embeds/cd-player/components/AudioConsent/*`
- `components/embeds/cd-player/components/VinylPlayer/VolumeControl.tsx` (the player's own +/- buttons, not the site nav mute button)

---

## 5. UX / design improvement opportunities (not bugs — genuine gaps found this session)

These are concrete, code-verified gaps, not generic suggestions — each has
exact evidence. Worth a real design pass, which is what you flagged this
project still needs.

### Accessibility — currently close to zero keyboard/screen-reader support
- **No way to load an album via keyboard at all.** `AlbumCard.tsx` is a
  `<div>` with dnd-kit's `useDraggable` spread onto it (`{...attributes}
  {...listeners}`) plus a plain `onClick`. dnd-kit's default `attributes`
  do add `role="button" tabIndex={0}`, so a keyboard user *can* tab to a
  card — but `CdPlayerApp.tsx`'s `useSensors()` only registers
  `PointerSensor` and `TouchSensor`, no `KeyboardSensor`, so keyboard-
  initiated drag does nothing. And there's no `onKeyDown` translating
  Enter/Space into the `onTap` handler either, so the click-to-load path
  (used on mobile) is also unreachable by keyboard. **Net result: a
  keyboard-only user cannot load any album, at all** — the single core
  interaction of this widget.
- **No visible focus indicator.** `AlbumCard.module.css` has zero
  `:focus`/`:focus-visible` rules, so even the tabIndex=0 the div does get
  from dnd-kit is invisible when focused — no `outline`, no ring, nothing.
- **No `aria-live` region anywhere in the component tree.** Loading an
  album, play/pause state changes, and playback errors are all silent to
  screen readers — no announcement of "now playing [title] by [artist]" or
  similar.
- **Audio errors are silently swallowed everywhere**, e.g.
  `hooks/useAudio.ts`: `audio.play().catch(() => {})` (multiple call
  sites, empty catch). If a track fails to load or play (network error,
  autoplay block, unsupported format), there's no user-facing feedback at
  all — the UI just looks stuck, with no visual or announced indication of
  what went wrong or what to do about it.

### Interaction/UX polish worth considering
- The drag-to-platter interaction (the core mechanic) has no non-drag
  fallback path for *any* input method other than the tap-to-load handler
  — worth deciding whether tap-to-load should be the explicit, documented
  accessible alternative (in which case it needs the keyboard wiring above)
  or whether a genuinely different affordance (e.g. a "play" button on
  hover/focus per card) makes more sense.
- No loading/error state distinct from the existing "loading" equalizer-bar
  animation in `DateBadge.tsx` — that animation plays during the normal
  ~1.3s load-and-play sequence (`CdPlayerApp.tsx`'s `loadAlbumWithAudio`),
  but there's no separate state if the *audio itself* subsequently fails to
  play after that sequence completes (see the swallowed-errors point above)
  — from the user's perspective these two situations are currently
  indistinguishable.
- Volume control (`components/embeds/cd-player/components/VinylPlayer/
  VolumeControl.tsx`) is +/- step buttons only, no way to see the current
  level as a number/percentage or set it directly — worth a design look at
  whether that's intentional (matches a physical CD player's up/down
  buttons) or worth a readable indicator.

---

## 6. Recommended order of work for Cursor

1. Fresh browser verification of section 2's fixes (dev server: `bash
   start-dev.sh` from repo root, port 3005) — none of the most recent edits
   have been re-confirmed visually since landing.
2. If spacing issues remain anywhere, diff the specific file against
   `improved-cdplayer/src/` directly (section 1/4) rather than re-guessing.
3. Accessibility pass (section 5) — this is probably the highest-leverage
   "significant UX improvement" available on this component: add a
   `KeyboardSensor` + `onKeyDown` Enter/Space handling to `AlbumCard.tsx`,
   add visible focus styles, add an `aria-live="polite"` region announcing
   load/play/pause/error state, and surface audio errors to the user
   instead of swallowing them.
4. Design pass on the interaction gaps in section 5 once accessibility is
   solid.
