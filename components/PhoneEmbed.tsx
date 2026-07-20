"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { useDialKit } from "dialkit";

const REF_W  = 344;
const REF_H  = 614;
const PHONE_W  = 280;
const PHONE_H  = 580;
const IFRAME_W = 394;
const IFRAME_H = 844;

interface Props {
  url?:            string;
  title?:          string;
  frameSrcLight?:  string;
  frameSrcDark?:   string;
  postMessageKey?: string;
  scale?:          number;
  style?:          React.CSSProperties;
}

export default function PhoneEmbed({
  url            = "",
  title          = "Embedded project preview",
  frameSrcLight,
  frameSrcDark,
  postMessageKey = "theme",
  scale          = 1,
  style,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef    = useRef<HTMLIFrameElement>(null);
  const [containerWidth, setContainerWidth] = useState(REF_W * scale);
  const [isSrcReady, setIsSrcReady] = useState(false);
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

  // Track container width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setContainerWidth(Math.min(e.contentRect.width, scaledRefW))
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, [scaledRefW]);

  // Lazy-load iframe on intersection
  useEffect(() => {
    if (!url) return;
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
  }, [url]);

  const phoneScale   = containerWidth / REF_W;
  const intrinsicH   = containerWidth * (REF_H / REF_W);
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
      style={{ position: "relative", width: "100%", maxWidth: scaledRefW, height: intrinsicH, margin: "0 auto", ...style }}
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
        }}>
          {url ? (
            <>
              <iframe
                ref={iframeRef}
                src={isSrcReady ? url : undefined}
                title={title}
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
