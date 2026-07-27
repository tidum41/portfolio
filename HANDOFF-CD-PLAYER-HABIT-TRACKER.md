# Handoff: CD Player + Habit Tracker embed issues

Written for handoff to another tool/session (e.g. Cursor). Covers the native
ports of the CD Player and Habit Tracker embeds under `components/embeds/`,
`components/CDPlayer.tsx` / `CdPlayerApp.tsx`, and `components/PhoneEmbed.tsx`
/ `PhonePoster.tsx` / `HabitTrackerApp.tsx`. Everything below reflects the
actual current state of the code as of this handoff — not aspirational.

**Standing rule from the user across this whole effort: do not commit or
push anything without being explicitly asked.** Nothing has been committed.
`git status` currently shows the files listed at the bottom as modified/untracked.

---

## 1. Reference project — read this first

`/Users/m/Documents/claude code/improved-cdplayer/` is a **separate, standalone
Vite app that is the canonical source of truth** for the CD Player's design.
The portfolio's `components/embeds/cd-player/` is a manual port of this
project into Next.js/React (dropping the iframe/postMessage plumbing that
only applied to the old Framer-embed version). When in doubt about *any*
spacing, sizing, font, or animation value in the CD Player, **diff against
this project's source directly** rather than guessing or measuring off a
live deployed site — a large fraction of this session's churn came from
trying to recalibrate values by eye/screenshot instead of just reading the
reference source, which has the exact numbers.

Key files there for comparison:
- `src/App.tsx` / `src/App.module.css` → maps to `components/embeds/cd-player/CdPlayerApp.tsx` / `.module.css`
- `src/components/VinylPlayer/*` → maps to `components/embeds/cd-player/components/VinylPlayer/*`
- `src/components/AlbumGrid/*` → maps to `components/embeds/cd-player/components/AlbumGrid/*`

There is **no equivalent reference project for the Habit Tracker** found
during this session — only the ported code itself and the two phone-frame
webp assets in `public/`.

There's also a live deployed reference for the CD player specifically:
`https://cdplayer-peach.vercel.app/` — but treat the `improved-cdplayer/`
**source code** as higher authority than that live site if they ever disagree,
since the live site could be stale relative to local source changes.

---

## 2. CD Player — current state

### Fixed and verified this session
- **Layout-mode breakpoint**: `CdPlayerApp.tsx`'s `mobileBreakpoint` DialKit
  dial. "work" variant (grid/popup on `/`) is `1000` (raised from the site
  grid's own 767px breakpoint — the CD player's 3-column grid needs more
  headroom than the rest of the page). "about" variant (inline embed on
  `/about`) uses the component's own container width instead of the site
  viewport, default `320`, since it sits in a narrow prose column whose
  width doesn't track viewport width.
- **Transport bar icon position**: `TransportBar.module.css`. The icons
  are positioned via `.btn svg { transform: translateY(52px); }`, **not**
  `padding-top`. This matters — see the reset-cascade bug below. Value
  `52px` matches `improved-cdplayer`'s own `padding-top: 52px` exactly.
- **Accent dot** (`.orangeDot { top: 22px; }`) — matches reference exactly.
- **DateBadge**: `DateBadge.module.css` — `.badge { width: 237px; height:
  108px; }`, `.display { padding: 0 18px; }` (symmetric, not asymmetric —
  earlier rounds drifted to asymmetric values, now reverted to match
  reference exactly). Font-size dials in `CdPlayerApp.tsx`
  (`dateLine1FontSize`/`dateLine2FontSize`) are `24`/`20`, matching reference.
- **Drag-to-play hint**: restored to match reference exactly — a 3-ring
  disc SVG (`.dragHintDisc`) + arrow SVG (`.dragHintArrow`), animated with
  `dragHintSlideLeft`/`dragHintSlideUp` (disc slides 8px + scales to 1.14x)
  and `dragHintArrowFade` (arrow opacity 0.3↔0.85), both on a 2.6s
  ease-in-out infinite loop. **A prior round of this session removed the
  disc entirely in favor of a static arrow — this was wrong and has been
  reverted.** Present in both `CdPlayerApp.tsx` (horizontal) and
  `components/AlbumGrid/AlbumGrid.tsx` (vertical/carousel).
- **Fonts**: the "MM-7" label (`VinylPlayer.tsx`) and drag-hint text
  (`CdPlayerApp.module.css` `.dragHintH, .dragHintV`) use
  `var(--font-geist-mono)`, set up via `next/font/google`'s `Geist_Mono` in
  `app/layout.tsx` (applied as a CSS variable on `<html className=
  {geistMono.variable}>`). This was a genuine user request (not something
  from the reference project, which uses IBM Plex Mono for these) — if the
  reference and the user's explicit asks ever conflict, the user's explicit
  ask wins.
- **Modal open/close motion continuity**: `CdPlayerApp.tsx`'s
  `data-player-sizer` width/height/transform transitions now use the exact
  same duration+easing as `ProjectPopup.tsx`'s panel fade
  (`PANEL_DURATION.panel.enter` = 0.26s, `EASE_OPACITY` cubic-bezier from
  `lib/motion.ts`), instead of an independent `0.18s ease`. An earlier
  round had this *instantly snap* (no transition at all) specifically on
  open to avoid a different complaint ("don't like the scale animation") —
  that traded one problem for another (content popping in with zero motion
  against a smoothly-fading panel). **This has not been re-verified live
  by the user** — worth explicit confirmation that it now reads as one
  continuous motion, not two.
- **Playground zoom-anchor bug** (`components/BentoGallery.tsx`, separate
  component, not part of the CD player but fixed in the same session):
  `onPointerUp` now calls `snapToBounds("spring")` after a drag-to-pan
  gesture ends. Root cause: `elastic()` rubber-banding during drag can
  leave the canvas transform outside true bounds, and that was never
  corrected until the *next* zoom action abruptly snapped it back — read as
  a jump. `getFocusT` (click-to-focus transform) was already fixed for a
  similar issue earlier in the session (clamped through `getBounds()`).

### The single most important bug found this session (root cause, not yet independently re-confirmed by a second full read)
`components/embeds/cd-player/CdPlayerApp.module.css` lines ~8-15 has a
**deliberate, documented reset**:
```css
.layout,
.layout *,
.layout *::before,
.layout *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
```
This exists because the original standalone app assumed it owned the whole
document and had its own global `* { margin:0; padding:0; box-sizing:
border-box }` reset (see `improved-cdplayer/src/App.module.css` line 1) —
ported into the portfolio, it had to be scoped to `.layout` instead of the
whole page, so as not to leak into the rest of the site.

**The problem**: this scoped reset and `TransportBar.module.css`'s `.btn {
padding-top: Npx }` rule have **equal CSS specificity** (both are single
class selectors from the browser's perspective — `.layout *` costs the same
as `.btn`), and Turbopack's bundler happens to emit `CdPlayerApp.module.css`
(where the reset lives) *after* `TransportBar.module.css` in the compiled
chunk. Equal specificity + later source order = the reset wins, silently.

**This meant `padding-top` on `.btn` had done literally nothing since the
original port** — confirmed via direct CSSOM inspection
(`getComputedStyle(btn).paddingTop` returned `"0px"` despite the source
file declaring `104px`). **Three separate rounds of "the buttons are still
too high" feedback across this session were all responses to a value that
was never actually being applied at all.** The fix was moving the icon
offset to `transform: translateY()` on the icon `<svg>` itself
(`transform` isn't touched by the reset), not to change the reset or the
bundling order.

**If any other spacing value in this component still looks wrong after
comparing to the reference source, suspect this same class of bug first** —
i.e., check whether the property in question is `margin` or `padding` (both
zeroed by the reset) on something inside `.layout`, and whether it's
actually taking effect via `getComputedStyle()` in devtools before assuming
the *value* is wrong. `transform`, `top`/`left`/`right`/`bottom` (on
absolutely-positioned elements), `width`, `height`, `gap` (on flex/grid
containers) are all unaffected by this reset and safe to trust at face value.

### Not independently re-verified after the most recent edits
The user said (this message) that things are "still not the same" as the
reference and flagged "so many spacing inconsistencies" — the fixes above
address every discrepancy found by diffing `CdPlayerApp.module.css`,
`TransportBar.module.css`, `DateBadge.module.css`, `VinylPlayer.module.css`,
`AlbumCard.module.css`, `AlbumGrid.module.css`, and the two `.tsx` files
containing the drag-hint markup against `improved-cdplayer/src/`. **This
diff was thorough but not exhaustive** — files *not* individually diffed
line-by-line against the reference this session:
- `components/embeds/cd-player/components/VinylPlayer/Platter.tsx` / `.module.css` (disc/platter itself)
- `components/embeds/cd-player/components/Disc/DragDisc.tsx` / `Disc.module.css`
- `components/embeds/cd-player/components/AudioConsent/*`
- `components/embeds/cd-player/components/VinylPlayer/VolumeControl.tsx` (the CD player's own +/- volume buttons, not the site's nav mute button)
- `components/embeds/cd-player/hooks/*`

If spacing/behavior issues remain, diff these next using the same method:
read both the portfolio file and the matching `improved-cdplayer/src/`
file side by side, don't rely on screenshots or live-site measurement.

---

## 3. Habit Tracker — current state

### The theme-source bug (fixed this session, NOT yet browser-verified)
This was the real root cause behind "the phone frame is wrong" being
reported *repeatedly* across many rounds, and it was misdiagnosed multiple
times before landing on the actual issue:

- `HabitTrackerApp.tsx` has its own **internal** light/dark toggle
  (sun/moon icon inside the widget, `resolvedTheme` state), seeded once
  from the site's theme on mount, then fully decoupled — this is
  intentional, per an explicit earlier user instruction, so the widget's
  toggle doesn't fight the site's own theme toggle.
- `PhoneEmbed.tsx` (the phone-frame chrome wrapping the widget) was
  picking its frame image (`phonemockup-light.webp` vs
  `phonemockup-dark.webp`) based on the **site's** theme
  (`document.documentElement`'s `data-theme`), not the widget's own toggle.
- Result: if a visitor toggles the site theme *after* the widget has
  mounted, or the widget's toggle differs from the site's, the frame color
  and the screen content color disagree — frame says one thing, screen
  says another. This is almost certainly what read as "wrong phone frame"
  across multiple rounds, even though the two webp files and the
  switching *logic* (in isolation) were each individually correct.

**Fix applied**: `HabitTrackerApp.tsx` now accepts an `onThemeChange?:
(theme: 'light' | 'dark') => void` prop and calls it whenever its internal
`resolvedTheme` changes (including on initial mount, via a `useEffect`
keyed on `[resolvedTheme, onThemeChange]`). `PhoneEmbed.tsx` holds this in
local state (`widgetTheme`, default `'light'` matching the widget's own
default) and uses it — not the site theme — to pick `frameSrc`. Because
`PhonePoster.tsx` (the static poster shown in the grid tile while the live
widget is elsewhere — a *sibling* of `PhoneEmbed`, not a descendant, so it
can't read `PhoneEmbed`'s local state directly) also needs to know this,
the theme was lifted one level further up into
`components/PersistentWorkShell.tsx` as `habitWidgetTheme` state:
`PersistentWorkShell` passes `onWidgetThemeChange={setHabitWidgetTheme}`
into `<PhoneEmbed>` and `theme={habitWidgetTheme}` into `<PhonePoster>`.
`PhonePoster.tsx` now takes a `theme?: 'light' | 'dark'` prop (default
`'light'`) instead of independently reading the site theme.

**This is implemented and typechecks clean (`npx tsc --noEmit -p .`), but
has NOT been visually re-verified in a browser this session** — the user
interrupted mid-verification to ask for this handoff doc instead. Next
step: open `/`, toggle the habit tracker's own internal sun/moon icon
(inside the widget screen, not the site nav toggle) with the widget both
in the grid tile and in the popup, and confirm the phone bezel image
switches to match the widget's *own* toggle state, independent of the
site's theme toggle.

### The `phonemockup-dark.webp` asset itself — user confirmed correct, do not touch
Extensive investigation this session (image inspection, git history check,
diffing against two other on-disk copies of the portfolio) found that
`public/phonemockup-dark.webp` visually renders as a white/light-colored
phone bezel — nearly identical to `phonemockup-light.webp`, differing only
in slightly different status-bar icon shading. This looked like a bug.
**The user has explicitly confirmed this is correct and intentional — do
not change, replace, or "fix" this file.** Both files are fine as they are;
the actual bug was the theme-*source* mismatch described above, not the
asset content.

### Cache-busting fix (done, low-risk, should hold)
`PhoneEmbed.tsx` and `PhonePoster.tsx` both import the two webp files as
static ES imports (`import phoneFrameLight from "@/public/phonemockup-
light.webp"`) instead of referencing them by plain string path
(`"/phonemockup-light.webp"`). This makes Next.js content-hash the served
filename (e.g. `/_next/static/media/phonemockup-dark.3d-25c77f4y82.webp`),
so if either file's bytes are ever replaced in the future, every client
automatically gets the new version instead of potentially serving a
browser-cached stale copy indefinitely under the old unhashed URL. This was
motivated by a suspicion (never fully proven or disproven) that stale
browser caching explained some of the repeated "still wrong" reports; it's
a strict improvement regardless and doesn't need to be reverted.

---

## 4. Things NOT done / explicitly out of scope this session

- **A hydration mismatch on `/playground`** (`components/PlaygroundPageClient.tsx`
  or wherever the top/bottom edge-fade gradient divs live — grep for `inset:
  0` combined with a `fadeBase` style object) — server renders `top/right/
  bottom/left: 0px` longhand, client renders `inset: 0` shorthand, causing a
  console hydration warning on every load. Confirmed unrelated to anything
  touched this session. A background task was spawned for this
  (`task_d2f90a60` if still tracked) but may not have been picked up.
- **Mobile-visible volume control**: `components/VolumeControl.tsx` was
  changed this session so the sitewide mute button (for the background
  XMB menu music) is visible and tappable below 768px, gated on a
  viewport-width check (`isNarrow`) OR touch-capability (`isMobile`,
  existing `useIsMobile()` hook) rather than the old `min-width:768px`-only
  gate that hid it entirely on narrow viewports. This is unrelated to CD
  Player/Habit Tracker but was part of the same session — verified working
  via direct DOM/JS checks (tapping toggles the real `<audio>` element's
  `.muted`), not by the user directly.

---

## 5. Files touched this session (uncommitted)

```
 M app/about/page.tsx                      (unrelated — pre-existing, see git log)
 M app/globals.css                         (volume-control CSS backstop removed)
 M app/layout.tsx                          (Geist Mono font added)
 M components/BentoGallery.tsx             (zoom-anchor bounds fix)
 M components/CDPlayer.tsx                 (variant prop passthrough)
 M components/CdPlayerPoster.tsx           (unrelated — pre-existing, see git log)
 M components/GlobalCustomCursor.tsx       (unrelated — pre-existing, see git log)
 M components/PersistentWorkShell.tsx      (habitWidgetTheme lift, mobileBreakpoint variant)
 M components/PhoneEmbed.tsx               (theme source fix, static image imports)
 M components/PhonePoster.tsx              (theme prop, static image imports)
 M components/VolumeControl.tsx            (mobile-visible mute button)
?? components/embeds/                      (the native CD Player + Habit Tracker port — untracked, i.e. never committed at all)
?? public/music/                           (CD player audio assets — untracked)
```
`package.json`/`package-lock.json` also show modified (dependency additions
for `@dnd-kit/core` etc. from the original port, done earlier in this
multi-session effort).

Run `npx tsc --noEmit -p .` from the repo root to confirm typecheck is
currently clean before making further changes — it was clean as of this
handoff.

---

## 6. Recommended next steps, in order

1. Start the dev server (`bash start-dev.sh` from repo root, or `npm run
   dev` — port 3005) and do a full fresh-browser verification pass of
   everything in section 2 and 3 above, since the most recent edits
   (habit tracker theme lift, disc icon restoration, DateBadge revert)
   have only been typechecked, not visually confirmed.
2. Specifically verify the habit tracker theme-source fix: toggle the
   widget's own internal sun/moon icon (inside the phone screen) with the
   site theme left unchanged, and confirm the phone bezel image follows
   the widget's toggle, not the site's.
3. If CD Player spacing still looks wrong anywhere after that, diff the
   specific component against `improved-cdplayer/src/` directly (see
   section 1) rather than re-guessing pixel values.
4. Consider fixing the `/playground` hydration warning (section 4) if
   time allows — low-risk, isolated, unrelated to everything else here.
