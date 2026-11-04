# Routing demo ↔ live Counts parity

Generated: 2026-11-04T07:11:11.537Z
Base: http://127.0.0.1:3001

## 1. Shared live imports vs forks

### `count_split`
- Uses: FridayBar/AnswerCard, SideSample, QuoteListFigure, SourcePill, DialogueInterviewPlayer
- Fork / why: Player stays in a reserved dlg-route-player-slot instead of nesting inside the quote (LiveSideSample nests and shifts). Demo-only follow-up chips sit under the answer.

### `quote_list`
- Uses: QuoteListFigure
- Fork / why: None — QuoteListFigure only, with routed quotes.

### `clip_list`
- Uses: ClipQuotes, DialogueInterviewPlayer
- Fork / why: ClipQuotes gains optional onSelect so a row can open the shared player; player stays in the reserved slot for zero layout shift.

### `segment_comparison`
- Uses: ChartVizCard, ChartBarList
- Fork / why: None — same chart primitives as the live library. No FridayBar/QuoteListFigure/ClipQuotes in this template.

### `thin_data`
- Uses: dp-low-signal / dp-next-study chrome (same classes as ThinDataFigure)
- Fork / why: Action copies a follow-up prompt for the example study instead of downloading ThinDataFigure's Markdown plan file — different product affordance on example data.

## 2. Pixel diffs (448px panels)

| Pair | Diff % | Diff px | Align | Live | Demo | Diff |
| --- | ---: | ---: | --- | --- | --- | --- |
| count_bar_closed | 0.004% | 2 | 0,0 | shots/routing-parity/count_bar_closed-live.png | shots/routing-parity/count_bar_closed-demo.png | shots/routing-parity/count_bar_closed-diff.png |
| count_side_open | 0.000% | 0 | 0,0 | shots/routing-parity/count_side_open-live.png | shots/routing-parity/count_side_open-demo.png | shots/routing-parity/count_side_open-diff.png |
| quote_list | 0.000% | 0 | 0,0 | shots/routing-parity/quote_list-live.png | shots/routing-parity/quote_list-demo.png | shots/routing-parity/quote_list-diff.png |
| clip_list | 0.000% | 0 | 0,0 | shots/routing-parity/clip_list-live.png | shots/routing-parity/clip_list-demo.png | shots/routing-parity/clip_list-diff.png |

Screenshots use integer page-clips (not element.screenshot) so fractional layout Y cannot 1px-skew a pair. Diff % also picks the best ±1px alignment if a residual crop remains (Align column).

## 3. Computed style mismatches

### bar
No mismatches.

### legend
No mismatches.

### chip
No mismatches.

### quote
No mismatches.

### clip_quote
No mismatches.

## 4. Hover / press / layout shift

```json
{
  "hover": {
    "side": {
      "rest": {
        "transition": "color, background-color, border-color, box-shadow",
        "cursor": "pointer",
        "bg": "rgba(0, 0, 0, 0)",
        "border": "rgb(28, 25, 23)"
      },
      "hover": {
        "transition": "color, background-color, border-color, box-shadow",
        "cursor": "pointer",
        "bg": "rgba(0, 0, 0, 0)",
        "border": "rgb(28, 25, 23)"
      },
      "changed": false
    },
    "quote": {
      "rest": {
        "transition": "background-color, border-color",
        "cursor": "pointer",
        "bg": "rgb(252, 251, 249)",
        "border": "rgb(231, 229, 228)"
      },
      "hover": {
        "transition": "background-color, border-color",
        "cursor": "pointer",
        "bg": "rgb(252, 251, 249)",
        "border": "rgb(138, 136, 134)"
      },
      "changed": true
    }
  },
  "press": {
    "side": {
      "rest": {
        "transition": "color, background-color, border-color, box-shadow",
        "cursor": "pointer",
        "bg": "rgba(0, 0, 0, 0)",
        "border": "rgb(28, 25, 23)"
      },
      "press": {
        "transition": "color, background-color, border-color, box-shadow",
        "cursor": "pointer",
        "bg": "rgba(0, 0, 0, 0)",
        "border": "rgb(28, 25, 23)"
      },
      "changed": false
    },
    "quote": {
      "rest": {
        "transition": "background-color, border-color",
        "cursor": "pointer",
        "bg": "rgb(252, 251, 249)",
        "border": "rgb(231, 229, 228)"
      },
      "press": {
        "transition": "background-color, border-color",
        "cursor": "pointer",
        "bg": "rgb(252, 251, 249)",
        "border": "rgb(44, 41, 39)"
      },
      "changed": true
    },
    "hasSideTransition": true,
    "hasQuoteTransition": true
  },
  "layoutShift": {
    "count": {
      "panelDeltaH": 0,
      "quoteDeltaY": 0,
      "beforeH": 758,
      "afterH": 758
    },
    "clip": {
      "listDeltaH": 0,
      "listDeltaY": 0,
      "rowDeltaY": 0,
      "panelDeltaH": 0
    }
  }
}
```
