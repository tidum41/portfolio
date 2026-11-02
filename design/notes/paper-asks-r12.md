# Paper asks (round 12, Nov 2 2026)

For a Mac agent with Paper Desktop open. The cloud VM can't reach Paper. Read design/TASTE.md first; it wins any conflict. Every value below is one the page already uses. Anything the page doesn't have stays a visible [PLACEHOLDER] in Paper too.

Frames are named by the screenshot they were exported to in `uploads/paper-shots.tgz` (`tokens/` and `viz2/`). Paper's own node ids are given where a note recorded them (597-0 player, 5SR-0). When a frame name doesn't match, find it by its text: every stale board below has a unique string to search for.

## 1. Colour variables (ramp C)

Add to the Dialogue colour variables, beside cherry. Code names are in brackets so the two stay in step.

| Paper variable | Value | Carbon token | Code |
| --- | --- | --- | --- |
| `teal/70` | #005d5d | `$teal-70`, slot 3 of Carbon's light-theme categorical palette | `--ds-teal-70` |
| `teal/20` | #9ef0f0 | `$teal-20` | `--ds-teal-20` |
| `chart/secondary` | alias of `teal/70` | | `--dp-chart-secondary` |
| `chart/secondary-soft` | alias of `teal/20` | | `--dp-chart-secondary-soft` |

Rules to write on the variables' description:
- Teal is for a chart's second series only, never UI chrome (no buttons, borders, links or text colour).
- `chart/secondary` is 7.7:1 on the white card, so it can carry a mark alone.
- `chart/secondary-soft` is about 1.3:1. It fills only a mark that has its own label next to it.
- Cherry #B43F7F stays the one focal per figure. Every other mark stays stone.
- Also update `tokens.md`, which still calls cherry logo-only. TASTE's Nov 1 approval of cherry as an accent wins.

## 2. Frames to update to match the page

Apply teal only where a chart has a true second group. A remainder (the 75 unsure, an Other row) stays stone-500.

| Frame | Change |
| --- | --- |
| By group, kept (`tokens/dataviz-section2-after.png`, option A, and `viz2/section-2-segments-*`) | Two rows only: New shoppers 9 of 14 as the focal (neutral stone-900 at 82% on the templates figure), and Repeat shoppers 88 of 125 in `chart/secondary`. Drop the lapsed row. Title: "Read 'Arrives by Friday' as this Friday, by group". |
| By group, ruled out (same sheet, option B) | Percent bars 64% and 70%, same two rows and colours as the kept card, under the tag "Ruled out: percents on one scale". The kept card's tag is "Kept: counts out of each group". |
| 1 to 5 scale (`tokens/dataviz-section5-after.png`) | Add a median dot frame: New shoppers dot at 2 (focal, "14 people") and Repeat shoppers dot at 4 in `chart/secondary` ("125 people"), axis 1 to 5, note "Each dot is a group's median score. 1 = not sure, 5 = sure." No such frame exists in Paper yet. The diverging stack and box plot on that sheet stay as explorations. |
| Thin data (`tokens/dataviz-section8-after.png`) | Option A stays the kept flag. Add the near-miss as it is on the page: one bar labelled 2, title "Two shoppers missed a delivery after reading it as this Friday.", note "Out of [PLACEHOLDER: total behind this bar]". Leave the placeholder; Mudit hasn't answered it. |
| Awkward shapes (no Paper sheet) | Four small frames in the chart card, tie first, all neutral (no cherry, no teal): tie with "Both at [PLACEHOLDER: tied count]"; top three asks (41, 28, 17 of 300) plus Other 19 of 300 with hatched fill; closest theme "Warn when Friday slips" 17 of 300 with a rephrase chip; the 225 and 75 split with a "How did repeat shoppers read it?" chip at 125. |
| Clip player (`tokens/components-section5-after.png`, node 597-0) | No change. Player time, fold, session link and clip range are settled. |

## 3. Stale boards to fix or delete

These carry values or rules the page dropped. Fix means rebind to the page's values. Delete means move to an "Archive, off page" page so nobody exports it again. When in doubt, archive.

| Search for | Where | Problem | Do |
| --- | --- | --- | --- |
| `118 of 150` (with `62 of 90`, `45 of 60` or `45 of 80`) | Section 2 segments (`viz2/section-2-segments-*`, `tokens/dataviz-section2-after.png`) | Three groups and old counts. The page has two groups, 9 of 14 and 88 of 125. | Fix as in section 2 above. Archive any variant you don't rebind. |
| `6 of 9` | Older By group card (copy from P10 and round 7) | The first-group count was 6 of 9 until round 9. | Fix to 9 of 14, or archive. |
| `142 of 300` | Section 3 ranking (`viz2/section-3-ranking-a.png`, `-b`) | Old top theme. The page's top asks are 41, 28, 17, 11 and 8 of 300. | Fix option A to the five asks with the page's labels. Archive option B (table with in-cell bars, a new component). |
| `41` with `34` in a three-slice split | Section 1 share (`tokens/dataviz-section1-after.png`, `viz2/section-1-share-*`) | 225, 41 and 34 splits the 300 three ways. The page is 225 and 75. | Fix the meter to 225 and 75. Archive the donut (pies are cut). |
| `Mei` or `Owen` beside "lapsed" or "cancelled" | Section 8 | Mei is unsure and Owen checked the date on the page. Each persona has one job. | Rename to unused placeholder names, or archive. |
| `two of 5` and a `60` chip | Section 8 unit dots (`viz2/section-8-thin-b.png`) | Not the page's two of 300. Unit dots are a new component. | Archive. |
| `+116` or `118 no date shown` | Section 6 theme (`viz2/section-6-theme-a.png`) | Counts not on the page. | Archive, or fix to the page's 225 if Mudit wants a fifth template later. |
| Wave counts `75`, `54`, `27` | Section 4 (`tokens/dataviz-section4-after.png`, `viz2/section-4-waves-*`) | Line charts and Round axes are cut. | Archive. |
| Step chart, sparkline | Section 9 (`tokens/dataviz-section9-after.png`) | Reopens the cut funnel and line charts, and every count is new. | Archive. |

## 4. Rule fixes across every remaining board

- **Quotes.** "Arrives by Friday" in double quotes becomes 'Arrives by Friday' in single quotes (round 9), in titles, questions and option labels.
- **Two cherries.** The cherry option labels in `viz2/` ("Pick", "Kept") go to stone-600, so the only cherry on a board is its focal mark.
- **Dot separator.** "Stacked bar · 300 interviews" in the footer of `tokens/components-section2-after.png`, Variation B, becomes "Stacked bar, 300 interviews". Dot separators are banned.
- **Dialogue's text chart.** The "Original (Dialogue spec)" DM Mono panel in `tokens/components-section2-after.png` gets a "Reference only, never on the page" label, or moves to the archive page. Figures never show it (r24 revert).

## 5. Done check

- Search the file again for `118 of 150`, `6 of 9`, `142 of 300`, `62 of 90`, `45 of 60` and `45 of 80`. Each should be gone or on the archive page.
- Search for `"Arrives` with a double quote. It should be gone.
- Every board shows at most one cherry mark, and teal only on a second series.
- Export the By group and scale frames and compare them with `/opt/cursor/artifacts/screenshots/r12-dataviz-group-light-1440.png` and `r12-dataviz-scale-light-1440.png`.
