# Generative UI routing spec (demo proposal)

Mudit's proposed design for a live routing demo on the Dialogue case study. This is not Dialogue's real internal logic. It maps a typed question onto one of five templates, then fills the template from a fixed 24-participant example dataset. The model (or the rule fallback) never invents a count.

## Inputs

1. **Query type**, inferred from the question:
   - `count_split`: how many, what share, how do people read X
   - `segment_comparison`: compare groups (mobile vs desktop, first-time vs repeat)
   - `quote_evidence`: what did they say, show quotes, evidence
   - `clip`: play, hear, listen, show the clip
   - `open_ended`: why, tell me about, explore (no clear chart ask)
2. **Available data** on the matched topic:
   - participant count for the finding
   - coded segments (theme codes present or not)
   - transcript timestamps (clip ranges present or not)
3. **Study goal** (fixed for this demo): understand how shoppers read delivery promises at checkout.

## Thin-data rule (demo choice)

```
THIN_DATA_MIN_PARTICIPANTS = 3
```

This cutoff is a demo choice, not a product claim. When the matched topic has fewer than three supporting participants, the router returns the `thin_data` template and no chart. Above the cutoff, the query type wins.

## Template map

| Query type | Data check | Template |
| --- | --- | --- |
| any | supporting participants `< THIN_DATA_MIN_PARTICIPANTS` | `thin_data` |
| `count_split` | coded segments present | `count_split` |
| `segment_comparison` | at least two named groups coded | `segment_comparison` |
| `quote_evidence` | quotes with speaker + timestamp | `quote_list` |
| `clip` | transcript timestamps present | `clip_list` |
| `open_ended` | quotes available | `quote_list` |
| `open_ended` | only counts available | `count_split` |

If a preferred template is missing its data (for example a clip ask with no timestamps), fall back to the next row that the data can fill: clip → quote_list → count_split → thin_data.

## Output schema

```
{ template, props, reason }
```

- `template`: one of the five names above
- `props`: dataset keys only (`topic`, optional `compareBy`, optional `side`). Never a raw count.
- `reason`: one short sentence naming the query type and the data check that won

The page resolves `props` against the example dataset and renders the matching React template inside the 448px chat panel.

## Routers

1. **Model path**: Vercel AI SDK `generateObject` over the schema, through the AI Gateway, on a cheap fast model. Used when a gateway key is available.
2. **Rule path**: deterministic keyword and data checks that implement this same table. Used when no key is available, or when the model errors. Always available so the demo works.

The UI labels which path answered.
