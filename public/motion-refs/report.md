# Motion references for the JOOLA B2B ordering film

What I measured: all 14 clips were downloaded to `/workspace/motion-refs/*.mp4`. `analyze.py` resampled each one to 30 fps at 480 px wide and capped it at 60 s. For each frame pair it took the mean absolute difference to find cuts (single-frame spikes) and holds (runs below 0.3 lasting 10 frames or more). It also ran ORB with a RANSAC similarity transform per frame to get scale and translation, then fitted a cubic-bezier to each zoom's normalised scale-over-time curve. Raw output is in `analysis.json` and `analysis.log`. Contact strips are in `strips/<name>.png`: 8 frames across the best transition, with timestamps.

Caveats: the bezier fits are noisy (0.1 grid, x2 fixed near 1). Trust the "t50" value more (the fraction of the move's time it takes to reach 50% of the scale change): below 0.4 means ease-out, about 0.5 means ease-in-out. Cursor values come from eyeballing the strips; the cursor was not tracked. I did not search X, Dribbble, or Godly, and I found no downloadable Stripe Sessions, Clerk, Resend, Vercel, or Mercury product-page mp4s. Those pages load their media from JS bundles or Mux streams.

## Ranked references

| # | Name | URL | Why it's relevant |
|---|---|---|---|
| 1 | Ramp Procurement hero | https://ramp.com/procurement (`assets.ramp.com/nextjs/videos/procurement-hero-428.mp4`) | The same story as JOOLA: PO card → "Purchase complete" confirmation, in a 15 s loop with no cuts |
| 2 | Ramp Bill Pay hero | https://ramp.com/bill-pay (`ap-hero-0420.mp4`) | A 9.7 s loop with a staggered row reveal, a text-led state, and 2 s holds |
| 3 | Linear Insights "Dashboards" demo | https://linear.app/insights | Slow, calm zooms (1.3–1.5×) on a real UI, with a small system cursor |
| 4 | Ramp product demo | https://ramp.com (`demo.mp4`) | Fast camera with 0.4–0.6 s ease-out zooms of 1.4× on tables |
| 5 | Notion homepage hero | https://www.notion.com/product/mail (ctfassets `web-homepage-hero…mp4`) | An 11 s loop with no camera move at all: only cursors and in-place state changes |
| 6 | Linear Insights hero | https://linear.app/insights (`hero.mp4`) | One long, gentle pull-back (0.83× over 2.9 s, ease-in-out) to end the loop |
| 7 | Linear — Product Launch Film | https://youtu.be/lKwyrKUEPS4 | A 26 s film made of 3 shots joined by continuous zooms |
| 8 | Introducing Linear Agent | https://youtu.be/mRql2VJ99gM | Restrained: 0.9–0.95× scale moves, 1.8–4.9 s reading holds |
| 9 | Introducing the new Notion AI | https://youtu.be/S92KX8-Hmlc | Hard cuts every ~3.5 s, almost no camera movement (82% of frames are static) |
| 10 | Raycast Focus | https://youtu.be/ykaj0pS4A1A | 38 hard cuts with an average shot of 1.3 s, cut to rhythm |
| 11 | New Raycast (2026) | https://youtu.be/Mi173xGb0ZA | List scroll and morph transitions, with 0.6–0.9 s zooms of 1.13–1.24× |
| 12 | Arc 1.0 "Everything or nothing" | https://youtu.be/n5Vwrj1gEWs | 24 cuts with 0.5–0.8 s holds; a confident cut rhythm |
| 13 | Framer homepage clip A | https://www.framer.com (`2zyGmnAWVTTdkv4LY1mFKgEdhg.mp4`) | Snappy ease-out (t50 0.22–0.29). Contrast example: too much motion |
| 14 | Framer homepage clip B | https://www.framer.com (`EGqLxawrgBiyYfcyRAdEFPRAMWo.mp4`) | Anti-reference: constant zooming (2.3–2.6×) and no holds |

## Measurements and techniques worth stealing

1. **Ramp Procurement.** No hard cuts. Zooms are small (0.8×, 1.19×, 1.04×) and take 0.17–0.63 s. Holds run 0.4–1.5 s (median 0.7 s). At 13.7 s the PO card scales up to 1.19× in about 0.4 s while it fades out. A centred "Purchase complete" pill then appears on an empty background, and its checkmark draws in over about 250 ms. *Steal:* (a) collapse the full UI into one centred confirmation chip (your Order placed beat); (b) push the outgoing card forward about 1.05–1.2× while fading it, rather than sliding it; (c) a warm off-white flat background with no device chrome.
2. **Ramp Bill Pay.** It fades up from white. The header text types in ("Routing to approvals…"). Rows enter with a staggered opacity fade of roughly 250 ms each, 40–60 ms apart, with no visible y-offset. Holds are 1.3–2.8 s (median 2.0 s). The camera drift is under 8%. *Steal:* a staggered list reveal for the Perseus results; long holds on the final state; loop through blank/white.
3. **Linear Dashboards.** Zooms of 1.32×, 1.47×, and 0.69×, each lasting 1.3–1.5 s, with t50 of about 0.5: a symmetric ease-in-out close to cubic-bezier(0.5,0.1,0.5,1). Pan speed p90 is only 1.6 px per frame at 480 px. The cursor is a normal macOS arrow, about 1.2% of frame width. It moves first, then the camera follows. *Steal:* the camera only zooms toward where the cursor is about to click; one zoom per beat; real-scale cursor.
4. **Ramp demo.** Zooms of 1.40× in 0.57 s and 1.45× in 0.67 s, with t50 0.19–0.33, so a strong ease-out (about cubic-bezier(0.2,0,0,1)). Holds have a median of 0.77 s. *Steal:* for fast zooms use strong ease-out and keep them under 0.6 s.
5. **Notion hero.** No camera motion at all (pan p90 = 0). Multiple cursors with name tags. Cards move in place, and 61% of frames are static. *Steal:* the UI itself is the motion; the camera stays still.
6. **Linear Insights hero.** The loop ends on a 0.83× pull-back over 2.87 s with symmetric easing, then resets. *Steal:* if you need a zoom on the end card, make it a slow pull-back.
7. **Linear Agent and Notion AI.** Hard cuts between scenes (shots average 3.5–11 s). Inside a shot, scale moves stay within 5–10%. Holds are 1–2 s on text. *Steal:* cut between scenes and zoom only within a scene.
8. **Raycast and Arc.** For rhythm: when cutting, cut on the action (a click or a keypress), never mid-hold. Holds between cuts are 0.4–0.8 s.

Anti-pattern (Framer B): 14 zooms in 16 s, peaking at 2.64×, with almost no holds. This is the "unrefined" feeling Mudit describes.

## MOTION SPEC — JOOLA B2B ordering film (4:3, 11.0 s loop, 30 fps, readable at 676 px)

**Global**
- Frame rate is 30 fps. All timings below are in frames at 30 fps.
- One easing family, no springs, no overshoot:
  - UI and state changes: `cubic-bezier(0.2, 0, 0, 1)` (strong ease-out).
  - Camera: `cubic-bezier(0.45, 0, 0.2, 1)` (gentle ease-in-out with an early settle; matches Linear's t50 of about 0.5).
  - Fades: `cubic-bezier(0.4, 0, 0.2, 1)`.
- Value changes (qty, badge count, credit numbers, totals) are **instant**: swap on a single frame with no count-up.

**Cut vs zoom rules**
- Cut whenever the screen or context changes: Quick order → Cart → Confirmation. Cut on the click frame, at the moment the press happens.
- Zoom only within a screen, toward the element the cursor is about to act on, and at most one zoom per screen.
- Maximum scale change is **1.25× per move**, and total magnification stays at or below 1.5× of the base framing. Never zoom out below 1.0 during the flow.
- A zoom lasts 0.5–0.7 s (15–21 frames), always ends at least 0.4 s before the action it frames, and pan plus zoom are combined in one move. A fast punch (e.g. onto the badge) is allowed at 0.33 s / 10 frames, up to 1.15×, with the ease-out curve.
- Base framing: UI text must render at 11 px or larger at 676 px wide, which is about 15 px at a 900 px master. If it doesn't, cut to a tighter base shot instead of zooming.

**Cursor**
- macOS arrow at about 1.3% of frame width (about 9 px at 676 px; 12–14 px at 900 px), black with a white 1 px outline and a soft shadow at 15% opacity.
- Travel follows a slight arc or straight line in 0.35–0.55 s with `cubic-bezier(0.3, 0, 0, 1)`. Arrive, dwell 6 frames (0.2 s), then click.
- Click is a press scale of 0.9 for 3 frames, then 1.0 over 4 frames, with no ripple or ring. The cursor is hidden on logo cards and the confirmation.
- Typing "Perseus": 2 frames per character (about 0.47 s total), no cursor movement while typing.

**State-change animation**
- Elements entering (search results, cart row, PO field): opacity 0→1 plus y 6 px→0 over **200 ms (6 f)**, ease-out. List stagger is **2 frames (≈66 ms)**, with no more than 4 staggered items.
- Elements leaving: opacity to 0 over 120 ms (4 f), with no movement.
- Selected or hover state: a background colour change over 100 ms (3 f).
- Cart pill badge "pop": after the hard cut, the badge appears with scale 0.6→1.0 over 160 ms (5 f) using `cubic-bezier(0.2,0,0,1)`. No overshoot and no 1.1 bump; it only grows into place. The count digit swaps instantly.
- Credit bar: width animates over 400 ms (12 f), ease-out. The number next to it swaps instantly at the start of the bar move.
- Order placed: the full cart cross-fades (8 f) to a centred confirmation chip (Ramp-style). The check icon fades and scales 0.9→1 over 6 f. Text appears 2 f later.

**Holds (minimum reading time)**
- Logo card: 0.8 s.
- Per value-bearing state (results visible, qty set, cart pill, PO + credit, confirmation): **0.6 s minimum, 1.0 s on the cart/credit screen** (the densest screen), and **1.2 s on Order placed**.
- No hold shorter than 10 frames anywhere.

**Indicative timeline (11.0 s)**

| Time | Beat |
|---|---|
| 0.00–0.80 | Logo hold (fades up from the background colour over the last 0.30 s of the previous loop) |
| 0.80 | Cut to Quick order, base framing |
| 0.80–1.30 | Cursor to search |
| 1.30–1.80 | Type "Perseus"; results stagger in |
| 1.80–2.40 | Zoom 1.0→1.2 onto the result and qty row (0.6 s) |
| 2.40–3.40 | Click qty preset (instant value), hold 0.6 s |
| 3.40–3.90 | Cursor to Add to cart, click at 3.90 |
| 3.90 | Cut to cart pill at 1.0 |
| 3.90–4.07 | Badge pop |
| 4.07–4.90 | Hold |
| 4.90 | Cut to Cart (PO + credit) |
| 4.90–6.70 | PO field fills, credit bar runs 0.4 s, hold 1.0 s |
| 6.70–7.20 | Cursor to Place order, click |
| 7.20–7.47 | Cross-fade to confirmation |
| 7.47–9.20 | Order placed hold, about 1.7 s |
| 9.20–9.50 | Fade to background |
| 9.50–10.70 | Logo card |
| 10.70–11.00 | Hold |

**Loop**
- Start and end on the identical logo frame, so the loop point is a held frame rather than a seam (the Ramp Bill Pay and Linear approach).
- Every transition into and out of the logo is a simple centred opacity fade of 0.30 s (9 f) through the background colour. No zoom carries across the loop boundary, and the camera resets on the cut.

## Strips (best three)
- `strips/ramp-procurement.png`: PO card → Purchase complete
- `strips/linear-dashboards.png`: calm 1.3× ease-in-out zoom with a small cursor
- `strips/ramp-billpay.png`: fade-up and staggered row reveal
