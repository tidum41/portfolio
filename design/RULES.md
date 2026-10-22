# Design rules

Standing rules for the portfolio. Builders read this with `design/OPEN-ASKS.md` before changing UI. Dialogue-specific figure rules on `cursor/dialogue-figure-parity-b9b1` merge into this file when that branch rebases.

## Standing

- Sentence case everywhere (STD-01).
- No em dashes (STD-02).
- No dot separators (·) as a default (STD-03).
- Site weight cap 500; Dialogue product UI may keep its real 600 (STD-04).
- Helvetica Neue fallback is intentional; Areal is shelved (STD-05).

## Agentation annotate ids (STD-09)

Preview and local builds mount `<Agentation />` (never production). Annotatable case-study graphics and home cards must be real DOM targets: no blocking overlays, no `pointer-events: none` on the selectable part itself (decorative layers such as phone chrome or posters may stay non-interactive).

Use stable `data-annotate="<figure>/<part>"` on every figure part so copied markdown still resolves after minification:

| Surface | Figure id examples | Parts |
| --- | --- | --- |
| Home work cards | `home-card/joola`, `home-card/cd` | `root`, `media`, `media-wrap`, `slot` |
| Case study image figures | `bruinlease-problem`, `cs-figure` | `root`, `media`, `caption`, `zoom`, `lightbox-*` |
| Case study heroes | `cs-hero`, `joola-hero` | `wrap`, `media` |
| Phone mockups | `phone-<instanceKey>` | `root`, `frame`, `screen` |
| Decision card columns | `d1-card-<label>` | `root`, `media`, `caption` |

For image or video figures, tag the **container** (`…/media`), not only the inner `<img>` / `<video>`. Pass `annotate` into `CaseStudyFigure` when the default `cs-figure` is too generic. Dialogue live figures must adopt the same `figure/part` shape when that branch rebases.

Agentation is configured with `identifyingAttributes` including `data-annotate` so the attribute appears in copied output.
