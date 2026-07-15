"use client";

import { useEffect, useRef, useState } from "react";

const REF_W = 344;
const REF_H = 614;
const PHONE_W = 280;
const PHONE_H = 580;
const INSET_TOP = 1.5;
const INSET_BOTTOM = 1.5;
const INSET_SIDE = 4;
const SCREEN_RADIUS = 7.5;

interface Props {
  url: string;
  frameSrcLight: string;
  frameSrcDark: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function PhoneEmbed({ url, frameSrcLight, frameSrcDark, className, style }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(REF_W);
  const [isDark, setIsDark] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(Math.min(entry.contentRect.width, REF_W));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setShouldLoad(true); obs.disconnect(); } },
      { rootMargin: "400px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const sync = () => setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

  const scale = containerWidth / REF_W;
  const intrinsicHeight = containerWidth * (REF_H / REF_W);
  const frameSrc = isDark ? frameSrcDark : frameSrcLight;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        margin: "0 auto",
        maxWidth: REF_W,
        height: intrinsicHeight,
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: PHONE_W,
          height: PHONE_H,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <div
          style={{
            position: "absolute",
            zIndex: 1,
            top: `${INSET_TOP}%`,
            bottom: `${INSET_BOTTOM}%`,
            left: `${INSET_SIDE}%`,
            right: `${INSET_SIDE}%`,
            borderRadius: `${SCREEN_RADIUS}%`,
            overflow: "hidden",
            background: "#000",
          }}
        >
          {shouldLoad && (
            <iframe
              src={url}
              title="phone embed"
              loading="lazy"
              style={{ display: "block", width: "100%", height: "100%", border: "none" }}
            />
          )}
        </div>

        <img
          src={frameSrc}
          alt=""
          style={{
            position: "absolute", top: 0, left: 0,
            width: "100%", height: "100%",
            objectFit: "contain",
            zIndex: 2, pointerEvents: "none", userSelect: "none",
          }}
        />
      </div>
    </div>
  );
}
