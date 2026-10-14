# JOOLA film pass 19 — report

## Timing (30fps, 370 frames, 12.33s)
| Beat | Frames | Duration | Notes |
|---|---|---|---|
| Logo → sidebar glide | 4–18 | 0.47s | Simple first-style logo into sidebar slot |
| Search + type | 26–41 | 0.50s | Swift type |
| Results reading hold | 34–58 | 0.80s | Perseus Pro V dropdown |
| Select + row in | 61–67 | 0.20s | No blue just-added fill |
| Qty → 120 | 76–82 | 0.20s | Instant tier/line total; neutral focus ring |
| Move 1 → Reorder | 90–104 | 0.47s | Story move 1 |
| Template popover hold | 108–136 | 0.93s | Overlay only; no layout shift |
| Template rows | 142–152 | 0.33s | |
| Move 2 → footer + pill | 156–170 | 0.47s | Story move 2 |
| Add + pill width | 172–183 | 0.37s | Pill hugs; width ease ~0.3s |
| Cart review hold | 200–224 | 0.80s | Hard cut to cart at 200 |
| Move 3 → summary | 224–242 | 0.60s | Story move 3 |
| Summary reading hold | 242–266 | 0.80s | |
| Place order morph | 269–283 | 0.47s | FLIP summary → Order placed |
| Order placed hold | 283–328 | 1.50s | |
| JOOLA logo | 328–370 | 1.40s | ~1.2s visible logo + loop pad |

## Framing (card ≈ css × s × 676/1440)
| Shot | s | Notes |
|---|---|---|
| A | 1.80 | Sidebar sliver; search + row + $16,197.60 clear |
| B | 2.05 | Qty + Reorder + popover |
| B2 | 1.48 | Near full-chrome max so header pill + footer Add share a frame |
| SUM | 1.95 | Summary + Place order; header sliver |
| D | 1.88 | Order placed panel large |

## Checks
- `check-film.py`: numbers_ok, no unexpected cuts, seam_ok, no forbidden strings
- Frozen runs include intentional reading holds (qty settle, cart review, Order placed 1.53s, logo end)
- No blue press/selected/just-added fills on rows or presets (prototype + film)
- Primary buttons keep their own blue; press darkens that colour only
- Cart pill hugs contents; continuous cursor; ≤3 story moves; numbers consistent

## Artifacts
- `/opt/cursor/artifacts/film.mp4`
- `/opt/cursor/artifacts/card-676.mp4`
- `/opt/cursor/artifacts/card-sheet.png`
- `/opt/cursor/artifacts/beat-*.png` (22× 676px crops)
- `/opt/cursor/artifacts/p19-report.md`
