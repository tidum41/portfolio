# PS3 XMB silk — frame analysis

Sources:
- `videoplayback (2).mp4` — **0–6s only** (640×360 @ 29.97fps)
- `ps3silk.mp4` — full ~20.7s (1920×1080 @ 30fps), ribbons without sparkle emphasis

Contact sheets: `contact-playback-6s.jpg`, `contact-playback-dense.jpg`, `contact-ps3silk.jpg`.

## What the frames show

### Structure
- **Multi-sheet ribbons**, not a single line: typically 2–4 stacked translucent strands mid-frame (`y ≈ 0.43–0.61`).
- Primary crest is brighter/sharper; surrounding sheets are softer, wider, lower opacity.
- Additive overlaps create luminous hotspots where strands cross.
- Opposing one-sided thickness (some sheets thicker above, some below) — matches production `flip` band groups.

### Wrap / depth
- Strong **L–R phase lag** on `ps3silk` (~150–180px ≈ 8–10% of height): crest `y` diverges left vs right → wrap/fold read.
- Early playback (~1–2.5s) shows thinner wispy strands on black; by ~3–5s sheets thicken and layer.
- Horizontal edge dominance (H/V ≈ 3): ribbons are horizontal sheets, not particles or vertical noise.

### Motion
- Very smooth continuous drift (MAD ~0.27 on ps3silk, ~0.65 on playback fade-in).
- Layers move at slightly different rates → parallax between near/far sheets.
- Slow overall pace; calm XMB feel.

### Lighting
- Soft luminous crests, darker valleys, soft bloom on edges.
- Dark field; wave is self-lit white/silver.

### Explicitly out of scope
- Floating sparkle particles (`particles.elf`) — present in some refs, **do not recreate**.
- PS3 logo / UI chrome in playback.
- Background color washes (lab uses site dark shell).

## Rebuild targets for `PS3SilkLab`

1. Keep 8-band one-sided sine DNA (production continuous path).
2. Add **per-layer horizontal parallax** so L/R crest positions diverge.
3. Add **crest fresnel / soft sheet edge** so peaks glow and valleys stay translucent.
4. Optional **secondary harmonic** for fine filament detail inside broader sheets.
5. Print only as material via `silkMix` (default low); dots reinforce crests.
6. Morph quiet / off by default.

## v9 DialKit defaults (visual reference)

Persist key: `ps3-wave-lab-v9`

Ship path: bake these uniforms into production `PS3Silk` behind a mode flag.
Keep morph off. Print path runs (silkMix 0.46) but morph 3×3 is gated off.
30fps + DPR cap already in lab/production.

```json
{
  "silk.parallax": 0.065,
  "silk.crestBoost": 0.14,
  "silk.harmonic": 0.36,
  "silk.sheetSoft": 0.6,
  "print.pitch": 6.3,
  "print.screenAngle": 0,
  "print.contrast": 1.25,
  "print.inkSoftness": 0.85,
  "print.inkDensity": 0.43,
  "print.minDot": 0.05,
  "print.inkColor": "#ffffff",
  "print.silkMix": 0.46,
  "plate.intensity": 0.19,
  "plate.mouseNudge": 0,
  "plate.speed": 0.92,
  "plate.yOffset": 49,
  "plate.opacity": 0.33,
  "morph.enabled": false
}
```
