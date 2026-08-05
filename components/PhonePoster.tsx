"use client";

import { useEffect, useRef, useState } from "react";
import { useDialKit } from "dialkit";
import { EASE_OPACITY, PANEL_DURATION } from "@/lib/motion";
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

const EASE_CSS = `cubic-bezier(${EASE_OPACITY.join(", ")})`;

/**
 * Grid-tile stand-in for Dumb Habit Tracker.
 * Same chrome geometry as PhoneEmbed so light/dark frame swaps never shift
 * size or clip the screen radii differently.
 */
export default function PhonePoster({
  opacity = 1,
  fade = true,
  theme = "light",
  showScreen = false,
}: {
  opacity?: number;
  fade?: boolean;
  theme?: "light" | "dark";
  showScreen?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: PHONE_REF_W, height: PHONE_REF_H });

  const dk = useDialKit("PhoneEmbed", PHONE_DIAL_DEFAULTS);
  const PHONE_W = PHONE_W_BASE * dk.sizeScale;
  const PHONE_H = PHONE_H_BASE * dk.sizeScale;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setContainerSize({ width: e.contentRect.width, height: e.contentRect.height }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const REF_W = PHONE_REF_W * dk.sizeScale;
  const REF_H = PHONE_REF_H * dk.sizeScale;
  const scale = Math.min(
    Math.min(containerSize.width, REF_W) / REF_W,
    containerSize.height / REF_H,
  );

  const { screenRadiusPx, contentH, contentScale } = phoneScreenMetrics(
    PHONE_W,
    PHONE_H,
    dk.insetTop,
    dk.insetBottom,
    dk.insetSide,
    dk.screenRadius,
  );

  const frameSrc = theme === "dark" ? phoneFrameDark.src : phoneFrameLight.src;

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 2,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-phone-bg)",
        opacity,
        transition: fade ? `opacity ${PANEL_DURATION.embed.enter}s ${EASE_CSS}` : "none",
      }}
    >
      <div
        style={{
          position: "relative",
          width: PHONE_W,
          height: PHONE_H,
          flexShrink: 0,
          transform: `scale(${scale})`,
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
            isolation: "isolate",
          }}
        >
          {showScreen && (
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
              <HabitTrackerApp forcedTheme={theme} inert />
            </div>
          )}
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
