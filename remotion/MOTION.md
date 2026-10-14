# Motion rules for the JOOLA film

All of this is driven by `useCurrentFrame()`. CSS transitions and CSS animations do not render in Remotion, so they are not used. Every change is `interpolate()` with `extrapolateLeft` and `extrapolateRight` set to `clamp`, plus an easing curve. The curve for UI is `Easing.bezier(0.23, 1, 0.32, 1)` (ease-out). Springs are only for a physical arrival, and only with high damping (`damping: 200`) so nothing bounces. This film does not use a spring. Durations are frame counts at 30fps. Six to ten frames is 200–333ms. A hold is a count of frames you can read, not a feeling.

## Purpose

| Motion | What it is for | This film |
| --- | --- | --- |
| Hard cut | A new idea. Nothing travels. | Search, Recommended, the order, and Message sales replace each other in one frame. The active label is already the destination on that frame. The file ends on the message. The loop seam is the hard cut back to search. |
| Ease-out settle (12px, 10 frames) | Something arrived because the user did it. | The search result settles 12px in 10 frames after the SKU is typed. Order quantities fade in over 8 frames after Add All To Cart. |
| Nav underline | Which screen this is. | The destination word is ink on the cut frame. A 2px line draws under that word only, over 8 frames, `cubic-bezier(0.23, 1, 0.32, 1)`. It does not travel across the other labels. |
| Typing | The field received the SKU. | `600558` at 2 frames per character, with a caret, after a cursor click. The caret drops before the result. |
| Cursor press | A control was used. | The pointer moves in a short straight line over 7 frames, ease-out, stops, then dips 1px for 3 frames. It does not scale, arc, or wander. It clicks the search field, the result, and Add All To Cart, then it is gone. |
| Scale press | A button squashing to show it was clicked. | No. It is not in the JOOLA prototype. |
| Shared-element / crop move | The camera showing where the same object went. | No. There is no page-long pan. |
| Motion blur | Only on something that is actually traveling in. | No. The catalog cards are already in place. Blur on a settled photo read as an error. |
| Hold | Time to read the consequence, not time to watch an entrance. | Yes. After the result, after the order total, and on the finished message. |

## Story

Motion shows cause and effect. A cursor clicks, then the result is the next state. Each beat is its own surface. The active word matches that surface on the same frame. One quantity, 120, runs through the search, the order, and the reply.
