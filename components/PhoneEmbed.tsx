"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useDialKit } from "dialkit";
import HabitTrackerApp from "@/components/embeds/habit-tracker/HabitTrackerApp";
// Static imports (not plain "/phonemockup-*.webp" string paths) so Next.js
// content-hashes the served filename — a plain public/ path never changes
// URL even if the file's bytes are replaced, so a browser that ever cached
// the old version keeps serving it forever. Hashed imports make any future
// asset swap automatically bust every client's cache.
import phoneFrameLight from "@/public/phonemockup-light.webp";
import phoneFrameDark from "@/public/phonemockup-dark.webp";

// Phone-frame chrome + screen-cutout math from Jul 29 (2c55487 / 477ee8d):
// DialKit REF 344×614 vs phone 280×580, object-fit contain, % screen radius.
// Frame art follows the *widget* theme (sun/moon), not the site theme.
// Assets: public/phonemockup-{light,dark}.webp (864×1762) — do not regenerate.
const REF_W_BASE = 344;
const REF_H_BASE = 614;
const PHONE_W_BASE = 280;
const PHONE_H_BASE = 580;
// Design box HabitTrackerApp renders at before being scaled into the screen
// cutout — matches the old iframe's own viewport size (394×844), which is
// also a near-perfect fit for the widget's own max-w-[393px] content.
const CONTENT_W = 394;

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
  /** Seed frame + widget theme before first paint (avoids light→dark jump). */
  initialTheme?: "light" | "dark";
  onWidgetThemeChange?: (theme: "light" | "dark") => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(null);
  // Frame follows the HABIT TRACKER WIDGET theme (not site theme after seed).
  const [widgetTheme, setWidgetTheme] = useState<"light" | "dark">(
    () => initialTheme ?? readSiteTheme(),
  );
  const handleWidgetThemeChange = (theme: "light" | "dark") => {
    setWidgetTheme(theme);
    onWidgetThemeChange?.(theme);
  };

  const dk = useDialKit("PhoneEmbed", {
    sizeScale: [1.4, 0.5, 2.5, 0.05],
    insetTop: [3.07, 0, 15, 0.01],
    insetBottom: [3.64, 0, 15, 0.01],
    insetSide: [3.3, 0, 15, 0.01],
    screenRadius: [12.86, 0, 25, 0.01],
    iframeOffsetX: [0, -10, 10, 0.01],
    iframeOffsetY: [-0.41, -10, 10, 0.01],
  });

  const popupBoost = expanded ? 1.28 : 1;
  const PHONE_W = PHONE_W_BASE * dk.sizeScale * popupBoost;
  const PHONE_H = PHONE_H_BASE * dk.sizeScale * popupBoost;
  // Tight reference box in popup so scale-to-fit uses the full slot.
  const REF_W = expanded ? PHONE_W : REF_W_BASE * dk.sizeScale;
  const REF_H = expanded ? PHONE_H : REF_H_BASE * dk.sizeScale;

  // Measure synchronously before paint so the first visible frame already
  // uses the real popup slot size (avoids REF→slot scale jump on open).
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
  const scaleByW = Math.min(cw, REF_W) / REF_W;
  const scaleByH = ch / REF_H;
  const phoneScale = Math.min(scaleByW, scaleByH);

  const screenLocalW = PHONE_W * (1 - (dk.insetSide * 2) / 100);
  const screenLocalH = PHONE_H * (1 - dk.insetTop / 100 - dk.insetBottom / 100);
  const contentH = Math.ceil(CONTENT_W * (screenLocalH / screenLocalW));
  const contentScale = screenLocalW / CONTENT_W;

  const frameSrc = widgetTheme === "dark" ? phoneFrameDark.src : phoneFrameLight.src;

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
        // Invisible until measured — prevents one-frame wrong-scale flash.
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
            borderRadius: `${dk.screenRadius}%`,
            overflow: "hidden",
            background: "#000",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: `${dk.iframeOffsetY}%`,
              left: `${dk.iframeOffsetX}%`,
              width: CONTENT_W,
              height: contentH,
              transform: `scale(${contentScale})`,
              transformOrigin: "top left",
            }}
          >
            <HabitTrackerApp
              initialTheme={initialTheme}
              onThemeChange={handleWidgetThemeChange}
            />
          </div>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
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
