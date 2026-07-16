"use client";

import { useEffect, useRef, useState } from "react";
import { useDialKit } from "dialkit";

const IFRAME_SRC = "https://cdplayer-peach.vercel.app/";

export default function CDPlayer({
  style,
  dialKitKey = "CDPlayer",
  defaults,
}: {
  style?: React.CSSProperties;
  dialKitKey?: string;
  defaults?: {
    zoom?: number; offsetX?: number; offsetY?: number;
    cardW?: number; cardH?: number;
    canvasW?: number; canvasH?: number;
    iframeW?: number; iframeH?: number;
  };
}) {
  const dk = useDialKit(dialKitKey, {
    // ── Scale & pan ─────────────────────────────────────────────────────────
    zoom:    [defaults?.zoom    ?? 1.35,  0.2,  3.0,  0.01],
    offsetX: [defaults?.offsetX ?? 0,    -600,  600,  1],
    offsetY: [defaults?.offsetY ?? 0,    -600,  600,  1],

    // ── Outer card aspect ratio ─────────────────────────────────────────────
    cardW:   [defaults?.cardW   ?? 1296,  200,  2400, 1],
    cardH:   [defaults?.cardH   ?? 1080,  200,  2400, 1],

    // ── Design canvas (virtual viewport) ───────────────────────────────────
    canvasW: [defaults?.canvasW ?? 1296,  300,  2400, 1],
    canvasH: [defaults?.canvasH ?? 1080,  300,  2400, 1],

    // ── Iframe viewport ─────────────────────────────────────────────────────
    iframeW: [defaults?.iframeW ?? 1296,  300,  2400, 1],
    iframeH: [defaults?.iframeH ?? 1080,  300,  2400, 1],
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef    = useRef<HTMLIFrameElement>(null);
  const [cw, setCw]           = useState(dk.canvasW);
  const [isTouch, setIsTouch] = useState(false);
  const [ready, setReady]     = useState(false);

  useEffect(() => { setIsTouch(window.matchMedia("(hover: none)").matches); }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => setCw(e.contentRect.width));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Lazy-load iframe until near viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const fallback = setTimeout(() => setReady(true), 1500);
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { clearTimeout(fallback); setReady(true); obs.disconnect(); } },
      { rootMargin: "0px 0px 400px 0px" },
    );
    obs.observe(el);
    return () => { obs.disconnect(); clearTimeout(fallback); };
  }, []);

  const sendTheme = () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    iframeRef.current?.contentWindow?.postMessage(
      { type: "theme", value: isDark ? "dark" : "light" }, "*",
    );
  };

  useEffect(() => {
    if (!ready) return;
    const mo = new MutationObserver(sendTheme);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // s = how many screen-pixels per design-canvas pixel
  const s = (cw / dk.canvasW) * dk.zoom;

  // Coordinate inversion for the transform:
  //   scale(s) translate(offsetX, offsetY) with transformOrigin center
  // screen offset from container center → design coords:
  //   design_x = (screenDx / s) - offsetX + canvasW/2
  const forwardEvent = (clientX: number, clientY: number, type: string) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || !iframeRef.current?.contentWindow) return;
    const dx = clientX - (rect.left + rect.width  / 2);
    const dy = clientY - (rect.top  + rect.height / 2);
    const x  = dx / s - dk.offsetX + dk.canvasW / 2;
    const y  = dy / s - dk.offsetY + dk.canvasH / 2;
    iframeRef.current.contentWindow.postMessage({ type, x, y }, "*");
  };

  return (
    <div
      ref={containerRef}
      style={{
        ...style,
        width: "100%",
        aspectRatio: `${dk.cardW} / ${dk.cardH}`,
        overflow: "hidden",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Inner div is always canvasW × canvasH in layout, then visually scaled.
          flexShrink:0 prevents flex from squeezing it before the scale applies.
          This is the same pattern as the original Framer component — the iframe
          always renders at full size and is scaled down to fit, so its background
          naturally fills the container at any breakpoint. */}
      <div
        style={{
          width:           dk.canvasW,
          height:          dk.canvasH,
          transform:       `scale(${s}) translate(${dk.offsetX}px, ${dk.offsetY}px)`,
          transformOrigin: "center center",
          flexShrink:      0,
        }}
      >
        <iframe
          ref={iframeRef}
          src={ready ? IFRAME_SRC : undefined}
          width={dk.iframeW}
          height={dk.iframeH}
          style={{ border: "none", display: "block", pointerEvents: isTouch ? "auto" : "none" }}
          allow="autoplay"
          title="CD Player"
          onLoad={sendTheme}
        />
      </div>

      {/* Overlay captures all pointer events and forwards them with corrected coordinates */}
      {!isTouch && (
        <div
          onPointerDown={(e) => forwardEvent(e.clientX, e.clientY, "framer-pointerdown")}
          onPointerMove={(e) => forwardEvent(e.clientX, e.clientY, "framer-pointermove")}
          onPointerUp={(e)   => forwardEvent(e.clientX, e.clientY, "framer-pointerup")}
          onClick={(e)       => forwardEvent(e.clientX, e.clientY, "framer-click")}
          style={{ position: "absolute", inset: 0 }}
        />
      )}
    </div>
  );
}
