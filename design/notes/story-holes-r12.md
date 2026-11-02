# Story holes (round 12, Nov 2 2026)

Read as a hiring manager would, top to bottom on `/dialogue` at round 12, next to Rachel Chen's Notion, 1Password and Figma studies (see `rachel-chen-audit.md` on `audit/rachel-chen`). TASTE.md wins every conflict. Nothing here invents a fact. Where the page needs one, it's a question for Mudit, and on the page it stays a visible [PLACEHOLDER].

What a hiring manager looks for on her pages, and so on this one:
- **A decision is shown** when the reader sees the option that lost, the constraint that killed it, and what was kept.
- **A decision is only asserted** when one sentence says it happened and no picture, constraint or alternative backs it.
- **Ownership:** who decided, and with whom.
- **A close that admits something:** one imperfection or reversal the work still carries (STORY-PRINCIPLES).

## Top 5 holes, ranked

Ranked by how much a skimming hiring manager would change their read of Mudit once the hole is filled.

1. **Counts is the only shipped work, and it has no before.** ANSWERED (round 13): before the single bar he iterated on standard two-bar charts (vertical side by side, horizontal stacked). Nothing broke; the single bar came out of those iterations and reads quicker in the 448px panel. Counts now holds an Explored versus Kept pair, framed as an iteration choice. The question and notes below are kept for the record.
   - Asked Mudit: *What did you build before the one bar? Show or describe the table that crowded the 448px panel, and say what broke when it sat there.*
   - Why first: shipped work is what a hiring manager trusts most. Today that decision rests on one sentence and a placeholder, while the concept sections each get a ruled-out option drawn.
2. **The page's one turn has no witness.** ANSWERED (round 13): Mudit found the scrolled-away count himself, using his own build. Levels now says so in first person and names no other witness. The question and notes below are kept for the record.
   - Asked Mudit: *Who actually hit the scrolled-away count: a PM or teammate you watched, feedback from Dialogue, or you using your own build?*
   - Why: "a PM had to scroll back up" is the evidence for the reversal, and the reader can't tell whether it was observed or imagined. Rachel's turns die on something real (Apple's API, noise she saw in testing).
3. **No one else is on the page.**
   - Ask Mudit: *Who did you work with at Dialogue, and which calls on this page were yours alone versus agreed with them?*
   - Why: the Team line is a placeholder and every decision reads as solo. A contract designer who shipped into someone else's product has a collaboration story. Its absence makes "Counts shipped" hard to weigh.
4. **"The AI picks a chart" doesn't say how.**
   - Ask Mudit: *When an answer comes back, what does the model choose and what is a fixed rule you wrote? For example, does the model label the question type and a rule then binds the template?*
   - Why: it's the most technical claim on the page and the one an AI-product team will probe first. The figure's route band is held until this is answered (round 11).
5. **The close admits nothing.**
   - Ask Mudit: *Of the 8 versions, which one did you believe in that turned out wrong, and what would you do differently on the next answer surface?*
   - Why: "8 versions" is stated, but none is shown or named. The takeaway restates the hero line and the learning is a placeholder. One named wrong turn would cover both.

Still open: holes 3, 4 and 5.

Next in line: the thin cutoff (why under 3), how the 2 shown quotes are picked, and why a clip in place beat the session page.

---

## By section

### Hero: "Interactive insights for UX research teams"
- **Shown.** The final answer in motion: the count arrives, a tap on 225 brings Ana's quote. Recorded from his code.
- **Asserted.** "I redesigned its answer so a research team can move fast on an insight and still check the people behind it." The video backs the first half. The second half is proven later.
- **Missing.**
  - Who he worked with, and the scope of the contract (Team is a placeholder).
  - What Dialogue asked for. Rachel opens on her role and the ask before the first problem.
- **Sharpest question.** *Who did you work with at Dialogue, and which calls on this page were yours alone?* (Top 3)

### Problem: "Teams needed answers fast, and the detail got lost"
- **Shown.** The before still with "Many found" marked as an unstated count. The 448px panel and Kalshi's share-out bar are named as constraints, with Kalshi in its own words.
- **Asserted.** That this is the problem Dialogue's own teams felt. The page says he knew teams "only through Dialogue's customer stories", which is honest, but nothing says whether Dialogue's team pointed at unstated counts or he found them.
- **Missing.**
  - The brief in Dialogue's words.
  - Whether a real reader ever over-read "Many found". `user-story-root.md` marks this as assumed.
- **Sharpest question.** *What did Dialogue ask you to fix, in their words, and was the unstated count their complaint or your finding?*

### Levels: "Every level at once was too slow, so depth became optional"
- **Shown.** This is the strongest section.
  - The first-try video shows the count scrolling away.
  - A (picker) and B (toggles) sit side by side, each with a reason row.
  - B's caption now names what B fixes: the toggles stay above the open clip, and one tap on Insight brings the count back.
- **Asserted.** "a PM had to scroll back up for the one number they came for." It carries the whole reversal, and the reader can't tell who the PM is. "Priya's PM wants the sentence and a skeptical director wants the people" reads as personas.
- **Missing.**
  - The constraint that forced the call: a real person, a review, a test.
  - Why toggles beat a third option, such as a sticky count over the player. He'd have considered it; the page doesn't say.
  - What A would have been good for (its conditional benefit). The con row says only what it costs.
- **Answered (round 13).** He found it himself, using his own build. The body now reads "Using my own build, I found the open player pushed the count out of view, and I had to scroll back up for the one number I came for." No PM witness is claimed.
- **Still missing.** Why toggles beat a third option such as a sticky count over the player.
- **Sharpest question now.** *Did you try keeping the count pinned over the player before choosing toggles, and what made it lose?*

### Counts: "Every claim leads with how many, and both sides open"
- **Shown.** The bar swapping its two sides of people, in motion.
- **Asserted.**
  - "A table crowded the 448px panel." No table is shown.
  - "Shipped." Nothing says what shipped exactly: the bar, the side taps, or only the count in the sentence.
- **Missing.**
  - The before (placeholder).
  - What Dialogue released versus what he designed.
  - How the 2 quotes per side are picked (placeholder). That's a trust question, since an AI picking its own evidence is what researchers fear (ACM, Reddit in `user-story-root.md`).
- **Answered (round 13).** He iterated on standard two-bar charts first (side by side, stacked), and the single bar came out of those iterations. The "table crowded the panel" line is gone, since nothing broke. A pair now shows both explored charts beside the kept bar.
- **Sharpest question now.** *Of this section, what exactly is live in Dialogue today?*
- **Second question.** *Of this section, what exactly is live in Dialogue today?*

### Clips: "A quote plays from its moment, inside the answer"
- **Shown.** Ana's clip opens in place, runs on the quote's 14 seconds, and folds on a second tap.
- **Asserted.** "The source is the deepest level and the heaviest to load, so the clip loads only on a tap." Load weight is a fair constraint, but nothing says whether it came from engineering or was his own reasoning.
- **Missing.** The alternative he beat. Today Dialogue keeps quotes on section pages and in a modal (`user-story-root.md`), so the obvious rejected option is "open the session page". It isn't named.
- **Sharpest question.** *Did you consider sending the reader to the session page or a transcript instead, and what made playing in place win?*

### Data viz: "The AI picks a chart from templates I designed"
- **Shown.**
  - Four question types, each with its chart, Carbon source and pro.
  - By group beside the percent chart it beat (round 11).
  - The awkward shapes as four frames.
  - The second series is now in Carbon teal (ramp C).
- **Asserted.**
  - "The AI picks." How is the placeholder (Top 4).
  - "Where I departed from Carbon, it was to keep people countable." The departures are named, but the guideline he bent on purpose is a placeholder.
- **Missing.**
  - Why these four templates and not others. For example, the Paper sheets explored a donut and a heatmap, and the page doesn't say why they lost.
  - A ruled-out option for Split, Ranked or Scale. Only By group shows its loser, which is fine for weight, but say so if asked.
- **Sharpest question.** *What does the model choose, and what is a fixed rule you wrote?* (Top 4)

### Thin data: "Two people get a flag, and no chart"
- **Shown.** A's two-person bar filling its track beside B's flag, then a follow-up answered with a count. The decision is drawn, and the caption now says what the pair proves.
- **Asserted.** The cutoff. "Under three people" is a number the page doesn't defend. Maze's low band is 1 to 4, so the obvious challenge is "why not under 5?"
- **Missing.**
  - The total behind A's bar (placeholder, untouched).
  - What would move the cutoff (placeholder).
  - That this didn't ship (TASTE: thin flags did not ship). The status line says Concept, which covers it.
- **Sharpest question.** *Why does the flag start under 3 and not at Maze's under-5 low band, and what would make you move it?*

### Shipped and next: "Counts shipped, and the rest is a concept I'd test"
- **Shown.** Nothing visual, which is right. The honesty is the content.
- **Asserted.** "The answer format took 8 versions to settle." It's a true count (TASTE), but none of the 8 appears or is named anywhere.
- **Missing.** Which signal he'd watch first (placeholder), and the one version that taught him the most.
- **Sharpest question.** *Which signal would you watch first, and what result would make you pull a concept back out?*

### Takeaway
- **Shown.** Nothing new. The sentence restates the hero line.
- **Asserted.** "working inside Dialogue's own system." True per TASTE, but no figure points at it, because figures can't claim they were built from the product's components.
- **Missing.** The learning (placeholder), and the one imperfection the work still carries (STORY-PRINCIPLES: the closing names one).
- **Sharpest question.** *Of the 8 versions, which one did you believe in that turned out wrong, and what would you do differently next time?* (Top 5)

---

## Where each answer lands

No new sections and no new figures. Each answer replaces a placeholder that already exists, or fits one sentence into its section.

| Hole | Lands in |
| --- | --- |
| 1, counts before | Done in round 13: Counts holds the explored versus kept pair, and its placeholder is gone. |
| 2, the turn's witness | Done in round 13: the Levels sentence is first person, from his own build. |
| 3, team | Hero metadata, `[PLACEHOLDER: team names and roles]`. Plus one first-person "with" clause where a call was shared. |
| 4, model versus rules | Data viz, `[PLACEHOLDER: how much the model decides versus fixed rules]`. Then the held route band can be drawn (round 11 hold). |
| 5, the close | Takeaway, `[PLACEHOLDER: one learning ...]`. |
| Thin cutoff | Thin data, `[PLACEHOLDER: why the cutoff sits under 3 ...]`. |
| Quote picking | Counts, `[PLACEHOLDER: how the 2 shown quotes are picked]`. |
| Clip versus session page | Clips body, one clause. Needs his answer first. |
