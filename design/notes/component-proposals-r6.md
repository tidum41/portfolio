# Component proposals (round 6, not built)

From the chart-story brief appendix and Carbon map. Reuse existing chart components only until Mudit OKs a new one.

| Proposed | Carbon name | Why it would help | Do not build yet |
|---|---|---|---|
| Step chart | Step | Task drop-off (“where shoppers stopped”) needs ordered stages with a tap target per step | Existing bars cannot show ordered falloff cleanly |
| Heatmap | Heatmap (charts demo) | Themes by segment at 3×3+ becomes a wall of grouped bars | Grouped bars exist; heatmap is the panel-fit alternative |
| Bullet | Bullet | Result against a team-set target on one line | No target encoding in ChartBarList today |
| Sparkline | Sparkline | Weekly tracking across several themes | Line charts were cut for study rounds; sparkline is a different job |

If approved, add each to `design/SYSTEM-COMPONENTS.md` in the same change that builds it.
