import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

type ProbeState = {
  tag: string;
  label: string;
  w: number;
  h: number;
  padding: string;
  margin: string;
  fontSize: string;
  padRects: { top: number; left: number; width: number; height: number }[];
  marginRect: { top: number; left: number; width: number; height: number } | null;
  readoutX: number;
  readoutY: number;
};

type EdgeLine = { top: number; left: number; height: number };

function parsePx(value: string) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function isDialKitNode(node: Node | null): boolean {
  if (!(node instanceof Element)) return false;
  return Boolean(
    node.closest(
      "[data-dialkit-ignore], .dialkit-root, [class*='dialkit'], [data-dialkit]",
    ),
  );
}

function elementLabel(el: Element) {
  const id = el.id ? `#${el.id}` : "";
  const cls =
    typeof el.className === "string" && el.className.trim()
      ? `.${el.className.trim().split(/\s+/).slice(0, 3).join(".")}`
      : "";
  return `${el.tagName.toLowerCase()}${id}${cls}`;
}

function docHeight() {
  const el = document.documentElement;
  const body = document.body;
  return Math.max(
    el?.scrollHeight ?? 0,
    el?.offsetHeight ?? 0,
    body?.scrollHeight ?? 0,
    body?.offsetHeight ?? 0,
    window.innerHeight,
  );
}

function buildProbe(el: Element, clientX: number, clientY: number): ProbeState {
  const style = getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  const bt = parsePx(style.borderTopWidth);
  const br = parsePx(style.borderRightWidth);
  const bb = parsePx(style.borderBottomWidth);
  const bl = parsePx(style.borderLeftWidth);
  const pt = parsePx(style.paddingTop);
  const pr = parsePx(style.paddingRight);
  const pb = parsePx(style.paddingBottom);
  const pl = parsePx(style.paddingLeft);
  const mt = parsePx(style.marginTop);
  const mr = parsePx(style.marginRight);
  const mb = parsePx(style.marginBottom);
  const ml = parsePx(style.marginLeft);

  const innerLeft = rect.left + bl;
  const innerTop = rect.top + bt;
  const innerW = Math.max(0, rect.width - bl - br);
  const innerH = Math.max(0, rect.height - bt - bb);

  const padRects: ProbeState["padRects"] = [];
  if (pt > 0) {
    padRects.push({
      top: innerTop,
      left: innerLeft,
      width: innerW,
      height: pt,
    });
  }
  if (pr > 0) {
    padRects.push({
      top: innerTop + pt,
      left: innerLeft + innerW - pr,
      width: pr,
      height: Math.max(0, innerH - pt - pb),
    });
  }
  if (pb > 0) {
    padRects.push({
      top: innerTop + innerH - pb,
      left: innerLeft,
      width: innerW,
      height: pb,
    });
  }
  if (pl > 0) {
    padRects.push({
      top: innerTop + pt,
      left: innerLeft,
      width: pl,
      height: Math.max(0, innerH - pt - pb),
    });
  }

  const marginRect =
    mt || mr || mb || ml
      ? {
          top: rect.top - mt,
          left: rect.left - ml,
          width: rect.width + ml + mr,
          height: rect.height + mt + mb,
        }
      : null;

  const padding = `${pt}px ${pr}px ${pb}px ${pl}px`;
  const margin = `${mt}px ${mr}px ${mb}px ${ml}px`;

  return {
    tag: el.tagName.toLowerCase(),
    label: elementLabel(el),
    w: Math.round(rect.width),
    h: Math.round(rect.height),
    padding,
    margin,
    fontSize: style.fontSize,
    padRects,
    marginRect,
    readoutX: clientX + 14,
    readoutY: clientY + 14,
  };
}

type GuidesOverlayProps = {
  /** DialKit toggle; URL `?guides=1` also enables (clean mode / screenshots). */
  enabled: boolean;
};

export function GuidesOverlay({ enabled: dialEnabled }: GuidesOverlayProps) {
  const [params] = useSearchParams();
  const urlEnabled = params.get("guides") === "1";
  const enabled = dialEnabled || urlEnabled;
  /** 4px subgrid is opt-in via `?guides-sub=1` (off by default for readability). */
  const subgridOn = params.get("guides-sub") === "1";

  const [edges, setEdges] = useState<EdgeLine[]>([]);
  const [probe, setProbe] = useState<ProbeState | null>(null);
  const [height, setHeight] = useState(() =>
    typeof window === "undefined" ? 0 : docHeight(),
  );
  const raf = useRef<number | null>(null);

  const measureEdges = useCallback(() => {
    const lines: EdgeLine[] = [];
    const selectors = [".shell__body", ".page"];
    const h = docHeight();
    setHeight(h);

    for (const sel of selectors) {
      document.querySelectorAll(sel).forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        const r = node.getBoundingClientRect();
        if (r.width < 1) return;
        // Edges use document coords (absolute overlay scrolls with the page).
        const top = window.scrollY + r.top;
        lines.push({ top: 0, left: r.left, height: h });
        lines.push({ top: 0, left: r.right - 1, height: h });
        void top;
      });
    }
    setEdges(lines);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setProbe(null);
      setEdges([]);
      return;
    }

    measureEdges();
    const onLayout = () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        measureEdges();
        raf.current = null;
      });
    };

    window.addEventListener("resize", onLayout);
    window.addEventListener("scroll", onLayout, true);

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(onLayout)
        : null;
    if (ro && document.body) ro.observe(document.body);
    if (ro && document.documentElement) ro.observe(document.documentElement);
    const app = document.querySelector(".app");
    if (ro && app) ro.observe(app);

    // Content often lays out after the first frame (clean bootstrap / data).
    // Remeasure so the grid covers the full document, not just the viewport.
    const t1 = window.setTimeout(onLayout, 50);
    const t2 = window.setTimeout(onLayout, 250);
    const t3 = window.setTimeout(onLayout, 800);

    const onMove = (e: MouseEvent) => {
      const app = document.querySelector(".app");
      if (!app) return;
      let target = document.elementFromPoint(e.clientX, e.clientY);
      if (!target || !app.contains(target) || isDialKitNode(target)) {
        setProbe(null);
        return;
      }
      let el: Element | null = target;
      while (el && el !== app) {
        if (el instanceof HTMLElement && el.matches(".guides-root, .guides-root *")) {
          setProbe(null);
          return;
        }
        if (isDialKitNode(el)) {
          setProbe(null);
          return;
        }
        el = el.parentElement;
      }
      if (!(target instanceof Element)) return;
      setProbe(buildProbe(target, e.clientX, e.clientY));
    };

    window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      window.removeEventListener("resize", onLayout);
      window.removeEventListener("scroll", onLayout, true);
      window.removeEventListener("mousemove", onMove);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      ro?.disconnect();
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, [enabled, measureEdges]);

  if (!enabled) return null;

  return (
    <div
      className="guides-root"
      aria-hidden
      data-dialkit-ignore
      style={{ height }}
    >
      <div className="guides-grid" style={{ height }} />
      {subgridOn ? <div className="guides-subgrid" style={{ height }} /> : null}
      {edges.map((line, i) => (
        <div
          key={`edge-${i}`}
          className="guides-edge"
          style={{
            top: line.top,
            left: line.left,
            height: line.height,
          }}
        />
      ))}
      {probe?.marginRect ? (
        <div
          className="guides-margin"
          style={{
            top: probe.marginRect.top,
            left: probe.marginRect.left,
            width: probe.marginRect.width,
            height: probe.marginRect.height,
          }}
        />
      ) : null}
      {probe?.padRects.map((r, i) => (
        <div
          key={`pad-${i}`}
          className="guides-pad"
          style={{
            top: r.top,
            left: r.left,
            width: r.width,
            height: r.height,
          }}
        />
      ))}
      {probe ? (
        <div
          className="guides-readout"
          style={{
            top: Math.min(probe.readoutY, window.innerHeight - 120),
            left: Math.min(probe.readoutX, window.innerWidth - 280),
          }}
        >
          <strong>{probe.label}</strong>
          <span>
            {probe.w}×{probe.h} · pad {probe.padding} · mg {probe.margin} · fs{" "}
            {probe.fontSize}
          </span>
        </div>
      ) : null}
    </div>
  );
}
