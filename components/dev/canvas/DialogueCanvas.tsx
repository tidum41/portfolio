"use client";

import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import { isEditableTarget } from "@/lib/isEditableTarget";
import { DIALOGUE_CANVAS_REGISTRY, type CanvasRegistryEntry } from "./registry";
import type { LiveComponent, LiveManifest } from "./liveManifest";
import { auditPane, type AuditFlag } from "./auditPane";
import "./dialogue-canvas.css";

/**
 * Freeform canvas for the Dialogue components in ./registry.
 *
 * Camera and item positions live outside the previews: pan and zoom write
 * one transform to the world wrapper per animation frame, item moves write
 * left and top on the moved item only, and neither remounts a preview.
 * Saved layout is camera plus positions by registry id, nothing else.
 */

const STORAGE_KEY = "muditm:dialogue-canvas:v2";
const LABEL_H = 30;
const MIN_ZOOM = 0.05;
const MAX_ZOOM = 3;
const MAX_COORD = 20000;

type XY = { x: number; y: number };
type Camera = { x: number; y: number; zoom: number };
type Positions = Record<string, XY>;

type Gesture =
  | { kind: "pan"; pointerId: number; startX: number; startY: number; cam: Camera; moved: boolean }
  | {
      kind: "move";
      pointerId: number;
      id: string;
      startX: number;
      startY: number;
      orig: XY;
      current: XY;
      moved: boolean;
    }
  | {
      kind: "pinch";
      startDist: number;
      midX: number;
      midY: number;
      worldX: number;
      worldY: number;
      cam: Camera;
      moved: boolean;
    };

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

function finite(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

/** Entries whose primary file (and scenario) the case study renders today. Set once per render of DialogueCanvas from the server manifest. */
let ACTIVE: CanvasRegistryEntry[] = DIALOGUE_CANVAS_REGISTRY;

let auditQueue = 0;
const PANE_GAP = 16;
const META_H = 168;
/** A tile holds the light pane and the dark pane side by side, then the token and flag strip. */
const tileW = (e: CanvasRegistryEntry) => e.width * 2 + PANE_GAP;
const tileH = (e: CanvasRegistryEntry) => e.height + META_H;

/** Shelf-pack the live entries, widest first, so new and removed components never overlap. */
function defaultPositions(): Positions {
  const out: Positions = {};
  const rowW = 3600;
  let x = 0;
  let y = 0;
  let rowH = 0;
  for (const entry of [...ACTIVE].sort((a, b) => b.height - a.height)) {
    if (x > 0 && x + tileW(entry) > rowW) {
      x = 0;
      y += rowH + LABEL_H + 64;
      rowH = 0;
    }
    out[entry.id] = { x, y };
    x += tileW(entry) + 64;
    rowH = Math.max(rowH, tileH(entry));
  }
  return out;
}

function loadSaved(): { camera: Camera | null; positions: Positions | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { camera: null, positions: null };
    const doc = JSON.parse(raw) as { version?: unknown; camera?: unknown; positions?: unknown };
    if (doc.version !== 1) return { camera: null, positions: null };
    let camera: Camera | null = null;
    const c = doc.camera as Partial<Camera> | null;
    if (c && finite(c.x) && finite(c.y) && finite(c.zoom)) {
      camera = {
        x: clamp(c.x, -MAX_COORD, MAX_COORD),
        y: clamp(c.y, -MAX_COORD, MAX_COORD),
        zoom: clamp(c.zoom, MIN_ZOOM, MAX_ZOOM),
      };
    }
    let positions: Positions | null = null;
    if (doc.positions && typeof doc.positions === "object") {
      positions = {};
      const saved = doc.positions as Record<string, Partial<XY>>;
      for (const entry of ACTIVE) {
        const p = saved[entry.id];
        if (p && finite(p.x) && finite(p.y)) {
          positions[entry.id] = {
            x: clamp(p.x, -MAX_COORD, MAX_COORD),
            y: clamp(p.y, -MAX_COORD, MAX_COORD),
          };
        }
      }
    }
    return { camera, positions };
  } catch {
    return { camera: null, positions: null };
  }
}

function GripIcon() {
  return (
    <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor" aria-hidden>
      <circle cx="2.5" cy="2.5" r="1.3" />
      <circle cx="7.5" cy="2.5" r="1.3" />
      <circle cx="2.5" cy="8" r="1.3" />
      <circle cx="7.5" cy="8" r="1.3" />
      <circle cx="2.5" cy="13.5" r="1.3" />
      <circle cx="7.5" cy="13.5" r="1.3" />
    </svg>
  );
}

const CanvasItem = memo(function CanvasItem({
  entry,
  pos,
  meta,
  onMoveBy,
  registerItem,
}: {
  entry: CanvasRegistryEntry;
  pos: XY;
  meta: LiveComponent | undefined;
  onMoveBy: (id: string, dx: number, dy: number) => void;
  registerItem: (id: string, el: HTMLDivElement | null) => void;
}) {
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef(0);
  const labelRef = useRef<HTMLButtonElement>(null);
  const { Component } = entry;
  const lightRef = useRef<HTMLDivElement>(null);
  const darkRef = useRef<HTMLDivElement>(null);
  const [flags, setFlags] = useState<AuditFlag[]>([]);

  // Audit the rendered panes after fonts and figures settle: hardcoded colour,
  // WCAG AA contrast, off-system font. Live DOM, so it never goes stale.
  useEffect(() => {
    // Tiles take turns, one per 120ms, so the audit never blocks first paint.
    const slot = auditQueue++;
    const t = window.setTimeout(() => {
      const out: AuditFlag[] = [];
      if (lightRef.current) out.push(...auditPane(lightRef.current, "light"));
      if (darkRef.current) out.push(...auditPane(darkRef.current, "dark"));
      setFlags(out);
    }, 1500 + slot * 120);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(
    () => () => {
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
    },
    [],
  );

  const copyName = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(entry.name);
      setCopied(true);
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard refused: leave the name selectable instead of claiming success.
      const el = labelRef.current;
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  };

  const onHandleKeyDown = (e: ReactKeyboardEvent) => {
    const step = e.shiftKey ? 10 : 1;
    const moves: Record<string, XY> = {
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: -step },
      ArrowDown: { x: 0, y: step },
    };
    const d = moves[e.key];
    if (!d) return;
    e.preventDefault();
    e.stopPropagation();
    onMoveBy(entry.id, d.x, d.y);
  };

  return (
    <div
      className="dc-item"
      data-canvas-item={entry.id}
      ref={(el) => registerItem(entry.id, el)}
      style={{ left: pos.x, top: pos.y, width: tileW(entry) }}
    >
      <div className="dc-item-head">
        <button
          type="button"
          className="dc-handle"
          data-canvas-handle={entry.id}
          aria-label={`Move ${entry.name}`}
          title="Drag to move. Arrow keys move it, Shift makes bigger steps."
          onKeyDown={onHandleKeyDown}
        >
          <GripIcon />
        </button>
        <button
          type="button"
          ref={labelRef}
          className="dc-label"
          data-canvas-label={entry.id}
          title="Copy name"
          aria-label={`Copy name: ${entry.name}`}
          onClick={copyName}
        >
          {entry.name}
        </button>
        {copied ? (
          <span className="dc-copied" role="status">
            Copied
          </span>
        ) : null}
      </div>
      <div className="dc-panes" style={{ gap: PANE_GAP }}>
        {(["light", "dark"] as const).map((theme) => (
          <div key={theme} className="dc-pane">
            <span className="dc-pane-label">{theme === "light" ? "Light" : "Dark"}</span>
            <div
              className={`dc-preview dc-preview--${theme}`}
              data-canvas-pane={theme}
              ref={theme === "light" ? lightRef : darkRef}
              style={{ width: entry.width, height: entry.height }}
            >
              <Component />
            </div>
          </div>
        ))}
      </div>
      <div className="dc-meta" style={{ height: META_H }}>
        <p className="dc-meta-line">
          <span className="dc-meta-file">{entry.files[0]?.replace("components/dialogue/", "")}</span>
          {entry.scenario ? <span> · scenario {entry.scenario}</span> : null}
          {meta?.via ? <span> · via {meta.via}</span> : null}
        </p>
        <p className="dc-meta-line">
          {meta?.allowlisted ? (
            <span className="dc-ok">On SYSTEM-COMPONENTS allowlist</span>
          ) : (
            <span className="dc-flag">Not on SYSTEM-COMPONENTS allowlist</span>
          )}
          <span className={flags.length ? "dc-flag" : "dc-ok"}>
            {" · "}
            {flags.length ? `${flags.length} audit flags` : "No audit flags"}
          </span>
        </p>
        <p className="dc-meta-line dc-meta-tokens" title={(meta?.tokens ?? []).join(" ")}>
          Tokens: {(meta?.tokens ?? []).join(" ") || "none found in CSS"}
        </p>
        {flags.length ? (
          <ul className="dc-flags">
            {flags.map((f, i) => (
              <li key={i}>
                <span className="dc-flag">{f.pane} · {f.kind}</span> {f.el}: {f.message}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
});

export default function DialogueCanvas({ manifest }: { manifest: LiveManifest }) {
  const liveFiles = new Set(manifest.components.map((c) => c.file));
  const liveScenarios = new Set(manifest.scenarios);
  ACTIVE = DIALOGUE_CANVAS_REGISTRY.filter(
    (e) => liveFiles.has(e.files[0]!) && (!e.scenario || liveScenarios.has(e.scenario)),
  );
  const metaByFile = new Map(manifest.components.map((c) => [c.file, c]));
  const covered = new Set(ACTIVE.flatMap((e) => e.files));
  const uncovered = manifest.components.filter((c) => !covered.has(c.file));
  const offList = manifest.components.filter((c) => !c.allowlisted);
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const itemEls = useRef(new Map<string, HTMLDivElement>());
  const cameraRef = useRef<Camera>({ x: 48, y: 48, zoom: 1 });
  const positionsRef = useRef<Positions>(defaultPositions());
  const gestureRef = useRef<Gesture | null>(null);
  const pointersRef = useRef(new Map<number, XY>());
  const spaceRef = useRef(false);
  const suppressClickUntil = useRef(0);
  const saveTimer = useRef(0);
  const rafRef = useRef(0);

  const registerItem = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) itemEls.current.set(id, el);
    else itemEls.current.delete(id);
  }, []);

  const [positions, setPositions] = useState<Positions>(defaultPositions);
  const [zoomPct, setZoomPct] = useState(100);
  const themeSelectRef = useRef<HTMLSelectElement>(null);
  // False during SSR and the hydration render, true right after. The tree
  // is portaled to <body> once this flips (see the return below).
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const applyCamera = useCallback(() => {
    const world = worldRef.current;
    if (!world) return;
    const { x, y, zoom } = cameraRef.current;
    world.style.transform = `translate(${x}px, ${y}px) scale(${zoom})`;
    setZoomPct((prev) => {
      const next = Math.round(zoom * 100);
      return prev === next ? prev : next;
    });
  }, []);

  // The portal move replaces the DOM nodes, so camera and zoom state that
  // were written straight to the first-paint nodes are re-applied after it.
  useEffect(() => {
    if (mounted) applyCamera();
  }, [mounted, applyCamera]);

  const scheduleApply = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      applyCamera();
    });
  }, [applyCamera]);

  const saveNow = useCallback(() => {
    try {
      const doc = {
        version: 1,
        camera: cameraRef.current,
        positions: positionsRef.current,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
    } catch {
      // Storage full or unavailable: the canvas keeps working unsaved.
    }
  }, []);

  const scheduleSave = useCallback(() => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      saveTimer.current = 0;
      saveNow();
    }, 250);
  }, [saveNow]);

  const zoomAt = useCallback(
    (cx: number, cy: number, factor: number) => {
      const cam = cameraRef.current;
      const zoom = clamp(cam.zoom * factor, MIN_ZOOM, MAX_ZOOM);
      if (zoom === cam.zoom) return;
      const worldX = (cx - cam.x) / cam.zoom;
      const worldY = (cy - cam.y) / cam.zoom;
      cameraRef.current = { x: cx - worldX * zoom, y: cy - worldY * zoom, zoom };
      scheduleApply();
    },
    [scheduleApply],
  );

  const zoomFromCenter = useCallback(
    (factor: number) => {
      const vp = viewportRef.current;
      if (!vp) return;
      zoomAt(vp.clientWidth / 2, vp.clientHeight / 2, factor);
      scheduleSave();
    },
    [zoomAt, scheduleSave],
  );

  const fitAll = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const entry of ACTIVE) {
      const p = positionsRef.current[entry.id] ?? entry;
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y - LABEL_H);
      maxX = Math.max(maxX, p.x + tileW(entry));
      maxY = Math.max(maxY, p.y + tileH(entry));
    }
    const bw = Math.max(maxX - minX, 1);
    const bh = Math.max(maxY - minY, 1);
    const pad = 48;
    const zoom = clamp(
      Math.min((vp.clientWidth - pad * 2) / bw, (vp.clientHeight - pad * 2) / bh, 1),
      MIN_ZOOM,
      1,
    );
    cameraRef.current = {
      x: pad - minX * zoom + Math.max(0, (vp.clientWidth - pad * 2 - bw * zoom) / 2),
      y: pad - minY * zoom + Math.max(0, (vp.clientHeight - pad * 2 - bh * zoom) / 2),
      zoom,
    };
    applyCamera();
    scheduleSave();
  }, [applyCamera, scheduleSave]);

  const resetCamera = useCallback(() => {
    cameraRef.current = { x: 48, y: 48, zoom: 1 };
    applyCamera();
    scheduleSave();
  }, [applyCamera, scheduleSave]);

  const moveBy = useCallback(
    (id: string, dx: number, dy: number) => {
      const cur = positionsRef.current[id];
      if (!cur) return;
      const next = {
        ...positionsRef.current,
        [id]: { x: clamp(cur.x + dx, -MAX_COORD, MAX_COORD), y: clamp(cur.y + dy, -MAX_COORD, MAX_COORD) },
      };
      positionsRef.current = next;
      setPositions(next);
      scheduleSave();
    },
    [scheduleSave],
  );

  const applyTheme = (next: "light" | "dark") => {
    const html = document.documentElement;
    // Same theme API as components/ThemeToggle.tsx: data-theme on <html>
    // plus the "theme" key in localStorage.
    html.classList.add("theme-switching");
    void html.offsetWidth;
    html.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Preference just will not persist.
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(() => html.classList.remove("theme-switching"));
    });
  };

  // Restore the saved layout once the portal is in place, or fit everything
  // on a first visit. Positions are written straight to the item nodes and
  // positionsRef; React state only mirrors them after the first move, so a
  // restore never fights the render that is already on screen.
  useEffect(() => {
    if (!mounted) return;
    const saved = loadSaved();
    if (saved.positions) {
      positionsRef.current = { ...defaultPositions(), ...saved.positions };
      for (const entry of ACTIVE) {
        const el = itemEls.current.get(entry.id);
        const p = positionsRef.current[entry.id];
        if (el && p) {
          el.style.left = `${p.x}px`;
          el.style.top = `${p.y}px`;
        }
      }
    }
    if (saved.camera) {
      cameraRef.current = saved.camera;
      applyCamera();
    } else {
      fitAll();
    }
    if (themeSelectRef.current) {
      themeSelectRef.current.value =
        document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    }
  }, [mounted, applyCamera, fitAll]);

  // Block Chrome horizontal history swipes while the canvas is mounted.
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overscrollBehaviorX;
    html.style.overscrollBehaviorX = "none";
    return () => {
      html.style.overscrollBehaviorX = prev;
    };
  }, []);

  // The site binds global single-key shortcuts (for example the preview
  // toolbar). Typed characters aimed at an editable element inside the
  // canvas must not reach them, the same guard AgentationMount uses.
  useEffect(() => {
    const KEY_EVENTS = ["keydown", "keypress", "keyup"] as const;
    const guard = (e: Event) => {
      const k = e as KeyboardEvent;
      if (!(k.key.length === 1 && !k.ctrlKey && !k.metaKey && !k.altKey)) return;
      if (!isEditableTarget(k)) return;
      const root = rootRef.current;
      if (!root) return;
      const inCanvas = k
        .composedPath()
        .some((n) => n instanceof Node && (n === root || root.contains(n)));
      if (inCanvas) k.stopImmediatePropagation();
    };
    for (const t of KEY_EVENTS) window.addEventListener(t, guard, true);
    return () => {
      for (const t of KEY_EVENTS) window.removeEventListener(t, guard, true);
    };
  }, []);

  // Ctrl or Meta + wheel zooms at the pointer. Plain wheel pans, unless a
  // nested scroll area under the pointer can still scroll that way.
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const canScrollFrom = (target: EventTarget | null, dx: number, dy: number) => {
      let el = target instanceof HTMLElement ? target : null;
      while (el && el !== vp) {
        const st = getComputedStyle(el);
        if (dy !== 0 && (st.overflowY === "auto" || st.overflowY === "scroll") && el.scrollHeight > el.clientHeight + 1) {
          if (dy > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true;
          if (dy < 0 && el.scrollTop > 0) return true;
        }
        if (dx !== 0 && (st.overflowX === "auto" || st.overflowX === "scroll") && el.scrollWidth > el.clientWidth + 1) {
          if (dx > 0 && el.scrollLeft + el.clientWidth < el.scrollWidth - 1) return true;
          if (dx < 0 && el.scrollLeft > 0) return true;
        }
        el = el.parentElement;
      }
      return false;
    };
    const onWheel = (e: WheelEvent) => {
      const unit = e.deltaMode === 1 ? 16 : 1;
      const dx = e.deltaX * unit;
      const dy = e.deltaY * unit;
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const rect = vp.getBoundingClientRect();
        zoomAt(e.clientX - rect.left, e.clientY - rect.top, Math.exp(-dy * 0.0025));
        scheduleSave();
        return;
      }
      if (canScrollFrom(e.target, dx, dy)) return;
      e.preventDefault();
      cameraRef.current = { ...cameraRef.current, x: cameraRef.current.x - dx, y: cameraRef.current.y - dy };
      scheduleApply();
      scheduleSave();
    };
    vp.addEventListener("wheel", onWheel, { passive: false });
    return () => vp.removeEventListener("wheel", onWheel);
    // `mounted` is a dep because the portal move swaps the viewport node;
    // a listener left on the first-paint node would never fire again.
  }, [zoomAt, scheduleApply, scheduleSave, mounted]);

  // Pointer gestures. One engine on window so a gesture keeps tracking
  // outside the element that started it.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (pointersRef.current.has(e.pointerId)) {
        pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }
      const g = gestureRef.current;
      if (!g) return;
      if (g.kind === "pinch") {
        if (pointersRef.current.size < 2) return;
        const [a, b] = [...pointersRef.current.values()] as [XY, XY];
        const vp = viewportRef.current;
        if (!vp) return;
        const rect = vp.getBoundingClientRect();
        const dist = Math.max(Math.hypot(a.x - b.x, a.y - b.y), 1);
        const midX = (a.x + b.x) / 2 - rect.left;
        const midY = (a.y + b.y) / 2 - rect.top;
        const zoom = clamp(g.cam.zoom * (dist / g.startDist), MIN_ZOOM, MAX_ZOOM);
        cameraRef.current = { x: midX - g.worldX * zoom, y: midY - g.worldY * zoom, zoom };
        g.moved = true;
        scheduleApply();
        return;
      }
      if (e.pointerId !== g.pointerId) return;
      if (g.kind === "pan") {
        const dx = e.clientX - g.startX;
        const dy = e.clientY - g.startY;
        if (Math.abs(dx) + Math.abs(dy) > 3) g.moved = true;
        cameraRef.current = { ...g.cam, x: g.cam.x + dx, y: g.cam.y + dy };
        scheduleApply();
      } else {
        const zoom = cameraRef.current.zoom;
        const dx = (e.clientX - g.startX) / zoom;
        const dy = (e.clientY - g.startY) / zoom;
        if (Math.abs(dx) + Math.abs(dy) > 2) g.moved = true;
        g.current = {
          x: clamp(g.orig.x + dx, -MAX_COORD, MAX_COORD),
          y: clamp(g.orig.y + dy, -MAX_COORD, MAX_COORD),
        };
        const el = itemEls.current.get(g.id);
        if (el) {
          el.style.left = `${g.current.x}px`;
          el.style.top = `${g.current.y}px`;
        }
      }
    };

    const onUp = (e: PointerEvent) => {
      pointersRef.current.delete(e.pointerId);
      const g = gestureRef.current;
      if (!g) return;
      if (g.kind === "pinch") {
        if (pointersRef.current.size >= 2) return;
        gestureRef.current = null;
        if (g.moved) suppressClickUntil.current = Date.now() + 350;
        scheduleSave();
        return;
      }
      if (e.pointerId !== g.pointerId) return;
      gestureRef.current = null;
      if (g.moved) suppressClickUntil.current = Date.now() + 350;
      if (g.kind === "move") {
        const final = g.current;
        positionsRef.current = { ...positionsRef.current, [g.id]: final };
        setPositions(positionsRef.current);
      }
      scheduleSave();
    };

    const onCancel = (e: PointerEvent) => {
      pointersRef.current.delete(e.pointerId);
      if (pointersRef.current.size === 0) gestureRef.current = null;
    };

    const onBlur = () => {
      pointersRef.current.clear();
      gestureRef.current = null;
      spaceRef.current = false;
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onBlur);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onBlur);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current);
        saveNow();
      }
    };
  }, [scheduleApply, scheduleSave, saveNow]);

  const onPointerDown = (e: ReactPointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-canvas-controls]")) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointersRef.current.size === 2) {
      // A second finger turns any current gesture into a pinch.
      const g = gestureRef.current;
      if (g?.kind === "move") {
        const el = itemEls.current.get(g.id);
        if (el) {
          el.style.left = `${g.orig.x}px`;
          el.style.top = `${g.orig.y}px`;
        }
      }
      gestureRef.current = null;
      // startPinchIfReady equivalent, inlined: the move/up engine reads
      // gestureRef on the next pointermove once pinch is armed there.
      const [a, b] = [...pointersRef.current.values()] as [XY, XY];
      const vp = viewportRef.current;
      if (vp) {
        const rect = vp.getBoundingClientRect();
        const midX = (a.x + b.x) / 2 - rect.left;
        const midY = (a.y + b.y) / 2 - rect.top;
        const cam = cameraRef.current;
        gestureRef.current = {
          kind: "pinch",
          startDist: Math.max(Math.hypot(a.x - b.x, a.y - b.y), 1),
          midX,
          midY,
          worldX: (midX - cam.x) / cam.zoom,
          worldY: (midY - cam.y) / cam.zoom,
          cam,
          moved: false,
        };
      }
      e.preventDefault();
      return;
    }
    if (e.button === 1 || spaceRef.current) {
      gestureRef.current = {
        kind: "pan",
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        cam: cameraRef.current,
        moved: false,
      };
      e.preventDefault();
      return;
    }
    if (e.button !== 0) return;
    const handle = target.closest<HTMLElement>("[data-canvas-handle]");
    if (handle?.dataset.canvasHandle) {
      const id = handle.dataset.canvasHandle;
      const orig = positionsRef.current[id];
      if (orig) {
        gestureRef.current = {
          kind: "move",
          pointerId: e.pointerId,
          id,
          startX: e.clientX,
          startY: e.clientY,
          orig,
          current: orig,
          moved: false,
        };
      }
      return;
    }
    if (!target.closest("[data-canvas-item]")) {
      gestureRef.current = {
        kind: "pan",
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        cam: cameraRef.current,
        moved: false,
      };
    }
  };

  const onClickCapture = (e: React.SyntheticEvent) => {
    if (Date.now() < suppressClickUntil.current) {
      e.preventDefault();
      e.stopPropagation();
      suppressClickUntil.current = 0;
    }
  };

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === " " && !isEditableTarget(e.nativeEvent)) {
      const t = e.target as HTMLElement;
      if (!t.closest("button") && !t.closest("select") && !t.closest("a")) {
        spaceRef.current = true;
        e.preventDefault();
      }
      return;
    }
    if ((e.target as HTMLElement) !== viewportRef.current) return;
    if (isEditableTarget(e.nativeEvent)) return;
    const step = e.shiftKey ? 200 : 40;
    const cam = cameraRef.current;
    switch (e.key) {
      case "ArrowLeft":
        cameraRef.current = { ...cam, x: cam.x + step };
        break;
      case "ArrowRight":
        cameraRef.current = { ...cam, x: cam.x - step };
        break;
      case "ArrowUp":
        cameraRef.current = { ...cam, y: cam.y + step };
        break;
      case "ArrowDown":
        cameraRef.current = { ...cam, y: cam.y - step };
        break;
      case "+":
      case "=":
        zoomFromCenter(1.2);
        return;
      case "-":
      case "_":
        zoomFromCenter(1 / 1.2);
        return;
      case "0":
        resetCamera();
        return;
      default:
        return;
    }
    e.preventDefault();
    applyCamera();
    scheduleSave();
  };

  const onKeyUp = (e: ReactKeyboardEvent) => {
    if (e.key === " ") spaceRef.current = false;
  };

  // Portaled to <body>, like CaseStudyLightbox: the app template wraps
  // pages in a transformed shell, and a fixed canvas inside it would be
  // trapped under the site header's stacking context.
  const tree = (
    <div className="dc-root" ref={rootRef}>
      <div
        className="dc-viewport"
        ref={viewportRef}
        tabIndex={0}
        role="application"
        aria-label="Dialogue component canvas. Drag empty space to pan, Control or Command plus scroll to zoom, drag a handle to move a preview."
        onPointerDown={onPointerDown}
        onClickCapture={onClickCapture}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
      >
        <div className="dc-world" ref={worldRef}>
          {ACTIVE.map((entry) => (
            <CanvasItem
              key={entry.id}
              entry={entry}
              pos={positions[entry.id] ?? entry}
              meta={metaByFile.get(entry.files[0]!)}
              onMoveBy={moveBy}
              registerItem={registerItem}
            />
          ))}
        </div>
        <div className="dc-controls" data-canvas-controls>
          <button type="button" onClick={fitAll}>
            Fit all
          </button>
          <button type="button" onClick={resetCamera}>
            Reset camera
          </button>
          <button type="button" onClick={() => zoomFromCenter(1 / 1.25)} aria-label="Zoom out">
            −
          </button>
          <span className="dc-zoom-pct">{zoomPct}%</span>
          <button type="button" onClick={() => zoomFromCenter(1.25)} aria-label="Zoom in">
            +
          </button>
          <label className="dc-sr-only" htmlFor="dc-theme">
            Theme
          </label>
          <select
            id="dc-theme"
            ref={themeSelectRef}
            defaultValue="dark"
            onChange={(e) => applyTheme(e.target.value as "light" | "dark")}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
          <a className="dc-link" href="/dialogue/ds-parity/token-audit">
            Token audit
          </a>
        </div>
        <div className="dc-summary" data-canvas-controls>
          <p>
            {manifest.components.length} live components reached from DialogueCaseStudyContent ·{" "}
            {ACTIVE.length} previews · {uncovered.length} without a preview ·{" "}
            <span className={offList.length ? "dc-flag" : undefined}>{offList.length} not on the allowlist</span>
          </p>
          <details>
            <summary>Live, no preview ({uncovered.length})</summary>
            <ul>
              {uncovered.map((c) => (
                <li key={c.file}>
                  {c.name}
                  {c.via ? ` · via ${c.via}` : ""}
                  {c.allowlisted ? "" : " · not allowlisted"}
                </li>
              ))}
            </ul>
          </details>
        </div>
      </div>
    </div>
  );

  return mounted ? createPortal(tree, document.body) : tree;
}
