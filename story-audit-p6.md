# Dialogue story audit, P6 (cold read of review/round-p5, 6c9dd8a)

Read as a PM and as a product design recruiter who has never heard of Dialogue. TASTE.md wins every conflict. Sources: `dlg copy`, the 1440 and 390 shots, `/workspace/research/dialogue-product/01..17`, REFERENCE-CASE-STUDIES.md (RCS).

## 1. Cold-read walkthrough

**Hero.** Sees: title, role line, four sentences, a chat card with "18 of 24" and Mei's quote. Wonders: what did I, Mudit, own here; is 24 interviews a real team's scale; why is Mei under the side she does not belong to. Drop-off risk: low, but the problem heading sits under the 1440x900 fold, so the scroll has no hook.

**Problem.** Sees: desk research list, a placeholder, the prose "before" card. Wonders: what was wrong with prose, concretely; who complained; what did the first try look like. The h2 says "the detail got lost" but the figure shows a short, readable paragraph, so the pain is not visible. Drop-off: here, for a PM. The before needs to look like the real summary surface (product shot 01: long prose, sentiment pills, unlabeled +N avatars).

**Counts (shipped).** Sees: the same card as the hero, plus two quote rows. Wonders: why this is a decision; what else was considered; why counts beat percents. The body hides the real call ("a percent hides how few people sit behind a claim") inside a long sentence. At a few hundred interviews that reason weakens, which a PM will catch.

**Levels (concept).** Sees: three formats, 2+1, Chosen badge. Wonders: did anything here get tested; why "Answer and evidence" over the others. This is the best decision unit on the page and it reads as one. Four captions compete (in-figure heading, subheading, three cost lines). Placeholder sits where the reader most wants Mudit's voice.

**Data viz (concept).** Sees: a 300-word chart spec. Wonders: does the AI really pick the chart; who wrote the rules; why did the common chart lose. The best argument (67% vs 70% hide very different evidence) is buried in a bullet. Drop-off: a recruiter skims past the spec.

**Clips (concept).** Sees: a blurred video and transcript. Wonders: why not just link to the session page, as Dialogue does today (product shot 05 opens a modal). Copy contradicts figures on Mei's side.

**Thin data (concept).** Sees: an early-signal line and Add to my plan. Wonders: where the cutoff comes from; "2 of 5" in copy and "2 of 24" in the figure disagree. Two features in one section.

**Measure.** Sees: a metrics list, no figure. Wonders: so what happened. The ending restates the hero instead of a learning.

## 2. Proposed outline (P6)

Mock scale: Hearthside becomes 300 interviews (segments: first-time 112, repeat 125, lapsed 63). The Friday split scales to 225 of 300 and 75 of 300, keeping the approved 75/25 shape. Real numbers in prose stay as they are; every mock number lives in a figure or a labelled caption.

| # | h2 | Figure and what it proves | Caption | Decision it backs | Tried X, dropped because Y | Placeholders |
|---|---|---|---|---|---|---|
| 0 | Interactive insights for UX research teams | Final answer card at 300 interviews, quotes from the 75 | One answer at study scale, with the people behind it a tap away. Illustrative data. | Final artifact first (RCS: Rachel "final first, then the hidden problem") | none | none |
| 1 | The chat answered fast, but in prose nobody could check | Before card recreated from product shots 01 and 15 | The chat before: themes in prose, with no count and no path to a person. Recreated with invented data. | Names the speed versus depth tension (RCS: Liang "AI failure as a symptom") | First try: markdown tables, shown as the before | first try and why grouping responses was the move |
| 2 | A count shows how much of the study backs the answer | Answer card with both sides opened into quotes | Tapping 75 opens the shoppers who asked which Friday. Illustrative data. | Count with denominator over percent; whole study over one interview | per-interview chat, if real | why study-wide shipped first |
| 3 | I tried three answer formats and kept the one that serves both readers | 2+1 compare with Chosen | Text is fastest and quotes are deepest, so the answer carries both. Illustrative data. | Answer and evidence, at the cost of room in the thread (RCS: Caleb Wu evaluation, 1Password conditionals) | Text only and direct quotes, shown as figures | what the other 8 versions taught you |
| 4 | The AI picks a chart from templates I designed | Chart library, 2 pairs, common versus mine | At study scale a percent can hide a segment of nine people. Illustrative data. | Counts out of each segment over percents (controversial) | The common chart, in the figure | how the model matches a template; which Carbon rule you bent |
| 5 | The clip plays inside the answer, so checking keeps the thread | Clip player in place | The quote opens its clip at the moment it was said. Illustrative data. | In-place clip over linking out, at the cost of video weight | linking to the session page, if tried | why in place beat the existing modal |
| 6 | A thin finding is labelled before anyone shares it | Early-signal answer | Two people get an early-signal line, never a chart. Illustrative data. | Cutoff under 3 (controversial) | a chart for two people | why the cutoff sits there; what would move it |
| 7 | I'd know it worked if teams share faster and still open the quotes | none | none | Paired signals, admitted missing evidence (RCS: Caleb Wu metrics admitted) | none | which signal first; what result reverses the design |
| 8 | Takeaway | none | spine line plus one learning | Payoff | none | the one thing you would do differently |

## 3. Controversial calls to argue openly
1. **Counts over percents at a few hundred interviews.** A PM will say percents are standard. Back it with the segments pair: 67% of 9 and 70% of 125 look equal and rest on very different evidence. Cite NN/g "1 out of the 6 participants" (allowed research figure). Name the cost: rows are harder to compare exactly.
2. **The AI picks the chart, not the researcher.** Risky for trust. Back it with the template set as the constraint and the thin-data rule as the guard: the model can only pick a chart that earned its place. Needs Mudit's placeholder on how matching works today.
3. **A hard cutoff for thin data.** Any line is arbitrary. Back it with Maze confidence bands (low 1 to 4) and research-ops "3+ is a pattern" guidance, then say what would move the line.

## 4. Ending
Pay off the problem with the shape of the answer, the shipped part, and one honest gap. Structure (RCS: Rachel "ending admits imperfection", Liang "open problem in the takeaway"): what shipped (study-wide counts), what stayed concept, what I'd test first, and a learning in Mudit's words as a placeholder. No usage claims.

## 5. Visual plan
- Keep: hero card (rescaled), Levels 2+1 compare (approved), chart library 2 pairs (approved), clip player (b056865), thin-data card (b056865).
- Merge: in-figure heading and subheading of Levels into the one page caption.
- Rebuild data only: all Hearthside counts to the 300 scale; Levels source pills neutral so Mei stops reading as the cherry side; thin data footer and prompt agree (2 of 63 lapsed buyers, 300 interviews).
- No new components, no new icons. The data viz check and minus marks are the approved b056865 set.

## 6. Update after market research (built on review/round-p6)
- Cited answers and inline clips already exist elsewhere (market-research.md), so the counts section is now the lead decision: "The count is the way into the evidence, and both sides open". Opening the side that didn't say it is the distinct move.
- Levels is the contrast unit: "Depth sits inside one answer, so nobody picks a mode first". Other tools ship quick and deep modes; the rejected option is a mode toggle. Named competitors stay in [PLACEHOLDER] prompts until Mudit confirms them.
- Clips are framed as craft: "The clip starts at the moment, so checking keeps the thread".
- Chosen hero: option A (bar plus Mei's clip quote). Option B (bar plus two quote rows) added 100px and pushed the problem further below the fold.
