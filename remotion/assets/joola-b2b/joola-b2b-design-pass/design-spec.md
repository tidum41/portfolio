# JOOLA B2B portal — design tokens (round 8)

Customer-facing wholesale portal only. Enforce via CSS variables + `check-prototype.mjs`.

## Principles

- **Less but better.** Empathy in every control.
- **One family:** FK Grotesk Neue (logo images for marks). Money: same family + `tabular-nums`.
- **Tight type:** 4 sizes, 2 weights, 3 greys.
- **Zero middle dots (hard):** at most **1** `·` per screen, preferably **0**. Separate with hierarchy, stacking, spacing, columns, tnum — never punctuation belts.

## Heading / label rule

| Role | Size | Weight | Case | Colour | Tracking |
| --- | --- | --- | --- | --- | --- |
| Page title | 24px | 500 | Sentence | ink | −0.01em |
| Section label | 13px | 500 | Sentence | ink | normal |
| Quiet label | 12px | 500 | Sentence | faint | **none** — no uppercase, no letter-spacing |

**Forbidden:** all-caps tracked eyebrows (`REORDER`, `TEMPLATES`, etc.).

## Search IA (one search)

**Decision:** Quick Order owns the only product search (types a name/SKU → add line).  
**Remove** the global top-bar search. Wholesale buyers on this surface are building an order; a second discovery search competes and duplicates. Catalog keeps its own browse; Messages/Invoices do not need a chrome search in this prototype.  
Cmd-K is not justified without a command palette — omit.

## Separators (no ·)

| Was | Now |
| --- | --- |
| `SKU 600558 · 120 × $134.98` | SKU line; qty × price on meta or in columns |
| Rail `Sep 18 · 3 lines · $3,802.40` | Stacked: date + lines (muted); amount right, tnum |
| `Anna Bright · Buyer` | Role line: `Anna Bright` only (Buyer implied by portal) |
| `Ready · 4 lines` | Footer quiet `4 items`; CTA `Add 4 to cart` |
| `Engage Pickleball · Main` | Address card: name bold, address muted, Change |

## Content width

QO, QO-search, and Cart share `--content-max: 1120px` and `--content-pad-x: 28px`. Sticky footer uses the same max-width and pad so left/right edges align with the page.

## Colour / type / icons

Unchanged tokens from r5 (`--ink/muted/faint`, 12/13/14/24, icon 16 in 16 slot, gap 8). Availability exceptions use a quiet grey `.avail-tag` (not orange).

### Cart count chip

- Perfect circle **18×18** (or pill if count ≥ 10)
- Fill: `--blue` (not magenta)
- Number: white, 12/500, tnum, flex-centred (bbox centre Δ ≤ 0.5px vs chip centre)
- Vertically centred on the Cart pill

### Credit

Thin segmented bar: prior used | this order | remaining. Single label: `Net 30` + `$X available`.

### Ship-to

Selectable address **card** (not native `<select>`). Name, address, Change.

### Store link

Nav-identical row: 16px external-link icon + `Back to joola.com store`. Same padding/gap/x as nav items.
