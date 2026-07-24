"use client";

import { useRef, useEffect, useLayoutEffect, useState, useMemo } from "react";
import { useDialKit } from "dialkit";
import { EASE_OPACITY, PANEL_DURATION } from "@/lib/motion";

const REF_W  = 344;
const REF_H  = 614;
const PHONE_W  = 280;
const PHONE_H  = 580;
const IFRAME_W = 394;
const IFRAME_H = 844;
const EASE_CSS = `cubic-bezier(${EASE_OPACITY.join(", ")})`;

interface Props {
  url?:            string;
  title?:          string;
  frameSrcLight?:  string;
  frameSrcDark?:   string;
  postMessageKey?: string;
  scale?:          number;
  eager?:          boolean;
  style?:          React.CSSProperties;
}

export default function PhoneEmbed({
  url            = "",
  title          = "Embedded project preview",
  frameSrcLight,
  frameSrcDark,
  postMessageKey = "theme",
  scale          = 1,
  eager          = false,
  style,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef    = useRef<HTMLIFrameElement>(null);
  const [containerSize, setContainerSize] = useState({ width: REF_W * scale, height: REF_H * scale });
  const [isSrcReady, setIsSrcReady] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const hasLoadedOnceRef = useRef(false);
  const [pageIsDark, setPageIsDark] = useState(false);
  // Theme reported by the embedded site itself (via postMessage), once it's told us.
  // Falls back to the outer page's theme until then.
  const [embedIsDark, setEmbedIsDark] = useState<boolean | null>(null);

  const dk = useDialKit("PhoneEmbed", {
    insetTop:      [3.07, 0, 15,  0.01],
    insetBottom:   [3.64, 0, 15,  0.01],
    insetSide:     [3.3,  0, 15,  0.01],
    screenRadius:  [12.86, 0, 25, 0.01],
    iframeOffsetX: [0,   -10, 10, 0.01],
    iframeOffsetY: [-0.41, -10, 10, 0.01],
  });

  // Watch page dark/light theme for frame image switching
  useEffect(() => {
    const read = () => setPageIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

  const isTouchDevice = useMemo(
    () => typeof navigator !== "undefined" && navigator.maxTouchPoints > 0,
    []
  );

  const scaledRefW = REF_W * scale;

  // Scroll-bridge postMessage
  useEffect(() => {
    let sbPending = 0, sbConfirmed = false;
    let sbTimer: ReturnType<typeof setTimeout> | null = null;
    const reset = () => { sbPending = 0; sbConfirmed = false; };

    function onMessage(e: MessageEvent) {
      const d = e.data;
      if (!d || typeof d !== "object") return;

      // Embedded site reporting its own dark/light toggle, e.g. { theme: "dark" }
      const themeVal = d[postMessageKey];
      if (themeVal === "dark" || themeVal === "light") {
        setEmbedIsDark(themeVal === "dark");
        return;
      }

      if (d.type === "scroll-bridge") {
        const phase = d.phase as string | undefined;
        if (phase === "start" || phase === "end") {
          reset();
          if (sbTimer) { clearTimeout(sbTimer); sbTimer = null; }
          return;
        }
        const dy = d.dy;
        if (typeof dy !== "number" || dy === 0) return;
        if (sbTimer) clearTimeout(sbTimer);
        sbTimer = setTimeout(() => { reset(); sbTimer = null; }, 250);
        if (!sbConfirmed) {
          sbPending += dy;
          if (Math.abs(sbPending) >= 10) {
            window.scrollBy({ top: sbPending, behavior: "instant" as ScrollBehavior });
            sbPending = 0; sbConfirmed = true;
          }
        } else {
          window.scrollBy({ top: dy, behavior: "instant" as ScrollBehavior });
        }
      }
    }

    window.addEventListener("message", onMessage);
    return () => { window.removeEventListener("message", onMessage); if (sbTimer) clearTimeout(sbTimer); };
  }, [postMessageKey]);

  // Track container width + height so the phone fits inside fixed-aspect slots.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setContainerSize({ width: e.contentRect.width, height: e.contentRect.height }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const isDarkNow = () => document.documentElement.getAttribute("data-theme") === "dark";

  const sendTheme = () => {
    iframeRef.current?.contentWindow?.postMessage(
      { [postMessageKey]: isDarkNow() ? "dark" : "light" },
      "*",
    );
  };

  const initialThemeRef = useRef<"dark" | "light" | null>(null);
  if (isSrcReady && initialThemeRef.current === null) {
    initialThemeRef.current = isDarkNow() ? "dark" : "light";
  }
  const iframeSrc = url && isSrcReady
    ? `${url}${url.includes("?") ? "&" : "?"}theme=${initialThemeRef.current}`
    : undefined;

  useLayoutEffect(() => {
    if (!isSrcReady) return;
    sendTheme();
  // Re-sync when the portal target resizes (grid ↔ popup).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerSize.width, containerSize.height, isSrcReady]);

  useEffect(() => {
    if (!isSrcReady) return;
    sendTheme();
    const retryDelays = [50, 200, 500, 1000];
    const timers = retryDelays.map((ms) => setTimeout(sendTheme, ms));
    const mo = new MutationObserver(sendTheme);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => { timers.forEach(clearTimeout); mo.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSrcReady]);

  // Lazy-load iframe on intersection — skipped when eager.
  useEffect(() => {
    if (!url) return;
    if (eager) {
      setIsSrcReady(true);
      return;
    }
    const ready = () => setIsSrcReady(true);
    const t = setTimeout(ready, 300);
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { ready(); clearTimeout(t); obs.disconnect(); } },
      { rootMargin: "0px 0px 600px 0px" }
    );
    obs.observe(el);
    return () => { clearTimeout(t); obs.disconnect(); };
  }, [url, eager]);

  const onIframeLoad = () => {
    sendTheme();
    if (hasLoadedOnceRef.current) {
      setRevealed(true);
      return;
    }
    hasLoadedOnceRef.current = true;
    requestAnimationFrame(() => setRevealed(true));
  };

  const showScreen = revealed || hasLoadedOnceRef.current || !url;

  const scaleByW = Math.min(containerSize.width, scaledRefW) / REF_W;
  const scaleByH = containerSize.height / REF_H;
  const phoneScale = Math.min(scaleByW, scaleByH);
  const screenLocalW = PHONE_W * (1 - (dk.insetSide * 2) / 100);
  const iframeScale  = screenLocalW / IFRAME_W;

  const isDark = embedIsDark ?? pageIsDark;
  const frameSrc = isDark ? (frameSrcDark || frameSrcLight) : (frameSrcLight || frameSrcDark);

  function forwardPointer(e: React.MouseEvent<HTMLDivElement>, type: "click" | "pointerdown") {
    const rect = e.currentTarget.getBoundingClientRect();
    const vs = iframeScale * phoneScale;
    iframeRef.current?.contentWindow?.postMessage(
      { type: "framer-pointer", eventType: type, x: (e.clientX - rect.left) / vs, y: (e.clientY - rect.top) / vs },
      "*"
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", height: "100%", maxWidth: scaledRefW, margin: "0 auto", ...style }}
    >
      {/* Phone body */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        width: PHONE_W, height: PHONE_H,
        transform: `translate(-50%, -50%) scale(${phoneScale})`,
        transformOrigin: "center center",
      }}>
        {/* Screen cutout */}
        <div style={{
          position: "absolute", zIndex: 1,
          top: `${dk.insetTop}%`, bottom: `${dk.insetBottom}%`,
          left: `${dk.insetSide}%`, right: `${dk.insetSide}%`,
          borderRadius: `${dk.screenRadius}%`,
          overflow: "hidden", background: "#000",
          opacity: showScreen ? 1 : 0,
          transition: hasLoadedOnceRef.current ? "none" : `opacity ${PANEL_DURATION.embed.enter}s ${EASE_CSS}`,
        }}>
          {url ? (
            <>
              <iframe
                ref={iframeRef}
                src={iframeSrc}
                title={title}
                onLoad={onIframeLoad}
                style={{
                  position: "absolute",
                  top: `${dk.iframeOffsetY}%`,
                  left: `${dk.iframeOffsetX}%`,
                  width: IFRAME_W, height: IFRAME_H,
                  border: "none",
                  transform: `scale(${iframeScale})`,
                  transformOrigin: "top left",
                  pointerEvents: isTouchDevice ? "auto" : "none",
                }}
              />
              <div
                onPointerDown={e => forwardPointer(e, "pointerdown")}
                onClick={e => forwardPointer(e, "click")}
                style={{
                  position: "absolute", inset: 0, zIndex: 10,
                  cursor: "none", backgroundColor: "transparent",
                  pointerEvents: isTouchDevice ? "none" : "all",
                }}
              />
            </>
          ) : (
            <div style={{
              width: "100%", height: "100%", background: "#111",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "rgba(255,255,255,0.15)", fontSize: 11,
              fontFamily: "var(--font-sans)",
            }}>
              coming soon
            </div>
          )}
        </div>

        {/* Phone frame PNG */}
        {frameSrc && (
          <img
            src={frameSrc} alt=""
            style={{
              position: "absolute", top: 0, left: 0,
              width: "100%", height: "100%",
              objectFit: "contain", zIndex: 2,
              pointerEvents: "none", userSelect: "none",
            }}
          />
        )}
      </div>
    </div>
  );
}
