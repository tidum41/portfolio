# Handoff: PS3 / XMB Hero Wave Lab → Local Agent

**Date:** 2026-08-06  
**Repo:** `tidum41/portfolio`  
**Branch:** `cursor/ps3-wave-playground-95f2`  
**PR:** https://github.com/tidum41/portfolio/pull/15  
**Cloud run (context only):** https://cursor.com/agents/bc-eb2160cc-a9f7-49a3-a5aa-6f58b38195f2  

This file is the full brief for a **local** Cursor agent. Cloud agents cannot read Mac paths like `/Users/m/Downloads/...`. Local agents can.

---

## 1. Mission

Prototype a **better hero wave** for muditm.com that:

1. Feels like the **real PS3 XMB silk** — continuous wrapping translucent ribbons with 3D/fold physics  
2. Optionally has **quiet creative flare** (vintage print / morphism) **without** destroying that physics  
3. Has **no floating sparkle particles** (XMB `particles.elf` layer = out of scope)  
4. Is developed **only** in a DialKit playground — **do not change production** `components/PS3Silk.tsx` until Mudit explicitly says to port a winner  

---

## 2. Setup (local)

```bash
git fetch origin cursor/ps3-wave-playground-95f2
git checkout cursor/ps3-wave-playground-95f2
git pull origin cursor/ps3-wave-playground-95f2
npm install   # if needed
npm run dev
```

Open: **http://localhost:3000/dev/ps3-wave-lab**

DialKit panel name: **Vintage Halftone** (top-right). Hard-refresh if dials look stale — persist key is `ps3-vintage-halftone-v5`.

### Reference videos (LOCAL ONLY — attach these in chat)

| File | Use |
| --- | --- |
| `/Users/m/Downloads/videoplayback (2).mp4` | **First ~6 seconds only** — primary XMB reference. Ignore the rest of the video. |
| `/Users/m/Downloads/ps3silk.mp4` | Same family of look, **without** moving sparkly floating particles. |

**Instructions for local agent:** Read / scrub those videos (or extract 1–3 stills from the first 6s). Match continuous ribbon wrap, soft sheet edges, layered depth. Do **not** recreate particle sparkles.

---

## 3. Hard constraints

| Constraint | Detail |
| --- | --- |
| **Production silk frozen** | Do not edit `components/PS3Silk.tsx` behavior for shipping without explicit ask. Lab only: `components/PS3SilkLab.tsx` + `app/dev/ps3-wave-lab/*`. |
| **Dev/preview only** | `/dev/ps3-wave-lab` allowed in `development` and `VERCEL_ENV=preview`. Blocked on production muditm.com. |
| **No sparkles** | No floating particle field. Ribbons/sheets only (+ optional print material). |
| **Elegant, not toy** | Avoid giant cursor size explosions, goo slime defaults, or effects that read as a particle toy. |
| **DialKit must stay visible** | Lab overlay z-index must stay **below** DialKit (`~9999`). Current lab `LAB_Z = 50` + CSS bump for `.dialkit-panel` to `10050`. Do not put a fullscreen layer at `999997` again. |
| **No `next/dynamic` `ssr:false` on lab** | That caused Next DevTools “Bail out to client-side rendering” error overlay. Import `PS3SilkLab` directly from the client page. |
| **Keep production wave math available** | The 8-band one-sided sine stack in production is the known-good ribbon approximation — preserve it as the continuous base. |

---

## 4. What real XMB is (research summary)

Sony’s XMB background is roughly:

1. **`spline.elf`** — continuous translucent ribbon / subdivided mesh (wrapping sheets, soft edges, fresnel-ish lighting)  
2. **`particles.elf`** — separate additive sparkles (we want this **off**)  

The “3D” read comes from **layered sheets that fold and wrap**, not from screening a flat photo into dots.

Community / reverse-engineering notes (for direction, not to copy blindly):

- Subdivided plane / mesh with vertex displacement  
- Layered translucent ribbons + additive blend  
- RetroArch / WebGL recreations treat it as ribbon mesh + optional particles  
- Early FW waves sometimes had lines without particles  

**Production site already approximates (1)** via additive sine bands with one-sided falloff in `PS3Silk.tsx` (halftone mode is a separate look). That continuous path is the physics we must not lose.

---

## 5. What we already tried (and why it failed / succeeded)

| Version | Idea | Verdict |
| --- | --- | --- |
| Early lab | Cursor cell-size / radius bloom on production dots | Too far / subtle but not “creative print” |
| v4 Vintage AM + morph | Wave = coverage plate only; AM dots replace ribbons | **Lost XMB wrap physics** — felt flat/off |
| v5 (current) | Continuous silk base + print as **material** via `silkMix` | **Correct architecture** — tune toward references |

### Current architecture (v5) — keep this shape

```
continuous production-style silk ribbons  (physics / wrap)
        +
halftone print texture mixed on top       (print.silkMix)
        +
optional cursor morph melt                (quiet)
```

- `print.silkMix = 0` → pure continuous XMB-like ribbons  
- `print.silkMix = 1` → dots only (old flat look)  
- Default `0.42` — adjust after watching the videos  

### User-approved DialKit defaults (already in code)

```json
{
  "print.pitch": 4.8,
  "print.screenAngle": 0,
  "print.contrast": 1.1,
  "print.inkSoftness": 0.7,
  "print.inkDensity": 0.44,
  "print.minDot": 0.035,
  "print.inkColor": "#ffffff",
  "print.silkMix": 0.42,
  "morph.enabled": true,
  "morph.strength": 0.7,
  "morph.radius": 0.26,
  "morph.fusion": 0.55,
  "morph.softness": 0.14,
  "morph.overlap": 1.2,
  "morph.lag": 0.055,
  "plate.intensity": 0.18,
  "plate.mouseNudge": 0.11,
  "plate.speed": 1,
  "plate.yOffset": 49,
  "plate.opacity": 0.55
}
```

Persist: `id: "ps3-vintage-halftone-v5"`, key `ps3-vintage-halftone-v5`. Bump to `v6+` if defaults change so stale localStorage doesn’t fight you.

---

## 6. Key files

| Path | Role |
| --- | --- |
| `components/PS3SilkLab.tsx` | Lab WebGL shader + DialKit — **edit here** |
| `app/dev/ps3-wave-lab/page.tsx` | Dev/preview gate |
| `app/dev/ps3-wave-lab/PS3WaveLabClient.tsx` | Fullscreen lab chrome + DialRoot + z-index CSS |
| `components/PS3Silk.tsx` | **Production** hero wave — reference / do not ship-change yet |
| `components/PS3ControlPanel.tsx` | Production in-page PS3 menu (separate from lab) |
| `components/HalftoneDotField.tsx` / `halftoneMask.ts` | Nav goo/morph vocabulary (inspiration only) |

---

## 7. Direction for the next local iteration

### Goal look
Match the **first 6 seconds** of `videoplayback (2).mp4` and the ribbon feel of `ps3silk.mp4` **without sparkles**:

- Continuous flowing sheets / lines that wrap in depth  
- Soft luminous crests, darker valleys  
- Multiple layers drifting at different rates  
- Optional **subtle** print grain that still lets sheets read as sheets  

### Suggested experiments (in order)

1. **Watch references** — extract what makes wrap/depth: layer count, falloff asymmetry, speed, brightness, edge softness.  
2. **Tune `silkMix` downward** (e.g. 0.2–0.35) until wrap matches references; then bring print back carefully.  
3. **Improve continuous silk** if needed (still in lab only): secondary harmonic, slight parallax by layer, fresnel-ish crest boost — stay close to production DNA.  
4. **Print as ridge texture** — prefer dots strengthening crests rather than flattening the whole field into a stamp.  
5. **Morph** stays optional and quiet; if it fights the silk, default `morph.enabled` false.  
6. When Mudit loves a preset: document DialKit JSON + optionally port **only that look** into production `PS3Silk` behind a mode flag.

### Anti-goals
- Replacing ribbons with pure AM screening again  
- Particle sparkle systems  
- Aggressive cursor cell-size warping  
- Editing production hero “just to try something”  
- Recreating the entire XMB UI — **background pattern only**

---

## 8. Related side work (other branches — ignore unless asked)

| Branch / PR | Topic |
| --- | --- |
| `main` | Live site; resume hosted at `/resume.pdf` |
| `cursor/host-resume-95f2` (#16) | Resume self-host (already cherry-picked to main) |
| `cursor/cd-player-entrance-95f2` (#17) | About/modal CD player: opacity fade, no scale-down |

Stay on **`cursor/ps3-wave-playground-95f2`** for wave work.

---

## 9. Prompt starter for the local agent

Copy-paste:

> Read `docs/ps3-wave-lab-handoff.md`. Checkout `cursor/ps3-wave-playground-95f2`, run `npm run dev`, open `/dev/ps3-wave-lab`. I’ve attached `/Users/m/Downloads/videoplayback (2).mp4` (use **only the first 6 seconds**) and `/Users/m/Downloads/ps3silk.mp4` (ribbons **without** sparkles). Improve `PS3SilkLab` so continuous XMB wrapping physics match those refs; keep halftone as an optional material via `silkMix`. Do not edit production `PS3Silk.tsx`. No particle sparkles. Keep DialKit visible. Iterate until the pattern feels like real XMB sheets first, print second.

---

## 10. Success criteria

- [ ] Looking at the lab fullscreen, ribbons clearly **wrap / fold** like the reference (not a flat stamp)  
- [ ] No floating sparkles  
- [ ] DialKit **Vintage Halftone** usable; defaults match Mudit’s JSON (+ `silkMix`)  
- [ ] Production homepage silk unchanged  
- [ ] Mudit can save a DialKit preset he’s willing to consider shipping later  
