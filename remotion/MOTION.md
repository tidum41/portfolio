# Motion rules for the JOOLA film

All of this is driven by `useCurrentFrame()`. CSS transitions and CSS animations do not render in Remotion, so they are not used. Every change is `interpolate()` with `extrapolateLeft` and `extrapolateRight` set to `clamp`, plus an easing curve. The curve for UI is `Easing.bezier(0.23, 1, 0.32, 1)` (ease-out). Springs are only for a physical arrival, and only with high damping (`damping: 200`) so nothing bounces. This film does not use a spring. Durations are frame counts at 30fps. Six to ten frames is 200–333ms. A hold is a count of frames you can read, not a feeling.

## Purpose

| Motion | What it is for | This film |
| --- | --- | --- |
| Hard cut | A new idea. Nothing travels. | Not between locations. Search, Recommended, the order, and Message sales are one page. The finished SKU and its result appear together. No caret. |
| Ease-out settle (16–28px, 10–14 frames) | Something arrived because the user did it. | Yes. The Recommended thumb moves 14px in 8 frames. Four frames after it lands, the heading and the paddle row each move 24px over 12 frames, `cubic-bezier(0.23, 1, 0.32, 1)`. |
| Crossfade | Two states of the same object, not a scene change. | No. A label swap is a step, not a fade. |
| Scale press | A button squashing to show it was clicked. | No. It is not in the JOOLA prototype. |
| Shared-element / crop move | The camera showing where the same object went. | The camera pans down one wholesale page, 16 frames, ease-in-out `cubic-bezier(0.77, 0, 0.175, 1)`. Same chrome the whole time. The return pan closes the loop. Not a wipe, not a crossfade. |
| Motion blur | Only on something that is actually traveling in. Not type that is already resting. Not the whole frame. | Vertical blur on the paddle photos only while they are still moving. The settled frame has no filter. Names and prices are not blurred. |
| Hold | Time to read the consequence, not time to watch an entrance. | Yes. After the result is already on screen. |

## Story

Motion shows cause and effect. A control moves, then the result is already there. UI the user did not summon does not enter.
