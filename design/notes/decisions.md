# Decisions: why I chose what I chose

Written in my own voice so I can explain each one in an interview. Each entry holds the decision, what else I tried, why this one, and what would make me revisit it. Newest first.

## Routing demo (Nov 4 2026)

### Round 2 interactions: cursor pill, one study base, clips stay clips

**Decision.** Hovering a bar shows the percent in the existing tooltip chip (`.dp-hero-tooltip`), positioned from the pointer. Legend counts stay put. Press and selected states use the ink and warm tokens already on the chips. The Friday answer uses the case study split, 225 of 300, and the named rows are a quoted extract of that study. A comparison names the sum of its bars. Returns lines say return. A clip question stays `clip_list` when those people have timestamps, including damaged packaging. The composer clears on send. The reason streams, then the card mounts. Enter timing, pill chrome, layout, and the clip still are token-level placeholders so a later visual pass can restyle them. **Tried.** Leaving the legend to swap to a percent, and treating the 24 named people as a second study. **Why.** The audit asked the demo to mimic the product's hover, press and clip, and the 24 versus 300 bases were reading as two studies. **Revisit.** If a cursor pill covers the segment on a phone, pin it to the segment's top edge.



### Round 2: quieter selection, visible routing, drill-down chips

**Decision.** The count card drops the title divider. Legend lanes share one baseline with swatches translated by `0 calc(4px - 0.3065em)`, and the right lane reads count then label. A selected quote uses a warm fill and hairline stone border; the source pill carries the selection. The typed flow shows a short "Picked … because …" step, then the template, with follow-up chips into people and a clip, plus a How it routed toggle for query type, data available and goal. **Tried.** Keeping the cherry outline on the open quote. **Why.** The chip already marks who is open, and a heavy outline competed with the bar's cherry focal. **Revisit.** If the warm quote still reads as unselected beside a cherry pill, try matching the pill's warm fill on the quote without a border change.

### A live router on the Data viz section, after the template rows

**Decision.** `/dialogue` gets an interactive routing demo under Match the chart: the reader types a question (or taps a suggested chip), an API returns `{template, props, reason}`, and one of five templates renders in the 448px panel from a fixed 24-person example dataset. The UI labels whether the model or the rule path answered, and the figure caption says it was built after the engagement on example data. **Tried.** A separate `/dialogue/live-route` page only. **Why.** Mudit approved building the Round 16 live-AI note for real, and putting it next to the template rows makes the mapping visible without inventing a product claim. **Revisit.** If the section feels long, move the demo under Thin data as the closing interaction.

### Templates are five, and thin data uses a named demo cutoff

**Decision.** The templates are `count_split`, `segment_comparison`, `quote_list`, `clip_list`, and `thin_data`. The thin-data gate is `THIN_DATA_MIN_PARTICIPANTS = 3`, labelled as a demo choice in the routing spec and on the flag. Thin data keeps the early-signal strip and an "Add to my plan" action that copies a follow-up prompt. **Tried.** Collapsing quote and clip into one evidence template. **Why.** The brief asked for each of these as a distinct take, and the page already has the parts (stacked bar, bar list, source pills, clip player, plan button). **Revisit.** If quote and clip feel like the same interaction in use, merge them and keep the play chip as the only difference.

### Model path through the AI Gateway, with a rule fallback that always works

**Decision.** `POST /api/dialogue/route` calls Vercel AI SDK `generateObject` with a zod schema when a gateway key exists, and otherwise (or on error) runs the same routing table as keywords and data checks. Counts never come from the model; `props` are dataset keys only. **Tried.** Client-only keyword routing. **Why.** The live-ai note already picked structured output and a keyword fallback so a public page never sits empty. **Revisit.** If gateway latency stays over about a second on cold start, keep a skeleton card in the reserved side slot (already reserved at 120px).

## Round 20

### Soft-rule change: the Data viz heading states the rule the section shows

**Decision.** The Data viz h2 is "Charts count people out of their own group". The old heading, "The AI picks a chart from templates I designed", moves to `design/OPEN-QUESTIONS.md` and comes back once it is settled whether a model or a fixed rule picks the chart. **Tried.** Keeping the P5 heading, which is an approved line in TASTE. **Why.** The heading states the rule the section shows, while how the AI picks stays an open question. **Revisit.** When the model-or-rule question is answered, restore the old heading if it is true.

### TASTE.md is split into hard and soft rules

**Decision.** `design/TASTE.md` has a HARD RULES section (never broken without Mudit's explicit OK) with a core list of twelve rules, then the existing lines that carry them, and a SOFT RULES section (defaults that can bend on judgment with the reason written down) holding everything else. No line was deleted, and the old section titles stay as sub-headings. One header line explains the difference. **Tried.** Splitting by the old section titles. **Why.** The old sections mixed laws with preferences, so an agent could not tell which lines it may bend. The reason for each bend now lives in decisions.md, which is itself a hard rule. **Revisit.** If a soft line keeps being treated as a law, it moves up.

## Round 19

### The hero ties the quote to the 225 with a header and source pills (option C)

**Decision.** After the 225 is tapped, a header with the cherry swatch names the open segment ("Read it as this Friday 225"), a row of source pills holds the timestamps (Ana 04:10 selected, Dev 11:02, +223 more), and Ana's quote sits under them at the full panel width. The selected pill and the quote card share the warm fill. The pills have rest, hover and press, and there is no coloured left bar. **Tried.** My own options A and B on `/dialogue/hero-options`, which are deleted, and Mudit's Paper variants A to C. **Why.** The chips reuse the source pill, so the segment link comes from a shared label rather than a decoration, and the quote keeps full width. **Revisit.** If the header and the legend above it read as the same line twice, I would drop the count from the header.

### The page runs Problem, Levels with Clips, Counts, Data viz with Thin data, Shipped, Takeaway

**Decision.** Six sections in that order. Clips is now the last beat of Levels, and Thin data is the closing rule of Data viz. **Tried.** The old eight sections, where Counts, Clips and Thin data each repeated an explored-then-kept beat. **Why.** Both reviews read the page as a tour of one card from top to bottom. Putting the deepest level inside Levels finishes the depth story in one place, and putting the thin-data gate inside Data viz makes it the chart section's last rule, because it decides when a chart appears. **Revisit.** If Levels gets too long to skim, Clips goes back to its own short section.

### The Problem is about speed against depth, and says the scenario is illustrative

**Decision.** The Problem's first line says Priya and Hearthside are an illustrative scenario with invented data. The body says a fast answer and a deep one pull apart. The "every claim shows how many people hold it" principle is gone, and the constraint line sits under the figure. **Tried.** Keeping the principle and adding a label. **Why.** The principle promised a count on every claim, which is a different product from the page's spine of a fast answer with depth on a tap. A named persona with a deadline reads as fieldwork unless the first line says otherwise. **Revisit.** If the label feels defensive, I would shorten it and keep the per-figure captions.

### Counts opens with the 8 versions and ends on the shipped bar

**Decision.** Counts starts with "the answer format took 8 versions to settle", then shows the early versions (two bars side by side, then stacked) in one frame and the shipped bar under it, with no A and B letters and no check or cross rows. **Tried.** Another explored and kept pair. **Why.** The pair already appears in Levels and in Thin data, and a bar shape is a smaller decision than where depth lives. A sequence reads as iteration. The single bar came from iterating, so it is an iteration choice and nothing here is called a failure. **Revisit.** If a reader wants the reason each version fell away, I would add a line per step.

### Data viz leads with the bar-or-rows rule

**Decision.** The first thing in Data viz is the rule (two short groups fit one bar; three or more groups, or a label over 26 characters, get one row each) and its figure. The template library is second and the thin-data pair closes it. The Carbon paragraph is cut to one line. **Tried.** Leading with the template library. **Why.** The rule is the most concrete decision on the page, measured in the 448px panel, and the library grid shows less judgment than one rule that switches the chart. **Revisit.** If someone asks who picks the template, I would add the override answer once I have it.

### Visible placeholders leave the page and go to OPEN-QUESTIONS

**Decision.** The Team row, the quote-picking line, the model-versus-rules line, the Carbon line, the cutoff reason and the signal line are off the page, plus two placeholders inside chart cards. They are logged in `design/OPEN-QUESTIONS.md`. The Takeaway keeps its one placeholder. **Tried.** Leaving them as markers. **Why.** A visible blank at the top of the page costs more than a missing row, and a claim with a blank under it reads as assertion without judgment. **Revisit.** Each returns when Mudit has the answer.

### Where Levels B starts is "the insight"

**Decision.** The kept option reads "Opens at the insight, with the count", matching the video label and the caption that one tap on Insight brings the count back. **Tried.** "Starts at the count". **Why.** The page used two words for one place. The count is part of the insight, so one word is enough. **Revisit.** If Counts and Levels are read separately, the count could get its own level.

### Illustrative data is back on every mock figure, and 04:10 to 04:24 appears once

**Decision.** Each figure caption ends with "Illustrative data." The clip caption no longer repeats the clip's time range. **Tried.** Only the Problem label. **Why.** The P15 removal let 225 of 300 read as a real result. Captions sit next to the figure a skimmer is looking at. The range was in the body and the caption, which gave a loading detail twice the weight of the shipped bar. **Revisit.** If the repeated caption sentence feels heavy, I would keep it on the first figure of each section only.

### The Takeaway keeps one placeholder and ends on the Levels reversal

**Decision.** The Takeaway is one spine line, "Fast and deep can share one answer when depth waits for a tap", then a placeholder for Mudit's own learning about the reversal in Levels. The old sentence repeated the hero. `DIALOGUE_SUBTITLE` no longer says "every answer shows the interviews behind it". **Why.** The learning has to be in Mudit's words, and the reversal is the page's one real turn. The old subtitle carried the retired framing. **Revisit.** When the learning is written, the spine line may go.

## Round 18

### The hero ties Ana's quote to the 225 with a head line, a selected pill and the segment's fill

**Decision.** After the shopper taps the 225, the 225 keeps its cherry, the 75 steps down to stone-300, a head line with the cherry swatch says "1 quote shown, picked from the 225 who read it as this Friday", a row of source pills (Ana selected, Dev, "+223 more") sits under it, and Ana's quote row sits under the pills. The coloured left edge on the quote is gone. **Tried.** Three builds on `/dialogue/hero-options`: A, the head line and a row for each person; B, the head line, pills and one row; C, a selected pill that names the group, one row and pills for the others. **Why.** B is the one that answers both asks with parts the product already has: the head line and swatch name the group, and the pills put other people's timestamps one tap away without adding rows. A needed a second row, which made the take taller for no new information, and C's group pill read as a button that does nothing. **Revisit.** I would revisit if the pills need to switch the quote on tap, because today they are display only, as they are in the product. The hero frame is 96px taller on desktop and 160px taller on phone so the card and the quote hold in one frame with nothing cut.

### The segment that is not open steps down to stone-300, in both directions

**Decision.** When either segment is open, the other one draws in stone-300, and its legend swatch follows. The old pale pink tint of the 225 and the 2px marker under the open segment are removed. **Tried.** Keeping the 35% cherry tint, no step down at all, and a stone-300 step down on one side only. **Why.** The audit of Every found the receded 225 drawn as a pink that is not on ramp C, and it only happened when the 75 was open, so the two segments followed different rules. Stone-300 is on the ramp, and the same rule both ways means no one has to learn which side recedes. **Revisit.** If the 225 stepping to grey reads as the answer being dismissed when the 75 is open, I would try a lighter stone-200 or no step down in that direction only.

### Every's rows carry no hue, and the open row is a warm fill

**Decision.** Quote rows have no coloured left edge and the open row has no cherry outline; it is the warm fill with the normal stone border. **Tried.** Keeping the edge in the open segment's hue, and keeping the outline only when the 225 is open. **Why.** In Every the 75 is open, so the open row was outlined in cherry from the 225 and the other rows carried a stone edge clipped by the corner radius. Both read as rendering faults. The head line and its swatch already name the group. **Revisit.** If someone loses track of which group a row belongs to once the head line scrolls away, I would put the group name on the row itself rather than bring the edge back.

### Source is not a level, and every timestamp is already a play button

**Decision.** The depth toggles are Insight, Chart and People. Every quote row shows its clip length as a play chip from the start, tapping the row plays it and tapping again pauses it. The Source toggle is gone from the toggles, the picker and the live chat. **Tried.** Keeping Source as a fourth level, and keeping it as a switch that only shows the chips. **Why.** I read the code first. `SourcePill` and `SourcesRow` are display only: a name and a time, and "selected" only tints the pill. In the toggles take the Source level did one thing, which was to set `playable` so the lane showed a play glyph, while a tap on the row already played the clip at any level. A control that adds only an icon is an extra step, so the icon is the default. **Revisit.** If a later product decision makes clips cost something to open, the chip would need a gate again, and I would bring a level back for that reason.

### Selecting a segment no longer underlines it

**Decision.** The 2px marker under the open segment is removed. The selection is shown by the segment's fill, the legend label in ink, and the head line with its swatch. **Tried.** Keeping the marker and removing only the left edge on rows. **Why.** The marker was added in Round 16 so the rows could be tied back to a segment, and the head line with the swatch now does that job in words. Four marks for one selection (underline, left edge, legend, head line) was the funkiness; one fill and one line is enough. **Revisit.** If the open segment is hard to find in a long bar with many groups, I would bring back a mark, but on the legend, not under the bar.

### Toggles and Counts reach the interaction in about a second, and Toggles shows the play chip by resting on Ana's row

**Decision.** Pre-roll is zero on Toggles, Every and Counts, the pointer starts beside its first target, and the first tap lands near 1 second (Toggles 0.8s, Every 0.5s, Counts 1.2s, from 1.3s, 1.4s and 2.0s). The Toggles take ends on the hover on Ana's row and then the Insight tap, and it does not open her clip. The pointer now starts resting on the first tab, so it never fades in on top of a label. **Tried.** Opening Ana's clip and folding it before Insight, which ran 10.1s and carried the tabs out of view. **Why.** The clip beat was already cut once because Insight folding an open player fades it as a ghost, and the Clips still shows the open player. The hover shows the chip is the tap target. **Revisit.** If someone asks where play and pause are shown in motion, I would add a short take on the Clips figure rather than lengthen Toggles.

### The data viz figure spaces itself with the page scale

**Decision.** The figure's padding is 32 and 48, rows are separated by 32 above and below, the question column and chart are 32 apart, a chart and its line are 16 apart, and the names sit 8 under their question, all from `--space-1` to `--space-5`. **Tried.** Only widening the gap between rows. **Why.** The density came from the 24px row padding and 8px chart gaps next to 12px panel gaps; those are off the page scale, so the figure used three spacings the rest of the page does not. **Revisit.** If the figure becomes too tall at a 1471 by 844 view, I would drop to 24 between rows before touching the panel gaps.

### Hovering a chart swaps counts for percents

**Decision.** Hovering the stacked bar (and its legend) swaps each legend count for its percent, and hovering a ranked row swaps its "N of 300" for its percent. Both values sit in one grid cell, so nothing moves. The hover shows in the Hero and Counts takes because the pointer crosses the bar before it taps. **Tried.** The existing row hover that added a muted percent after the label. **Why.** That version added text beside the label and moved the value column, and it only existed on rows that no page figure used. Swapping keeps the one rule the page states, counts out of the group, as the default and gives the percent on request. **Revisit.** If people read the swap as a flicker, I would hold it for 150ms before it starts.

### The thin flag's info icon says why, and the flag itself is shorter

**Decision.** Hovering or focusing the info icon shows the existing tooltip chip with "Not enough data for a chart yet." The flag reads "Early signal from 2 people.", the finding drops "after reading it as this Friday", and the follow-ups label reads "Follow-ups with more data". **Tried.** Two longer tooltip lines that gave the 3 person rule. **Why.** An icon on a flag looks like it can be hovered, so it should answer. The chip opens over the flag's own label, in the same row, so it never covers the finding above it, and the pointer rests left of the icon so it is never on a word; the 3 person rule stays in the figure's intro. **Revisit.** If someone asks what the cutoff is, I would put the rule back in the tooltip as a second sentence.

## Round 17

### The answer card picks a bar or rows for each answer

**Decision.** The answer card keeps the single bar when an answer has two groups with short labels. When it has three or more groups, or a label longer than 26 characters, the card shows one row per group instead, each scaled to the whole. **Tried.** I ran the card through six stress cases (a long question, a long answer sentence, tiny counts, huge counts, long group labels and four groups) and drew three fixes. One patched the bar, one switched by query and one used rows every time. **Why.** The bar is the fastest read for two groups in the stage panel, and the case study already says the template is picked for each answer, so this applies the same idea to the card itself. Patching the bar could not fix four groups, because every group but one is the same stone, and rows every time would have dropped the segment taps the Counts take shows. **Revisit.** I would change the 26 if the panel width changes, since I measured it at 471px, where 26 characters fit on one line and 28 wrap. I would also revisit if rows need to open their people the way the segments do, because rows have no tap yet. The evidence stays on the stress page at `/dialogue/answer-stress`.

### Clips is a still, not a take

**Decision.** The Clips figure is a still of Ana's clip open under the 225's head line, and the take is gone. **Tried.** I compared it with every other take and it repeats Every's Mei beat: tap a row, the player opens, tap again, it folds. I also weighed merging it into Every, which fails because Every needs the 75's people and the count in the same frame as Mei, and a new beat with a loading state and a highlighted transcript line, which needs a part the stage does not have. **Why.** A repeated motion costs scroll time and teaches nothing the first one has not, and the still keeps the point that a quote plays inside the answer. **Revisit.** I would bring a take back if clip loading becomes the thing I need to show, or if a reader cannot tell from the still that the clip plays. The Clips storyboard is still in the recorder, so a new take is a re-record.

### Match the chart is three rows

**Decision.** The Match the chart figure is three rows. Each row pairs a question with the chart it gets and puts one line under it; the first row is a split bar, the second is ranked bars and the third is a flag for fewer than 3 people. **Tried.** Option 2 was one worked example and a text index that names the other charts, and before that the figure carried a By group pair and four awkward-shape frames. **Why.** A skimmer reads the question to chart mapping in one pass when every chart is drawn next to its question, and option 2 hides that mapping in text. The cost is that By group's percent against count comparison and the tie, too many themes, nothing matches and two shapes frames are off the page. **Revisit.** If someone asks how the template handles a tie or too many themes, I would add that one row back instead of restoring the whole set. I would also revisit it if the three rows feel too thin next to the thin data section below.
