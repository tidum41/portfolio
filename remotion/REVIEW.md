# JOOLA film review

Standing rules for the self-healing review loop. Apply them after every render. One pass, then stop.

## Directing rules

- All motion is a function of `useCurrentFrame()`. No CSS transitions or CSS animations.
- Motion shows cause, then result. UI the user did not summon is already on screen. Do not fade the whole page in.
- Hard cut = a new idea. Ease-out (`cubic-bezier(0.23, 1, 0.32, 1)`, 6–14 frames, under 28px) = something the user just did. Crossfade only for two states of the same object. No scale-press. No bounce springs.
- Motion blur only when something travels more than ~24px in under 8 frames, or when Recommended cards slide in. Never blur resting type.
- Typing is the exception to the 6–10 frame rule: about 2 frames per character, caret visible, then the caret drops.
- A hold exists only so a result can be read (about 0.6–1.2s). If something is still moving after 14 frames, it is late.
- The loop's last frames must match the opening frames.
- Numbers, names, and rows on screen must agree. A footer total must match the visible lines.
- The subject fills the frame. A single control floating in a large empty field is a failed crop.
- Type, radius, color, and icons match the HTML prototype. JOOLA blue only where the prototype already uses it.

## Review loop (run after every render, once)

1. Extract stills at the start and end of each beat, plus the frame of each action, into `remotion/out/frames/review/`.
2. Spawn three read-only critics. They must not edit files. Each reads the stills (and the mp4 if they can) and returns only a punch list.
   - Continuity critic: loop seam, cause→effect, totals vs rows, product identity stable across beats.
   - Timing critic: late settles, holds that are too long, typing that is too fast or too slow, transitions that blink or drift.
   - Cohesion critic: prototype mismatch (font, radius, button height, icons, color), empty-field crops, awkward line breaks, captions that explain instead of show.
3. Merge their notes. Apply only issues that two critics share, plus any continuity break even if only one critic caught it (wrong total, broken loop, missing logo).
4. Fix the film and, if the bug is in the prototype, the HTML too. Log prototype fixes in `CHANGELOG.md` in the existing voice.
5. Re-render `remotion/out/joola-b2b.mp4` once. Look at the new stills. If a merged issue is still visible, fix that one thing and render once more. Then stop. Do not open a second review round.
