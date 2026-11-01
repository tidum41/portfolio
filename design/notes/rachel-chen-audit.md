# Rachel Chen audit

Read-only. No page copy was changed. Written against `review/round-p15` on Nov 1, 2026.

`design/TASTE.md` wins every conflict below. Decided items stay decided. Proposed sentences are sentence case. Em dashes stay out. Rhetorical lists of three stay out. Outcome claims stay out. Any number missing from the page or from an approved Hearthside figure is marked `[PLACEHOLDER]`.

Studies read in full:

| Study | URL |
|---|---|
| Setup experience for Notion's Custom Agents | https://www.rachelchen.tech/projects/notion |
| Bringing autofill to macOS | https://www.rachelchen.tech/projects/1password |
| Mobile-first for Figma | https://www.rachelchen.tech/projects/figma |

Paper references are filenames inside `uploads/paper-shots.tgz`.

## What her pages do

**Section order.** Notion opens on the product doing its job, turns on the setup problem, states her role, then gives each hard part its own chapter: broken state, explorations, a named decision, the shipped flow. 1Password shows the final flows, then rewinds into the one step that was hard. Figma tries a direction, shows it, says why it failed, and only then shows what she kept. Dialogue already uses her rewind: the hero is the final answer, the problem follows, and the reversal sits in Levels. Later sections keep proving that reversal. A chronology of all 8 versions stays off the page.

**How a section opens.** A short kicker (Overview, Connections, Exploration, Decisions, Solution, Reflection), then a claim heading, then one or two sentences, then the visual. The heading often carries the point by itself. Notion's Connections chapter is the model: "Connections required manual setup in settings", one sentence, then the broken video.

**Headlines and captions.** Her h2s are about 4 to 14 words and say the point. Dialogue's decided h2s already sit in that range, so they stay. Her option captions are one sentence, about 12 to 20 words, and they say what the picture decided. Examples under "I explored ways to bring agent edits and saving to the chat!": "A pill above the chat input counts unsaved edits and offers a save action." 1Password's death line is a heading of its own: "This just wasn't possible with Apple's API limitations." Dialogue captions often run two sentences and restate the video.

**Visuals carry the argument.** The broken product is a video. The fix is a second video of the same surface. Rejected ideas sit beside the one she kept, each with a name and one sentence. Notion's decision figures are a single before-to-after image ("Unclear tool steps → Precise & exhaustive edits", "Persistent save card → Unsaved edits pill that links to settings"). Figma's first pass is a video of the idea that failed, placed before the solution video. A skimmer who only watches leaves with the decision.

**Decisions and tradeoffs.** She shows the options, then writes the call in one sentence that names the loss in concrete terms. Figma, under "Solution: Sections within a Live Comment": the kept structure matches today's comments, and a reply cannot target a smaller piece of a long recording. The loss is a missing action, stated once, next to the picture of the path she dropped.

**Edge cases and iteration.** Each failed path is a named block with the reason it died. 1Password's Safari explorations are two attempts and one remaining path. Figma's segmenting pass is shown, then retired for the noise it added. Notion's "Iterating in real code" is a still of a behaviour the real interaction broke. Her rules show up as pictures of a path that failed.

**Pacing.** Most beats are one sentence and a visual. One chapter holds the big turn (Notion's edits and saving, Figma's comment structure). Quick chapters stay quick. Text-only reflection comes after the decisions are visible. Her Figma close states a competition result. Dialogue's measure section should stay on what he would watch, with no results.

Her em dashes, sentence fragments, and outcome lines stay on her site.

## Where Dialogue already matches

- The hero is the final answer, the way 1Password opens on the handed-off flows and then names the hidden problem. Title stays "Interactive insights for UX research teams".
- Levels is the one reversal, placed early, with a first-try video and a ruled-out picker beside the kept toggles. That is her exploration-then-decision shape. The h2 stays "Every level at once was too slow, so depth became optional". The picker stays ruled out.
- Kickers, shipped and concept lines, and the refusal to claim results already match her chapter labels and the decided impact rule.
- The hero and thin captions say the take was recorded from his live code. That is the decided way to show designing in code. A separate engineering chapter stays off the page. Show code through the demos.

## Gaps

Ranked by how much a skimming reader would change their mind. The first five are the ones to do. The rest wait on a decided item or on a placeholder.

### 1. The group-chart decision is a sentence, and the chart he refused is already built

**Chen.** Notion, "Communicating edits", heading "I explored ways to bring agent edits and saving to the chat!": three named options in a row, each a picture plus one sentence, then "Key interaction decisions" with a before-to-after figure per call. Figma, "How do we make it easy to understand and respond to Live Comments?": the segmenting video plays, the next paragraph says it adds noise, then "Solution: Sections within a Live Comment" plays the path she kept.

**Dialogue.** Data visualization, h2 "The AI picks a chart from templates I designed". The body says 9 of 14 and 88 of 125 look alike as percents. The figure's group row shows the kept counts. `ChartMatches` prints `t.pro`. The con and the other chart stay unmounted. The percent bars already exist as the unused `segments` "bad" specimen in `DialogueChartLibrary.tsx`, bound to those same two groups.

**Change.** Inside the existing stack, on the group row only, place that percent specimen beside the kept "x of y" bars. Same question above both: "Do new and repeat shoppers read 'Arrives by Friday' the same way?" Desktop matches the Levels pair width. Small screens stack, as Levels already does. The 2x2 grid and the cycling picker stay retired.

In-figure lines, one sentence each:

- Ruled out: "One percent scale puts 9 of 14 and 88 of 125 on the same bar length."
- Kept: "Each row counts people out of its own group."

Section caption, one sentence for this figure once gap 2 is in the same row: "A shared percent scale makes 9 of 14 and 88 of 125 look close, and the kept chart counts each group out of its own size with the 9 open to those shoppers."

The unused specimen says "67%". Leave that sentence off the page. The caption keeps 9 of 14 and 88 of 125. If the chart prints a percent, that percent is the chart's own label for these counts. Keep it away from the real study's 64/31/22.

**Visual.** `tokens/dataviz-section2-after.png`, option B beside option A. Rebuild from the page's two groups. Leave the screenshot's first-time, repeat, and lapsed counts (62 of 90, 118 of 150, 45 of 80) in the file.

**New component.** No. `ChartBarList` already draws both specimens.

**Leave in place.** One cherry in this figure: the split row's 225. The group pair stays on the neutral stone already set by `data-neutral`. H2, Carbon line, and the four question types stay. Lollipop (option C on that sheet) stays off this row. A stem would be a new mark, and the page's argument is the percent scale.

### 2. The same group row hides the people a skim never clicks

**Chen.** Notion, "Solution: Connection card" and "Solution: Entity survey tool": the video holds the card open. The caption names the result. A skim sees the fix with the card already there. 1Password's solution shots are the end state of the flow, under "Solution: Instruct users to turn off Apple Passwords".

**Dialogue.** The spine is that a team gets the insight and still reaches the people. Counts and the hero videos show that tap. The data viz group row can open its people in code, and the still starts closed, so the chart section reads as shapes only. Paper's picked charts put the people on the card.

**Change.** Render the kept group card in the opened state, using the sample that card already renders on tap (the 9 new shoppers, the quotes it already lists, the +N pill). The percent card beside it stays closed, so the pair itself shows what the percent chart withholds.

Use the single caption in gap 1. It already includes the open 9.

**Visual.** `tokens/dataviz-section2-after.png`, the people row under option A (the waveform row and the count). Use the page's 9. Leave the screenshot's "Ana, Dev +116" in the file. `tokens/dataviz-section6-after.png` option A is the reference for "count, then a voice". Leave its always-visible quote off the resting card. Quotes stay behind a tap (P9). This still is the after-tap state, which the counts video already uses for the split.

**New component.** No. The open sample is already in the group template.

**Leave in place.** The open sample sits on the neutral group row, so its swatch uses the stone focal token. The split row's 225 remains the one cherry. Default product behaviour stays count first, quotes on a tap. Only the case-study still holds the open state.

### 3. Thin data describes a bar the page never shows

**Chen.** Figma, "First pass: Segmenting into multiple comments", then the paragraph on the noise it created, then "Solution: Sections within a Live Comment". 1Password, "Exploration 1: Disable macOS Autofill on Safari only", then "This just wasn't possible with Apple's API limitations." The failed object is on screen before the sentence that kills it.

**Dialogue.** Thin data. The body says a bar for two people would read as a pattern. The figure is only the flag, the two clips, and the follow-ups. The finding already in the take is "Two of 300 shoppers said they missed a delivery after reading it as this Friday." The question is "Did anyone miss a delivery over 'Arrives by Friday'?"

**Change.** One figure, two columns, Levels-pair width.

- Left, a new still: the same question and a chart card whose bar is drawn as a finding, labelled 2, with "of 300" left off the mark. Title it as a result. This is the pattern the sentence warns about.
- Right: the current thin take, unchanged, including "Early signal, 2 people. A chart needs 3 or more." and the follow-up that answers with 88 of 125.

In-figure lines:

- Ruled out: "A bar labelled 2 reads as a result once the 300 is off the mark."
- Kept: "The sentence keeps two of 300, and the flag takes the place of a chart."

Caption: "A bar labelled 2 reads as a pattern, so the answer keeps two of 300 in the sentence and shows a flag." Keep "Recorded from my live code recreation."

The cutoff reason stays the existing placeholder: why it sits under 3, and what would change his mind.

**Visual.** Layout and the kept column: `tokens/dataviz-section8-after.png` option A (flag, clips, follow-up). The tempting bar is a new detail still. Option B on that sheet is unit dots for "two of 5", and option C is a shorter flag. Neither uses two of 300.

**New component.** No for the bar, if it is `ChartVizCard` plus `ChartBarList` or `ChartStackedBar`. Yes for unit dots: Paper marks them as a custom mark with no Carbon chart. Leave the dots off this change. Their note ("units still look like a result") can be a later foil, after the bar is on the page, and only with an OK for the new mark.

**Leave in place.** The flag copy, the warm flag surface, the chip counts 125 and 300, and the follow-up answer 88 of 125. The screenshot's "two of 5" and its 60 chip stay in the file.

### 4. "The AI picks a chart" is one sentence of routing

**Chen.** Notion, Overview, the figures titled "The custom agent formula" and "Challenge: User prompt → agent config". Both sit under one or two sentences. They make the translation visible: a broad prompt goes in, a deterministic config comes out. Her role heading comes after that picture.

**Dialogue.** The h2 says the AI picks a template he designed. `ChartFlow` is a label plus one sentence: the shape picks the template, and a value with fewer than 3 people gets a flag. The body then says the routing is concept and leaves `[PLACEHOLDER: how much the model decides versus fixed rules]`. A skim sees four finished charts and a claim about a picker it cannot see.

**Change.** Replace that sentence with a strip of four beats inside the same figure, case-study chrome, above the rows. Each beat is a label and a crop of a figure the page already has.

1. Read the shape of the answer. Crop the question bubble.
2. Count the people behind each value. Crop a "9 of 14" label.
3. Bind the template for that shape. Crop the kept group bar.
4. Under 3 people, show the flag. Crop the thin flag.

The strip's own line: "How an answer reaches a chart, as concept." The body placeholder stays under it, word for word.

**Visual.** The pack has no routing artboard. New detail visual, as the strip above. Leave `tokens/dataviz-section9-after.png` in the file. Those cards are other query types, and their counts stay off the page.

**New component.** No, if the strip is markup inside `DialogueChartLibrary`. A standalone routing component needs an OK before it is added to the allowlist.

**Leave in place.** Concept status. The placeholder on model versus rules. The four templates underneath. Cherry stays on the split row only, so the strip itself uses no focal colour.

### 5. Awkward shapes are a definition list

**Chen.** Notion, "Problem: Editing and saving was unclear": a stepper of four questions, each a screen ("What has updated?", "Do I have to save my agent?", "What changes am I saving?"). The edge of the problem is a screen.

**Dialogue.** Under the templates, "When the shape is awkward" is four text cells: ties, too many themes, nothing matches, two shapes in one answer. None of them is drawn. Thin data is the one edge with a picture, and gap 3 covers it.

**Change.** Keep the four rules in that band. Replace each cell's prose with a small frame and one sentence. No new counts.

- Tie. Two bars of equal length, no cherry, answer sentence says they tie. The two counts are `[PLACEHOLDER: the tied counts]`. Note: "When the top two tie, the sentence says they tie, and no bar is marked."
- Too many. The ranked card already shows five asks out of 300. Add an Other row whose count is `[PLACEHOLDER: how many asks sit outside the top five]`. Note: "The top five stay on the card, and the rest roll into Other."
- Nothing matched. A card with the sentence "Nothing matched", the closest theme, and a rephrase line. Theme and count are `[PLACEHOLDER: the closest theme and its count]`. Note: "The closest theme shows with its count, and a rephrase sits under it."
- Two shapes. The split chart for "How do shoppers read 'Arrives by Friday'?", and one follow-up chip using the existing scale question, "How sure were shoppers about the delivery date?" Note: "One chart answers the question, and the second shape becomes a follow-up."

The section caption stays the group-chart verdict from gap 1. These notes live inside the figure, as her option captions do.

**Visual.** No Paper sheet draws a tie, an Other row, a miss, or a second shape. New detail frames, composed from the current cards. `tokens/dataviz-section3-after.png` option B is a table with in-cell bars for a long ranking. It is a different rule (a table when labels get long). The page's rule is Other. Leave that table off this band.

**New component.** No, if the frames are `ChartVizCard`, `ChartBarList`, and `FollowUpChips`. The nothing-matched card needs an OK if it grows past a sentence inside `ChartVizCard`. In-cell bars from the ranking sheet would be a new component. Leave them off this band.

**Leave in place.** The split row remains the figure's one cherry. The tie frame has none. The four template rows stay a stack.

### 6. Counts names a crowded table and shows only the bar

**Chen.** 1Password, "Safari Explorations", Exploration 1, then the one-line reason that path died, then the solution. The attempt is a block of its own.

**Dialogue.** Counts. "A table crowded the 448px panel, so the count became one bar with two labels, and each side opens its people on a tap." The next line is `[PLACEHOLDER: what you built before counts, in one line]`. The figure is the kept bar video.

**Change.** Add a first-try frame in this section, locked to the 448px panel width, labelled "First try". The cells stay `[PLACEHOLDER: what you built before counts]` until he writes them. The kept video stays beside or under it. Caption: "The first table crowded the 448px panel, and the shipped answer is one bar whose two sides open."

**Visual.** New detail frame. `tokens/dataviz-section3-after.png` option B fits its table on purpose. The counts failure is a table that crowds 448px. `tokens/components-section2-after.png` is chart-card chrome. Its first column is Dialogue's dark mono chart. The page keeps his redesigned charts, so that column stays in the file.

**New component.** A table frame needs an OK if it becomes its own component. Leave `DialogueVersionTable` unimported. It is off the allowlist, and it recreates the checkout funnel and a sentiment line. Both stay cut from the library.

**Leave in place.** The counts h2, the shipped line, the 225 and 75 tap video, and the placeholder for how the two shown quotes are picked.

### 7. The problem still is the last thing in its section

**Chen.** Notion, "Connections required manual setup in settings": one sentence, then the broken video. The picture opens the section.

**Dialogue.** Problem h2, then the constraint sentence, then two paragraphs, then the still of "Many found". The still already makes the point. It arrives after the point has been written out.

**Change.** Order: h2, the constraint sentence (the 448px panel, and Kalshi's share-out by tomorrow morning), the existing still, then one sentence on Priya and the principle that every claim shows how many people hold it. Caption stays one line: "How Dialogue's chat answers today, recreated in code. 'Many found' stands in for a count the answer never states." If that must be one sentence: "'Many found' stands in for a count the recreated answer never states."

**Visual.** The existing still, `/dialogue/motion/variant-before-full.jpg`. No Paper sheet. `tokens/components-section1-after.png` is panel chrome and crop variants. The crop decision is already settled.

**New component.** No.

**Leave in place.** The h2 "Teams needed answers fast, and the detail got lost". The problem surface stays prose, with no chart added to it.

## Paper shots to leave in the file

These are real drawings. Putting them on the page would undo a decided item or invent a count.

| Shot | What it shows | Why it stays off the page |
|---|---|---|
| `tokens/dataviz-section1-after.png` | Meter, donut, proportional meter with a third slice (Next Friday 41, Unsure 34) | Pies stay out of the library. The page's split stays 225 and 75. The sheet's 41 and 34 stay in the file. |
| `tokens/dataviz-section4-after.png` | Line, vertical bars, area across waves | Line charts stay cut. The wave counts (75, 54, 27) stay in the file. |
| `tokens/dataviz-section5-after.png` | Diverging stack, rating bars, box plot | The page's scale template is the median dot. Swapping the pick reopens it. A box plot is a new component. Rating bars as a later ruled-out foil are the only use, and only beside the existing dot. |
| `tokens/dataviz-section6-after.png` option A as the resting card | Quote under the bar by default | P9: the default answer shows the count, and quotes open on a tap. |
| `tokens/dataviz-section7-after.png` | Heatmap, grouped bars, overlap meter | The sheet's counts (58 of 225, 38 of 75, and the four slices) stay in the file. Heatmap would be a new component. `ChartGroupedBars` exists in the system and sits outside the four templates. |
| `tokens/dataviz-section9-after.png` | Step, version bars, heatmap, bullet, sparkline | Step and sparkline reopen the funnel and line cuts. Every count on the sheet is new. |
| `tokens/components-section2-after.png` first column | Dark mono chart | Figures show his charts. The product's dark text chart stays off the page. |
| `tokens/components-section5-after.png` | Player chrome variants | Player time, fold, session link, and clip range are settled. |
| `tokens/components-section6-after.png` | More picker layouts | The picker is the ruled-out path in Levels. |

`tokens/components-section3-after.png` and `tokens/components-section4-after.png` match the thin flag and the count rows the page already ships. They document spacing for that UI.

## Top 5

1. Mount the percent bars beside the kept group counts, inside the current stack.
2. Hold that kept group card open on its people.
3. Put a bar labelled 2 beside the thin-data flag, and keep two of 300 in the sentence.
4. Draw the four-beat route from question to template or flag, and leave the model-versus-rules line as a placeholder.
5. Replace the awkward-shape definition list with four small frames, the tie first, with unknown counts left as placeholders.
