# Decisions: why I chose what I chose

Written in my own voice so I can explain each one in an interview. Each entry holds the decision, what else I tried, why this one, and what would make me revisit it. Newest first.

## Round 17

### The answer card picks a bar or rows for each answer

**Decision.** The answer card keeps the single bar when an answer has two groups with short labels. When it has three or more groups, or a label longer than 26 characters, the card shows one row per group instead, each scaled to the whole. **Tried.** I ran the card through six stress cases (a long question, a long answer sentence, tiny counts, huge counts, long group labels and four groups) and drew three fixes. One patched the bar, one switched by query and one used rows every time. **Why.** The bar is the fastest read for two groups in the stage panel, and the case study already says the template is picked for each answer, so this applies the same idea to the card itself. Patching the bar could not fix four groups, because every group but one is the same stone, and rows every time would have dropped the segment taps the Counts take shows. **Revisit.** I would change the 26 if the panel width changes, since I measured it at 471px, where 26 characters fit on one line and 28 wrap. I would also revisit if rows need to open their people the way the segments do, because rows have no tap yet. The evidence stays on the stress page at `/dialogue/answer-stress`.

### Clips is a still, not a take

**Decision.** The Clips figure is a still of Ana's clip open under the 225's head line, and the take is gone. **Tried.** I compared it with every other take and it repeats Every's Mei beat: tap a row, the player opens, tap again, it folds. I also weighed merging it into Every, which fails because Every needs the 75's people and the count in the same frame as Mei, and a new beat with a loading state and a highlighted transcript line, which needs a part the stage does not have. **Why.** A repeated motion costs scroll time and teaches nothing the first one has not, and the still keeps the point that a quote plays inside the answer. **Revisit.** I would bring a take back if clip loading becomes the thing I need to show, or if a reader cannot tell from the still that the clip plays. The Clips storyboard is still in the recorder, so a new take is a re-record.

### Match the chart is three rows

**Decision.** The Match the chart figure is three rows. Each row pairs a question with the chart it gets and puts one line under it; the first row is a split bar, the second is ranked bars and the third is a flag for fewer than 3 people. **Tried.** Option 2 was one worked example and a text index that names the other charts, and before that the figure carried a By group pair and four awkward-shape frames. **Why.** A skimmer reads the question to chart mapping in one pass when every chart is drawn next to its question, and option 2 hides that mapping in text. The cost is that By group's percent against count comparison and the tie, too many themes, nothing matches and two shapes frames are off the page. **Revisit.** If someone asks how the template handles a tie or too many themes, I would add that one row back instead of restoring the whole set. I would also revisit it if the three rows feel too thin next to the thin data section below.
