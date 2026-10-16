# JOOLA film pass 40

16.2 seconds (486 frames). Branched from pass 38. The beats through the logo fade-in are pass 38. The extra 1.2 seconds is hold on the settled logo. The cart pill is optically aligned in the prototype and in the film. Five approved copy changes are in the prototype and in the film.

## Logo hold

The logo finishes its fade and scale at frame 439 (opacity 1, scale 1). Pass 38 ended at frame 449. Pass 40 holds that settled logo through frame 485. Nothing before frame 439 moves.

## Cart pill

The basket (wheels excluded), the price cap-height midline, and the badge circle share one centre line. The "4" stays centred in the badge. Left ink-to-edge and right badge-to-edge match, and the icon-to-price and price-to-badge gaps match. The pill sits in the middle of the 48px header (6px above, 6px below).

On the settled 1920 frame the insets are 101px and 101px, the gaps are 59px and 59px, and the basket and the badge both sit 0.5px from the cap midline. On the prototype at 8x the insets are 109px and 109px and the gaps differ by 1px.

## Copy

Changed in `public/dev/joola-proto` and `remotion/assets/joola-b2b`, and in the baked film screens.

| Was | Now |
| --- | --- |
| Sidebar and Orders page heading "Orders" | "Order history" |
| Search result "$134.98" | "from $134.98 ea" |
| Table header "Price" | "Unit price" |
| Rail "Saved" and "3 products, $3,108.90" | "Saved order" and "3 lines, $3,108.90" |
| HC-40 "2-day ship" | "Ships in 2 days" |

The rail Add control is named for its target, for example "Add Match kit to order".

"Unit price" is stacked on two lines, right-aligned in the same 120px column. A single line would have crossed into the search close-up, which stops at the search field so that header is not a sliced word. The stacked ink starts at the same x as "Price" did. Row positions, the rail's 72px rows, the search result box, and the HC-40 row height stay put. "Ships in 2 days" stays on one line inside the product column.

Frames from the cart cut through the logos match the pre-copy render. Chunks 336–485 are byte-identical. Frames 330 and 335 are pixel-identical.

## Check

`check-film.py` once on the 1920×1440 film: 486 frames, 16.2s, hover assertion clean (0 violations), no unexpected cuts, seam diff 0.022, ledger strings present, including "from $134.98 ea", "Saved order", "3 lines", and "Ships in 2 days". Holds over 0.4s are the settled pill (297–311), the green button (369–383), and the logo (438–485, 1.6s). `no_freeze` is false for those holds. The only all-caps OCR token is `FYJOOLA`.
