# P10 design decisions

Spine: research teams surface insights quickly without losing detail. Six decisions, one turning point.

| # | Problem | Options weighed (pro / con) | Decision | What I built | Proof on the page |
|---|---|---|---|---|---|
| 1 | Prose can't say how many shoppers hold a claim | Prose summary: fastest read / can't be checked. Markdown table: precise / crowds a ~415px panel. Count bar: glanceable and checkable / needs two labels to fit | Every claim leads with N of the study | Count sentence plus one stacked bar, 225 of 300 | Hero loop (ask to answer), problem still |
| 2 | A bare count asks for trust | Open the majority only: simpler / hides the dissent. Open both sides: honest / one more target | Both sides open | Tapping 75 opens a sample of 2 with +73 more | Counts clip (tap 75) |
| 3 | Checking a quote means leaving the thread | Link out to the interview: full context / loses the thread. Play in place: keeps the thread / heaviest element in the panel | Play in place, load on tap, start at the quote's time | Inline player starting at 18:27 | Clips clip (tap Mei) |
| 4 | Percents hide tiny segments | Percent: easy to compare / 67% hides nine people. Count of own group: honest scale / harder to compare | Count out of its own group | Carbon-based templates the AI picks from | Data viz still |
| 5 | A chart for two people reads as a pattern | Same bar for every finding: consistent / overstates two people. Flag and no chart: honest / less visual | Under three people, flag it and drop the chart | Early-signal note with warn surface, plan action | Thin-data still with live Add to my plan |
| 6 **Turning point** | Different readers want different depth | Depth picker before asking: predictable / you choose before seeing the answer, a mode switch like Dovetail Fast and Deep. Toggles inside the answer: fast default / one tap per level | Depth is optional and opened by the reader | Answer starts at the count; people and source open on taps | Levels side-by-side (B kept, A explored) |

Turning point, in Mudit's words: "I assumed that honing in on the smallest levels of detail might be useful, but this might not be feasible and efficient for teams, rather optional."

Chart rule (both variants): a question about how much of the study holds a view always carries its chart, whatever depth was picked.

Media treatment varies by section: full-flow loop in the hero, single-interaction clips in counts and clips, stills for the problem, data viz and thin data, and one side-by-side comparison in Levels.
