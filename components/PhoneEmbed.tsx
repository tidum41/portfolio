"use client";

import { useEffect, useRef, useState } from "react";
import { useDialKit } from "dialkit";
import HabitTrackerApp from "@/components/embeds/habit-tracker/HabitTrackerApp";
// Static imports (not plain "/phonemockup-*.webp" string paths) so Next.js
// content-hashes the served filename — a plain public/ path never changes
// URL even if the file's bytes are replaced, so a browser that ever cached
// the old version keeps serving it forever. Hashed imports make any future
// asset swap automatically bust every client's cache.
import phoneFrameLight from "@/public/phonemockup-light.webp";
import phoneFrameDark from "@/public/phonemockup-dark.webp";

// Phone-frame chrome + screen-cutout math, restored from the pre-port iframe
// version of this component (same dial key/names, so any previously-tuned
// values carry over) — only what's INSIDE the screen cutout changed: a fixed
// iframe viewport swapped for a fixed native design box holding HabitTrackerApp.
const REF_W_BASE = 344;
const REF_H_BASE = 614;
const PHONE_W_BASE = 280;
const PHONE_H_BASE = 580;
// Design box HabitTrackerApp renders at before being scaled into the screen
// cutout — matches the old iframe's own viewport size (394×844), which is
// also a near-perfect fit for the widget's own max-w-[393px] content.
const CONTENT_W = 394;

export default function PhoneEmbed({ style, expanded = false, onWidgetThemeChange }: { style?: React.CSSProperties; expanded?: boolean; onWidgetThemeChange?: (theme: 'light' | 'dark') => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: REF_W_BASE, height: REF_H_BASE });
  // The frame follows the HABIT TRACKER WIDGET's own internal theme toggle
  // (reported up via HabitTrackerApp's onThemeChange), not the site's theme —
  // the two are deliberately decoupled (see HabitTrackerApp.tsx's own
  // comment), and the frame has to agree with whatever the screen content
  // inside it is actually showing, not with the site chrome around it.
  // Default 'light' matches HabitTrackerApp's own initial default.
  const [widgetTheme, setWidgetTheme] = useState<'light' | 'dark'>('light');
  const handleWidgetThemeChange = (theme: 'light' | 'dark') => {
    setWidgetTheme(theme);
    onWidgetThemeChange?.(theme);
  };

  const dk = useDialKit("PhoneEmbed", {
    // Scales the whole phone body (and its own max-size cap) up or down —
    // the grid/popup slots have plenty of room the phone wasn't using before.
    sizeScale:     [1.4, 0.5, 2.5, 0.05],
    insetTop:      [3.07, 0, 15,  0.01],
    insetBottom:   [3.64, 0, 15,  0.01],
    insetSide:     [3.3,  0, 15,  0.01],
    screenRadius:  [12.86, 0, 25, 0.01],
    iframeOffsetX: [0,   -10, 10, 0.01],
    iframeOffsetY: [-0.41, -10, 10, 0.01],
  });

  const popupBoost = expanded ? 1.28 : 1;
  const PHONE_W = PHONE_W_BASE * dk.sizeScale * popupBoost;
  const PHONE_H = PHONE_H_BASE * dk.sizeScale * popupBoost;
  // Tight reference box in popup so scale-to-fit uses the full slot instead of
  // leaving ~20% dead margin (REF was intentionally larger than the phone body).
  const REF_W = expanded ? PHONE_W : REF_W_BASE * dk.sizeScale;
  const REF_H = expanded ? PHONE_H : REF_H_BASE * dk.sizeScale;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setContainerSize({ width: e.contentRect.width, height: e.contentRect.height }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scaledRefW = REF_W;
  const scaleByW = Math.min(containerSize.width, scaledRefW) / REF_W;
  const scaleByH = containerSize.height / REF_H;
  const phoneScale = Math.min(scaleByW, scaleByH);

  const screenLocalW = PHONE_W * (1 - (dk.insetSide * 2) / 100);
  const screenLocalH = PHONE_H * (1 - dk.insetTop / 100 - dk.insetBottom / 100);
  // Match content canvas height to the screen cutout aspect ratio so scaling
  // by width also fills height — avoids the black bezel gap below the app.
  const contentH = Math.ceil(CONTENT_W * (screenLocalH / screenLocalW));
  const contentScale = screenLocalW / CONTENT_W;

  const frameSrc = widgetTheme === 'dark' ? phoneFrameDark.src : phoneFrameLight.src;

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
        }}>
          <div
            style={{
              position: "absolute",
              top: `${dk.iframeOffsetY}%`,
              left: `${dk.iframeOffsetX}%`,
              width: CONTENT_W, height: contentH,
              transform: `scale(${contentScale})`,
              transformOrigin: "top left",
            }}
          >
            <HabitTrackerApp onThemeChange={handleWidgetThemeChange} />
          </div>
        </div>

        {/* Phone frame PNG */}
        <img
          src={frameSrc} alt=""
          style={{
            position: "absolute", top: 0, left: 0,
            width: "100%", height: "100%",
            objectFit: "contain", zIndex: 2,
            pointerEvents: "none", userSelect: "none",
          }}
        />
      </div>
    </div>
  );
}
