"use client";

import { useEffect, useRef, useState } from "react";
import { useDialKit } from "dialkit";
import { EASE_OPACITY, PANEL_DURATION } from "@/lib/motion";

const IFRAME_SRC = "https://cdplayer-peach.vercel.app/";
const EASE_CSS = `cubic-bezier(${EASE_OPACITY.join(", ")})`;

export default function CDPlayer({
  style,
  dialKitKey = "CDPlayer",
  defaults,
  eager = false,
}: {
  style?: React.CSSProperties;
  dialKitKey?: string;
  eager?: boolean;
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
  // Cached and refreshed on resize/scroll, reused by forwardEvent below —
  // calling getBoundingClientRect() directly from the onPointerMove handler
  // forces a synchronous layout read on every event while dragging, which is
  // exactly when a visitor is actively interacting with this card.
  const rectRef = useRef<DOMRect | null>(null);
  const [cw, setCw]           = useState(dk.canvasW);
  const [isTouch, setIsTouch] = useState(false);
  const [ready, setReady]     = useState(false);
  // Hidden until we're confident the embedded app has applied the right
  // theme — see the `src` / onLoad wiring below for why this can't just be
  // "instant" from our side alone.
  const [revealed, setRevealed] = useState(false);
  const hasLoadedOnceRef = useRef(false);

  useEffect(() => { setIsTouch(window.matchMedia("(hover: none)").matches); }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateRect = () => { rectRef.current = el.getBoundingClientRect(); };
    const obs = new ResizeObserver(([e]) => { setCw(e.contentRect.width); updateRect(); });
    obs.observe(el);
    updateRect();
    window.addEventListener("scroll", updateRect, { passive: true });
    return () => { obs.disconnect(); window.removeEventListener("scroll", updateRect); };
  }, []);

  // Lazy-load iframe until near viewport — skipped when eager (shell-level
  // instance that should start loading immediately on first "/" visit).
  useEffect(() => {
    if (eager) {
      setReady(true);
      return;
    }
    const el = containerRef.current;
    if (!el) return;
    const fallback = setTimeout(() => setReady(true), 1500);
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { clearTimeout(fallback); setReady(true); obs.disconnect(); } },
      { rootMargin: "0px 0px 400px 0px" },
    );
    obs.observe(el);
    return () => { obs.disconnect(); clearTimeout(fallback); };
  }, [eager]);

  const isDarkNow = () => document.documentElement.getAttribute("data-theme") === "dark";

  const sendTheme = () => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "theme", value: isDarkNow() ? "dark" : "light" }, "*",
    );
  };

  // Theme also travels as a `?theme=` query param on the iframe's initial
  // src — if the embedded app reads it at boot (same origin app, built
  // alongside this one), it can paint the right theme on its very first
  // frame instead of waiting for postMessage at all. Computed once, at the
  // moment we actually set `src`, from whatever the page's theme is right
  // then — not before, so a theme toggle that happens while still loading
  // isn't missed.
  const initialThemeRef = useRef<"dark" | "light" | null>(null);
  if (ready && initialThemeRef.current === null) {
    initialThemeRef.current = isDarkNow() ? "dark" : "light";
  }
  const iframeSrc = ready ? `${IFRAME_SRC}?theme=${initialThemeRef.current}` : undefined;

  // The iframe's own `load` event fires once its document is parsed, but the
  // embedded app's JS (and its message listener) can still be initializing a
  // beat later — a theme message sent exactly on `onLoad` can arrive before
  // anything's listening and get silently dropped, leaving the popup's fresh
  // instance stuck in the wrong theme until the next toggle. Re-send a few
  // times over the following second to close that race without needing an
  // ack protocol from the embedded app; harmless to send the same value
  // more than once. The `?theme=` param above should make this a non-issue
  // for the *initial* paint if the embedded app reads it; this remains the
  // mechanism for live toggles while the popup is already open.
  useEffect(() => {
    if (!ready) return;
    const retryDelays = [50, 200, 500, 1000];
    const timers = retryDelays.map((ms) => setTimeout(sendTheme, ms));
    const mo = new MutationObserver(sendTheme);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => { timers.forEach(clearTimeout); mo.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Defensive fallback for whenever the URL param isn't honored (or the
  // embedded app doesn't support it): one rAF beat after load lets the
  // first postMessage retry land before we reveal — turns a possible
  // wrong-theme flash into a deliberate fade-in instead.
  const onIframeLoad = () => {
    sendTheme();
    if (hasLoadedOnceRef.current) {
      setRevealed(true);
      return;
    }
    hasLoadedOnceRef.current = true;
    requestAnimationFrame(() => setRevealed(true));
  };

  const showContent = revealed || hasLoadedOnceRef.current;

  // s = how many screen-pixels per design-canvas pixel
  const s = (cw / dk.canvasW) * dk.zoom;

  // Coordinate inversion for the transform:
  //   scale(s) translate(offsetX, offsetY) with transformOrigin center
  // screen offset from container center → design coords:
  //   design_x = (screenDx / s) - offsetX + canvasW/2
  const forwardEvent = (clientX: number, clientY: number, type: string) => {
    const rect = rectRef.current;
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
          opacity:         showContent ? 1 : 0,
          transition:      hasLoadedOnceRef.current ? "none" : `opacity ${PANEL_DURATION.embed.enter}s ${EASE_CSS}`,
        }}
      >
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          width={dk.iframeW}
          height={dk.iframeH}
          style={{ border: "none", display: "block", pointerEvents: isTouch ? "auto" : "none" }}
          allow="autoplay"
          title="CD Player"
          onLoad={onIframeLoad}
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
