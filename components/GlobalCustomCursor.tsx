"use client";

import { useEffect } from "react";
import { useDialKit } from "dialkit";

const ECHO_COUNT = 6;
const CURSOR_COLOR_KEY = "ps3cp_cursor_color";
const CURSOR_POS_KEY = "ps3cp_cursor_pos";
const BOOT_KEY = "gc_booted";

// Declare on window for inter-component communication
declare global {
  interface Window {
    [BOOT_KEY]?: boolean;
    gc_syncColor?: (color: string) => void;
  }
}

function bootCursor(defaultColor: string, size: number, zIndex: number) {
  if (typeof window === "undefined") return;
  if (window[BOOT_KEY]) {
    window.gc_syncColor?.(defaultColor);
    return;
  }
  window[BOOT_KEY] = true;

  // Hide on touch devices
  if (window.matchMedia("(pointer: coarse)").matches) return;

  let currentColor = defaultColor;
  try { currentColor = sessionStorage.getItem(CURSOR_COLOR_KEY) || defaultColor; } catch {}

  let seededPos: { x: number; y: number } | null = null;
  try {
    const raw = sessionStorage.getItem(CURSOR_POS_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (typeof p.x === "number" && typeof p.y === "number") seededPos = p;
    }
  } catch {}

  // Inject cursor-none stylesheet
  const styleEl = document.createElement("style");
  styleEl.textContent = "* { cursor: none !important; }";
  document.head.appendChild(styleEl);

  // Create echo elements (rendered behind main dot)
  const echoEls: HTMLDivElement[] = [];
  for (let i = 0; i < ECHO_COUNT; i++) {
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

  // Main dot
  const dot = document.createElement("div");
  Object.assign(dot.style, {
    position: "fixed", top: "0", left: "0",
    width: `${size}px`, height: `${size}px`,
    backgroundColor: currentColor, borderRadius: "50%",
    pointerEvents: "none", zIndex: `${zIndex}`,
    opacity: "0", willChange: "auto",
    transition: "opacity 120ms ease",
  });
  document.body.appendChild(dot);

  const mouse = {
    x: seededPos?.x ?? -999,
    y: seededPos?.y ?? -999,
    inside: seededPos != null,
  };
  const echoes = Array.from({ length: ECHO_COUNT }, () => ({ x: mouse.x, y: mouse.y }));

  let lastX = mouse.x, lastY = mouse.y, vel = 0;
  let lastMove = seededPos != null ? performance.now() : 0;
  let raf = 0, isIdle = false, pressScale = 1, pressTarget = 1;
  let gpuPromoted = false, lastPosWrite = 0;
  const lastOpacity = new Array(ECHO_COUNT).fill(-1);
  const lastTransform = new Array(ECHO_COUNT).fill("");

  const setWillChange = (v: string) => {
    dot.style.willChange = v;
    echoEls.forEach((el) => { el.style.willChange = v; });
  };
  const promoteGPU = () => { if (!gpuPromoted) { gpuPromoted = true; setWillChange("transform"); } };
  const wakeUp = () => {
    if (isIdle) { isIdle = false; setWillChange("transform"); raf = requestAnimationFrame(tick); }
  };

  const tick = () => {
    const now = performance.now();
    vel *= 0.78;
    const msSinceMove = now - lastMove;
    const idleFade = msSinceMove < 150 ? 1 : Math.max(0, 1 - (msSinceMove - 150) / 200);
    const speedFactor = Math.min(1, vel / 4), fastLerp = 0.5, spread = 0.28;
    pressScale += (pressTarget - pressScale) * 0.2;

    if (mouse.inside) {
      const rx = Math.round(mouse.x * 2) / 2, ry = Math.round(mouse.y * 2) / 2;
      dot.style.transform = `translate3d(${rx - size / 2}px,${ry - size / 2}px,0) scale(${pressScale})`;
      dot.style.opacity = "1";
    }

    let allSettled = true;
    for (let i = 0; i < ECHO_COUNT; i++) {
      const el = echoEls[i];
      if (!el) continue;
      const tx = i === 0 ? mouse.x : echoes[i - 1].x;
      const ty = i === 0 ? mouse.y : echoes[i - 1].y;
      const lerpF = Math.max(0.08, fastLerp - i * spread * speedFactor);
      echoes[i].x += (tx - echoes[i].x) * lerpF;
      echoes[i].y += (ty - echoes[i].y) * lerpF;
      const t = (i + 1) / (ECHO_COUNT + 1);
      const scale = 0.78 - t * 0.56;
      const opacity = (0.55 - t * 0.45) * idleFade;
      const rx = Math.round(echoes[i].x * 2) / 2, ry = Math.round(echoes[i].y * 2) / 2;
      const tr = `translate3d(${rx - size / 2}px,${ry - size / 2}px,0) scale(${scale})`;
      if (tr !== lastTransform[i]) { el.style.transform = tr; lastTransform[i] = tr; }
      const op = Math.round(opacity * 100) / 100;
      if (op !== lastOpacity[i]) { el.style.opacity = String(op); lastOpacity[i] = op; }
      if (Math.abs(echoes[i].x - tx) > 0.1 || Math.abs(echoes[i].y - ty) > 0.1) allSettled = false;
    }

    const pressSettled = Math.abs(pressScale - pressTarget) < 0.001;
    if (allSettled && pressSettled && !mouse.inside && idleFade <= 0) {
      isIdle = true; setWillChange("auto"); return;
    }
    raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);

  window.addEventListener("pointermove", (e: PointerEvent) => {
    promoteGPU();
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    vel = vel * 0.6 + Math.sqrt(dx * dx + dy * dy) * 0.4;
    lastX = e.clientX; lastY = e.clientY;
    mouse.x = e.clientX; mouse.y = e.clientY;
    mouse.inside = true; lastMove = performance.now();
    const now = performance.now();
    if (now - lastPosWrite > 500) {
      try { sessionStorage.setItem(CURSOR_POS_KEY, JSON.stringify({ x: e.clientX, y: e.clientY })); } catch {}
      lastPosWrite = now;
    }
    wakeUp();
  }, { passive: true });

  window.addEventListener("pointerleave", () => { mouse.inside = false; vel = 0; dot.style.opacity = "0"; });
  window.addEventListener("pointerenter", (e: PointerEvent) => {
    promoteGPU();
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.inside = true;
    lastX = e.clientX; lastY = e.clientY; lastMove = performance.now(); vel = 0;
    echoes.forEach((ec) => { ec.x = e.clientX; ec.y = e.clientY; });
    wakeUp();
  });
  window.addEventListener("pointerdown", () => { pressTarget = 0.6; wakeUp(); });
  window.addEventListener("pointerup",   () => { pressTarget = 1;   wakeUp(); });
  window.addEventListener("resize", () => {
    if (!mouse.inside) return;
    mouse.x = Math.min(mouse.x, window.innerWidth);
    mouse.y = Math.min(mouse.y, window.innerHeight);
    mouse.inside = true; wakeUp();
  });

  const applyColor = (color: string) => {
    dot.style.backgroundColor = color;
    echoEls.forEach((el) => { el.style.backgroundColor = color; });
    try { sessionStorage.setItem(CURSOR_COLOR_KEY, color); } catch {}
  };

  window.addEventListener("ps3-cursor-update", ((e: CustomEvent) => {
    if (e.detail?.color) applyColor(e.detail.color);
  }) as EventListener);

  window.gc_syncColor = (newDefault: string) => {
    let persisted: string | null = null;
    try { persisted = sessionStorage.getItem(CURSOR_COLOR_KEY); } catch {}
    if (!persisted || persisted === currentColor) { applyColor(newDefault); currentColor = newDefault; }
  };
}

export default function GlobalCustomCursor({
  color = "#595959",
  size = 20,
  zIndex = 999999,
}: {
  color?: string;
  size?: number;
  zIndex?: number;
}) {
  const dk = useDialKit("Cursor", {
    size:       [size,   8, 48],
    echoCount:  [6,      0, 12],
    lerpFactor: [0.08,   0.01, 0.5],
  });

  useEffect(() => {
    bootCursor(color, dk.size, zIndex);
  }, [color, dk.size, zIndex]);

  return null;
}
