# Motion, round 14 (Nov 2 2026)

TASTE.md wins. Nothing approved was undone: video controls stay on the container, the UI stays separated from the background by its drop shadow, the two-stage rule stands, the 56px gutter and 640px lock are untouched. No GSAP was added.

## 1. Which animation approach /dialogue uses

The /dialogue case study uses CSS and small hand-written `requestAnimationFrame` loops. It does not use framer-motion, `motion`, GSAP or the Web Animations API (`.animate()`) anywhere under `components/dialogue/` or `app/dialogue/`.

| Layer | Approach | Files |
| --- | --- | --- |
| Product components (chat, bars, quote rows, Grow, tap, fill, enter) | CSS `@keyframes` and `transition`, with a `prefers-reduced-motion` block for each | `components/dialogue/product/dialogue-product.css` (`dlg-grow-open`, `dlg-grow-close`, `dlg-grow-fold`, `dlg-hug-open`, `dlg-hug-close`, `dlg-enter`, `dlg-land`, `dlg-rise`, `dlg-fill`, `dlg-tap`, `ellipsis-*`) |
| Height grow and fold | CSS grid-rows keyframes (`0fr` to `1fr`), mounted by the `Grow` component | `components/dialogue/live/DialogueMotionStage.tsx` (`Grow`), same CSS file |
| Chat scroll easing | `requestAnimationFrame` loop with an ease-in-out cubic, skipped under reduced motion | `components/dialogue/live/DialogueChatLive.tsx` (`scrollToBottom`), `components/dialogue/live/DialogueMotionStage.tsx` (`top`, `stick`, `stickEnd`, `chase`, `follow`, `clear`, `up`) |
| Take stage api | `window.__dlg`, a plain object of functions the recorder calls: `type`, `send`, `answer`, `ana`, `clip`, `side`, `thin`, `ask`, `reply`, `stick`, `stickEnd`, `clear` | `components/dialogue/live/DialogueMotionStage.tsx`, route `app/dialogue/motion/page.tsx` (`/dialogue/motion?demo=X`) |
| Take playback on the page | A plain `<video>` with `IntersectionObserver` autoplay, a poster, and reduced-motion respect | `components/dialogue/motion/DialogueDemoVideo.tsx` |
| Take recorder | Playwright driving `/usr/bin/google-chrome`, a CDP `Page.startScreencast` PNG capture cropped to `#frame` at zoom 2, `Animation.setPlaybackRate(1/K)` for slow capture (K=2) so the CSS keyframes are sampled at full 30fps, an injected `#dlg-cursor`, ffmpeg to 30fps H.264, then a checker | `scripts/record-dialogue-motion.mjs`, `scripts/pick-dialogue-posters.py`, `scripts/check-dialogue-motion.py`, `scripts/version-dialogue-motion.mjs` |
| Pointer motion in a take | A stepped `page.mouse.move` along `EASE_IO` (cubic ease-in-out, 600ms default) with a slight bow (0.08) so the path is never ruler-straight | `scripts/record-dialogue-motion.mjs` (`cursorTo`, `grab`, `press`, `cursorOut`) |

Where the libraries do appear. `framer-motion` ^12.38.0 and `motion` ^12.43.0 are in `package.json` and are used by the site-wide pieces only. On /dialogue the one touchpoint is the section reveal: `components/dialogue/DialogueCaseStudyContent.tsx` wraps blocks in `components/ScrollReveal.tsx`, which uses framer-motion. That wrapper is page chrome around the case study, not part of the product components or any take. `app/layout.tsx` also mounts `components/AnimationProvider.tsx` for the whole site.

What this means for the takes. Every take is a recording of the real components running in the real stage. The recorder drives the stage by calling its api and moving a real mouse. Nothing is animated outside the components, so there is no second animation layer to keep in sync and nothing for GSAP to improve. Adding GSAP would make a take a different thing from the product, so it stays out.

## 2. Stageshow pass on the takes

Source: `.agents/skills/stageshow/SKILL.md` plus `references/motion.md`, `framing.md`, `craft.md`. Principles applied: the poster is the beat that tells the story alone with the result left on screen; the payoff holds about two seconds; the pointer never covers the words it clicks, stays where the press happened, and every move travels to the next action; one focal per moment; crop to the panel the story happens in.

Crop. The cards sit centred in a wide gutter, which reads loose against Stageshow's "tighter crops". TASTE.md approved the 56px gutter and the 640px lock, so the crop stays. The tightening comes from where each take is held and which poster represents it.

Pointer. The 600ms ease-in-out glide with a 0.08 bow already gives a clear start, a decisive middle and a soft landing. The pointer rests beside text, not on it, and keeps its spot while the page moves (Round 11b). The pointer audit confirms no touches. No change.

Keep limit. Every take stays between 4 and 9 seconds.

Comparison images: `/opt/cursor/artifacts/screenshots/r14-*`.

| Take | Length | Option A (before) | Option B | Kept | Why |
| --- | --- | --- | --- | --- | --- |
| Hero (`live-hero-ask`) | 7.03s | Poster at 5.267: Ana's row open under the 225 count, held about 2.2s after the tap | No second option worth a recording. The held beat after the tap is already 1.2s of rest plus the 450ms ride and the 550ms scroll, and the poster already shows the one focal (the cherry 225) with the answer below it | A | The poster tells the story alone: a question, a count, and the first person behind it. Lengthening would push past the point and add nothing to the frame |
| Counts (`live-side`) | 5.47s to 6.23s | Poster at 4.433: the 225 open with Ana and Dev. It repeats the end of the hero poster | Poster at 3.2: the 75 open, the 225 dimmed, Mei and Owen listed. Holds lengthened from 1500 and 1400ms to 1900 and 1800ms so the key moment sits for about two seconds | B | The take's point is that both sides of one bar open their people. A already appears in the hero, so it says nothing new. B shows the other side, which is the part a reader would not guess. The longer holds give each side its full beat. Desktop and phone, light and dark, all re-recorded; the checker passed on the first take for all four |
| Clip (`live-clip`) | 7.3s | Poster at 3.5: the quotes header pinned at the top, Ana's open player, Dev's row below. Nothing is cropped | Pinned the open player's bottom (`stickEnd`, as on phone) so the bar stays in view above the player. Recorded, checker passed | A | In the 448px panel the player is tall. With B the answer sentence is sliced at the top edge ("this Friday, whatever day they ordered." half cut) and Dev's row drops out of the frame. B keeps the bar but crops text, which breaks the "nothing cropped" rule. A shows a complete header, two complete rows and the player. The phone clip keeps its `stickEnd` since there the whole sentence fits |
| Every (`variant-every-full`) | 8.13s | Poster at 4.6: the failure moment, the count pushed out of view by the open player | A shorter take with a longer hold on the failure was the only alternative | A | Already the failure beat, and the poster is that frame. Under the 9s limit by under a second, so a longer hold does not fit |
| Toggles (`variant-toggles-full`) | 8.97s | Poster at 3.6: Source open, rows marked playable | A trimmed take with a longer hold on Source | A | No room. The take is at 8.97s of 9s. The poster already holds the one focal (Source) |
| Thin (`live-thin`) | 6.77s | Poster at 1.2: the question, the flag ("Two of 300 shoppers said..."), the two labelled follow-ups | Poster at 6.2: the 88 of 125 answer after the chip tap, with the flag scrolled out | A | The take is about thin data, so its story is the flag and the follow-ups. B shows an ordinary count, a different story. A shows the refusal and what to ask next in one frame |

How each B was tested. Recorded: Counts (longer holds, four files) and Clip (`stickEnd` on desktop). Compared from frames already in the existing take: the Counts poster and the Thin poster. Not recorded: Hero, Every and Toggles, because the poster frame is already the story beat and the take has no room to lengthen (Every and Toggles sit within one second of the 9s cap), so a second recording would only have changed timing without changing the frame.

Net change from this pass: the Counts take and its poster, in all four light, dark, desktop and phone files, and a `live-side` poster override in `scripts/pick-dialogue-posters.py`. No other take was re-recorded. The recorder file also holds the longer Counts holds.

## 3. Checks

- `npm run typecheck`: clean.
- `npm run check:dialogue-system`: OK.
- `scripts/check-dialogue-motion.py public/dialogue/motion/*.mp4`: 24 of 24.
- Clip audit at 1440, 390 and 360, light and dark: 0 clipped in all six.
- Pointer-on-text audit, 6 takes at 2 viewports: `"touches":[]` in all 12.
