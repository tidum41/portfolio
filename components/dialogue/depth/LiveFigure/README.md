# LiveFigure

Status: dev only, awaiting Mudit's OK. Exploration 5 in design/dialogue-explorations/ex5-live-figure.md. Not on /dialogue.

One figure the reader can tap (225 and 75), built from the live EvidenceLayer (option layer, rise). The recorded take (`DialogueDemoVideo`) is the default and the fallback.

## When to use
- One figure per page at most (ANALYSIS section 4 item 5), where touching the real UI proves it is built.

## When not to use
- Anywhere a take tells the story by itself. Never more than one live figure per page.

## Props
| Prop | Type | Notes |
|---|---|---|
| `signal` | `"control" \| "ghost"` | a, b. Recommended `"control"` |
| `take` | `{ src, poster, label }` | The existing take and its poster |
| `question`, `finding`, `total`, `sides` | as EvidenceLayer | Hearthside mock data |
| `controlLabels` | `{ live, take }` | Copy for the control. Proposals until Mudit writes them |

## Fallbacks
- No JavaScript: a `<noscript>` poster image.
- Viewport under 360px: the take.
- Reduced motion: `control` keeps the take's poster and still offers the control (opt-in, every live transition is off). `ghost` shows the take's poster, since its signal is motion.

## States
- control: take (playing, with the play button top right) or live (control reads as the take label). The control is a 44px pill on the well, top left.
- ghost: live, with one demo tap on first view (60% in view). Any real pointer down ends the demo.

## Tap targets
The bar sides reach at least 44px tall (`--dlg-depth-hit-min`) with no visual change. Measured at 390px: 177x84 and 67x84, people rows 228x86, control 139x44.
