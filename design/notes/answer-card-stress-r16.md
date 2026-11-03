# Answer card stress test (Round 16, item 5)

Page: `/dialogue/answer-stress` (not indexed, not linked). Each case is drawn four times in the 471px stage panel, or in a 320px panel with `?w=phone`: the current card, then three options. Filter with `?only=tiny,huge`. Data is Hearthside; the tiny, huge and four-group cases stretch the same study to stress the layout and are not page facts. Screenshots: `/opt/cursor/artifacts/screenshots/r16-item5-*`.

## Where the current card breaks

| Case | What breaks |
| --- | --- |
| Very long query | Nothing in the card. The question bubble grows to 4 lines at 471px and 6 on a phone and pushes the card down; the card itself is unchanged. |
| Long answer sentence | Nothing breaks. At 4 lines the bar sits well below the fold on a phone, so the count and the bar are no longer in one view. |
| Tiny count (2 of 300) | The 2 segment is 3px wide, so it reads as a rendering glitch rather than a group, and it is far too small to tap. |
| Huge counts (12,480 of 48,200) | The legend printed raw numbers (`12480`, `35720`) with no separators. The "of 48,200" in a row layout also clipped in a 72px value column. Both fixed in the stress page; the legend fix is in `ChartStackedBar` and is harmless at the page's counts. |
| Long group labels | The two lanes share one row, so each label gets about half the card and wraps to 3 lines on desktop and 6 on a phone, with the count floating beside the wrapped text. |
| Three or more groups | The worst break. Every non-focal segment is the same stone, so the legend swatches are identical and nothing says which segment is which. Lane labels wrap to one word per line ("This / Friday"). Segments also run out of room: the 25 segment is 8% of the bar. |

## Options

All three use existing components only (`ChartVizCard`, `ChartStackedBar`, `ChartBarList`). No new component.

- **A. Patch the bar.** Keep the stacked bar for every query. The legend wraps, and goes to one lane per line when there are three or more groups or a long label. A segment never draws under 8px. Fixes the tiny count, the huge counts and the long labels. It cannot fix three or more groups, because the swatches are still the same stone.
- **B. Bar, or rows when it crowds.** Two groups with short labels keep the bar (what ships today, including the segment taps the takes demonstrate). Three or more groups, or any label over 28 characters, return one row per group: label and count above a bar scaled to the whole. Every row is named, so the identical-colour problem disappears. The rule is one line of code and is the same for every query.
- **C. Rows every time.** One layout for everything. Simplest to maintain, and it handles every case, but the single bar is the page's Counts decision (a single bar came out of iterating on two-bar charts) and its two-sided tap is what Levels, Counts and Clips show. C drops that.

## Recommendation

B. It keeps the shipped Counts bar and its tap behaviour where the data is two short groups, which is the case on every take, and it switches to named rows exactly where the bar stops being readable. A alone leaves three or more groups unreadable, and C undoes a decision Mudit approved.

Open choices for Mudit:
1. A, B or C.
2. If B: the switch points (more than 2 groups, or a label over 28 characters) are my guess; he may want 3 groups to stay a bar.
3. A group of 3 people or fewer: the card should show the existing early-signal flag instead of a bar. Not built; the tiny case shows why.
