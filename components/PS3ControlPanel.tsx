"use client";

import { useEffect, useRef, useState, startTransition, useCallback, useMemo, memo } from "react";
import { createPortal } from "react-dom";
import { useDialKit } from "dialkit";

// Module-level: persists across client-side nav, resets on page reload
let _ps3cpHasLoaded = false;

const PANEL_W = 240;
const PILL_W  = 72;
const PILL_H  = 28;
const EDGE_PAD = 10;
const MAX_W   = 1700;
const EASE_IN = "cubic-bezier(0.4, 0, 1, 1)";
const EXPAND_EASE = "cubic-bezier(0.25, 0, 0, 1)";
const FADE_MS = 2000;
const PICKER_MAX_H = 180;
const BODY_H = 620;

const POS_KEY         = "ps3cp_pos";
const WAVE_COLOR_KEY  = "ps3cp_wave_color";
const MODE_KEY        = "ps3cp_mode";

const DEFAULT_INTENSITY_HT = 0.14; // halftone mode default
const DEFAULT_INTENSITY_WV = 0.04; // wave mode default
const DEFAULT_MOUSE_STR    = 0.11;
const DEFAULT_YOFFSET      = 49;
const DEFAULT_WAVE_COLOR: [number, number, number] = [1, 1, 1];
const DEFAULT_MODE         = 1;
const DEFAULT_HALFTONE_SIZE = 3.0;
const DEFAULT_SPEED        = 1.0;

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

function computeNavAlignedPos(): {x:number;y:number} | null {
  if (typeof window === "undefined") return null;
  const navLink = document.querySelector<HTMLElement>('a[href="/about"]') ?? document.querySelector<HTMLElement>('a[href="./about"]');
  if (!navLink) return null;
  const navRect = navLink.getBoundingClientRect();
  const w = window.innerWidth;
  const leftPad = w > 768 ? 40 : w > 360 ? 32 : 24;
  const containerLeft = w > MAX_W ? (w - MAX_W) / 2 : 0;
  return {
    x: Math.round(containerLeft + leftPad + window.scrollX),
    y: Math.round(navRect.top + navRect.height / 2 - PILL_H / 2 + window.scrollY),
  };
}

function shouldFlip(pillY: number) {
  if (typeof window === "undefined") return false;
  const vy = pillY - window.scrollY;
  return window.innerHeight - vy - PILL_H - EDGE_PAD < BODY_H && vy - EDGE_PAD >= BODY_H;
}

function getGeometry(pillPos: {x:number;y:number}, isOpen: boolean, flipped: boolean) {
  if (typeof window === "undefined") return { w: PILL_W, maxH: PILL_H, r: PILL_H / 2, left: 0, top: 0, clampedBodyH: BODY_H };
  const docW = document.documentElement.scrollWidth;
  const viewportH = window.innerHeight;
  const maxBodyH = Math.max(120, viewportH - PILL_H - EDGE_PAD * 3);
  const clampedBodyH = Math.min(BODY_H, maxBodyH);
  const w = isOpen ? PANEL_W : PILL_W;
  const maxH = isOpen ? PILL_H + clampedBodyH : PILL_H;
  // PS3 XMB feel: rectangular button (not pill) when closed, gently rounded panel when open.
  const r = isOpen ? 14 : 8;
  const rightEdge = pillPos.x + PILL_W;
  const left = Math.max(EDGE_PAD, Math.min(rightEdge - w, docW - w - EDGE_PAD));
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

// ── Slider fill helper ──────────────────────────────────────────────────────
const THUMB_HALF = 0;
function trackFill(val: number, min: number, max: number, dark = false): React.CSSProperties {
  const pct = ((val - min) / (max - min)) * 100;
  const filled = dark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.65)";
  const empty  = dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
  return {
    position: "absolute", top: "50%", left: THUMB_HALF, right: THUMB_HALF,
    height: 2, transform: "translateY(-50%)", borderRadius: 1, pointerEvents: "none",
    background: `linear-gradient(to right,${filled} 0%,${filled} ${pct}%,${empty} ${pct}%,${empty} 100%)`,
  };
}

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

// ── Expand/collapse section ─────────────────────────────────────────────────
function ExpandSection({ open, maxH, children }: { open: boolean; maxH: number; children: React.ReactNode }) {
  return (
    <div style={{
      maxHeight: open ? maxH : 0, overflow: "hidden",
      opacity: open ? 1 : 0,
      transition: open
        ? `max-height 320ms ${EXPAND_EASE}, opacity 220ms ease`
        : `max-height 240ms ${EASE_IN}, opacity 160ms ease`,
      pointerEvents: open ? "auto" : "none",
    }}>
      {children}
    </div>
  );
}

// ── Color picker ────────────────────────────────────────────────────────────
const PS3ColorPicker = memo(function PS3ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  const svRef      = useRef<HTMLDivElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);

  const [hsl, setHsl]         = useState<[number,number,number]>(() => hexToHsl(value || "#999999"));
  const [hexDraft, setHexDraft] = useState((value || "#999999").toUpperCase());

  useEffect(() => { if (value) { setHsl(hexToHsl(value)); setHexDraft(value.toUpperCase()); } }, [value]);

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
    const hex = hslToHex(newHsl[0], newHsl[1], newHsl[2]);
    setHexDraft(hex.toUpperCase()); onChange(hex);
  }, [onChange]);

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

  return (
    <div onPointerDown={e => e.stopPropagation()}>
      <div ref={svRef} style={{ position: "relative", width: "100%", height: 80, borderRadius: 2, overflow: "hidden", marginBottom: 6, touchAction: "none" }}
        onPointerDown={e => { isDragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); applySV(...getSVFromCanvas(e), hsl[0]); }}
        onPointerMove={e => { if (!isDragging.current) return; applySV(...getSVFromCanvas(e), hsl[0]); }}
        onPointerUp={() => { isDragging.current = false; }}
      >
        <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "repeating-linear-gradient(to bottom,transparent 0px,transparent 2px,rgba(0,0,0,0.035) 2px,rgba(0,0,0,0.035) 3px)" }} />
        <div style={{ position: "absolute", left: `${svX}%`, top: `${svY}%`, width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.95)", boxShadow: "0 0 0 1.5px rgba(0,0,0,0.35),0 1px 4px rgba(0,0,0,0.25)", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />
      </div>

      <div style={{ position: "relative", height: 44, display: "flex", alignItems: "center", marginBottom: 6 }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 5, transform: "translateY(-50%)", borderRadius: 1, pointerEvents: "none", background: "linear-gradient(to right,hsl(0,90%,52%),hsl(30,90%,52%),hsl(60,90%,52%),hsl(90,90%,52%),hsl(120,90%,52%),hsl(150,90%,52%),hsl(180,90%,52%),hsl(210,90%,52%),hsl(240,90%,52%),hsl(270,90%,52%),hsl(300,90%,52%),hsl(330,90%,52%),hsl(360,90%,52%))" }} />
        <input type="range" min={0} max={360} step={1} value={Math.round(hsl[0])}
          style={{ position: "relative", zIndex: 1, width: "100%", height: 44, background: "transparent", appearance: "none", WebkitAppearance: "none", outline: "none", margin: 0, padding: 0, touchAction: "none" }}
          onPointerDown={e => e.stopPropagation()}
          onChange={e => {
            const h = parseFloat(e.target.value);
            const newHsl: [number,number,number] = [h, hsl[1], hsl[2]];
            setHsl(newHsl); drawCanvas(h);
            const hex = hslToHex(h, hsl[1], hsl[2]);
            setHexDraft(hex.toUpperCase()); onChange(hex);
          }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 8.5, fontWeight: 600, letterSpacing: "0.09em", color: "rgba(0,0,0,0.28)", flexShrink: 0 }}>HEX</span>
        <input
          value={hexDraft}
          onChange={e => {
            const raw = e.target.value.replace(/[^0-9a-fA-F#]/g, "");
            setHexDraft(raw.toUpperCase());
            const hex = raw.startsWith("#") ? raw : "#" + raw;
            if (/^#[0-9a-fA-F]{6}$/.test(hex)) { setHsl(hexToHsl(hex)); onChange(hex.toLowerCase()); }
          }}
          onPointerDown={e => e.stopPropagation()}
          maxLength={7} spellCheck={false}
          style={{ flex: 1, height: 20, background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.09)", borderRadius: 2, fontSize: 10, letterSpacing: "0.07em", color: "rgba(0,0,0,0.58)", padding: "0 5px", outline: "none", textTransform: "uppercase", boxSizing: "border-box", fontFamily: "monospace", minWidth: 0 }}
        />
      </div>
    </div>
  );
});

// ── CSS injected once ───────────────────────────────────────────────────────
const PANEL_CSS = `
.ps3cp,.ps3cp * { cursor: none !important; }
.ps3cp input[type=range] { -webkit-appearance:none;appearance:none;width:100%;height:44px;background:transparent!important;outline:none;margin:0;padding:0;box-sizing:border-box;touch-action:none; }
.ps3cp input[type=range]::-webkit-slider-runnable-track { height:2px;border-radius:1px;background:transparent; }
.ps3cp input[type=range]::-webkit-slider-thumb { -webkit-appearance:none;width:5px;height:14px;border-radius:2px;background:rgba(0,0,0,0.65);margin-top:-4px; }
html[data-theme=dark] .ps3cp input[type=range]::-webkit-slider-thumb { background:rgba(255,255,255,0.72); }
.ps3cp input[type=range]::-moz-range-track { height:2px;border-radius:1px;background:transparent; }
.ps3cp input[type=range]::-moz-range-thumb { width:5px;height:14px;border-radius:2px;background:rgba(0,0,0,0.65);border:none;margin-top:-4px; }
html[data-theme=dark] .ps3cp input[type=range]::-moz-range-thumb { background:rgba(255,255,255,0.72); }
.ps3cp-ibtn { display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:6px;border:none;background:none;color:rgba(0,0,0,0.28);padding:0;transition:color 120ms ease,transform 120ms ease;position:relative; }
.ps3cp-ibtn::before { content:"";position:absolute;inset:-8px; }
.ps3cp-ibtn:hover { color:rgba(0,0,0,0.55); }
.ps3cp-ibtn:active { transform:scale(0.96); }
.ps3cp-swatch-btn { position:relative;border:none;padding:0;outline:none;transition:transform 150ms ease,border-color 150ms ease; }
.ps3cp-swatch-btn::before { content:"";position:absolute;inset:-6px; }
.ps3cp-swatch-btn:active { transform:scale(0.96)!important; }
.ps3cp-mode-btn { transition:background 120ms ease,color 120ms ease,transform 120ms ease; }
.ps3cp-mode-btn:hover { background:rgba(0,0,0,0.07)!important; }
.ps3cp-mode-btn:active { transform:scale(0.96); }
.ps3cp-color-swatch { transition:transform 120ms ease,box-shadow 120ms ease,border-color 120ms ease;cursor:pointer; }
.ps3cp-color-swatch:active { transform:scale(0.96)!important; }
`;

export default function PS3ControlPanel() {
  const dk = useDialKit("PS3 Pill", {
    chevronOffset:  [-1,   -4, 4, 0.5],
    pillGap:        [4,    2, 10, 0.5],
    menuTextOffset: [-2.5, -4, 4, 0.5],
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

  const [portalEl, setPortalEl]         = useState<HTMLElement | null>(null);
  const [pillPos, setPillPos]           = useState(savedPos.current ?? { x: 0, y: 0 });
  const [posReady, setPosReady]         = useState(savedPos.current !== null);
  const [isOpen, setIsOpen]             = useState(false);
  const [flipped, setFlipped]           = useState(false);
  const [isDragging, setIsDragging]     = useState(false);
  const [shown, setShown]               = useState(!isVeryFirstLoad.current);
  const [showTransition, setShowTransition] = useState(false);
  const [positionSettled, setPositionSettled] = useState(
    savedPos.current !== null && !isVeryFirstLoad.current
  );

  const [intensityHt,  setIntensityHt]  = useState(DEFAULT_INTENSITY_HT); // halftone
  const [intensityWv,  setIntensityWv]  = useState(DEFAULT_INTENSITY_WV); // wave
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

  // Portal setup
  useEffect(() => {
    const el = document.createElement("div");
    el.id = "ps3cp-portal";
    el.style.fontFamily = getComputedStyle(document.body).fontFamily;
    document.body.appendChild(el);
    setPortalEl(el);
    return () => { try { el.remove(); } catch {} };
  }, []);

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
      const w = window.innerWidth, lp = w > 768 ? 40 : w > 360 ? 32 : 24, cl = w > MAX_W ? (w - MAX_W) / 2 : 0;
      startTransition(() => { setPillPos({ x: cl + lp + window.scrollX, y: EDGE_PAD + window.scrollY }); setFlipped(false); setPosReady(true); });
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
      startTransition(() => setShown(true));
      requestAnimationFrame(() => requestAnimationFrame(() => setPositionSettled(true)));
      return;
    }
    const t = setTimeout(() => {
      startTransition(() => setShowTransition(true));
      requestAnimationFrame(() => requestAnimationFrame(() => startTransition(() => {
        setShown(true); setPositionSettled(true);
      })));
      setTimeout(() => startTransition(() => setShowTransition(false)), FADE_MS + 200);
      _ps3cpHasLoaded = true;
    }, 400);
    return () => clearTimeout(t);
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
    // When switching mode without an explicit intensity, dispatch the stored intensity for the new mode
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
        x: Math.max(EDGE_PAD + cw - PILL_W, Math.min(dragRef.current.origX + dx, docW - PILL_W - EDGE_PAD)),
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

  // Derived styling
  const dur = isOpen ? `320ms ${EXPAND_EASE}` : `200ms ${EASE_IN}`;
  const baseMorphParts = [
    `width ${dur}`, `height ${dur}`, `max-height ${dur}`,
    `border-radius ${isOpen ? `300ms ${EXPAND_EASE}` : `180ms ${EASE_IN}`}`,
    `left ${dur}`, `top ${dur}`, "background-color 300ms ease", "border-color 300ms ease",
  ];
  const morphT = !positionSettled ? "none" : isDragging ? "none" : !shown
    ? (showTransition ? `opacity ${FADE_MS}ms ease-out` : "none")
    : (showTransition ? [...baseMorphParts, `opacity ${FADE_MS}ms ease-out`].join(", ") : baseMorphParts.join(", "));

  const geo = getGeometry(pillPos, isOpen, flipped);

  const isDefaultWave = waveColor[0] > 0.9 && waveColor[1] > 0.9 && waveColor[2] > 0.9;
  const wr = Math.round(waveColor[0] * 255), wg = Math.round(waveColor[1] * 255), wb = Math.round(waveColor[2] * 255);
  const tintAmt = isDefaultWave ? 0 : 0.06;
  // PS3 base: deep midnight blue-black (6,8,18) vs flat near-black (16,16,16).
  // The subtle blue undertone is characteristic of PS3 XMB's dark void aesthetic.
  const [baseBgR, baseBgG, baseBgB] = isDark ? [20, 20, 20] : [252, 252, 252];
  const bgR = Math.round(baseBgR * (1 - tintAmt) + wr * tintAmt);
  const bgG = Math.round(baseBgG * (1 - tintAmt) + wg * tintAmt);
  const bgB = Math.round(baseBgB * (1 - tintAmt) + wb * tintAmt);
  const pillBg     = `rgba(${bgR},${bgG},${bgB},${isDark ? "0.93" : "0.82"})`;
  const pillBorder = isDark
    ? "rgba(255,255,255,0.14)"
    : (isDefaultWave ? "rgba(0,0,0,0.28)" : `rgba(${Math.round(wr*0.3)},${Math.round(wg*0.3)},${Math.round(wb*0.3)},0.32)`);
  // PS3 glass sheen: thin inset highlight on the top edge only — flat, no drop shadow.
  const pillShadow = isDark
    ? "inset 0 1px 0 rgba(255,255,255,0.10)"
    : "inset 0 1px 0 rgba(255,255,255,0.60)";
  const accentCol  = isDark ? "rgba(255,255,255,0.62)" : "rgba(0,0,0,0.62)";

  const activePreset = PRESETS.findIndex(p => p.wave.every((v, i) => Math.abs(v - waveColor[i]) < 0.015));

  const labelSt: React.CSSProperties = { fontSize: 11, color: isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.42)", letterSpacing: "0.01em" };
  const valueSt: React.CSSProperties = { fontSize: 11, fontVariantNumeric: "tabular-nums", color: isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.28)", fontFamily: "monospace" };
  const rowSt: React.CSSProperties   = { display: "flex", flexDirection: "column", gap: 4 };
  const rowH: React.CSSProperties    = { display: "flex", alignItems: "center", justifyContent: "space-between" };
  const secPad = "4px 16px 8px";

  const swatchSt = (active: boolean, bg: string): React.CSSProperties => ({
    width: 20, height: 20, borderRadius: 4, flexShrink: 0,
    border: active ? "1.5px solid rgba(0,0,0,0.40)" : "1px solid rgba(0,0,0,0.18)",
    backgroundColor: bg, boxShadow: active ? "0 0 0 2px rgba(0,0,0,0.10)" : "none",
    transition: "border-color 120ms ease, box-shadow 120ms ease, transform 120ms ease",
  });

  const sliderWrap: React.CSSProperties = { position: "relative", overflow: "visible" };

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
      WebkitTapHighlightColor: "transparent",
    }} onClick={e => e.stopPropagation()} onPointerDown={startDrag}>

      {/* Header / pill */}
      <div ref={headerRef} style={{ position: "relative", height: PILL_H, flexShrink: 0, WebkitTapHighlightColor: "transparent" }} role="button" aria-label="Drag or click to toggle panel">
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: dk.pillGap }}>
            <div style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: isDragging ? "none" : "transform 260ms ease", display: "flex", alignItems: "center", marginTop: dk.chevronOffset }}>
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
        <div style={{ padding: "6px 16px 10px" }}>
          <div style={{ ...rowH, marginBottom: 8 }}>
            <span style={labelSt}>pattern color</span>
            <div className="ps3cp-color-swatch" onClick={e => { e.stopPropagation(); setOpenColorPicker(openColorPicker === "pattern" ? null : "pattern"); }} style={swatchSt(openColorPicker === "pattern", rgbToHex(waveColor))} />
          </div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {PRESETS.map((p, i) => (
              <button key={i} className="ps3cp-swatch-btn" onClick={() => setAndDispatch({ waveColor: p.wave })}
                style={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: p.swatch, border: activePreset === i ? "2px solid rgba(0,0,0,0.55)" : "1.5px solid rgba(0,0,0,0.10)", padding: 0, flexShrink: 0, outline: "none", transform: activePreset === i ? "scale(1.18)" : "scale(1)" }} />
            ))}
          </div>
          <ExpandSection open={openColorPicker === "pattern"} maxH={PICKER_MAX_H}>
            <div style={{ paddingTop: 10 }}>
              <PS3ColorPicker value={rgbToHex(waveColor)} onChange={hex => setAndDispatch({ waveColor: hexToRgb01(hex) })} />
            </div>
          </ExpandSection>
        </div>

        {/* Pattern mode */}
        <div style={{ padding: "8px 16px" }}>
          <span style={{ ...labelSt, display: "block", marginBottom: 6 }}>pattern</span>
          <div style={{ display: "flex", gap: 4 }}>
            {["wave", "halftone"].map((m, i) => (
              <button key={m} className="ps3cp-mode-btn" onClick={() => setAndDispatch({ mode: i })} aria-pressed={mode === i}
                style={{ flex: 1, height: 28, borderRadius: 6, border: "none", background: mode === i ? (isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.09)") : (isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"), color: mode === i ? (isDark ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.72)") : (isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)"), fontSize: 11, fontWeight: mode === i ? 500 : 400, letterSpacing: "0.01em" }}>
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Dot size */}
        <ExpandSection open={mode === 1} maxH={72}>
          <div style={{ padding: "0 16px 4px", ...rowSt }}>
            <div style={rowH}><span style={labelSt}>dot size</span><span style={valueSt}>{Number(halftoneSize).toFixed(1)}px</span></div>
            <div style={sliderWrap}>
              <div style={trackFill(halftoneSize, 2, 10, isDark)} />
              <input type="range" min={2} max={10} step={0.5} value={halftoneSize}
                onChange={e => setAndDispatch({ halftoneSize: parseFloat(e.target.value) })}
                style={{ position: "relative", zIndex: 1, width: "100%", background: "transparent" }} />
            </div>
          </div>
        </ExpandSection>

        {/* Intensity */}
        <div style={{ padding: secPad, ...rowSt }}>
          <div style={rowH}><span style={labelSt}>intensity</span><span style={valueSt}>{Number(intensity).toFixed(2)}</span></div>
          <div style={sliderWrap}>
            <div style={trackFill(intensity, 0, 0.4, isDark)} />
            <input type="range" min={0} max={0.4} step={0.01} value={intensity}
              onChange={e => setAndDispatch({ intensity: parseFloat(e.target.value) })}
              style={{ position: "relative", zIndex: 1, width: "100%", background: "transparent" }} />
          </div>
        </div>

        {/* Speed */}
        <div style={{ padding: secPad, ...rowSt }}>
          <div style={rowH}><span style={labelSt}>speed</span><span style={valueSt}>{Number(speed).toFixed(2)}×</span></div>
          <div style={sliderWrap}>
            <div style={trackFill(speed, 0.2, 2.5, isDark)} />
            <input type="range" min={0.2} max={2.5} step={0.05} value={speed}
              onChange={e => setAndDispatch({ speed: parseFloat(e.target.value) })}
              style={{ position: "relative", zIndex: 1, width: "100%", background: "transparent" }} />
          </div>
        </div>

        {/* Y offset */}
        <div style={{ padding: secPad, ...rowSt }}>
          <div style={rowH}><span style={labelSt}>y offset</span><span style={valueSt}>{Math.round(yOffset)}px</span></div>
          <div style={sliderWrap}>
            <div style={trackFill(yOffset, -200, 200, isDark)} />
            <input type="range" min={-200} max={200} step={1} value={yOffset}
              onChange={e => setAndDispatch({ yOffset: parseFloat(e.target.value) })}
              style={{ position: "relative", zIndex: 1, width: "100%", background: "transparent" }} />
          </div>
        </div>

        {/* Cursor reactivity */}
        <div style={{ padding: secPad, ...rowSt }}>
          <div style={rowH}><span style={labelSt}>cursor reactivity</span><span style={valueSt}>{Number(mouseStr).toFixed(3)}</span></div>
          <div style={sliderWrap}>
            <div style={trackFill(mouseStr, 0, 0.3, isDark)} />
            <input type="range" min={0} max={0.3} step={0.005} value={mouseStr}
              onChange={e => setAndDispatch({ mouseStrength: parseFloat(e.target.value) })}
              style={{ position: "relative", zIndex: 1, width: "100%", background: "transparent" }} />
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
