# Card lab — refinements research

Measured project-card (or closest work-index) patterns across **25** product-designer / design-engineer portfolios. Viewport **1440×900** via Playwright `getComputedStyle` where pages loaded; otherwise noted.

**Homepage baseline (muditm.com):** title **18px / 500**, meta **13px / 400** tertiary, image→title gap **6px**, media radius **4px**, aspect **1.2 / 1**, Mux poster (Bruinlease).

## Summary table

| Site | Title size/weight | Meta size/weight/color | Gap (img→title) | Chips | Hover | Radius / border | Notes |
|---|---|---|---|---|---|---|---|
| muditm.com (baseline) | 18 / 500 | 13 / 400 · tertiary grey | 6px | none | underlay wash | 4px / 0 | Live work grid |
| joshpuckett.me | 16 / 400 | 16 / 400 · `rgb(82,82,82)` | n/a (text rows) | none | row `neutral-100` ~150ms | row 12px | Soft list wash |
| rauno.me/projects | 14 / 500 | year 14 / 400 · `rgb(143,143,143)` | n/a · row gap 12 | none | row grey3 | row 14px | Title — leader — year |
| emilkowal.ski | 16 / 400 | 16 / 400 · `rgb(99,99,94)` | n/a · pad 12 | none | `#F5F4F4` row | row 6px | Text-only writing/work |
| paco.me | 16 / 400 | 16 / 400 · `rgb(58,58,58)` | n/a · ~5px title→meta | none | underline 0.24s | 0 | Ultra-minimal index |
| leerob.com | 17 / 400 | date 14 / 400 · `#676767` | n/a · grid 20 | none | sibling dim 0.8 | hairline bottom | Notes/blogs, not projects |
| joebell.studio | 20 / 700 | 16 / 400 muted | side gap 56 (h-stack) | none | image blur-up | media ~19px + ring | Featured posts |
| samuelkraft.com | 14 / 500 | 14 / 500 · `rgb(112,111,108)` | ~14–16px | none | row hover + sibling dim | image ~10.5px | Clearest Batch-A image card |
| ibelick.com | 15 / 400 | 15 / 400 · `#646464` | n/a (strip) | none | text → primary-light | 0 · 1px black/4% | Image strip + name list |
| huntabyte.com | 24 / 700 | 14 / 400 · `#6c6c6c` | n/a | none | active scale 0.96 | 8px · 1px `#eee` | Blog cards |
| harryjatkins.com (MG) | 14 / 400 | 14 / 400 · `#999` | caption above · pad-top 8 | none | card hover bg | thumb 6px · top hairline | Craft grid |
| elwyn.co/websites (MG) | 20 / 400 | 16 / 400 | ~4px title→meta | text tags 16px | link | 0 | List index |
| elaineyu.design (BF) | 15 / 700 serif | 16 / 400 mono blue | overlay | 7.5px pad 2×6 hairline | Y−3 + scale 1.03 | thumb 6px | Strong PD case cards |
| byclaireli.com (BF) | 17 / 400 | role 12 / 400 | under thumb | soft role words | scale 1.01 · Y−5 | image 8px | Image-led PD |
| siddharth.design | 14 / 400 | cat 10.4 @ 52% | row pad 14×12 | category text | row fill · video scale 1.018 | row 12px | Video + compact rows |
| brianlovin.com | 20 / 500 | 20 / 400 muted | n/a (no image) | none | link | 0 | Text-list projects |
| alexcarpenter.me | 12 / 400 mono | 12 / 400 mono muted | large figure | none | minimal | 0 · section hairline | Title≈meta size |
| maggieappleton.com | 22 / 400 | 15 / 400 · `rgb(142,143,148)` | 11px | none | scale 1.02 + accent border | ~6.4px | Essay/work tiles |
| yannglt.com (Linear) | 20 / 400 | 14 / 300 muted | block 48 · pad 20×24 | “Note” 14 mono | colour shift | ~0 | Writing > thumbs |
| tomjohn.design (Vercel) | 16 / 500 Geist | 13–16 / 400 `#5c5c5c` | ~4px | none | rail fill | 0 | Text project list |
| sergzorin.com (BF) | ~16 / 500 mono | ~14 / 400 grey | ~11.5px | none | arrow translateX 4px | 0 | Terminal case list |
| steveschoger.com/projects | 20 / 400 | 18 / 400 `#4a5568` | text stack | none | link | 0 | Simple list |
| adamwathan.me/projects | 18 / 700 | ~16–18 / 400 | prose | none | link | 0 | No image cards |
| linear.app/now *(brand)* | 20 / 510 | 15 / 400 `#8a8f98` | 24px | none | brightness 125% | img 5 · card 6 | Brand, not personal |
| vercel.com/design *(brand)* | 16 / 500 | role 16 / 400 | 12px | handle 12 `#a1a1a1` | grey→colour | img 12 · card 16 · 1px | People cards |

MG = Minimal Gallery feature · BF = Bestfolios feature.

## Steal cluster (used for variant values)

| Axis | Observed range | Lab steps |
|---|---|---|
| Title weight | 400–700 (craft often 400–500) | 400/400 · 500/400 · 600/400 |
| Title size | 12–22px (craft 14–16; PD 15–18) | 15 · 16 · 18 |
| Meta size | 12–16px, often −0–4 vs title | 12 · 13 · 14 |
| Meta colour | `#999`–`#5c5c5c` / tertiary | soft · mid · strong |
| Image→title gap | 6–24px (live 6; kraft ~16) | 8 · 12 · 16 |
| Radius | 0 · 4–8 · ~12 | 0 · 6 · 12 |
| Chips | rare; 7.5–12px hairline or soft words | none · outline · tint · mono tag · year · role |
| Hover | row wash · underline · scale 1.02–1.03 · arrow +4px · meta colour | arrow · underline · scale 1.02 · meta shift |

## Variant → source map

| Lab id | Values | Cited from |
|---|---|---|
| T1 | 500/400 · 18/13px | muditm.com live baseline |
| T2 | 600/400 · 15/13px | elaineyu.design title weight · craft size |
| T3 | 400/400 · 16/16px · colour contrast | paco.me / emilkowal.ski equal size |
| T4 | 500/400 · 16/14px · −0.01em | joshpuckett label + samuelkraft |
| T5 | 500/400 · 18/13 · meta mono | alexcarpenter.me mono meta · vercel design handle |
| T6 | 500/400 · 18/12 · small-caps meta | byclaireli role 12px · tracked labels |
| C1 | neutral grey ramp (live tertiary) | muditm.com |
| C2 | warm grey meta `rgb(99,99,94)` | emilkowal.ski |
| C3 | cool grey meta `#8a8f98` | linear.app/now |
| C4 | soft meta `#999` | harryjatkins.com |
| C5 | strong meta `#5c5c5c` | tomjohn.design |
| C6 | accent role · no accent | accent token vs none |
| C7 | dark theme surface | lab dark + vercel.com/design |
| K0 | no chip | majority of sites |
| K1 | outline chip 7.5–11px | elaineyu.design |
| K2 | filled tint | soft PD role words |
| K3 | mono uppercase tag | siddharth / yannglt “Note” |
| K4 | year chip | rauno year treatment |
| K5 | role chip below title | byclaireli |
| K6 | chip over image corner | elaineyu overlay |
| K7 | size 20px · radius 4 | compact craft |
| K8 | size 20px · full pill | contrast to 4px |
| S1 | gap 8 | near live 6 · brianlovin 8 |
| S2 | gap 12 | vercel design / harryjatkins |
| S3 | gap 16 | samuelkraft |
| S4 | title/meta inline · year right | rauno row |
| S5 | radius 0 | paco / alexcarpenter |
| S6 | radius 6 | harryjatkins / maggie |
| S7 | radius 12 | joshpuckett / siddharth rows |
| S8 | 1px border | huntabyte / vercel people |
| S9 | subtle inset shadow | joebell ring family |
| H1 | arrow nudge +4px | sergzorin.com |
| H2 | title underline | paco.me |
| H3 | image scale 1.02 | maggieappleton / elaineyu 1.03 |
| H4 | meta colour shift | yannglt / ibelick text shift |
