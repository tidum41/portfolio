"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useDialKit } from "dialkit";
import HabitTrackerApp from "@/components/embeds/habit-tracker/HabitTrackerApp";
import phoneFrameLight from "@/public/phonemockup-light.webp";
import phoneFrameDark from "@/public/phonemockup-dark.webp";
import {
  PHONE_CONTENT_W,
  PHONE_DIAL_DEFAULTS,
  PHONE_H_BASE,
  PHONE_REF_H,
  PHONE_REF_W,
  PHONE_W_BASE,
  phoneScreenMetrics,
} from "@/lib/phoneChrome";

function readSiteTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

export default function PhoneEmbed({
  style,
  expanded = false,
  initialTheme,
  onWidgetThemeChange,
}: {
  style?: React.CSSProperties;
  expanded?: boolean;
  initialTheme?: "light" | "dark";
  onWidgetThemeChange?: (theme: "light" | "dark") => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(null);
  const [widgetTheme, setWidgetTheme] = useState<"light" | "dark">(
    () => initialTheme ?? readSiteTheme(),
  );
  const handleWidgetThemeChange = (theme: "light" | "dark") => {
    setWidgetTheme(theme);
    onWidgetThemeChange?.(theme);
  };

  const dk = useDialKit("PhoneEmbed", PHONE_DIAL_DEFAULTS);

  const popupBoost = expanded ? 1.28 : 1;
  const PHONE_W = PHONE_W_BASE * dk.sizeScale * popupBoost;
  const PHONE_H = PHONE_H_BASE * dk.sizeScale * popupBoost;
  const REF_W = expanded ? PHONE_W : PHONE_REF_W * dk.sizeScale;
  const REF_H = expanded ? PHONE_H : PHONE_REF_H * dk.sizeScale;

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const apply = () => {
      const r = el.getBoundingClientRect();
      setContainerSize({ width: r.width, height: r.height });
    };
    apply();
    const ro = new ResizeObserver(([e]) =>
      setContainerSize({ width: e.contentRect.width, height: e.contentRect.height }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const measured = containerSize !== null;
  const cw = containerSize?.width ?? REF_W;
  const ch = containerSize?.height ?? REF_H;
  const phoneScale = Math.min(Math.min(cw, REF_W) / REF_W, ch / REF_H);

  const { screenRadiusPx, contentH, contentScale } = phoneScreenMetrics(
    PHONE_W,
    PHONE_H,
    dk.insetTop,
    dk.insetBottom,
    dk.insetSide,
    dk.screenRadius,
  );

  const frameSrc = widgetTheme === "dark" ? phoneFrameDark.src : phoneFrameLight.src;

  // Warm both frame assets so widget theme toggles don't flash or reflow.
  useLayoutEffect(() => {
    const light = new Image();
    light.src = phoneFrameLight.src;
    const dark = new Image();
    dark.src = phoneFrameDark.src;
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        maxWidth: REF_W,
        margin: "0 auto",
        ...style,
        opacity: measured ? 1 : 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: PHONE_W,
          height: PHONE_H,
          transform: `translate(-50%, -50%) scale(${phoneScale})`,
          transformOrigin: "center center",
        }}
      >
        <div
          style={{
            position: "absolute",
            zIndex: 1,
            top: `${dk.insetTop}%`,
            bottom: `${dk.insetBottom}%`,
            left: `${dk.insetSide}%`,
            right: `${dk.insetSide}%`,
            borderRadius: screenRadiusPx,
            overflow: "hidden",
            background: "#000",
            // Keep child radii clipped correctly under transform.
            isolation: "isolate",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: `${dk.iframeOffsetY}%`,
              left: `${dk.iframeOffsetX}%`,
              width: PHONE_CONTENT_W,
              height: contentH,
              transform: `scale(${contentScale})`,
              transformOrigin: "top left",
            }}
          >
            <HabitTrackerApp onThemeChange={handleWidgetThemeChange} />
          </div>
        </div>

        <img
          src={frameSrc}
          alt=""
          decoding="async"
          draggable={false}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            // Assets are full-bleed at the same aspect as PHONE_W×PHONE_H —
            // contain + identical canvases keeps light/dark chrome locked.
            objectFit: "contain",
            zIndex: 2,
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
      </div>
    </div>
  );
}
