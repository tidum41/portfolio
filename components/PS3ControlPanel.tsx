"use client";

import { useEffect, useRef, useState, startTransition, useCallback, useMemo, memo } from "react";
import { createPortal } from "react-dom";
import { useDialKit } from "dialkit";
import { ENTRANCE_DEFAULTS } from "@/lib/motion";

// Module-level: persists across client-side nav, resets on page reload
let _ps3cpHasLoaded = false;

const PANEL_W = 240;
const PILL_W  = 70;
const PILL_H  = 28;
const EDGE_PAD = 10;
const MAX_W   = 1700;
const EXPAND_EASE = "cubic-bezier(0.25, 0, 0, 1)";
// Matches lib/motion.ts's EASE_OPACITY / app/layout.tsx's intro-gate CSS
// (`transition: opacity 0.7s cubic-bezier(.16,1,.3,1)`) — the pill's first-
// load fade now rides the exact same curve/duration nav and footer use, and
// is triggered by the same "intro-done" event (see the posReady effect
// below), instead of an independently-tuned 2s ease-out that finished long
// after everything else had already settled and read as a separate, slower
// reveal bolted onto the page rather than part of it.
const OPEN_EASE  = "cubic-bezier(0.16, 1, 0.3, 1)";
const CLOSE_EASE = "cubic-bezier(0.25, 1, 0.4, 1)";
const FADE_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const FADE_MS = 700;
// This component unmounts whenever the user navigates off "/" (see the
// `isWorkRoute &&` gate in PersistentWorkShell.tsx) and remounts fresh on
// return — unlike PS3Silk/hero/the grid, which stay mounted the whole
// session and are only CSS-hidden. `_ps3cpHasLoaded` (module-level, so it
// survives the unmount) means every return trip takes the "not very first
// load" path below. Matches EntranceItem/hero's own re-entry animation
// (lib/motion.ts's EASE_Y + ENTRANCE_DEFAULTS.duration=0.45s) — used so the
// pill fades back in as part of the same "content sliding back into view"
// moment as everything else on the route, instead of popping in at full
// opacity with zero transition while its neighbors visibly re-enter.
const RETURN_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const RETURN_FADE_MS = 450;
const PICKER_MAX_H = 125;
const BODY_H = 620;

const POS_KEY         = "ps3cp_pos";
const WAVE_COLOR_KEY  = "ps3cp_wave_color";
const MODE_KEY        = "ps3cp_mode";

const DEFAULT_INTENSITY_HT = 0.18; // halftone mode default
const DEFAULT_INTENSITY_WV = 0.04; // wave mode default
const DEFAULT_MOUSE_STR    = 0.11;
const DEFAULT_YOFFSET      = 49;
const DEFAULT_WAVE_COLOR: [number, number, number] = [1, 1, 1];
const DEFAULT_MODE         = 1;
const DEFAULT_HALFTONE_SIZE = 3.0;
const DEFAULT_SPEED        = 1.0;
// First-pick intensity for any colored preset (index >= 1 in PRESETS below —
// index 0 is the white/"no color" swatch and keeps using DEFAULT_INTENSITY_HT/WV
// above). Only applied the first time a given preset is picked in a given
// mode; after that, whatever intensity was last active for that preset+mode
// (default or user-adjusted) is what's remembered — see presetIntensity state.
const PRESET_INTENSITY_HT = 0.33;
const PRESET_INTENSITY_WV = 0.16;

const PRESETS = [
  { swatch: "#CBCBCB", wave: [1.0, 1.0, 1.0] as [number,number,number] },
  { swatch: "#D8BF1A", wave: [0.85, 0.75, 0.1] as [number,number,number] },
  { swatch: "#6DB217", wave: [0.43, 0.7, 0.09] as [number,number,number] },
  { swatch: "#E17E9A", wave: [0.88, 0.49, 0.6] as [number,number,number] },
  { swatch: "#178816", wave: [0.09, 0.53, 0.09] as [number,number,number] },
  { swatch: "#9A61C8", wave: [0.6, 0.38, 0.78] as [number,number,number] },
  { swatch: "#02CDC7", wave: [0.01, 0.8, 0.78] as [number,number,number] },
  { swatch: "#0C76C0", wave: [0.05, 0.46, 0.75] as [number,number,number] },
  { swatch: "#B444C0", wave: [0.71, 0.27, 0.75] as [number,number,number] },
  { swatch: "#E5A708", wave: [0.9, 0.65, 0.03] as [number,number,number] },
  { swatch: "#875B1E", wave: [0.53, 0.36, 0.12] as [number,number,number] },
  { swatch: "#E3412A", wave: [0.89, 0.25, 0.16] as [number,number,number] },
];

// ── Persistence ────────────────────────────────────────────────────────────
function readWaveColor(): [number,number,number] { try { const r = sessionStorage.getItem(WAVE_COLOR_KEY); return r ? JSON.parse(r) : DEFAULT_WAVE_COLOR; } catch { return DEFAULT_WAVE_COLOR; } }
function saveWaveColor(c: [number,number,number]) { try { sessionStorage.setItem(WAVE_COLOR_KEY, JSON.stringify(c)); } catch {} }
function readMode() { try { const r = sessionStorage.getItem(MODE_KEY); return r !== null ? parseInt(r, 10) : DEFAULT_MODE; } catch { return DEFAULT_MODE; } }
function saveMode(m: number) { try { sessionStorage.setItem(MODE_KEY, String(m)); } catch {} }
function readSavedPos() { try { const r = sessionStorage.getItem(POS_KEY); return r ? JSON.parse(r) : null; } catch { return null; } }
function savePos(pos: {x:number;y:number}) { try { sessionStorage.setItem(POS_KEY, JSON.stringify(pos)); } catch {} }

// Anchors the pill under the "currently @ JOOLA..." hero line, left-aligned
// to it at every breakpoint (found via its JOOLA link, since the <p> itself
// has no stable selector) — that line is an unconstrained-width flex sibling
// of the heading, so its own left edge already equals the page's real left
// content edge (page-px in from the true left, whatever --grid-max-w's
// centering margin is at the current width). Same rule from mobile straight
// through desktop — instead of the old nav-row-relative logic (docking after
// "about", or falling back to raw viewport math, or an even earlier version
// that mirrored to the *right* edge above the mobile breakpoint), which
// routinely lost that margin or put the pill on the wrong side entirely.
function computeHeroAlignedPos(): {x:number;y:number} | null {
  if (typeof window === "undefined") return null;
  const joolaLink = document.querySelector<HTMLElement>('a[href="https://joola.com"]');
  const heroP = joolaLink?.closest("p");
  if (!heroP) return null;
  const r = heroP.getBoundingClientRect();
  return {
    x: Math.round(r.left + window.scrollX),
    y: Math.round(r.bottom + 16 + window.scrollY),
  };
}

function computeNavAlignedPos(): {x:number;y:number} | null {
  return computeHeroAlignedPos();
}

function shouldFlip(pillY: number) {
  if (typeof window === "undefined") return false;
  const vy = pillY - window.scrollY;
  const spaceBelow = window.innerHeight - (vy + PILL_H) - EDGE_PAD * 2;
  const spaceAbove = vy - EDGE_PAD * 2;
  return spaceBelow < 420 && spaceAbove > spaceBelow;
}

function getGeometry(pillPos: {x:number;y:number}, isOpen: boolean, flipped: boolean) {
  if (typeof window === "undefined") return { w: PILL_W, maxH: PILL_H, r: PILL_H / 2, left: 0, top: 0, clampedBodyH: BODY_H };
  const docW = document.documentElement.scrollWidth;
  const viewportH = window.innerHeight;
  const vy = pillPos.y - window.scrollY;

  const spaceBelow = Math.max(100, viewportH - (vy + PILL_H) - EDGE_PAD * 2);
  const spaceAbove = Math.max(100, vy - EDGE_PAD * 2);
  const availH = flipped ? spaceAbove : spaceBelow;
  const clampedBodyH = Math.max(140, Math.min(BODY_H, Math.floor(availH)));

  const w = isOpen ? PANEL_W : PILL_W;
  const maxH = isOpen ? PILL_H + clampedBodyH : PILL_H;
  const r = isOpen ? 14 : 8;

  const targetLeft = pillPos.x;
  const left = Math.max(EDGE_PAD, Math.min(targetLeft, docW - w - (isOpen ? EDGE_PAD : 0)));
  const top = flipped && isOpen
    ? Math.max(EDGE_PAD, pillPos.y + PILL_H - maxH)
    : Math.max(EDGE_PAD, pillPos.y);

  return { w, maxH, r, left, top, clampedBodyH };
}

// ── Color math ─────────────────────────────────────────────────────────────
function rgbToHex(rgb: [number,number,number]) {
  return "#" + rgb.map(v => Math.round(v * 255).toString(16).padStart(2, "0")).join("");
}
function hexToRgb01(hex: string): [number,number,number] {
  const c = (hex || "").replace("#", "");
  const full = c.length === 3 ? c.split("").map(x => x + x).join("") : c;
  if (full.length < 6) return [1, 1, 1];
  return [parseInt(full.slice(0,2),16)/255, parseInt(full.slice(2,4),16)/255, parseInt(full.slice(4,6),16)/255];
}
function hexToHsl(hex: string): [number,number,number] {
  const c = (hex || "#000000").replace("#", "");
  if (c.length < 6) return [0, 100, 50];
  const r = parseInt(c.slice(0,2),16)/255, g = parseInt(c.slice(2,4),16)/255, b = parseInt(c.slice(4,6),16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h * 360, s * 100, l * 100];
}
function hslToHex(h: number, s: number, l: number) {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toB = (x: number) => Math.round(x * 255).toString(16).padStart(2, "0");
  return "#" + toB(f(0)) + toB(f(8)) + toB(f(4));
}

function preventTextSelect(e?: React.PointerEvent) {
  if (e) { try { e.preventDefault(); } catch {} }
  try { window.getSelection()?.removeAllRanges(); } catch {}
  if (typeof document !== "undefined") {
    document.body.style.userSelect = "none";
    (document.body.style as { webkitUserSelect?: string }).webkitUserSelect = "none";
  }
}

function restoreTextSelect() {
  if (typeof document !== "undefined") {
    document.body.style.userSelect = "";
    (document.body.style as { webkitUserSelect?: string }).webkitUserSelect = "";
  }
}

// ── Minimal Design-Engineer Custom Slider ────────────────────────────────────
const Slider = memo(function Slider({
  min, max, step, value, onChange, label, isDark
}: {
  min: number; max: number; step: number; value: number;
  onChange: (v: number) => void; label: string; isDark: boolean;
}) {
  const [isHovered, setIsHovered]   = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef                    = useRef<HTMLDivElement>(null);

  const clamp = useCallback((v: number) => Math.max(min, Math.min(max, v)), [min, max]);

  const valueFromClientX = useCallback((clientX: number) => {
    const el = trackRef.current;
    if (!el) return value;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return value;
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const raw = min + pct * (max - min);
    const stepped = Math.round(raw / step) * step;
    return clamp(Number(stepped.toFixed(4)));
  }, [min, max, step, value, clamp]);

  const active = isHovered || isDragging;
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  const trackBg   = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)";
  const filledBg  = active
    ? (isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.78)")
    : (isDark ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.40)");
  const thumbColor = active
    ? (isDark ? "rgba(255,255,255,0.95)" : "rgba(0,0,0,0.90)")
    : (isDark ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.65)");

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      tabIndex={0}
      className="ps3cp-slider-track"
      style={{
        position: "relative",
        height: 24,
        display: "flex",
        alignItems: "center",
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        cursor: "pointer",
      } as React.CSSProperties}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      onPointerDown={e => {
        e.stopPropagation();
        preventTextSelect(e);
        setIsDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
        onChange(valueFromClientX(e.clientX));
      }}
      onPointerMove={e => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
        preventTextSelect(e);
        onChange(valueFromClientX(e.clientX));
      }}
      onPointerUp={e => {
        setIsDragging(false);
        restoreTextSelect();
        try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
      }}
      onPointerCancel={e => {
        setIsDragging(false);
        restoreTextSelect();
        try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
      }}
      onKeyDown={e => {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); onChange(clamp(value + step)); }
        else if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); onChange(clamp(value - step)); }
        else if (e.key === "Home") { e.preventDefault(); onChange(min); }
        else if (e.key === "End") { e.preventDefault(); onChange(max); }
      }}
    >
      <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 2, transform: "translateY(-50%)", borderRadius: 1, pointerEvents: "none", background: trackBg }} />
      <div style={{ position: "absolute", left: 0, width: `${pct}%`, top: "50%", height: 2, transform: "translateY(-50%)", borderRadius: 1, pointerEvents: "none", background: filledBg, transition: "background-color 150ms cubic-bezier(0.23, 1, 0.32, 1)" }} />
      <div style={{ position: "absolute", top: "50%", left: `${pct}%`, width: active ? 6 : 5, height: active ? 16 : 14, borderRadius: 2, backgroundColor: thumbColor, boxShadow: isDark ? "0 1px 3px rgba(0,0,0,0.5)" : "0 1px 3px rgba(0,0,0,0.2)", transform: `translate(-50%, -50%) scale(${isDragging ? 0.94 : 1})`, pointerEvents: "none", transition: "width 140ms cubic-bezier(0.23, 1, 0.32, 1), height 140ms cubic-bezier(0.23, 1, 0.32, 1), transform 140ms cubic-bezier(0.23, 1, 0.32, 1), background-color 150ms ease" }} />
    </div>
  );
});

// ── Icons ──────────────────────────────────────────────────────────────────
function ChevronDown({ size = 10, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", flexShrink: 0 }} aria-hidden><polyline points="6 9 12 15 18 9" /></svg>;
}
function Minus({ size = 11 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden><line x1="5" y1="12" x2="19" y2="12" /></svg>;
}
function Reset({ size = 11 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>;
}
function Plus({ size = 9, color = "currentColor" }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", flexShrink: 0 }} aria-hidden><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
}
function PS3TriangleGlyph({ size = 9, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", flexShrink: 0 }} aria-hidden><polygon points="12 3 22 21 2 21" /></svg>;
}
function PS3CircleGlyph({ size = 9, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", flexShrink: 0 }} aria-hidden><circle cx="12" cy="12" r="9" /></svg>;
}

// ── Expand/collapse section ─────────────────────────────────────────────────
function ExpandSection({ open, maxH, children }: { open: boolean; maxH: number; children: React.ReactNode }) {
  return (
    <div style={{
      maxHeight: open ? maxH : 0, overflow: "hidden",
      opacity: open ? 1 : 0,
      transition: open
        ? `max-height 180ms ${OPEN_EASE}, opacity 140ms ease`
        : `max-height 280ms ${CLOSE_EASE}, opacity 180ms ease`,
      pointerEvents: open ? "auto" : "none",
    }}>
      {children}
    </div>
  );
}

// ── Color picker (Minimal, Pixel-Perfect Canvas + Hue Track) ────────────────
const PS3ColorPicker = memo(function PS3ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  const svRef       = useRef<HTMLDivElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const hueRef      = useRef<HTMLDivElement>(null);
  const isSvDrag    = useRef(false);
  const isHueDrag   = useRef(false);

  const [hsl, setHsl] = useState<[number,number,number]>(() => hexToHsl(value || "#999999"));

  useEffect(() => { if (value) { setHsl(hexToHsl(value)); } }, [value]);

  const drawCanvas = useCallback((hue: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    if (!W || !H) return;
    const wg = ctx.createLinearGradient(0, 0, W, 0);
    wg.addColorStop(0, "rgba(255,255,255,1)");
    wg.addColorStop(1, `hsl(${hue},100%,50%)`);
    ctx.fillStyle = wg; ctx.fillRect(0, 0, W, H);
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "transparent"); bg.addColorStop(1, "#000");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current, wrap = svRef.current;
    if (!canvas || !wrap || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      const rect = wrap.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = Math.round(rect.width); canvas.height = Math.round(rect.height);
        drawCanvas(hsl[0]);
      }
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []); // eslint-disable-line

  useEffect(() => { drawCanvas(hsl[0]); }, [hsl[0], drawCanvas]);

  const applySV = useCallback((x: number, y: number, hue: number) => {
    const sat = Math.max(0, Math.min(1, x)), val = Math.max(0, Math.min(1, y));
    const L = val * (1 - sat / 2);
    const S = L === 0 || L === 1 ? 0 : (val - L) / Math.min(L, 1 - L);
    const newHsl: [number,number,number] = [hue, S * 100, L * 100];
    setHsl(newHsl);
    onChange(hslToHex(newHsl[0], newHsl[1], newHsl[2]));
  }, [onChange]);

  const applyHueFromClientX = useCallback((clientX: number) => {
    const el = hueRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pad = 7;
    const availW = Math.max(1, rect.width - pad * 2);
    const pct = Math.max(0, Math.min(1, (clientX - rect.left - pad) / availW));
    const newHue = Math.round(pct * 360);
    const newHsl: [number,number,number] = [newHue, hsl[1], hsl[2]];
    setHsl(newHsl);
    drawCanvas(newHue);
    onChange(hslToHex(newHue, hsl[1], hsl[2]));
  }, [hsl, drawCanvas, onChange]);

  const getSVFromCanvas = useCallback((e: React.PointerEvent) => {
    const rect = svRef.current!.getBoundingClientRect();
    return [
      Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height)),
    ] as [number, number];
  }, []);

  const { svX, svY } = useMemo(() => {
    const [, s, l] = hsl;
    const sn = s / 100, ln = l / 100;
    const v = ln + sn * Math.min(ln, 1 - ln);
    const sv_s = v === 0 ? 0 : 2 * (1 - ln / v);
    return { svX: sv_s * 100, svY: (1 - v) * 100 };
  }, [hsl]);

  const huePct = Math.max(0, Math.min(100, (hsl[0] / 360) * 100));

  return (
    <div onPointerDown={e => e.stopPropagation()} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
      {/* SV Canvas */}
      <div ref={svRef} style={{ position: "relative", width: "100%", height: 86, borderRadius: 5, overflow: "hidden", touchAction: "none", cursor: "crosshair", userSelect: "none", WebkitUserSelect: "none" } as React.CSSProperties}
        onPointerDown={e => { preventTextSelect(e); isSvDrag.current = true; e.currentTarget.setPointerCapture(e.pointerId); applySV(...getSVFromCanvas(e), hsl[0]); }}
        onPointerMove={e => { if (!isSvDrag.current) return; preventTextSelect(e); applySV(...getSVFromCanvas(e), hsl[0]); }}
        onPointerUp={e => { isSvDrag.current = false; restoreTextSelect(); try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {} }}
        onPointerCancel={e => { isSvDrag.current = false; restoreTextSelect(); try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {} }}
      >
        <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
        <div style={{ position: "absolute", left: `${svX}%`, top: `${svY}%`, width: 12, height: 12, borderRadius: "50%", border: "2px solid #ffffff", boxShadow: "0 0 0 1px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3)", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />
      </div>

      {/* Custom Precision Hue Rail (Zero Clipping) */}
      <div
        ref={hueRef}
        style={{
          position: "relative",
          width: "100%",
          height: 12,
          borderRadius: 6,
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
          cursor: "pointer",
          background: "linear-gradient(to right, hsl(0,95%,52%), hsl(30,95%,52%), hsl(60,95%,52%), hsl(90,95%,52%), hsl(120,95%,52%), hsl(150,95%,52%), hsl(180,95%,52%), hsl(210,95%,52%), hsl(240,95%,52%), hsl(270,95%,52%), hsl(300,95%,52%), hsl(330,95%,52%), hsl(360,95%,52%))",
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12)",
        } as React.CSSProperties}
        onPointerDown={e => {
          preventTextSelect(e);
          isHueDrag.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          applyHueFromClientX(e.clientX);
        }}
        onPointerMove={e => {
          if (!isHueDrag.current) return;
          preventTextSelect(e);
          applyHueFromClientX(e.clientX);
        }}
        onPointerUp={e => {
          isHueDrag.current = false;
          restoreTextSelect();
          try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
        }}
        onPointerCancel={e => {
          isHueDrag.current = false;
          try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
        }}
      >
        <div style={{
          position: "absolute",
          top: "50%",
          left: `calc(7px + (${huePct} / 100) * (100% - 14px))`,
          width: 14,
          height: 14,
          borderRadius: "50%",
          backgroundColor: "#ffffff",
          border: "2px solid #ffffff",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.35), 0 1px 4px rgba(0,0,0,0.25)",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          transition: "left 40ms linear",
        }} />
      </div>
    </div>
  );
});

// ── CSS injected once ───────────────────────────────────────────────────────
const PANEL_CSS = `
.ps3cp,.ps3cp * { cursor: none !important; }
.ps3cp input[type=range] { -webkit-appearance:none;appearance:none;width:100%;height:28px;background:transparent!important;margin:0;padding:0;box-sizing:border-box;touch-action:none; }
.ps3cp input[type=range]::-webkit-slider-runnable-track { height:2px;border-radius:1px;background:transparent; }
.ps3cp input[type=range]::-webkit-slider-thumb { -webkit-appearance:none;width:5px;height:14px;border-radius:2px;background:rgba(0,0,0,0.65);margin-top:-4px; }
html[data-theme=dark] .ps3cp input[type=range]::-webkit-slider-thumb { background:rgba(255,255,255,0.72); }
.ps3cp input[type=range]::-moz-range-track { height:2px;border-radius:1px;background:transparent; }
.ps3cp input[type=range]::-moz-range-thumb { width:5px;height:14px;border-radius:2px;background:rgba(0,0,0,0.65);border:none;margin-top:-4px; }
html[data-theme=dark] .ps3cp input[type=range]::-moz-range-thumb { background:rgba(255,255,255,0.72); }
.ps3cp input[type=range]:focus-visible { outline: 2px solid rgba(0,0,0,0.65); outline-offset: 2px; }
html[data-theme=dark] .ps3cp input[type=range]:focus-visible { outline-color: rgba(255,255,255,0.72); }
.ps3cp-slider-track:focus-visible { outline: 2px solid rgba(0,0,0,0.65); outline-offset: 4px; border-radius: 2px; }
html[data-theme=dark] .ps3cp-slider-track:focus-visible { outline-color: rgba(255,255,255,0.72); }
.ps3cp-header:focus-visible { outline: 2px solid rgba(0,0,0,0.65); outline-offset: -3px; border-radius: 999px; }
html[data-theme=dark] .ps3cp-header:focus-visible { outline-color: rgba(255,255,255,0.72); }
.ps3cp-ibtn { display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:6px;border:none;background:none;color:rgba(0,0,0,0.28);padding:0;transition:color 120ms ease,transform 120ms ease;position:relative; }
.ps3cp-ibtn::before { content:"";position:absolute;inset:-8px; }
.ps3cp-ibtn:hover { color:rgba(0,0,0,0.55); }
.ps3cp-ibtn:active { transform:scale(0.96); }
.ps3cp-swatch-btn { position:relative;border:none;padding:0;transition:transform 140ms cubic-bezier(0.23, 1, 0.32, 1),box-shadow 140ms cubic-bezier(0.23, 1, 0.32, 1); }
.ps3cp-swatch-btn::before { content:"";position:absolute;inset:-4px; }
.ps3cp-swatch-btn:active { transform:scale(0.92)!important; }
.ps3cp-swatch-btn:focus-visible { outline: 2px solid rgba(0,0,0,0.65); outline-offset: 2px; }
html[data-theme=dark] .ps3cp-swatch-btn:focus-visible { outline-color: rgba(255,255,255,0.72); }
.ps3cp-mode-btn { transition:background 120ms ease,color 120ms ease,transform 120ms ease; }
.ps3cp-mode-btn:hover { background:rgba(0,0,0,0.07)!important; }
.ps3cp-mode-btn:active { transform:scale(0.96); }
.ps3cp-color-swatch { transition:transform 120ms ease,box-shadow 120ms ease,border-color 120ms ease;cursor:pointer; }
.ps3cp-color-swatch:active { transform:scale(0.96)!important; }
.ps3cp-color-swatch:focus-visible { outline: 2px solid rgba(0,0,0,0.65); outline-offset: 2px; }
html[data-theme=dark] .ps3cp-color-swatch:focus-visible { outline-color: rgba(255,255,255,0.72); }
`;

export default function PS3ControlPanel({ visible = true }: { visible?: boolean }) {
  const dk = useDialKit("PS3 Pill", {
    chevronOffset:  [-1.5, -4, 4, 0.5],
    pillGap:        [4,    2, 10, 0.5],
    menuTextOffset: [-3.5, -4, 4, 0.5],
  });

  const panelRef       = useRef<HTMLDivElement>(null);
  const headerRef      = useRef<HTMLDivElement>(null);
  const dragRef        = useRef<{startX:number;startY:number;origX:number;origY:number} | null>(null);
  const didDragRef     = useRef(false);
  const dragStartedRef = useRef(false);
  const dragInHeaderRef = useRef(false);

  const isVeryFirstLoad = useRef(!_ps3cpHasLoaded);
  const savedPos        = useRef<{x:number;y:number} | null>(typeof window !== "undefined" ? readSavedPos() : null);
  const hasDraggedRef   = useRef(savedPos.current !== null);
  const revealKindRef   = useRef<"first" | "return">("first");

  const [portalEl, setPortalEl]         = useState<HTMLElement | null>(null);
  const [pillPos, setPillPos]           = useState(savedPos.current ?? { x: 0, y: 0 });
  const [posReady, setPosReady]         = useState(savedPos.current !== null);
  const [isOpen, setIsOpen]             = useState(false);
  const [flipped, setFlipped]           = useState(false);
  const [isDragging, setIsDragging]     = useState(false);
  const [shown, setShown]               = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [positionSettled, setPositionSettled] = useState(
    savedPos.current !== null && !isVeryFirstLoad.current
  );

  const [intensityHt,  setIntensityHt]  = useState(DEFAULT_INTENSITY_HT);
  const [intensityWv,  setIntensityWv]  = useState(DEFAULT_INTENSITY_WV);
  const [presetIntensity, setPresetIntensity] = useState<Record<string, number>>({});
  const [mouseStr,     setMouseStr]     = useState(DEFAULT_MOUSE_STR);
  const [yOffset,      setYOffset]      = useState(DEFAULT_YOFFSET);
  const [waveColor,    setWaveColor]    = useState<[number,number,number]>(() =>
    typeof window !== "undefined" ? readWaveColor() : DEFAULT_WAVE_COLOR
  );
  const [mode,         setMode]         = useState(() =>
    typeof window !== "undefined" ? readMode() : DEFAULT_MODE
  );
  const [halftoneSize, setHalftoneSize] = useState(DEFAULT_HALFTONE_SIZE);
  const [speed,        setSpeed]        = useState(DEFAULT_SPEED);
  const intensity = mode === 1 ? intensityHt : intensityWv;

  const [isDark, setIsDark] = useState(() =>
    typeof window !== "undefined" ? document.documentElement.getAttribute("data-theme") === "dark" : true
  );
  const [openColorPicker, setOpenColorPicker] = useState<"pattern"|null>(null);

  // Portal setup — UI is portaled to document.body, so parent display:none
  // on PersistentWorkShell cannot hide it. `visible` gates that host node.
  useEffect(() => {
    const el = document.createElement("div");
    el.id = "ps3cp-portal";
    el.style.fontFamily = getComputedStyle(document.body).fontFamily;
    document.body.appendChild(el);
    setPortalEl(el);
    return () => { try { el.remove(); } catch {} };
  }, []);

  useEffect(() => {
    if (!portalEl) return;
    portalEl.style.display = visible ? "" : "none";
    portalEl.setAttribute("aria-hidden", visible ? "false" : "true");
    if (!visible) {
      startTransition(() => setIsOpen(false));
    }
  }, [portalEl, visible]);

  // Inject CSS once
  useEffect(() => {
    if (document.getElementById("ps3cp-styles")) return;
    const el = document.createElement("style");
    el.id = "ps3cp-styles"; el.textContent = PANEL_CSS;
    document.head.appendChild(el);
    return () => { try { el.remove(); } catch {} };
  }, []);

  // Push persisted wave color + mode (+ correct default intensity) to PS3Silk on mount
  useEffect(() => {
    const storedColor = readWaveColor();
    const storedMode  = readMode();
    const initIntensity = storedMode === 1 ? DEFAULT_INTENSITY_HT : DEFAULT_INTENSITY_WV;
    window.dispatchEvent(new CustomEvent("ps3-update", {
      detail: { waveColor: storedColor, mode: storedMode, intensity: initIntensity },
    }));
  }, []);

  // Sync mode from canvas click — defer to avoid setState-during-render
  useEffect(() => {
    const h = (e: Event) => {
      const newMode = (e as CustomEvent).detail.mode;
      setTimeout(() => { startTransition(() => setMode(newMode)); saveMode(newMode); }, 0);
    };
    window.addEventListener("ps3-mode-sync", h);
    return () => window.removeEventListener("ps3-mode-sync", h);
  }, []);

  // Find nav-aligned position
  useEffect(() => {
    if (savedPos.current) return;
    const findAndPlace = (attempt: number) => {
      const pos = computeNavAlignedPos();
      if (pos) {
        startTransition(() => { setPillPos(pos); setFlipped(shouldFlip(pos.y)); setPosReady(true); });
        return;
      }
      if (attempt < 15) { setTimeout(() => findAndPlace(attempt + 1), 150); return; }
      const w = window.innerWidth, cl = w > MAX_W ? (w - MAX_W) / 2 : 0;
      startTransition(() => { setPillPos({ x: cl + window.scrollX + EDGE_PAD, y: EDGE_PAD + window.scrollY }); setFlipped(false); setPosReady(true); });
    };
    setTimeout(() => findAndPlace(0), 200);
  }, []);

  // Reposition on resize (unless user has dragged)
  useEffect(() => {
    const onResize = () => {
      if (hasDraggedRef.current) return;
      const pos = computeNavAlignedPos();
      if (!pos) return;
      startTransition(() => { setPillPos(pos); setFlipped(shouldFlip(pos.y)); });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // posReady: handle show timing
  useEffect(() => {
    if (!posReady) return;
    if (!isVeryFirstLoad.current) {
      revealKindRef.current = "return";
      startTransition(() => setShowTransition(true));
      requestAnimationFrame(() => requestAnimationFrame(() => startTransition(() => {
        setShown(true); setPositionSettled(true);
      })));
      setTimeout(() => startTransition(() => setShowTransition(false)), RETURN_FADE_MS + 200);
      return;
    }
    revealKindRef.current = "first";
    function reveal() {
      startTransition(() => setShowTransition(true));
      requestAnimationFrame(() => requestAnimationFrame(() => startTransition(() => {
        setShown(true); setPositionSettled(true);
      })));
      setTimeout(() => startTransition(() => setShowTransition(false)), FADE_MS + 200);
      _ps3cpHasLoaded = true;
    }
    if (!document.documentElement.hasAttribute("data-intro")) {
      reveal();
      return;
    }
    window.addEventListener("intro-done", reveal, { once: true });
    return () => window.removeEventListener("intro-done", reveal);
  }, [posReady]);

  // Sync dark mode from html[data-theme]
  useEffect(() => {
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e: PointerEvent) => {
      if (panelRef.current?.contains(e.target as Node)) return;
      e.stopPropagation(); e.preventDefault();
      startTransition(() => setIsOpen(false));
    };
    document.addEventListener("pointerdown", handleOutside, true);
    return () => document.removeEventListener("pointerdown", handleOutside, true);
  }, [isOpen]);

  // Dispatch helper
  const dispatch = useCallback((patch: Record<string, unknown>) => {
    window.dispatchEvent(new CustomEvent("ps3-update", { detail: patch }));
  }, []);

  function setAndDispatch(patch: {
    waveColor?: [number,number,number]; mode?: number; intensity?: number;
    mouseStrength?: number; yOffset?: number; halftoneSize?: number; speed?: number;
  }) {
    if (patch.intensity !== undefined) {
      if (mode === 1) startTransition(() => setIntensityHt(patch.intensity!));
      else            startTransition(() => setIntensityWv(patch.intensity!));
    }
    if (patch.mouseStrength !== undefined) startTransition(() => setMouseStr(patch.mouseStrength!));
    if (patch.yOffset       !== undefined) startTransition(() => setYOffset(patch.yOffset!));
    if (patch.halftoneSize  !== undefined) startTransition(() => setHalftoneSize(patch.halftoneSize!));
    if (patch.speed         !== undefined) startTransition(() => setSpeed(patch.speed!));
    if (patch.waveColor     !== undefined) { startTransition(() => setWaveColor(patch.waveColor!)); saveWaveColor(patch.waveColor!); }
    if (patch.mode          !== undefined) { startTransition(() => setMode(patch.mode!)); saveMode(patch.mode!); }
    const payload: Record<string, unknown> = { ...patch as Record<string, unknown> };
    if (patch.mode !== undefined && patch.intensity === undefined) {
      payload.intensity = patch.mode === 1 ? intensityHt : intensityWv;
    }
    dispatch(payload);
  }

  function handleReset(e: React.MouseEvent) {
    e.stopPropagation();
    startTransition(() => { setIntensityHt(DEFAULT_INTENSITY_HT); setIntensityWv(DEFAULT_INTENSITY_WV); });
    setAndDispatch({ intensity: DEFAULT_MODE === 1 ? DEFAULT_INTENSITY_HT : DEFAULT_INTENSITY_WV, mouseStrength: DEFAULT_MOUSE_STR, yOffset: DEFAULT_YOFFSET, waveColor: DEFAULT_WAVE_COLOR, mode: DEFAULT_MODE, halftoneSize: DEFAULT_HALFTONE_SIZE, speed: DEFAULT_SPEED });
    setOpenColorPicker(null);
  }

  // Drag logic
  const startDrag = useCallback((e: React.PointerEvent) => {
    if ((e.target as Element).closest("button, label, input")) return;
    didDragRef.current = false; dragStartedRef.current = true;
    dragInHeaderRef.current = headerRef.current?.contains(e.target as Node) ?? false;
    dragRef.current = { startX: e.pageX, startY: e.pageY, origX: pillPos.x, origY: pillPos.y };
    startTransition(() => setIsDragging(true));
  }, [pillPos]);

  useEffect(() => {
    if (!isDragging && !dragStartedRef.current) return;
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current) return;
      const dx = e.pageX - dragRef.current.startX, dy = e.pageY - dragRef.current.startY;
      if (Math.abs(dx) + Math.abs(dy) > 4) didDragRef.current = true;
      if (!didDragRef.current) return;
      const docW = document.documentElement.scrollWidth, docH = document.documentElement.scrollHeight;
      const cw = isOpen ? PANEL_W : PILL_W;
      const dragged = {
        x: Math.max(EDGE_PAD, Math.min(dragRef.current.origX + dx, docW - cw - EDGE_PAD)),
        y: Math.max(EDGE_PAD, Math.min(dragRef.current.origY + dy, docH - PILL_H - EDGE_PAD)),
      };
      savePos(dragged); hasDraggedRef.current = true;
      startTransition(() => setPillPos(dragged));
    };
    const onUp = () => {
      if (!dragStartedRef.current) return;
      dragStartedRef.current = false; startTransition(() => setIsDragging(false));
      const wasDrag = didDragRef.current, wasHeader = dragInHeaderRef.current;
      dragRef.current = null; didDragRef.current = false; dragInHeaderRef.current = false;
      if (wasDrag) return;
      if (!wasHeader) return;
      if (isOpen) startTransition(() => setIsOpen(false));
      else startTransition(() => { setFlipped(shouldFlip(pillPos.y)); setIsOpen(true); });
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
  }, [isDragging, isOpen, pillPos.y]);

  const dur = isOpen ? `180ms ${OPEN_EASE}` : `300ms ${CLOSE_EASE}`;
  const baseMorphParts = [
    `width ${dur}`, `height ${dur}`, `max-height ${dur}`, `border-radius ${dur}`,
    `left ${dur}`, `top ${dur}`, "background-color 300ms ease", "border-color 300ms ease",
  ];
  const fadeMs   = revealKindRef.current === "return" ? RETURN_FADE_MS : FADE_MS;
  const fadeEase = revealKindRef.current === "return" ? RETURN_EASE   : FADE_EASE;
  const slideY = revealKindRef.current === "return" ? ENTRANCE_DEFAULTS.y : 0;
  const morphT = !positionSettled ? "none" : isDragging ? "none" : !shown
    ? (showTransition ? `opacity ${fadeMs}ms ${fadeEase}, transform ${fadeMs}ms ${fadeEase}` : "none")
    : (showTransition ? [...baseMorphParts, `opacity ${fadeMs}ms ${fadeEase}, transform ${fadeMs}ms ${fadeEase}`].join(", ") : baseMorphParts.join(", "));

  const geo = getGeometry(pillPos, isOpen, flipped);

  const isDefaultWave = waveColor[0] > 0.9 && waveColor[1] > 0.9 && waveColor[2] > 0.9;
  const wr = Math.round(waveColor[0] * 255), wg = Math.round(waveColor[1] * 255), wb = Math.round(waveColor[2] * 255);
  const tintAmt = isDefaultWave ? 0 : 0.06;
  const [baseBgR, baseBgG, baseBgB] = isDark ? [20, 20, 20] : [252, 252, 252];
  const bgR = Math.round(baseBgR * (1 - tintAmt) + wr * tintAmt);
  const bgG = Math.round(baseBgG * (1 - tintAmt) + wg * tintAmt);
  const bgB = Math.round(baseBgB * (1 - tintAmt) + wb * tintAmt);
  const pillBg     = `rgba(${bgR},${bgG},${bgB},${isDark ? "0.93" : "0.82"})`;
  const pillBorder = isDark
    ? "rgba(255,255,255,0.14)"
    : (isDefaultWave ? "rgba(0,0,0,0.28)" : `rgba(${Math.round(wr*0.3)},${Math.round(wg*0.3)},${Math.round(wb*0.3)},0.32)`);
  const pillShadow = isDark
    ? "inset 0 1px 0 rgba(255,255,255,0.10)"
    : "inset 0 1px 0 rgba(255,255,255,0.60)";
  const accentCol  = isDark ? "rgba(255,255,255,0.62)" : "rgba(0,0,0,0.62)";

  const activePreset = PRESETS.findIndex(p => p.wave.every((v, i) => Math.abs(v - waveColor[i]) < 0.015));

  const pickPreset = (i: number) => {
    const preset = PRESETS[i];
    if (i === 0) { setAndDispatch({ waveColor: preset.wave }); return; }
    const key = `${mode}:${i}`;
    const remembered = presetIntensity[key];
    const nextIntensity = remembered ?? (mode === 1 ? PRESET_INTENSITY_HT : PRESET_INTENSITY_WV);
    if (remembered === undefined) {
      setPresetIntensity(prev => ({ ...prev, [key]: nextIntensity }));
    }
    setAndDispatch({ waveColor: preset.wave, intensity: nextIntensity });
  };

  const labelSt: React.CSSProperties = { fontSize: 11, fontWeight: 500, color: isDark ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.50)", letterSpacing: "0.01em" };
  const valueSt: React.CSSProperties = { fontSize: 10.5, fontVariantNumeric: "tabular-nums", color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)", fontFamily: "monospace" };
  const rowSt: React.CSSProperties   = { display: "flex", flexDirection: "column", gap: 2 };
  const rowH: React.CSSProperties    = { display: "flex", alignItems: "center", justifyContent: "space-between" };
  const secPad = "4px 16px 6px";

  const isColorLight = (waveColor[0]*0.299 + waveColor[1]*0.587 + waveColor[2]*0.114) > 0.5;

  const panelMarkup = (
    <div ref={panelRef} className="ps3cp intro-hide" style={{
      position: "absolute", left: geo.left, top: geo.top,
      width: geo.w, height: "auto", maxHeight: geo.maxH, borderRadius: geo.r,
      overflow: "hidden", zIndex: 49,
      transition: morphT,
      backgroundColor: pillBg,
      backdropFilter: "blur(28px) saturate(180%)",
      WebkitBackdropFilter: "blur(28px) saturate(180%)",
      border: `1px solid ${pillBorder}`,
      boxShadow: pillShadow,
      touchAction: "none", color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.65)", userSelect: "none",
      display: "flex", flexDirection: flipped ? "column-reverse" : "column",
      opacity: shown && posReady ? 1 : 0,
      transform: shown ? "translateY(0px)" : `translateY(${slideY}px)`,
      WebkitTapHighlightColor: "transparent",
    }} onClick={e => e.stopPropagation()} onPointerDown={startDrag}>

      {/* Header / pill */}
      <div ref={headerRef} className="ps3cp-header" style={{ position: "relative", height: PILL_H, flexShrink: 0, WebkitTapHighlightColor: "transparent" }} role="button" tabIndex={0} aria-label="Drag or click to toggle panel" aria-expanded={isOpen}
        onKeyDown={e => {
          if (e.key !== "Enter" && e.key !== " ") return;
          e.preventDefault();
          if (isOpen) startTransition(() => setIsOpen(false));
          else startTransition(() => { setFlipped(shouldFlip(pillPos.y)); setIsOpen(true); });
        }}
      >
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: dk.pillGap, marginLeft: -1 }}>
            <div style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: isDragging ? "none" : isOpen ? `transform 180ms ${OPEN_EASE}` : `transform 300ms ${CLOSE_EASE}`, display: "flex", alignItems: "center", marginTop: dk.chevronOffset }}>
              <ChevronDown color={accentCol} size={10} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.03em", color: accentCol, transition: "color 300ms ease", lineHeight: 1, marginTop: dk.menuTextOffset }}>menu</span>
          </div>
        </div>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 2, opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "auto" : "none", transition: "opacity 150ms" }}>
          <button className="ps3cp-ibtn" onClick={handleReset} title="Reset" aria-label="Reset to defaults"><Reset /></button>
          <button className="ps3cp-ibtn" onClick={() => startTransition(() => setIsOpen(false))} title="Minimize" aria-label="Minimize"><Minus /></button>
        </div>
      </div>

      {/* Body */}
      <div style={{ pointerEvents: isOpen ? "auto" : "none", display: "flex", flexDirection: "column", overflowY: "auto", overflowX: "visible", maxHeight: geo.clampedBodyH, WebkitOverflowScrolling: "touch" }}>

        {/* Pattern color */}
        <div style={{ padding: "6px 16px 8px" }}>
          <div style={{ ...rowH, marginBottom: 8 }}>
            <span style={labelSt}>pattern color</span>
            <button
              className="ps3cp-custom-color-btn"
              onClick={e => { e.stopPropagation(); setOpenColorPicker(openColorPicker === "pattern" ? null : "pattern"); }}
              onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); setOpenColorPicker(openColorPicker === "pattern" ? null : "pattern"); } }}
              aria-label="Custom color picker"
              aria-expanded={openColorPicker === "pattern"}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 18,
                height: 18,
                borderRadius: 4,
                border: "none",
                backgroundColor: rgbToHex(waveColor),
                boxShadow: openColorPicker === "pattern"
                  ? (isDark ? "0 0 0 2px rgba(20,20,20,0.9), 0 0 0 3.5px rgba(255,255,255,0.85)" : "0 0 0 2px rgba(252,252,252,0.9), 0 0 0 3.5px rgba(0,0,0,0.75)")
                  : (isDark ? "inset 0 0 0 1px rgba(255,255,255,0.25)" : "inset 0 0 0 1px rgba(0,0,0,0.20)"),
                transform: openColorPicker === "pattern" ? "scale(1.08)" : "scale(1)",
                cursor: "pointer",
                padding: 0,
                flexShrink: 0,
                transition: "transform 140ms cubic-bezier(0.23, 1, 0.32, 1), boxShadow 140ms cubic-bezier(0.23, 1, 0.32, 1)",
              }}
            >
              <Plus size={8} color={isColorLight ? "rgba(0,0,0,0.70)" : "rgba(255,255,255,0.90)"} />
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, width: "100%" }}>
            {PRESETS.map((p, i) => (
              <button key={i} className="ps3cp-swatch-btn" onClick={() => pickPreset(i)}
                aria-label={`Color preset ${p.swatch}`} aria-pressed={activePreset === i}
                style={{
                  width: "100%", height: 18, borderRadius: 4, backgroundColor: p.swatch,
                  boxShadow: activePreset === i
                    ? (isDark ? "0 0 0 2px rgba(20,20,20,0.9), 0 0 0 3.5px rgba(255,255,255,0.85)" : "0 0 0 2px rgba(252,252,252,0.9), 0 0 0 3.5px rgba(0,0,0,0.75)")
                    : (isDark ? "inset 0 0 0 1px rgba(255,255,255,0.15)" : "inset 0 0 0 1px rgba(0,0,0,0.12)"),
                  transform: activePreset === i ? "scale(1.04)" : "scale(1)",
                  padding: 0, flexShrink: 0,
                }} />
            ))}
          </div>
          <ExpandSection open={openColorPicker === "pattern"} maxH={PICKER_MAX_H}>
            <div style={{ paddingTop: 10 }}>
              <PS3ColorPicker value={rgbToHex(waveColor)} onChange={hex => setAndDispatch({ waveColor: hexToRgb01(hex) })} />
            </div>
          </ExpandSection>
        </div>

        {/* Pattern mode (Clean Text Label - Zero Icons) */}
        <div style={{ padding: "6px 16px 8px" }}>
          <span style={{ ...labelSt, display: "block", marginBottom: 6 }}>pattern mode</span>
          <div style={{ display: "flex", gap: 4 }}>
            {["wave", "halftone"].map((m, i) => (
              <button key={m} className="ps3cp-mode-btn" onClick={() => setAndDispatch({ mode: i })} aria-pressed={mode === i}
                style={{ flex: 1, height: 26, borderRadius: 6, border: "none", background: mode === i ? (isDark ? "rgba(255,255,255,0.11)" : "rgba(0,0,0,0.09)") : (isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"), color: mode === i ? (isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.80)") : (isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)"), fontSize: 10.5, fontWeight: mode === i ? 500 : 400, letterSpacing: "0.02em" }}>
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Dot size */}
        <ExpandSection open={mode === 1} maxH={68}>
          <div style={{ padding: "0 16px 4px", ...rowSt }}>
            <div style={rowH}><span style={labelSt}>dot size</span><span style={valueSt}>{Number(halftoneSize).toFixed(1)}px</span></div>
            <Slider min={2} max={10} step={0.5} value={halftoneSize} isDark={isDark} label="Dot size"
              onChange={v => setAndDispatch({ halftoneSize: v })} />
          </div>
        </ExpandSection>

        {/* Intensity */}
        <div style={{ padding: secPad, ...rowSt }}>
          <div style={rowH}><span style={labelSt}>intensity</span><span style={valueSt}>{Number(intensity).toFixed(2)}</span></div>
          <Slider min={0} max={1.0} step={0.01} value={intensity} isDark={isDark} label="Intensity"
            onChange={v => {
              if (activePreset >= 1) {
                setPresetIntensity(prev => ({ ...prev, [`${mode}:${activePreset}`]: v }));
              }
              setAndDispatch({ intensity: v });
            }} />
        </div>

        {/* Speed */}
        <div style={{ padding: secPad, ...rowSt }}>
          <div style={rowH}><span style={labelSt}>speed</span><span style={valueSt}>{Number(speed).toFixed(2)}×</span></div>
          <Slider min={0.2} max={2.5} step={0.05} value={speed} isDark={isDark} label="Speed"
            onChange={v => setAndDispatch({ speed: v })} />
        </div>

        {/* Y offset */}
        <div style={{ padding: secPad, ...rowSt }}>
          <div style={rowH}><span style={labelSt}>y offset</span><span style={valueSt}>{Math.round(yOffset)}px</span></div>
          <Slider min={-200} max={200} step={1} value={yOffset} isDark={isDark} label="Y offset"
            onChange={v => setAndDispatch({ yOffset: v })} />
        </div>

        {/* Cursor reactivity */}
        <div style={{ padding: secPad, ...rowSt }}>
          <div style={rowH}><span style={labelSt}>cursor reactivity</span><span style={valueSt}>{Number(mouseStr).toFixed(3)}</span></div>
          <Slider min={0} max={0.3} step={0.005} value={mouseStr} isDark={isDark} label="Cursor reactivity"
            onChange={v => setAndDispatch({ mouseStrength: v })} />
        </div>

      </div>
    </div>
  );

  return (
    <div style={{ position: "relative", width: 0, height: 0, overflow: "visible" }}>
      {portalEl && createPortal(panelMarkup, portalEl)}
    </div>
  );
}
