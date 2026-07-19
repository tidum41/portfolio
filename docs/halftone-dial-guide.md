# Halftone nav dial guide

Plain-English reference for the "Nav Links" panel in the DialKit dev toolbar
(the sliders icon, top right, dev-only). DialKit turns each key below into
its slider label automatically, but has no room for a description next to
it — this file is that description. Open the panel, find "Nav Links", flip
on **Keep Effect On** so the effect stays visible without needing to hover,
then match sliders to the rows below.

**Keep Effect On** — pins the hover effect active on every nav link/icon at
once, so you can drag sliders and watch them update live instead of losing
the effect every time your mouse leaves the link to reach the panel.

## Dot Shape (folder)

The dots themselves, before any animation.

| Slider | What it does |
|---|---|
| Dot Spacing | Distance between candidate dot positions. Smaller = more, denser dots. |
| Dot Size | How big a fully-inked dot gets. |
| Size Contrast | How much dot size varies between "fully on a stroke" and "barely touching one." Higher = more variation. |
| Min Visibility | Faint slivers of a letter below this get no dot at all. Higher = fewer, bolder dots. |
| Grid Shift X / Y | Nudges the whole dot grid sideways/vertically. Cosmetic alignment only. |

## Ripple (folder)

The order dots fill in/recede, not their final size.

| Slider | What it does |
|---|---|
| Ripple Spread | How spread-out in time the dots' fill-in is. 0 = all dots move together; higher = a visible cascade. |
| Ripple Randomness | 0 = a clean ripple from the center outward; higher = a more scattered, randomized order. |
| Ripple Outward | On = dots fill in starting from the center and spreading out. Off = starting from the edges inward. |

## Melt Effect (folder) — **the group behind "does it look like a fade or a melt"**

This is the mechanism that's supposed to make the crisp text/icon visibly
*soften and deform* as it turns into dots, instead of just fading
transparent while staying sharp. If the effect still reads as "two things
crossfading" rather than "one shape melting," these are the sliders to try:

| Slider | What it does | Try this if... |
|---|---|---|
| Blur Strength | How blurry the text/dots get at the most intense point of the transition. | Effect looks too sharp/crisp throughout → raise it. Looks like a foggy blob → lower it. |
| Melt Peak Timing | *When* in the transition (0 = right at the start, 1 = right at the end) the blur/fusion is strongest. | The blur feels like it kicks in too late or too early relative to the dots appearing → nudge this earlier/later. |
| Dot Overlap Amount | How much dots temporarily balloon in size at the peak so neighboring dots actually touch and fuse. | Dots never visibly connect into a blob → raise it. Dots turn into one shapeless smear → lower it. |
| Edge Sharpness | How crisp vs. soft the outer edge of the fused blob looks at its peak. | Fused shape looks mushy/undefined → raise it. Looks like hard-edged circles instead of a fused mass → lower it. |
| Fusion Tightness | How closely the fused blob hugs the real letterform vs. ballooning outward past it. | Blob spreads wider than the actual letters → raise it. Blob shrinks away from the letters' true shape → lower it. |
| Text Melt Duration | How much of the transition the crisp text/icon spends actively fading. **Keep this close to Melt Peak Timing, not much smaller.** | This is the one that caused "just fades, doesn't melt" — if it's set much lower than Melt Peak Timing, the text finishes fading to invisible *before* blur has ramped up, so it looks like a flat opacity fade instead of a melt. |
| Extra Softness | A constant, always-on blur over the whole dot layer (separate from Blur Strength, which only kicks in during the transition). Usually leave at 0. | |

## Show Hide Speed (folder)

The outer swap between "plain text" and "the whole halftone effect" —
separate timer from Melt Effect above, doesn't affect blur/dots directly.

| Slider | What it does |
|---|---|
| Show Duration Ms | How long (ms) it takes for plain text to fade out / the effect to fade in, on hover. |
| Hide Duration Ms | Same, but fading back to plain text on mouse-out. Usually slower than Show Duration Ms. |
| Slow Motion | Debug only — stretches everything below (Bounce Physics) in time so you can watch it frame by frame. 1 = normal speed. |

## Bounce Physics (folder)

The actual motion physics of dots growing/shrinking — springy, not linear.

| Slider | What it does |
|---|---|
| Activate Speed | How fast the dots spring into place on hover-in. Higher = snappier. |
| Activate Smoothness | How much the dots overshoot/wobble on the way in. Higher = calmer, less bounce. |
| Settle Speed | How fast the dots spring back on hover-out. |
| Settle Wobble Control | How much the dots overshoot/wobble on the way out. Deliberately low by default — dots are meant to overshoot and settle with a visible wobble, like ink surface tension. |
| Text End Scale | How much the crisp text grows/shrinks by the time the transition finishes. 1 = no change. |
| Dots End Scale | Same, for the dot layer. |

## If you're diagnosing "it fades instead of melting"

1. Turn on **Keep Effect On**.
2. Watch one nav link closely. If the text goes from sharp-and-opaque
   straight to invisible with no visible blur/softening in between, the
   likely culprit is **Text Melt Duration** being too small relative to
   **Melt Peak Timing** — try raising Text Melt Duration toward (not past)
   Melt Peak Timing's value.
3. If blur is happening but the text/dots never visibly connect into one
   mass, raise **Dot Overlap Amount** and/or **Blur Strength**.
4. If the fused mass balloons into a generic blob instead of tracing the
   letters, raise **Fusion Tightness** and/or lower **Blur Strength** /
   **Dot Overlap Amount**.
