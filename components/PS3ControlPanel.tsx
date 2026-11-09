"use client";

import { useEffect, useLayoutEffect, useRef, useState, startTransition, useCallback, memo } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "framer-motion";
import { useDialKit } from "dialkit";
import { ENTRANCE_DEFAULTS, EASE_OPACITY, EASE_EXPAND, type CubicBezier } from "@/lib/motion";
import { onIntroDone } from "@/lib/introReady";

// Module-level: persists across client-side nav, resets on page reload
let _ps3cpHasLoaded = false;
const useSafeLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const PANEL_W = 240;
const PILL_W  = 70;
const PILL_H  = 28;
const EDGE_PAD = 10;
const MAX_W   = 1700;

function cssCubic(c: CubicBezier) {
  return `cubic-bezier(${c[0]}, ${c[1]}, ${c[2]}, ${c[3]})`;
}

// Morph open/close — same expand curve as site panels (`--expand-ease` /
// EASE_EXPAND). Open stays prompt; close runs a touch longer so collapse
// doesn't feel abrupt.
const OPEN_MS = 220;
const CLOSE_MS = 280;
const OPEN_EASE = cssCubic(EASE_EXPAND);
const CLOSE_EASE = cssCubic(EASE_EXPAND);
// Same fade-up as EntranceItem / work grid (ENTRANCE_DEFAULTS + EASE_OPACITY).
const REVEAL_MS = Math.round(ENTRANCE_DEFAULTS.duration * 1000);
const REVEAL_EASE = cssCubic(EASE_OPACITY);
const REVEAL_Y = ENTRANCE_DEFAULTS.y;
// This portal stays mounted across soft-nav (`visible` toggles it). First
// load mounts with the work shell, before the intro gate lifts, and its
// reveal is armed on "intro-done" like the rest of the intro (HeroText,
// grid); about/archive return replays settle.
// Content-tight body (not a fixed 620). First-frame estimate only —
// ResizeObserver replaces it with the inner's visible offsetHeight.
const BODY_COLOR_H = 107;
const BODY_MODE_H = 65;
const BODY_DOT_H = 49;
const BODY_SLIDER_H = 55;
const BODY_PAD_BOTTOM = 2;

function estimateBodyH(mode: number) {
  return (
    BODY_COLOR_H +
    BODY_MODE_H +
    BODY_SLIDER_H * 2 +
    BODY_PAD_BOTTOM +
    (mode === 1 ? BODY_DOT_H : 0)
  );
}

const POS_KEY         = "ps3cp_pos";
const WAVE_COLOR_KEY  = "ps3cp_wave_color";
const MODE_KEY        = "ps3cp_mode";

const DEFAULT_INTENSITY_HT = 0.29; // halftone mode default
const DEFAULT_INTENSITY_WV = 0.04; // wave mode default
const DEFAULT_MOUSE_STR    = 0.11;
const DEFAULT_WAVE_COLOR: [number, number, number] = [1, 1, 1];
const DEFAULT_MODE         = 1;
const DEFAULT_HALFTONE_SIZE = 3.0;
const DEFAULT_SPEED        = 1.2; // shared wave + halftone (+20% from 1.0)
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

// Anchors the pill under the hero subtitle, left-aligned
// to it at every breakpoint (the subtitle carries data-hero-sub) — that line is an unconstrained-width flex sibling
// of the heading, so its own left edge already equals the page's real left
// content edge (page-px in from the true left, whatever --grid-max-w's
// centering margin is at the current width). Same rule from mobile straight
// through desktop — instead of the old nav-row-relative logic (docking after
// "about", or falling back to raw viewport math, or an even earlier version
// that mirrored to the *right* edge above the mobile breakpoint), which
// routinely lost that margin or put the pill on the wrong side entirely.
/** Layout box of `el`, ignoring CSS translates (offset* is transform-agnostic).
 *  getBoundingClientRect includes the hero subtitle's entrance translateY,
 *  so docking to it made the menu pill chase the subtitle. */
function layoutDocumentRect(el: HTMLElement): { left: number; top: number; width: number; height: number } | null {
  const width = el.offsetWidth;
  const height = el.offsetHeight;
  if (width < 8 || height < 8) return null;
  let left = 0;
  let top = 0;
  let node: HTMLElement | null = el;
  while (node) {
    left += node.offsetLeft;
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { left, top, width, height };
}

function elementTranslation(el: HTMLElement): { x: number; y: number } {
  const cs = getComputedStyle(el);
  const t = cs.transform;
  if (t && t !== "none") {
    try {
      const m = new DOMMatrix(t);
      return { x: m.e, y: m.f };
    } catch {
      /* fall through to `translate` */
    }
  }
  const raw = cs.translate;
  if (raw && raw !== "none") {
    const parts = raw.trim().split(/\s+/);
    const n = (v?: string) => {
      const x = parseFloat(v ?? "0");
      return Number.isFinite(x) ? x : 0;
    };
    return { x: n(parts[0]), y: n(parts[1]) };
  }
  return { x: 0, y: 0 };
}

function untransformedViewportRect(el: HTMLElement): DOMRect | null {
  const r = el.getBoundingClientRect();
  if (r.width < 8 || r.height < 8) return null;
  let dx = 0;
  let dy = 0;
  let node: HTMLElement | null = el;
  while (node && node !== document.documentElement) {
    const { x, y } = elementTranslation(node);
    dx += x;
    dy += y;
    node = node.parentElement;
  }
  return new DOMRect(r.left - dx, r.top - dy, r.width, r.height);
}

function computeHeroAlignedPos(): {x:number;y:number} | null {
  if (typeof window === "undefined") return null;
  const heroP = document.querySelector<HTMLElement>("[data-hero-sub]");
  if (!heroP) return null;
  // Prefer offset chain (ignores transforms). Fall back to undoing matrices
  // if an offsetParent is missing (transformed containing blocks).
  const layout = layoutDocumentRect(heroP);
  if (layout) {
    return {
      x: Math.round(layout.left),
      y: Math.round(layout.top + layout.height + 16),
    };
  }
  const r = untransformedViewportRect(heroP);
  if (!r) return null;
  return {
    x: Math.round(r.left + window.scrollX),
    y: Math.round(r.bottom + 16 + window.scrollY),
  };
}

function computeNavAlignedPos(): {x:number;y:number} | null {
  return computeHeroAlignedPos();
}

function shouldFlip(pillY: number, openBodyH: number) {
  if (typeof window === "undefined") return false;
  const vy = pillY - window.scrollY;
  const needed = PILL_H + openBodyH + EDGE_PAD * 2;
  const spaceBelow = window.innerHeight - (vy + PILL_H) - EDGE_PAD * 2;
  const spaceAbove = vy - EDGE_PAD * 2;
  return spaceBelow < needed && spaceAbove > spaceBelow;
}

function getGeometry(
  pillPos: {x:number;y:number},
  isOpen: boolean,
  flipped: boolean,
  bodyH: number,
) {
  if (typeof window === "undefined") return { w: PILL_W, maxH: PILL_H, r: PILL_H / 2, left: 0, top: 0, clampedBodyH: bodyH };
  const docW = document.documentElement.scrollWidth;
  const viewportH = window.innerHeight;
  const vy = pillPos.y - window.scrollY;

  const spaceBelow = Math.max(80, viewportH - (vy + PILL_H) - EDGE_PAD * 2);
  const spaceAbove = Math.max(80, vy - EDGE_PAD * 2);
  const availH = flipped ? spaceAbove : spaceBelow;
  const clampedBodyH = Math.max(0, Math.min(bodyH, Math.floor(availH)));

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
    // Continuous live updates: 0.001 precision
    const continuous = Math.round(raw * 1000) / 1000;
    return clamp(continuous);
  }, [min, max, value, clamp]);

  const active = isHovered || isDragging;
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  // Non-overlapping tracks with solid opaque thumb to prevent double-darkening or see-through thumb
  const trackBg = isDark ? "#3f3f46" : "#e4e4e7";
  const filledBg = active
    ? (isDark ? "#d4d4d8" : "#27272a")
    : (isDark ? "#a1a1aa" : "#52525b");
  const thumbBg = isDark ? "#ffffff" : "#18181b";

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
        if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); onChange(clamp(Number((value + step).toFixed(4)))); }
        else if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); onChange(clamp(Number((value - step).toFixed(4)))); }
        else if (e.key === "Home") { e.preventDefault(); onChange(min); }
        else if (e.key === "End") { e.preventDefault(); onChange(max); }
      }}
    >
      {/* Filled track: 0 to pct% */}
      <div style={{ position: "absolute", left: 0, width: `${pct}%`, top: "50%", height: 2, transform: "translateY(-50%)", borderRadius: "1px 0 0 1px", pointerEvents: "none", background: filledBg, transition: "background-color 150ms cubic-bezier(0.23, 1, 0.32, 1)" }} />
      {/* Unfilled track: pct% to 100% */}
      <div style={{ position: "absolute", left: `${pct}%`, right: 0, top: "50%", height: 2, transform: "translateY(-50%)", borderRadius: "0 1px 1px 0", pointerEvents: "none", background: trackBg }} />
      {/* Opaque Thumb */}
      <div style={{ position: "absolute", top: "50%", left: `${pct}%`, width: active ? 6 : 5, height: active ? 16 : 14, borderRadius: 2, backgroundColor: thumbBg, boxShadow: isDark ? "0 1px 3px rgba(0,0,0,0.5)" : "0 1px 2px rgba(0,0,0,0.25)", transform: `translate(-50%, -50%) scale(${isDragging ? 0.94 : 1})`, pointerEvents: "none", transition: "width 140ms cubic-bezier(0.23, 1, 0.32, 1), height 140ms cubic-bezier(0.23, 1, 0.32, 1), transform 140ms cubic-bezier(0.23, 1, 0.32, 1), background-color 150ms ease" }} />
    </div>
  );
});

// ── Icons ──────────────────────────────────────────────────────────────────
function ChevronDown({ size = 10, color = "currentColor", polyRef }: { size?: number; color?: string; polyRef?: React.Ref<SVGPolylineElement> }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", flexShrink: 0 }} aria-hidden><polyline ref={polyRef} points="6 9 12 15 18 9" /></svg>;
}
function Minus({ size = 11 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden><line x1="5" y1="12" x2="19" y2="12" /></svg>;
}
function Reset({ size = 11 }) {
  // Single path so the arrow + arc share one stroke (no stacked translucent joins).
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5" />
    </svg>
  );
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

// ── Chevron/label optical alignment ─────────────────────────────────────────
// "menu" renders in --font-sans (Helvetica Neue stack).
// Ascent/descent differ across the fallback chain, so a marginTop tuned by
// eye against one font's glyph metrics reads as misaligned against another's.
// Measure the *actual* rendered ink of both the chevron and the label — via
// CanvasTextMetrics for the glyph, getBoundingClientRect for the stroke —
// and compute the delta needed to center them on each other.
function useLabelOpticalOffset(
  chevronRef: React.RefObject<SVGPolylineElement | null>,
  labelRef: React.RefObject<HTMLSpanElement | null>,
) {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const chevron = chevronRef.current, label = labelRef.current;
    if (!chevron || !label) return;
    function measure() {
      if (!chevron || !label) return;
      const ctx = document.createElement("canvas").getContext("2d");
      if (!ctx) return;
      const cs = getComputedStyle(label);
      ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const m = ctx.measureText(label.textContent || "");
      if (m.fontBoundingBoxAscent === undefined || m.actualBoundingBoxAscent === undefined) return;
      const labelRect = label.getBoundingClientRect();
      const halfLeading = (labelRect.height - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2;
      const baselineFromTop = halfLeading + m.fontBoundingBoxAscent;
      const inkCenterFromTop = baselineFromTop + (m.actualBoundingBoxDescent - m.actualBoundingBoxAscent) / 2;
      const labelInkCenterY = labelRect.top + inkCenterFromTop;
      const chevronRect = chevron.getBoundingClientRect();
      const chevronInkCenterY = chevronRect.top + chevronRect.height / 2;
      // Accumulate: if we already applied a marginTop from a prior measure
      // (e.g. fonts.ready re-run), the live delta is the remaining error —
      // adding it avoids double-correcting against the shifted label.
      const delta = chevronInkCenterY - labelInkCenterY;
      if (Math.abs(delta) < 0.25) return;
      setOffset(prev => prev + delta);
    }
    measure();
    document.fonts?.ready?.then(measure).catch(() => {});
  }, [chevronRef, labelRef]);
  return offset;
}

// ── Expand/collapse section ─────────────────────────────────────────────────
function ExpandSection({ open, maxH, children }: { open: boolean; maxH: number; children: React.ReactNode }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateRows: open ? "1fr" : "0fr",
      opacity: open ? 1 : 0,
      transition: open
        ? `grid-template-rows ${OPEN_MS}ms ${OPEN_EASE}, opacity 120ms ${OPEN_EASE}`
        : `grid-template-rows ${CLOSE_MS}ms ${CLOSE_EASE}, opacity 140ms ${CLOSE_EASE}`,
      pointerEvents: open ? "auto" : "none",
    }}>
      <div style={{ overflow: "hidden", minHeight: 0, maxHeight: maxH }}>
        {children}
      </div>
    </div>
  );
}


// ── CSS injected once ───────────────────────────────────────────────────────
const PANEL_CSS = `
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
.ps3cp-header { position: relative; }
.ps3cp-header::before { content:""; position:absolute; left:0; right:0; top:-8px; bottom:-8px; }
.ps3cp-header:focus-visible { outline: 2px solid rgba(0,0,0,0.65); outline-offset: -3px; border-radius: 999px; }
html[data-theme=dark] .ps3cp-header:focus-visible { outline-color: rgba(255,255,255,0.72); }
.ps3cp-ibtn { display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:6px;border:none;background:none;color:rgba(0,0,0,0.72);padding:0;transition:color 120ms ease,transform 120ms ease;position:relative; }
.ps3cp-ibtn svg { display:block; opacity:1; }
.ps3cp-ibtn::before { content:"";position:absolute;inset:-10px; }
@media (hover: hover) and (pointer: fine) {
  .ps3cp-ibtn:hover { color:rgba(0,0,0,0.88); }
  .ps3cp-ibtn:active { transform:scale(0.96); }
}
@media (hover: none), (pointer: coarse) {
  .ps3cp-ibtn:active { color:rgba(0,0,0,0.88); }
}
.ps3cp-ibtn:focus-visible { outline:2px solid rgba(0,0,0,0.65); outline-offset:2px; }
html[data-theme=dark] .ps3cp-ibtn:focus-visible { outline-color:rgba(255,255,255,0.72); }
.ps3cp-swatch-btn { position:relative;border:none;padding:0;transition:transform 140ms cubic-bezier(0.23, 1, 0.32, 1),box-shadow 140ms cubic-bezier(0.23, 1, 0.32, 1); }
.ps3cp-swatch-btn::before { content:"";position:absolute;inset:-4px; }
@media (hover: hover) and (pointer: fine) {
  .ps3cp-swatch-btn:active { transform:scale(0.92)!important; }
}
.ps3cp-swatch-btn:focus-visible { outline: 2px solid rgba(0,0,0,0.65); outline-offset: 2px; }
html[data-theme=dark] .ps3cp-swatch-btn:focus-visible { outline-color: rgba(255,255,255,0.72); }
.ps3cp-mode-btn { position:relative;transition:background 140ms ease,color 140ms ease,box-shadow 140ms ease,transform 120ms ease; min-height:32px; cursor:pointer; }
.ps3cp-mode-btn:focus-visible { outline: 2px solid rgba(0,0,0,0.65); outline-offset: 1px; }
html[data-theme=dark] .ps3cp-mode-btn:focus-visible { outline-color: rgba(255,255,255,0.72); }
@media (hover: hover) and (pointer: fine) {
  .ps3cp-mode-btn:active { transform:scale(0.98); }
}
`;

export default function PS3ControlPanel({
  instantReturn = false,
  visible = true,
}: {
  instantReturn?: boolean;
  /** When false (off work route), hide the body portal without unmounting. */
  visible?: boolean;
}) {
  const dk = useDialKit("PS3 Pill", {
    // Optical lift for the whole chevron+"menu" unit inside the pill.
    // Lowercase text + downward chevron read heavy when geometrically
    // centered — default −1px. Relative chevron↔label alignment is still
    // handled by useLabelOpticalOffset; menuTextOffset is a fine-tune on top.
    chevronOffset:  [-1, -4, 2, 0.5],
    pillGap:        [4,    2, 10, 0.5],
    menuTextOffset: [0, -4, 4, 0.5],
  });

  const chevronPolyRef  = useRef<SVGPolylineElement>(null);
  const menuLabelRef    = useRef<HTMLSpanElement>(null);
  const labelAutoOffset = useLabelOpticalOffset(chevronPolyRef, menuLabelRef);

  const panelRef       = useRef<HTMLDivElement>(null);
  const headerRef      = useRef<HTMLDivElement>(null);
  const bodyInnerRef   = useRef<HTMLDivElement>(null);
  const contentBodyHRef = useRef(estimateBodyH(DEFAULT_MODE));
  const [measuredBodyH, setMeasuredBodyH] = useState(0);
  const dragRef        = useRef<{startX:number;startY:number;origX:number;origY:number} | null>(null);
  const didDragRef     = useRef(false);
  const dragStartedRef = useRef(false);
  const dragInHeaderRef = useRef(false);

  const isVeryFirstLoad = useRef(!_ps3cpHasLoaded);
  const savedPos        = useRef<{x:number;y:number} | null>(typeof window !== "undefined" ? readSavedPos() : null);
  const hasDraggedRef   = useRef(savedPos.current !== null);
  const revealKindRef   = useRef<"first" | "return" | "instant">("first");

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
  const reduced = useReducedMotion();

  useSafeLayoutEffect(() => {
    const el = bodyInnerRef.current;
    if (!el) return;
    const sync = () => {
      // offsetHeight only — scrollHeight includes max-height:0 / overflow
      // hidden descendants (collapsed picker + wave's hidden dot-size),
      // which left a tall empty well that did not shrink with mode.
      const h = Math.ceil(el.offsetHeight);
      if (h > 80) setMeasuredBodyH(h);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [mode, portalEl]);

  // Portal setup
  useEffect(() => {
    const el = document.createElement("div");
    el.id = "ps3cp-portal";
    el.style.fontFamily = getComputedStyle(document.body).fontFamily;
    document.body.appendChild(el);
    setPortalEl(el);
    return () => { try { el.remove(); } catch {} };
  }, []);

  // Soft-nav leave/return: hide body portal without remounting (remount was a
  // measured hitch on Work↔About). Parent display:none cannot hide this portal.
  useEffect(() => {
    if (!portalEl) return;
    portalEl.style.display = visible ? "" : "none";
    portalEl.style.pointerEvents = visible ? "auto" : "none";
    portalEl.setAttribute("aria-hidden", visible ? "false" : "true");
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

  // Find the live hero alignment before paint. A normal effect plus the old
  // 200ms retry left every remounted pill behind the work entrance, even when
  // the anchor was already in the DOM.
  useSafeLayoutEffect(() => {
    if (savedPos.current) return;
    const applyPos = (pos: {x:number;y:number}) => {
      if (hasDraggedRef.current) return;
      setPillPos(pos);
      setFlipped(shouldFlip(pos.y, contentBodyHRef.current));
      setPosReady(true);
    };
    const findAndPlace = (attempt: number) => {
      if (hasDraggedRef.current) return;
      const pos = computeNavAlignedPos();
      if (pos) {
        applyPos(pos);
        return;
      }
      if (attempt < 15) { setTimeout(() => findAndPlace(attempt + 1), 150); return; }
      const w = window.innerWidth, cl = w > MAX_W ? (w - MAX_W) / 2 : 0;
      applyPos({ x: cl + window.scrollX + EDGE_PAD, y: EDGE_PAD + window.scrollY });
    };
    findAndPlace(0);
    // Re-read the untransformed rest box when the subtitle starts and when
    // webfonts settle — both used to shift the subtitle (and wrap
    // it on mobile) after the first measure.
    let cancelled = false;
    const reanchor = () => {
      if (cancelled) return;
      const pos = computeNavAlignedPos();
      if (pos) applyPos(pos);
    };
    window.addEventListener("intro-done", reanchor);
    document.fonts?.ready.then(reanchor);
    return () => {
      cancelled = true;
      window.removeEventListener("intro-done", reanchor);
    };
  }, []);

  // Reposition on resize (unless user has dragged)
  useEffect(() => {
    const onResize = () => {
      if (hasDraggedRef.current) return;
      const pos = computeNavAlignedPos();
      if (!pos) return;
      startTransition(() => { setPillPos(pos); setFlipped(shouldFlip(pos.y, contentBodyHRef.current)); });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Work was display:none on About/Archive, so the hero rect was 0. Re-read
  // alignment whenever the pill becomes visible again (and after soft-nav
  // layout has flushed). Skip if the user dragged it.
  useSafeLayoutEffect(() => {
    if (!visible) return;
    if (hasDraggedRef.current) return;
    let cancelled = false;
    const place = () => {
      if (cancelled || hasDraggedRef.current) return;
      const pos = computeNavAlignedPos();
      if (!pos) return;
      startTransition(() => {
        setPillPos(pos);
        setFlipped(shouldFlip(pos.y, contentBodyHRef.current));
        setPosReady(true);
      });
    };
    place();
    const raf = requestAnimationFrame(() => requestAnimationFrame(place));
    window.addEventListener("soft-nav-settled", place);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("soft-nav-settled", place);
    };
  }, [visible]);

  // posReady: same EntranceItem settle for first load (after intro-done)
  // and about/archive return. Case-study Back snaps.
  useSafeLayoutEffect(() => {
    if (!posReady) return;
    if (!visible) {
      setShown(false);
      setShowTransition(false);
      return;
    }
    const revealImmediately = () => {
      setShowTransition(false);
      setShown(true);
      setPositionSettled(true);
    };
    // Stage the reveal in two commits. First commit arms the reveal
    // transition while the pill is still at opacity 0 (morphT is "none"
    // until positionSettled, so settling must land here, not with `shown`);
    // only after two frames (a painted frame with the transition armed)
    // flip `shown`. Flipping settled + shown in one commit gave the pill a
    // before-change style with no transition, so the fade was skipped and
    // it popped in at full opacity whenever React batched those updates.
    // Handles for everything stageReveal schedules, so the effect cleanup
    // (unmount, or a dep change mid-stage) can cancel all of it instead of
    // firing setState after the panel is gone.
    let rafOuter = 0;
    let rafInner = 0;
    let clearTimer: ReturnType<typeof setTimeout> | undefined;
    const cancelStaged = () => {
      cancelAnimationFrame(rafOuter);
      cancelAnimationFrame(rafInner);
      if (clearTimer) clearTimeout(clearTimer);
    };
    const stageReveal = () => {
      startTransition(() => {
        setShowTransition(true);
        setPositionSettled(true);
      });
      rafOuter = requestAnimationFrame(() => {
        rafInner = requestAnimationFrame(() => startTransition(() => {
          setShown(true);
        }));
      });
      clearTimer = setTimeout(() => startTransition(() => setShowTransition(false)), REVEAL_MS + 200);
    };
    if (instantReturn) {
      revealKindRef.current = "instant";
      revealImmediately();
      _ps3cpHasLoaded = true;
      return;
    }
    // Same signal as the hero, nav, and grid: hidden while data-intro is
    // "playing", revealed on "intro-done". The old return branch faded the
    // pill on its own as soon as this effect re-ran, so a tab-return replay
    // left it moving while everything else was still gated.
    const introIsPlaying = () =>
      document.documentElement.getAttribute("data-intro") === "playing";
    if (!isVeryFirstLoad.current && !introIsPlaying()) {
      revealKindRef.current = "return";
      if (reduced) {
        revealImmediately();
        return;
      }
      stageReveal();
      return cancelStaged;
    }
    revealKindRef.current = "first";
    // intro-done is the only reveal. IntroOrchestrator already completes the
    // gate if the silk never signals (3500ms). A second timer here used to
    // fade the pill on its own, ahead of that signal.
    let revealed = false;
    let cancelIntro = () => {};
    function reveal() {
      if (revealed) return;
      revealed = true;
      if (reduced) {
        revealImmediately();
      } else {
        stageReveal();
      }
      _ps3cpHasLoaded = true;
      isVeryFirstLoad.current = false;
    }
    const arm = () => {
      cancelIntro();
      cancelIntro = onIntroDone(reveal);
    };
    const onReplay = () => {
      revealed = false;
      cancelStaged();
      revealKindRef.current = "first";
      startTransition(() => {
        setShown(false);
        setShowTransition(false);
      });
      arm();
    };
    arm();
    window.addEventListener("intro-replay", onReplay);

    return () => {
      cancelIntro();
      cancelStaged();
      window.removeEventListener("intro-replay", onReplay);
    };
  }, [instantReturn, posReady, reduced, visible]);

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
    mouseStrength?: number; halftoneSize?: number; speed?: number;
  }) {
    if (patch.intensity !== undefined) {
      if (mode === 1) startTransition(() => setIntensityHt(patch.intensity!));
      else            startTransition(() => setIntensityWv(patch.intensity!));
    }
    if (patch.mouseStrength !== undefined) startTransition(() => setMouseStr(patch.mouseStrength!));
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
    setAndDispatch({ intensity: DEFAULT_MODE === 1 ? DEFAULT_INTENSITY_HT : DEFAULT_INTENSITY_WV, mouseStrength: DEFAULT_MOUSE_STR, waveColor: DEFAULT_WAVE_COLOR, mode: DEFAULT_MODE, halftoneSize: DEFAULT_HALFTONE_SIZE, speed: DEFAULT_SPEED });
  }

  // Drag logic — only flip `isDragging` once past the click threshold.
  // Setting it on pointerdown used to force `transition: none` for the
  // subsequent open/close toggle, so the pill→panel morph snapped instead
  // of animating (isOpen committed while isDragging was still true).
  // Listeners are bound synchronously here (not via useEffect) so a quick
  // click can't miss pointerup before React re-renders.
  const startDrag = useCallback((e: React.PointerEvent) => {
    if ((e.target as Element).closest("button, label, input")) return;
    if (dragStartedRef.current) return;
    didDragRef.current = false;
    dragStartedRef.current = true;
    dragInHeaderRef.current = headerRef.current?.contains(e.target as Node) ?? false;
    const origX = pillPos.x;
    const origY = pillPos.y;
    const openAtStart = isOpen;
    dragRef.current = { startX: e.pageX, startY: e.pageY, origX, origY };

    const onMove = (ev: PointerEvent) => {
      if (!dragRef.current) return;
      const dx = ev.pageX - dragRef.current.startX;
      const dy = ev.pageY - dragRef.current.startY;
      if (Math.abs(dx) + Math.abs(dy) > 4) {
        if (!didDragRef.current) {
          didDragRef.current = true;
          setIsDragging(true);
        }
      }
      if (!didDragRef.current) return;
      const docW = document.documentElement.scrollWidth;
      const docH = document.documentElement.scrollHeight;
      const cw = openAtStart ? PANEL_W : PILL_W;
      const dragged = {
        x: Math.max(EDGE_PAD, Math.min(dragRef.current.origX + dx, docW - cw - EDGE_PAD)),
        y: Math.max(EDGE_PAD, Math.min(dragRef.current.origY + dy, docH - PILL_H - EDGE_PAD)),
      };
      savePos(dragged);
      hasDraggedRef.current = true;
      setPillPos(dragged);
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (!dragStartedRef.current) return;
      dragStartedRef.current = false;
      // Clear drag flag synchronously *before* toggling open so morphT
      // still includes width/height when isOpen flips in this same turn.
      setIsDragging(false);
      const wasDrag = didDragRef.current;
      const wasHeader = dragInHeaderRef.current;
      dragRef.current = null;
      didDragRef.current = false;
      dragInHeaderRef.current = false;
      if (wasDrag) return;
      if (!wasHeader) return;
      if (openAtStart) setIsOpen(false);
      else { setFlipped(shouldFlip(origY, contentBodyHRef.current)); setIsOpen(true); }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }, [pillPos, isOpen]);

  const dur = isOpen ? `${OPEN_MS}ms ${OPEN_EASE}` : `${CLOSE_MS}ms ${CLOSE_EASE}`;
  // Keep morph transitions on their own string — never share a node with
  // `.intro-hide` (that class sets `transition: opacity … !important` and
  // wipes width/height morph). Reveal uses EntranceItem fade-up tokens.
  const baseMorphParts = [
    `width ${dur}`,
    `height ${dur}`,
    `max-height ${dur}`,
    `border-radius ${dur}`,
    `left ${dur}`,
    `top ${dur}`,
    "background-color 200ms ease",
    "border-color 200ms ease",
  ];
  const morphT = !positionSettled ? "none" : isDragging ? "none" : !shown
    ? (showTransition ? `opacity ${REVEAL_MS}ms ${REVEAL_EASE}, transform ${REVEAL_MS}ms ${REVEAL_EASE}` : "none")
    : (showTransition
      ? [...baseMorphParts, `opacity ${REVEAL_MS}ms ${REVEAL_EASE}`, `transform ${REVEAL_MS}ms ${REVEAL_EASE}`].join(", ")
      : baseMorphParts.join(", "));

  const contentBodyH = measuredBodyH > 80 ? measuredBodyH : estimateBodyH(mode);
  contentBodyHRef.current = contentBodyH;
  const geo = getGeometry(pillPos, isOpen, flipped, contentBodyH);

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

  // Not shown yet (e.g. mounted during the intro gate, ~2s before its
  // fade): the root is inert + aria-hidden so none of its controls (toggle,
  // Reset, Minimize, color picker, presets, sliders) can be Tab-focused or
  // read out while invisible, matching main, where it is not mounted then.
  // Both come off in the same commit that flips `shown`, i.e. when the
  // reveal actually starts.
  const panelHidden = !(shown && posReady);

  const panelMarkup = (
    <div ref={panelRef} className="ps3cp" inert={panelHidden} aria-hidden={panelHidden ? true : undefined} style={{
      position: "absolute", left: geo.left, top: geo.top,
      width: geo.w, height: geo.maxH, maxHeight: geo.maxH, borderRadius: geo.r,
      overflow: "hidden", zIndex: 49,
      transition: morphT,
      backgroundColor: pillBg,
      backdropFilter: "blur(28px) saturate(180%)",
      WebkitBackdropFilter: "blur(28px) saturate(180%)",
      border: `1px solid ${pillBorder}`,
      boxShadow: pillShadow,
      touchAction: "none", color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.65)", userSelect: "none",
      display: "flex", flexDirection: flipped ? "column-reverse" : "column",
      opacity: panelHidden ? 0 : 1,
      // Hidden until revealed. Same contract as the intro's `.intro-hide`
      // (opacity 0 + pointer-events none while the gate is playing), so the
      // now-early-mounted pill can't intercept hero clicks before its fade.
      pointerEvents: panelHidden ? "none" : "auto",
      // First load: the subtitle owns the Y settle. Sliding the pill
      // too made the pair look like a position jump. Soft-nav return still
      // uses the shared 8px fade-up.
      transform: shown || revealKindRef.current === "first" ? "translateY(0px)" : `translateY(${REVEAL_Y}px)`,
      WebkitTapHighlightColor: "transparent",
    }} onClick={e => e.stopPropagation()} onPointerDown={startDrag}>

      {/* Header / pill */}
      <div ref={headerRef} className="ps3cp-header" style={{ position: "relative", height: PILL_H, flexShrink: 0, WebkitTapHighlightColor: "transparent" }} role="button" tabIndex={0} aria-label="Drag or click to toggle panel" aria-expanded={isOpen}
        onKeyDown={e => {
          if (e.key !== "Enter" && e.key !== " ") return;
          e.preventDefault();
          if (isOpen) setIsOpen(false);
          else { setFlipped(shouldFlip(pillPos.y, contentBodyHRef.current)); setIsOpen(true); }
        }}
      >
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: dk.pillGap,
            marginLeft: -1,
            // Lift the whole unit — lowercase "menu" + downward chevron sit
            // optically low when only flex-centered in the pill.
            transform: `translateY(${dk.chevronOffset}px)`,
          }}>
            <div style={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: isDragging ? "none" : isOpen ? `transform ${OPEN_MS}ms ${OPEN_EASE}` : `transform ${CLOSE_MS}ms ${CLOSE_EASE}`,
              display: "flex",
              alignItems: "center",
            }}>
              <ChevronDown color={accentCol} size={10} polyRef={chevronPolyRef} />
            </div>
            <span
              ref={menuLabelRef}
              style={{
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.03em",
                color: accentCol,
                transition: "color 200ms ease",
                lineHeight: 1,
                display: "block",
                marginTop: labelAutoOffset + dk.menuTextOffset,
              }}
            >
              Menu
            </span>
          </div>
        </div>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 2, opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "auto" : "none", transition: isOpen ? `opacity 140ms ${OPEN_EASE} 60ms` : `opacity 90ms ${CLOSE_EASE}` }}>
          <button className="ps3cp-ibtn" onClick={handleReset} title="Reset" aria-label="Reset to defaults"><Reset /></button>
          <button className="ps3cp-ibtn" onClick={() => setIsOpen(false)} title="Minimize" aria-label="Minimize"><Minus /></button>
        </div>
      </div>

      {/* Body — hugs visible controls (wave vs halftone, picker). Shell
          height tracks this instead of a fixed 620px well. */}
      <div style={{
        pointerEvents: isOpen ? "auto" : "none",
        flex: "0 0 auto",
        height: isOpen ? geo.clampedBodyH : 0,
        overflow: isOpen && geo.clampedBodyH < contentBodyH - 1 ? "auto" : "hidden",
        overflowX: "hidden",
        opacity: isOpen ? 1 : 0,
        transition: isOpen
          ? `height ${OPEN_MS}ms ${OPEN_EASE}, opacity 160ms ${OPEN_EASE} 50ms`
          : `height ${CLOSE_MS}ms ${CLOSE_EASE}, opacity 100ms ${CLOSE_EASE}`,
        WebkitOverflowScrolling: "touch",
      }}>
        <div ref={bodyInnerRef} style={{ paddingBottom: BODY_PAD_BOTTOM }}>

        {/* Pattern color */}
        <div style={{ padding: "6px 16px 8px" }}>
          <div style={{ ...rowH, marginBottom: 8 }}>
            <span style={labelSt}>Pattern Color</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, width: "100%" }}>
            {PRESETS.map((p, i) => (
              <button key={i} className="ps3cp-swatch-btn" onClick={() => pickPreset(i)}
                aria-label={`Color preset ${p.swatch}`} aria-pressed={activePreset === i}
                style={{
                  width: "100%", height: 44, border: "none", background: "transparent",
                  padding: 0, flexShrink: 0, display: "flex", alignItems: "center",
                }}>
                <span style={{
                  display: "block", width: "100%", height: 18, borderRadius: 4, backgroundColor: p.swatch,
                  boxShadow: activePreset === i
                    ? (isDark ? "0 0 0 2px rgba(20,20,20,0.9), 0 0 0 3.5px rgba(255,255,255,0.85)" : "0 0 0 2px rgba(252,252,252,0.9), 0 0 0 3.5px rgba(0,0,0,0.75)")
                    : (isDark ? "inset 0 0 0 1px rgba(255,255,255,0.15)" : "inset 0 0 0 1px rgba(0,0,0,0.12)"),
                  transform: activePreset === i ? "scale(1.04)" : "scale(1)",
                }} />
              </button>
            ))}
          </div>
        </div>

        {/* Pattern mode segmented toggle */}
        <div style={{ padding: "6px 16px 8px" }}>
          <span style={{ ...labelSt, display: "block", marginBottom: 6 }}>Pattern Mode</span>
          <div
            role="group"
            aria-label="Pattern mode"
            style={{
              display: "flex",
              padding: 2,
              borderRadius: 7,
              background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
              gap: 2,
            }}
          >
            {[
              { id: 0, label: "Wave" },
              { id: 1, label: "Halftone" },
            ].map(({ id, label }) => {
              const active = mode === id;
              return (
                <button
                  key={id}
                  className="ps3cp-mode-btn"
                  onClick={() => setAndDispatch({ mode: id })}
                  aria-pressed={active}
                  style={{
                    flex: 1,
                    minHeight: 32,
                    height: 32,
                    borderRadius: 5,
                    border: "none",
                    background: active
                      ? isDark
                        ? "rgba(255,255,255,0.14)"
                        : "rgba(255,255,255,0.95)"
                      : "transparent",
                    boxShadow: active
                      ? isDark
                        ? "0 1px 2px rgba(0,0,0,0.3)"
                        : "0 1px 2px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.08)"
                      : "none",
                    color: active
                      ? isDark
                        ? "rgba(255,255,255,0.95)"
                        : "rgba(0,0,0,0.90)"
                      : isDark
                        ? "rgba(255,255,255,0.45)"
                        : "rgba(0,0,0,0.45)",
                    fontSize: 11,
                    fontWeight: active ? 550 : 450,
                    letterSpacing: "0.01em",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 8px",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dot size */}
        <ExpandSection open={mode === 1} maxH={68}>
          <div style={{ padding: "0 16px 4px", ...rowSt }}>
            <div style={rowH}><span style={labelSt}>Dot Size</span><span style={valueSt}>{Number(halftoneSize).toFixed(1)}px</span></div>
            <Slider min={2} max={10} step={0.5} value={halftoneSize} isDark={isDark} label="Dot size"
              onChange={v => setAndDispatch({ halftoneSize: v })} />
          </div>
        </ExpandSection>

        {/* Intensity */}
        <div style={{ padding: secPad, ...rowSt }}>
          <div style={rowH}><span style={labelSt}>Intensity</span><span style={valueSt}>{Number(intensity).toFixed(2)}</span></div>
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
          <div style={rowH}><span style={labelSt}>Speed</span><span style={valueSt}>{Number(speed).toFixed(2)}×</span></div>
          <Slider min={0.2} max={2.5} step={0.05} value={speed} isDark={isDark} label="Speed"
            onChange={v => setAndDispatch({ speed: v })} />
        </div>

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
