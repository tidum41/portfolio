"use client";

import { useEffect } from "react";
import { useDialKit } from "dialkit";

// Pool size for the echo trail — always allocated in full so the Trail
// "echoCount" dial can be tuned live without remounting the cursor; only the
// first N (per dial) are ever animated/shown, the rest sit hidden.
const MAX_ECHO = 12;
const CURSOR_COLOR_KEY = "ps3cp_cursor_color";
const CURSOR_POS_KEY   = "ps3cp_cursor_pos";

declare global {
  interface Window {
    gc_syncColor?:   (color: string) => void;
    gc_applyColor?:  (color: string) => void;
    gc_morphConfig?: {
      duration: number; textDelay: number;
      collapseDur: number; textFadeDur: number;
      textOffsetX: number; textOffsetY: number;
      timeScale: number;
      expandX1: number; expandY1: number; expandX2: number; expandY2: number;
      collapseX1: number; collapseY1: number; collapseX2: number; collapseY2: number;
      fillEffect: string;
      solidSaturate: number; solidBrightness: number;
      sheenAngle: number; sheenAlpha: number; sheenSpread: number;
      ringFlashColor: string; ringFlashWidth: number; ringFlashAlpha: number; ringFlashDur: number;
      frostedBlur: number; frostedSaturate: number; frostedAlpha: number;
    };
    gc_dotConfig?: {
      restOpacity: number;
      pressScaleAmount: number;
      pressLerp: number;
      idleFadeDelay: number;
      idleFadeDuration: number;
      wrapFadeDuration: number;
    };
    gc_trailConfig?: {
      echoCount: number;
      velocityDecay: number;
      velocitySmoothing: number;
      lerpBase: number;
      lerpSpread: number;
      lerpMin: number;
      speedDivisor: number;
      scaleStart: number;
      scaleFalloff: number;
      opacityStart: number;
      opacityFalloff: number;
    };
  }
}

function bootCursor(lightColor: string, darkColor: string, size: number, zIndex: number): (() => void) | undefined {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(pointer: coarse)").matches) return;

  const getThemeColor = () =>
    document.documentElement.getAttribute("data-theme") === "dark" ? darkColor : lightColor;

  const getTextColor = () => contrastColor(currentColor);

  let currentColor = getThemeColor();

  function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const c = hex.replace("#", "");
    const full = c.length === 3 ? c.split("").map(x => x + x).join("") : c;
    if (full.length < 6) return null;
    return {
      r: parseInt(full.slice(0, 2), 16),
      g: parseInt(full.slice(2, 4), 16),
      b: parseInt(full.slice(4, 6), 16),
    };
  }

  function contrastColor(hex: string): string {
    const rgb = hexToRgb(hex);
    if (!rgb) return "#000000";
    return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255 > 0.55 ? "#000000" : "#ffffff";
  }

  // Translucent variant of the pill fill — lets the blurred backdrop show
  // through, PS3-XMB style, instead of a flat opaque chip.
  function withAlpha(hex: string, alpha: number): string {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }

  const ac  = new AbortController();
  const sig = ac.signal;

  let seededPos: { x: number; y: number } | null = null;
  try {
    const raw = sessionStorage.getItem(CURSOR_POS_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (typeof p.x === "number" && typeof p.y === "number") seededPos = p;
    }
  } catch {}

  const styleEl = document.createElement("style");
  styleEl.textContent = "* { cursor: none !important; }";
  document.head.appendChild(styleEl);

  // Echo trail — full pool always created; tick() shows/animates only the
  // first N per the live "echoCount" dial.
  const echoEls: HTMLDivElement[] = [];
  for (let i = 0; i < MAX_ECHO; i++) {
    const el = document.createElement("div");
    Object.assign(el.style, {
      position: "fixed", top: "0", left: "0",
      width: `${size}px`, height: `${size}px`,
      backgroundColor: currentColor, borderRadius: "50%",
      pointerEvents: "none", zIndex: `${zIndex - 1 - i}`,
      opacity: "0", willChange: "auto",
    });
    document.body.appendChild(el);
    echoEls.push(el);
  }

  // ph: pill height when expanded — 4px taller than the resting dot.
  const ph = size + 4;
  // No permanent stroke on the cursor — used as the box-shadow transition
  // target everywhere (rest and pill alike) so nothing is ever left with a
  // visible ring. Kept as a structured (zero-alpha) inset value rather than
  // "none" so it still interpolates cleanly from the ringFlash pulse.
  const noStroke = (px: number) => `inset 0 0 0 ${px}px rgba(255,255,255,0)`;

  // Single persistent cursor shape. `wrap` tracks the raw mouse position every
  // frame; `cursorEl` is center-anchored inside it via translate(-50%,-50%),
  // so growing/shrinking is always symmetric around the cursor regardless of
  // current size — no top-left corner math, and nothing to hand off between
  // a separate "dot" and "pill" element.
  const wrap = document.createElement("div");
  Object.assign(wrap.style, {
    position: "fixed", top: "0", left: "0",
    pointerEvents: "none", zIndex: `${zIndex}`,
    opacity: "0",
    transition: "opacity 180ms ease",
    willChange: "auto",
    transform: "translate3d(-9999px,-9999px,0)",
  });
  document.body.appendChild(wrap);

  const cursorEl = document.createElement("div");
  Object.assign(cursorEl.style, {
    boxSizing: "border-box",
    display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
    width: `${size}px`, height: `${size}px`, padding: "0px",
    borderRadius: "999px",
    backgroundColor: currentColor,
    backdropFilter: "blur(0px) saturate(100%)",
    WebkitBackdropFilter: "blur(0px) saturate(100%)",
    boxShadow: noStroke(1),
    overflow: "hidden",
    willChange: "auto",
    transform: "translate(-50%,-50%)",
    opacity: String(window.gc_dotConfig?.restOpacity ?? 0.88),
  });
  wrap.appendChild(cursorEl);

  // Sheen overlay for the "gradient" fill effect — a fixed diagonal highlight
  // whose OPACITY fades in/out (fully animatable), instead of trying to
  // CSS-transition between two gradients (browsers don't interpolate those).
  const sheenEl = document.createElement("div");
  Object.assign(sheenEl.style, {
    position: "absolute", inset: "0",
    pointerEvents: "none",
    opacity: "0",
    zIndex: "0",
  });
  cursorEl.appendChild(sheenEl);

  // Text inside pill — separate element for opacity/offset control
  const textSpan = document.createElement("span");
  Object.assign(textSpan.style, {
    position: "relative", zIndex: "1",
    color: getTextColor(),
    fontSize: "13.5px",
    fontWeight: "500",
    letterSpacing: "0.01em",
    marginRight: "-0.01em",
    textAlign: "center",
    whiteSpace: "nowrap",
    opacity: "0",
    userSelect: "none",
    pointerEvents: "none",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
  });
  cursorEl.appendChild(textSpan);

  // Arrow icon — SVG northeast arrow, fades in with text.
  // Explicit width/height + translateZ(0) pins it to its own compositor layer
  // so opacity transitions never cause a sub-pixel position jitter.
  const arrowEl = document.createElement("span");
  Object.assign(arrowEl.style, {
    position: "relative", zIndex: "1",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: "10px", height: "10px",
    flexShrink: "0",
    color: getTextColor(),
    opacity: "0",
    pointerEvents: "none",
    userSelect: "none",
    transition: "none",
    lineHeight: "1",
    transform: "translateZ(0)",
  });
  arrowEl.innerHTML = `<svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="10" x2="10" y2="2"/><polyline points="4,2 10,2 10,8"/></svg>`;
  cursorEl.appendChild(arrowEl);

  const mouse = {
    x: seededPos?.x ?? -999,
    y: seededPos?.y ?? -999,
    inside: seededPos != null,
  };
  const echoes = Array.from({ length: MAX_ECHO }, () => ({ x: mouse.x, y: mouse.y }));

  let lastX = mouse.x, lastY = mouse.y, vel = 0;
  let lastMove = seededPos != null ? performance.now() : 0;
  let raf = 0, isIdle = false, pressScale = 1, pressTarget = 1;
  let gpuPromoted = false, lastPosWrite = 0;
  let isPill = false, pillLabel = "", pillVisible = false, renderedLabel = "";
  let pillIsTimed = false;
  let lastHoverCheck = 0;
  let showPillTimer = 0, timedPillTimeout = 0;
  let pillGen = 0;
  let lastWrapFadeMs = 180;
  const lastOpacity    = new Array(MAX_ECHO).fill(-1);
  const lastTransform  = new Array(MAX_ECHO).fill("");

  const setWillChange = (v: string) => {
    wrap.style.willChange = v;
    echoEls.forEach(el => { el.style.willChange = v; });
  };
  const promoteGPU = () => { if (!gpuPromoted) { gpuPromoted = true; setWillChange("transform"); } };
  const wakeUp = () => {
    if (isIdle) { isIdle = false; setWillChange("transform"); raf = requestAnimationFrame(tick); }
  };

  const morphToPill = (label: string) => {
    clearTimeout(showPillTimer);
    pillGen++;
    const genAtStart = pillGen;
    const cfg = window.gc_morphConfig ?? {} as NonNullable<typeof window.gc_morphConfig>;
    const duration    = cfg.duration    ?? 220;
    const textDelay   = cfg.textDelay   ?? 80;
    const textFadeDur = cfg.textFadeDur ?? 120;
    const timeScale   = cfg.timeScale   ?? 1;
    const expandX1    = cfg.expandX1    ?? 0.4;
    const expandY1    = cfg.expandY1    ?? 0;
    const expandX2    = cfg.expandX2    ?? 0.2;
    const expandY2    = cfg.expandY2    ?? 1;
    const textOffsetX = cfg.textOffsetX ?? 0;
    const textOffsetY = cfg.textOffsetY ?? 0;
    const scaledDur   = duration / timeScale;
    const scaledText  = textDelay / timeScale;
    const scaledFade  = textFadeDur / timeScale;

    // Always restore arrow to flow first — handles switching from a timed pill
    // (where it was display:none) to a non-timed one without leaving it hidden.
    arrowEl.style.display     = "";
    textSpan.textContent      = label;
    textSpan.style.transition = "none";
    textSpan.style.opacity    = "0";
    textSpan.style.transform  = `translate(${textOffsetX}px,${textOffsetY}px)`;
    arrowEl.style.transition  = "none";
    arrowEl.style.opacity     = "0";

    // Capture the box's current size before measuring — this is normally the
    // resting dot size, but if we're interrupting an in-flight collapse it's
    // whatever partial size that was at, so re-expanding never snaps.
    const startRect    = cursorEl.getBoundingClientRect();
    const startPadding = getComputedStyle(cursorEl).padding;
    const startW = startRect.width, startH = startRect.height;

    const fillEffect = cfg.fillEffect ?? "solid";

    const pillPad = pillIsTimed ? "0 12px" : "0 10px 0 12px";
    // For timed pills (no arrow), remove the arrow from layout during
    // measurement so max-content doesn't include its invisible width + gap.
    // Hide arrow from layout for timed pills — keeps it out of max-content
    // measurement AND out of the flex flow during the expanded state so the
    // text stays optically centered. Restored in morphToRest.
    if (pillIsTimed) arrowEl.style.display = "none";
    cursorEl.style.transition = "none";
    cursorEl.style.padding    = pillPad;
    cursorEl.style.height     = `${ph}px`;
    cursorEl.style.overflow   = "visible";
    cursorEl.style.width      = "max-content";
    // Ceil to an integer pixel so the animated width target is always a whole
    // number — prevents a sub-pixel snap at transition-end that shifts flex children.
    const naturalW = Math.ceil(Math.max(cursorEl.getBoundingClientRect().width, size * 2));
    cursorEl.style.overflow   = "hidden";
    cursorEl.style.width      = `${startW}px`;
    cursorEl.style.height     = `${startH}px`;
    cursorEl.style.padding    = startPadding;
    // Do NOT restore arrowEl.display here for timed pills — stays hidden until morphToRest.

    // ringFlash needs its bright frame set *instantly* (transition:none,
    // same context as above) so the upcoming transition eases it back down
    // to the resting ring rather than starting from the resting value.
    if (fillEffect === "ringFlash") {
      const flashColor = cfg.ringFlashColor ?? "#ffffff";
      const flashWidth = cfg.ringFlashWidth ?? 3;
      const flashAlpha = cfg.ringFlashAlpha ?? 0.9;
      cursorEl.style.boxShadow = `inset 0 0 0 ${flashWidth}px ${withAlpha(flashColor, flashAlpha)}`;
    }

    requestAnimationFrame(() => {
      if (pillGen !== genAtStart) return;
      const easing = `cubic-bezier(${expandX1},${expandY1},${expandX2},${expandY2})`;
      let extra = "";

      if (fillEffect === "solid") {
        const sat = cfg.solidSaturate   ?? 100;
        const bri = cfg.solidBrightness ?? 114;
        extra = `, filter ${scaledDur}ms ${easing}`;
        cursorEl.style.filter = `saturate(${sat}%) brightness(${bri}%)`;
      } else if (fillEffect === "frosted") {
        const blur = cfg.frostedBlur     ?? 18;
        const sat  = cfg.frostedSaturate ?? 180;
        const a    = cfg.frostedAlpha    ?? 0.55;
        extra = `, background-color ${scaledDur}ms ${easing}, ` +
                `backdrop-filter ${scaledDur}ms ${easing}, -webkit-backdrop-filter ${scaledDur}ms ${easing}`;
        cursorEl.style.backgroundColor = withAlpha(currentColor, a);
        cursorEl.style.backdropFilter  = `blur(${blur}px) saturate(${sat}%)`;
        (cursorEl.style as unknown as { webkitBackdropFilter: string }).webkitBackdropFilter = `blur(${blur}px) saturate(${sat}%)`;
      } else if (fillEffect === "ringFlash") {
        const flashDur  = (cfg.ringFlashDur ?? 220) / timeScale;
        const flashWidth = cfg.ringFlashWidth ?? 3;
        extra = `, box-shadow ${flashDur}ms ease`;
        cursorEl.style.boxShadow = noStroke(flashWidth); // eases the bright flash frame away to nothing
      } else if (fillEffect === "gradient") {
        const angle  = cfg.sheenAngle  ?? 125;
        const alpha  = cfg.sheenAlpha  ?? 0.35;
        const spread = cfg.sheenSpread ?? 55;
        sheenEl.style.background  = `linear-gradient(${angle}deg, rgba(255,255,255,${alpha}) 0%, rgba(255,255,255,0) ${spread}%)`;
        sheenEl.style.transition  = `opacity ${scaledDur}ms ${easing}`;
        sheenEl.style.opacity     = "1";
      }

      const borderExtra = fillEffect !== "ringFlash" ? `, box-shadow ${scaledDur}ms ${easing}` : "";
      cursorEl.style.transition =
        `width ${scaledDur}ms ${easing}, height ${scaledDur}ms ${easing}, padding ${scaledDur}ms ${easing}, opacity ${scaledDur}ms ${easing}${extra}${borderExtra}`;
      cursorEl.style.width   = `${naturalW}px`;
      cursorEl.style.height  = `${ph}px`;
      cursorEl.style.padding = pillPad;
      cursorEl.style.opacity = "1";
      if (fillEffect !== "ringFlash") {
        cursorEl.style.boxShadow = `inset 0 0 0 1.5px rgba(255,255,255,0.28)`;
      }

      showPillTimer = window.setTimeout(() => {
        if (pillGen !== genAtStart) return;
        const c = window.gc_morphConfig ?? {} as NonNullable<typeof window.gc_morphConfig>;
        textSpan.style.transform  = `translate(${c.textOffsetX ?? 0}px,${c.textOffsetY ?? 0}px)`;
        textSpan.style.transition = `opacity ${scaledFade}ms ease`;
        textSpan.style.opacity    = "1";
        if (!pillIsTimed) {
          arrowEl.style.transition  = `opacity ${scaledFade}ms ease`;
          arrowEl.style.opacity     = "1";
        }
      }, scaledText) as unknown as number;
    });
  };

  const morphToRest = () => {
    clearTimeout(showPillTimer);
    pillGen++;
    const cfg = window.gc_morphConfig ?? {} as NonNullable<typeof window.gc_morphConfig>;
    const colDur      = cfg.collapseDur  ?? 250;
    const textFadeDur = cfg.textFadeDur  ?? 120;
    const timeScale   = cfg.timeScale    ?? 1;
    const collapseX1  = cfg.collapseX1  ?? 0.4;
    const collapseY1  = cfg.collapseY1  ?? 0;
    const collapseX2  = cfg.collapseX2  ?? 0.2;
    const collapseY2  = cfg.collapseY2  ?? 1;
    const scaledCol   = colDur / timeScale;
    const scaledFade  = textFadeDur / timeScale;
    const fillEffect  = cfg.fillEffect  ?? "solid";

    textSpan.style.transition = `opacity ${scaledFade}ms ease`;
    textSpan.style.opacity    = "0";
    arrowEl.style.transition  = `opacity ${scaledFade}ms ease`;
    arrowEl.style.opacity     = "0";

    // Same element, same transition mechanism as the expand — just animating
    // back to the resting dot size. No swap, so nothing to hand off.
    const curve = `cubic-bezier(${collapseX1},${collapseY1},${collapseX2},${collapseY2})`;
    let extra = "";
    if (fillEffect === "solid")        extra = `, filter ${scaledCol}ms ${curve}, box-shadow ${scaledCol}ms ${curve}`;
    else if (fillEffect === "frosted") extra = `, background-color ${scaledCol}ms ${curve}, ` +
                                                `backdrop-filter ${scaledCol}ms ${curve}, -webkit-backdrop-filter ${scaledCol}ms ${curve}` +
                                                `, box-shadow ${scaledCol}ms ${curve}`;
    else if (fillEffect === "gradient") extra = `, box-shadow ${scaledCol}ms ${curve}`;
    else if (fillEffect === "ringFlash") extra = `, box-shadow ${scaledCol}ms ${curve}`;

    cursorEl.style.transition =
      `width ${scaledCol}ms ${curve}, height ${scaledCol}ms ${curve}, padding ${scaledCol}ms ${curve}, opacity ${scaledCol}ms ${curve}${extra}`;
    cursorEl.style.width   = `${size}px`;
    cursorEl.style.height  = `${size}px`;
    cursorEl.style.padding = "0px";
    cursorEl.style.opacity = String(window.gc_dotConfig?.restOpacity ?? 0.88);
    // Back to a plain flat dot regardless of which effect was active.
    cursorEl.style.filter          = "none";
    cursorEl.style.backgroundColor = currentColor;
    cursorEl.style.backdropFilter  = "blur(0px) saturate(100%)";
    (cursorEl.style as unknown as { webkitBackdropFilter: string }).webkitBackdropFilter = "blur(0px) saturate(100%)";
    cursorEl.style.boxShadow = noStroke(1);
    // Restore arrow visibility (was hidden for timed pills during expand)
    arrowEl.style.display = "";

    sheenEl.style.transition = `opacity ${scaledCol}ms ${curve}`;
    sheenEl.style.opacity    = "0";
  };

  // Instant reset to the resting dot — no transition. Used specifically when a
  // click is about to trigger real navigation: a graceful animated collapse
  // would otherwise compete for main-thread paint time with the destination
  // page mounting (video, motion reveals, etc.), which is what reads as a
  // jittery/rubberbanding cursor. Snapping removes that contention entirely.
  const snapToRest = () => {
    clearTimeout(showPillTimer);
    pillGen++;
    textSpan.style.transition = "none";
    textSpan.style.opacity    = "0";
    arrowEl.style.transition  = "none";
    arrowEl.style.opacity     = "0";
    cursorEl.style.transition = "none";
    cursorEl.style.width      = `${size}px`;
    cursorEl.style.height     = `${size}px`;
    cursorEl.style.padding    = "0px";
    cursorEl.style.opacity    = String(window.gc_dotConfig?.restOpacity ?? 0.88);
    cursorEl.style.filter          = "none";
    cursorEl.style.backgroundColor = currentColor;
    cursorEl.style.backdropFilter   = "blur(0px) saturate(100%)";
    (cursorEl.style as unknown as { webkitBackdropFilter: string }).webkitBackdropFilter = "blur(0px) saturate(100%)";
    cursorEl.style.boxShadow = noStroke(1);
    arrowEl.style.display = "";
    sheenEl.style.transition = "none";
    sheenEl.style.opacity    = "0";
  };

  const tick = () => {
    if (!wrap.isConnected) return; // cursor was cleaned up — stop RAF chain
    const dc = window.gc_dotConfig   ?? {} as NonNullable<typeof window.gc_dotConfig>;
    const tc = window.gc_trailConfig ?? {} as NonNullable<typeof window.gc_trailConfig>;

    const now = performance.now();
    vel *= tc.velocityDecay ?? 0.78;
    const fadeDelay = dc.idleFadeDelay    ?? 150;
    const fadeDur   = dc.idleFadeDuration ?? 200;
    const msSinceMove = now - lastMove;
    const idleFade    = msSinceMove < fadeDelay ? 1 : Math.max(0, 1 - (msSinceMove - fadeDelay) / fadeDur);
    const speedFactor = Math.min(1, vel / (tc.speedDivisor ?? 4));
    const fastLerp    = tc.lerpBase   ?? 0.5;
    const spread      = tc.lerpSpread ?? 0.28;
    const lerpMin     = tc.lerpMin    ?? 0.08;
    pressScale += (pressTarget - pressScale) * (dc.pressLerp ?? 0.28);

    const wrapFadeMs = dc.wrapFadeDuration ?? 180;
    if (wrapFadeMs !== lastWrapFadeMs) {
      lastWrapFadeMs = wrapFadeMs;
      wrap.style.transition = `opacity ${wrapFadeMs}ms ease`;
    }

    if (mouse.inside) {
      const rx = Math.round(mouse.x * 2) / 2, ry = Math.round(mouse.y * 2) / 2;
      wrap.style.transform     = `translate3d(${rx}px,${ry}px,0)`;
      wrap.style.opacity       = "1";
      // No click-press squash while the "View Case Study" pill is showing —
      // that scale cue is for the plain dot only.
      cursorEl.style.transform = `translate(-50%,-50%) scale(${pillVisible ? 1 : pressScale})`;
      if (isPill) {
        if (!pillVisible || pillLabel !== renderedLabel) {
          pillVisible = true; renderedLabel = pillLabel; morphToPill(pillLabel);
        }
      } else if (pillVisible) {
        pillVisible = false; renderedLabel = ""; morphToRest();
      }
    } else {
      wrap.style.opacity = "0";
      if (pillVisible) { pillVisible = false; morphToRest(); }
    }

    const count = Math.max(0, Math.min(MAX_ECHO, Math.round(tc.echoCount ?? 6)));
    const scaleStart    = tc.scaleStart    ?? 0.78;
    const scaleFalloff  = tc.scaleFalloff  ?? 0.56;
    const opacityStart  = tc.opacityStart  ?? 0.55;
    const opacityFalloff = tc.opacityFalloff ?? 0.45;

    let allSettled = true;
    for (let i = 0; i < MAX_ECHO; i++) {
      const el = echoEls[i];
      if (!el) continue;
      if (i >= count) {
        if (lastOpacity[i] !== 0) { el.style.opacity = "0"; lastOpacity[i] = 0; }
        continue;
      }
      const tx    = i === 0 ? mouse.x : echoes[i - 1].x;
      const ty    = i === 0 ? mouse.y : echoes[i - 1].y;
      const lerpF = Math.max(lerpMin, fastLerp - i * spread * speedFactor);
      echoes[i].x += (tx - echoes[i].x) * lerpF;
      echoes[i].y += (ty - echoes[i].y) * lerpF;
      const t   = (i + 1) / (count + 1);
      const sc  = scaleStart - t * scaleFalloff;
      const op  = (opacityStart - t * opacityFalloff) * idleFade;
      const rx  = Math.round(echoes[i].x * 2) / 2, ry = Math.round(echoes[i].y * 2) / 2;
      const tr  = `translate3d(${rx - size / 2}px,${ry - size / 2}px,0) scale(${sc})`;
      if (tr !== lastTransform[i]) { el.style.transform = tr; lastTransform[i] = tr; }
      const opR = Math.round(op * 100) / 100;
      if (opR !== lastOpacity[i]) { el.style.opacity = String(opR); lastOpacity[i] = opR; }
      if (Math.abs(echoes[i].x - tx) > 0.1 || Math.abs(echoes[i].y - ty) > 0.1) allSettled = false;
    }

    const pressSettled = Math.abs(pressScale - pressTarget) < 0.001;
    if (allSettled && pressSettled && !mouse.inside && idleFade <= 0) {
      isIdle = true; setWillChange("auto"); return;
    }
    raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);

  function checkPillHover(x: number, y: number) {
    // No heavy throttle — elementFromPoint is a cheap hit-test. A minimal
    // 8ms guard prevents redundant calls within a single animation frame.
    const now = performance.now();
    if (now - lastHoverCheck < 8) return;
    lastHoverCheck = now;
    const el       = document.elementFromPoint(x, y);
    const labelEl  = el?.closest("[data-cursor-label]");
    const newLabel = labelEl?.getAttribute("data-cursor-label") ?? "";
    if (newLabel !== pillLabel) {
      pillLabel    = newLabel;
      isPill       = !!newLabel;
      pillIsTimed  = newLabel ? (labelEl?.hasAttribute("data-cursor-timed") ?? false) : false;
      clearTimeout(timedPillTimeout);
      if (newLabel && pillIsTimed) {
        timedPillTimeout = window.setTimeout(() => {
          isPill = false;
        }, 1000) as unknown as number;
      }
    }
  }

  window.addEventListener("pointermove", (e: PointerEvent) => {
    promoteGPU();
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    const smoothing = window.gc_trailConfig?.velocitySmoothing ?? 0.4;
    vel = vel * (1 - smoothing) + Math.sqrt(dx * dx + dy * dy) * smoothing;
    lastX = e.clientX; lastY = e.clientY;
    mouse.x = e.clientX; mouse.y = e.clientY;
    mouse.inside = true; lastMove = performance.now();
    checkPillHover(e.clientX, e.clientY);
    const now = performance.now();
    if (now - lastPosWrite > 500) {
      try { sessionStorage.setItem(CURSOR_POS_KEY, JSON.stringify({ x: e.clientX, y: e.clientY })); } catch {}
      lastPosWrite = now;
    }
    wakeUp();
  }, { passive: true, signal: sig });

  window.addEventListener("pointerleave", () => {
    mouse.inside = false; vel = 0; wrap.style.opacity = "0";
    if (pillVisible) { pillVisible = false; morphToRest(); }
    isPill = false; pillLabel = ""; renderedLabel = "";
  }, { signal: sig });
  window.addEventListener("pointerenter", (e: PointerEvent) => {
    promoteGPU();
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.inside = true;
    lastX = e.clientX; lastY = e.clientY; lastMove = performance.now(); vel = 0;
    echoes.forEach(ec => { ec.x = e.clientX; ec.y = e.clientY; });
    wakeUp();
  }, { signal: sig });
  window.addEventListener("pointerdown", () => {
    pressTarget = window.gc_dotConfig?.pressScaleAmount ?? 0.6;
    wakeUp();
  }, { signal: sig });
  window.addEventListener("pointerup",   () => { pressTarget = 1;   wakeUp(); }, { signal: sig });
  // Collapse the pill on click — prevents it staying open if the user clicks
  // a case-study card and doesn't move the mouse after navigation.
  document.addEventListener("click", (e) => {
    clearTimeout(timedPillTimeout);
    // Collapse pill but keep pillLabel so a stationary mouse doesn't re-trigger
    // on the same element. It re-arms when the mouse leaves and re-enters.
    isPill = false; pillIsTimed = false; renderedLabel = "";
    // A link click is about to trigger real navigation — snap instantly
    // instead of animating, so the collapse doesn't compete with the new
    // page's own mount work (see snapToRest above).
    const willNavigate = !!(e.target as Element)?.closest?.("a[href]");
    // Project cards ("View Case Study") should always play the normal
    // hover-off morph on click, even though navigation is imminent — the pill
    // collapsing back to a dot is part of the interaction feedback there.
    // Other links still snap instantly to avoid competing with page mount.
    const wasCaseStudyPill = pillLabel === "View Case Study";
    if (pillVisible) {
      pillVisible = false;
      (willNavigate && !wasCaseStudyPill) ? snapToRest() : morphToRest();
    }
  }, { capture: true, signal: sig });
  window.addEventListener("resize", () => {
    if (!mouse.inside) return;
    mouse.x = Math.min(mouse.x, window.innerWidth);
    mouse.y = Math.min(mouse.y, window.innerHeight);
    mouse.inside = true; wakeUp();
  }, { signal: sig });

  const applyColor = (color: string) => {
    currentColor = color;
    const cfg = window.gc_morphConfig ?? {} as NonNullable<typeof window.gc_morphConfig>;
    const isFrostedPill = pillVisible && (cfg.fillEffect ?? "solid") === "frosted";
    cursorEl.style.backgroundColor = isFrostedPill ? withAlpha(color, cfg.frostedAlpha ?? 0.55) : color;
    const tc = getTextColor();
    textSpan.style.color = tc;
    arrowEl.style.color  = tc;
    echoEls.forEach(el => { el.style.backgroundColor = color; });
    try { sessionStorage.setItem(CURSOR_COLOR_KEY, color); } catch {}
  };

  window.addEventListener("ps3-cursor-update", ((e: CustomEvent) => {
    if (e.detail?.color) applyColor(e.detail.color);
  }) as EventListener, { signal: sig });

  window.gc_syncColor = (newDefault: string) => {
    let persisted: string | null = null;
    try { persisted = sessionStorage.getItem(CURSOR_COLOR_KEY); } catch {}
    if (!persisted || persisted === currentColor) { applyColor(newDefault); currentColor = newDefault; }
  };

  window.gc_applyColor = applyColor;

  // Respond to theme changes (light ↔ dark)
  const themeObserver = new MutationObserver(() => {
    const themeColor = getThemeColor();
    let persisted: string | null = null;
    try { persisted = sessionStorage.getItem(CURSOR_COLOR_KEY); } catch {}
    // Only auto-switch if no manual override, or override was one of the two theme defaults
    if (!persisted || persisted === lightColor || persisted === darkColor) {
      applyColor(themeColor);
    }
  });
  themeObserver.observe(document.documentElement, {
    attributes: true, attributeFilter: ["data-theme"],
  });

  return () => {
    ac.abort();
    cancelAnimationFrame(raf);
    clearTimeout(showPillTimer);
    clearTimeout(timedPillTimeout);
    themeObserver.disconnect();
    wrap.remove();
    echoEls.forEach(el => el.remove());
    styleEl.remove();
  };
}

export default function GlobalCustomCursor({
  color     = "#595959",
  darkColor = "#EFEFEF",
  size      = 20,
  zIndex    = 999999,
}: {
  color?:     string;
  darkColor?: string;
  size?:      number;
  zIndex?:    number;
}) {
  const dk = useDialKit("Cursor", {
    size: [20, 8, 48],

    // Dot — the resting cursor shape, independent of the trail behind it.
    Dot: {
      restOpacity:      [0.88, 0.2,  1,   0.01],
      pressScaleAmount: [0.6,  0.3,  1,   0.01], // scale target while a pointer button is held
      pressLerp:        [0.28, 0.05, 0.6, 0.01], // follow speed back to rest scale
      idleFadeDelay:    [150,  0,    500, 5],    // ms after last move before the idle fade starts
      idleFadeDuration: [200,  20,   800, 10],   // ms for that fade to complete
      wrapFadeDuration: [180,  20,   600, 10],   // ms for the whole cursor's enter/leave opacity
    },

    // Trail — the echo dots following the cursor.
    Trail: {
      echoCount:         [6,    0,    12,  1],    // visible echoes (pool is always 12)
      velocityDecay:      [0.78, 0.5,  0.98, 0.01], // per-frame decay of tracked speed
      velocitySmoothing:  [0.4,  0.05, 1,    0.01], // blend weight for new pointer speed samples
      lerpBase:           [0.5,  0.05, 1,    0.01], // base follow speed for echo 0
      lerpSpread:         [0.28, 0,    1,    0.01], // how much slower each further echo follows
      lerpMin:            [0.08, 0.01, 0.3,  0.01], // floor so trailing echoes never fully stall
      speedDivisor:       [4,    1,    20,   0.5],  // higher = speed-based lag kicks in later
      scaleStart:         [0.78, 0.2,  1.2,  0.01], // size of the first echo, relative to the dot
      scaleFalloff:       [0.56, 0,    1,    0.01], // how much smaller each further echo gets
      opacityStart:       [0.55, 0,    1,    0.01], // opacity of the first echo
      opacityFalloff:     [0.45, 0,    1,    0.01], // how much fainter each further echo gets
    },

    // PS3 XMB pacing — slow enough to read as graceful, not sluggish.
    morphDuration:  [260,   60,   900,  10],
    textDelay:      [100,   0,    600,  10],
    collapseDur:    [300,   10,   3000, 10],
    textFadeDur:    [150,   10,   400,  10],
    textOffsetX:    [0,     -20,  20,   0.5],
    textOffsetY:    [0,     -20,  20,   0.5],
    // Slow-mo: 1 = real speed, 0.05 = 20× slower for fine-tuning
    timeScale:      [1,     0.05, 1,    0.05],
    // Expand cubic-bezier — Material "standard" ease: smooth deceleration
    // into place, no overshoot past the target.
    expandX1:       [0.4,   0,    1,    0.01],
    expandY1:       [0,     0,    1,    0.01],
    expandX2:       [0.2,   0,    1,    0.01],
    expandY2:       [1,     0,    1,    0.01],
    // Collapse cubic-bezier — same graceful curve, mirrored — smooth
    // acceleration away, decisive but never abrupt.
    collapseX1:     [0.4,   0,    1,    0.01],
    collapseY1:     [0,     0,    1,    0.01],
    collapseX2:     [0.2,   0,    1,    0.01],
    collapseY2:     [1,     0,    1,    0.01],

    // Pill fill effect — swap between looks without touching the morph timing.
    fillEffect: { type: "select", options: ["solid", "gradient", "ringFlash", "frosted"], default: "solid" },
    // "solid" — opaque fill, brightness bump only (no blur, no shadow)
    solidSaturate:   [100, 100, 220, 5],
    solidBrightness: [114,  90, 130, 1],
    // "gradient" — diagonal highlight sheen faded in via opacity (gradients
    // themselves don't CSS-transition, so the sheen is a separate overlay)
    sheenAngle:  [125,  0,   360, 1],
    sheenAlpha:  [0.35, 0,   1,   0.02],
    sheenSpread: [55,   20,  100, 1],
    // "ringFlash" — a bright ring pops in on expand, then eases back to the
    // resting subtle stroke — an accent flash instead of a shape bounce.
    ringFlashColor: { type: "color", default: "#ffffff" },
    ringFlashWidth: [3,    1,   8,   0.5],
    ringFlashAlpha: [0.9,  0.3, 1,   0.02],
    ringFlashDur:   [220,  60,  600, 10],
    // "frosted" — translucent blurred glass (the original look), now tunable
    frostedBlur:     [18,   0,   40,  1],
    frostedSaturate: [180, 100, 260,  5],
    frostedAlpha:    [0.55, 0.2,  1,  0.01],
  });

  useEffect(() => {
    window.gc_morphConfig = {
      duration:    dk.morphDuration,
      textDelay:   dk.textDelay,
      collapseDur: dk.collapseDur,
      textFadeDur: dk.textFadeDur,
      textOffsetX: dk.textOffsetX,
      textOffsetY: dk.textOffsetY,
      timeScale:   dk.timeScale,
      expandX1:    dk.expandX1,
      expandY1:    dk.expandY1,
      expandX2:    dk.expandX2,
      expandY2:    dk.expandY2,
      collapseX1:  dk.collapseX1,
      collapseY1:  dk.collapseY1,
      collapseX2:  dk.collapseX2,
      collapseY2:  dk.collapseY2,
      fillEffect:      dk.fillEffect,
      solidSaturate:   dk.solidSaturate,
      solidBrightness: dk.solidBrightness,
      sheenAngle:      dk.sheenAngle,
      sheenAlpha:      dk.sheenAlpha,
      sheenSpread:     dk.sheenSpread,
      ringFlashColor:  dk.ringFlashColor,
      ringFlashWidth:  dk.ringFlashWidth,
      ringFlashAlpha:  dk.ringFlashAlpha,
      ringFlashDur:    dk.ringFlashDur,
      frostedBlur:     dk.frostedBlur,
      frostedSaturate: dk.frostedSaturate,
      frostedAlpha:    dk.frostedAlpha,
    };
  }, [dk.morphDuration, dk.textDelay, dk.collapseDur, dk.textFadeDur,
      dk.textOffsetX, dk.textOffsetY, dk.timeScale,
      dk.expandX1, dk.expandY1, dk.expandX2, dk.expandY2,
      dk.collapseX1, dk.collapseY1, dk.collapseX2, dk.collapseY2,
      dk.fillEffect, dk.solidSaturate, dk.solidBrightness,
      dk.sheenAngle, dk.sheenAlpha, dk.sheenSpread,
      dk.ringFlashColor, dk.ringFlashWidth, dk.ringFlashAlpha, dk.ringFlashDur,
      dk.frostedBlur, dk.frostedSaturate, dk.frostedAlpha]);

  useEffect(() => {
    window.gc_dotConfig = {
      restOpacity:      dk.Dot.restOpacity,
      pressScaleAmount: dk.Dot.pressScaleAmount,
      pressLerp:        dk.Dot.pressLerp,
      idleFadeDelay:    dk.Dot.idleFadeDelay,
      idleFadeDuration: dk.Dot.idleFadeDuration,
      wrapFadeDuration: dk.Dot.wrapFadeDuration,
    };
  }, [dk.Dot.restOpacity, dk.Dot.pressScaleAmount, dk.Dot.pressLerp,
      dk.Dot.idleFadeDelay, dk.Dot.idleFadeDuration, dk.Dot.wrapFadeDuration]);

  useEffect(() => {
    window.gc_trailConfig = {
      echoCount:         dk.Trail.echoCount,
      velocityDecay:     dk.Trail.velocityDecay,
      velocitySmoothing: dk.Trail.velocitySmoothing,
      lerpBase:          dk.Trail.lerpBase,
      lerpSpread:        dk.Trail.lerpSpread,
      lerpMin:           dk.Trail.lerpMin,
      speedDivisor:      dk.Trail.speedDivisor,
      scaleStart:        dk.Trail.scaleStart,
      scaleFalloff:      dk.Trail.scaleFalloff,
      opacityStart:      dk.Trail.opacityStart,
      opacityFalloff:    dk.Trail.opacityFalloff,
    };
  }, [dk.Trail.echoCount, dk.Trail.velocityDecay, dk.Trail.velocitySmoothing,
      dk.Trail.lerpBase, dk.Trail.lerpSpread, dk.Trail.lerpMin, dk.Trail.speedDivisor,
      dk.Trail.scaleStart, dk.Trail.scaleFalloff, dk.Trail.opacityStart, dk.Trail.opacityFalloff]);

  useEffect(() => {
    return bootCursor(color, darkColor, dk.size, zIndex);
  }, [color, darkColor, dk.size, zIndex]);

  return null;
}
