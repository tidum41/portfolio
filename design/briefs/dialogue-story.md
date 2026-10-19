# Dialogue case study storytelling brief

Draft for /dialogue (branch cursor/dialogue-case-study-draft, PR #86).
Goal: one story a reader can follow in 90 seconds. Every image proves one sentence.

## 1. Ten reference rules

1. Headings carry the story on their own. Read only the H2s and you get the arc ("Custom agents are powerful..." then "...but with that power comes a setup problem"). https://www.rachelchen.tech/projects/notion
2. Pair every problem with its fix, back to back, in the same frame size, so the change is the only thing that moves. https://www.rachelchen.tech/projects/notion
3. The caption is a title that sits above or below the frame, never on the UI, and starts with its job ("Problem: ...", "Solution: ..."). https://www.rachelchen.tech/projects/notion
4. Crop to the component, not the screen. Rachel's problem/solution media are wide, short strips (about 624 x 150 in a 664 px column) showing just the part being discussed. https://www.rachelchen.tech/projects/notion
5. Body copy is 1 to 3 lines per paragraph, one paragraph per heading. The image does the explaining. https://www.rachelchen.tech/projects/notion
6. Name the constraint early, then show explorations as numbered options with one line each before the pick. https://www.rachelchen.tech/projects/1password
7. Show the "big problem hidden inside" once with one zoomed visual, then spend the rest of the page on how you solved it. https://www.rachelchen.tech/projects/1password
8. Lead with what it is and who it serves in one sentence, then the pain. Key flows get a small labeled grid, not full screens. https://www.rachelchen.tech/projects/earth
9. Be honest about ship status: say what happened and what you would do next, without padding. https://ruthkerbawy.com/case-studies/nextgen-redesign.html and "Projects can succeed and still not ship" in https://lilithyu.com/projects/rabbit
10. Close with 2 or 3 lessons, each a bold one-line claim plus one sentence. https://www.yehux.com/from-ai-hesitation-to-ai-fluency , https://www.calebwu.ca/Metalab , https://www.rachelchen.tech/projects/1password

Rhythm across all of them: heading, 1 to 3 lines, one image, repeat. Never two text blocks in a row without a visual, and never two full screens in a row.

## 2. Proposed outline (one beat each)

Headline: "Answers you can pinpoint". Hero: tight crop of the after answer (see image plan), not the full page.

1. Context. Dialogue runs AI-moderated interviews for enterprise UX teams and startups, and its study chat answered in paragraphs.
2. The problem. "Answers came back as walls of text" with no way to see which interview said what.
3. Why it matters. Researchers only repeat a finding they can point to. (Fold the founders, team, and student conversations in here as one sentence. To fill: one concrete thing Benjamin, Justin, or the team said.)
4. The idea. Every answer gets one fixed structure, and only the chart changes. (Anatomy image, numbered 1 to 5.)
5. The chart fits the question. Four question types, four answer shapes. (Answer shapes image.)
6. Problem: a number with no proof. Solution: tap a bar, see the clips behind it.
7. Problem: a quote with no context. Solution: the clip opens at the exact second with the transcript synced.
8. Where it lives. Explored a docked sidebar against the floating bubble, kept the bubble. (To fill: the actual reason.)
9. The full answer. One end-to-end frame: question, chart, clips drawer.
10. What happened. Presented to Benjamin and Justin. It did not ship as designed but guided what shipped. (To fill: which parts.)
11. Reflection. Two or three lessons. (To fill.)

TOC labels, shorter: Problem, Why it matters, One structure, Fitted charts, Proof, Clips, Placement, Full answer, Outcome, Reflection.

## 3. Image plan (column is 750 px)

General: crop the PNG to the component and drop the beige margin (each export is 1600 x 1000 with 40 to 60% empty background). Keep 8 to 16 px of padding around the card, never the full 1600 x 1000 frame. Captions are plain text under the frame (12 px, muted, left aligned), never inside it. Remove the "Before" and "After" text baked into section-1.png and put the labels under each frame. Keep the numbered annotations as plain numerals with short labels.

| Image | Zooms on | Crop and scale | Caption, off the UI |
|---|---|---|---|
| Hero (section-7 crop) | Summary sentence plus funnel chart with the "-38% drop" tooltip | About x 230 to 540, y 250 to 470 of the current render; full column width, roughly 16:7 | None, the title does the work |
| section-1 problem | Split in two frames. Left: the text-only answer body. Right: the summary plus funnel | Two cards side by side at 50% width each (or stacked on mobile), same height, cropped to the card edges | Under each: "Before: three paragraphs, no sources" and "After: one claim, one chart, linked moments" |
| section-3 anatomy | The answer card only, numerals 1 to 5 kept on the left | Crop to numerals plus card (about x 240 to 780); show at about 80% column width, centered | Keep the 1 to 5 legend row under it. Delete the extra sentence caption, it repeats the legend |
| section-2 answer shapes | Four answer cards | Keep the 2 x 2 grid but crop the outer margin; render full width so each card is about 360 px | One caption: "Four question types, four chart shapes" |
| section-4 proof | The selected Address bar and the "Clips for this step" block below it | Crop y 205 to 530 only (answer card body plus clips); about 70% column width | "Solution: selecting a bar filters the clips to that step". Pair with a "Problem" crop of the same bar without the clips block (To fill: export one) |
| section-5 clips | Highlighted Marcus W. transcript row plus the scrub bar timestamp | Crop to the player control bar and the transcript, cut the blurred video top; full width, about 16:7 | "Solution: the clip opens at 01:38 with the speaker row highlighted" |
| section-6b vs section-6 placement | The right third of each page where the assistant sits | Same crop on both, side by side at 50% each | "Explored: docked sidebar" and "Kept: floating bubble" |
| section-7 full answer | Answer card plus clips drawer | Crop to the two cards (about x 220 to 795); full width | "The full answer, with every supporting clip in one drawer" |

## 4. What to cut

- section-6a (empty assistant panel). It shows nothing the reader needs. Cut it and its long caption.
- The section "Same chat, same place". It has no image and repeats the placement beat. Fold it into Placement.
- The $6M Lightspeed sentence and the mission paragraph. They are company facts, not your story. Keep at most one clause of context.
- The Process numbered list. Its steps are already shown by the shapes, anatomy, and proof images. Keep one sentence ("I grouped real chat questions by type and gave each a chart shape") inside beat 5. Confirm the method is accurate (To fill).
- The "Draft copy" tag and the "Solution: easy to trust and easy to use" heading, which is a claim without proof. The full answer image is the solution.
- section-6 as hero. A full page with grey placeholder bars hides the work. Use the zoomed answer instead.
- Duplicate captions under the anatomy figure.
- Placeholder asks for a cut exploration and for metrics, unless Mudit has real ones. Do not invent results or quotes.

## Open gaps (To fill)

- One concrete insight from Benjamin, Justin, the team, or the students.
- The real reason the bubble beat the sidebar.
- Which parts influenced what shipped.
- Two or three reflection lessons.
- A matching "Problem" export for the proof and clips beats.
