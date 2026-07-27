"use client";

import { useEffect, useRef, useState } from "react";
import { useDialKit } from "dialkit";
import { EASE_OPACITY, PANEL_DURATION } from "@/lib/motion";
// Static imports (see matching comment in PhoneEmbed.tsx) so Next.js
// content-hashes the served filename instead of a plain public/ path that
// never changes URL even when the file's bytes are swapped.
import phoneFrameLight from "@/public/phonemockup-light.webp";
import phoneFrameDark from "@/public/phonemockup-dark.webp";

const PHONE_W_BASE = 280;
const PHONE_H_BASE = 580;
const EASE_CSS = `cubic-bezier(${EASE_OPACITY.join(", ")})`;

/** Phone frame only — no iframe. Shown in the grid while the live embed is in the modal. */
export default function PhonePoster({ opacity = 1, theme = 'light' }: { opacity?: number; theme?: 'light' | 'dark' }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: PHONE_W_BASE, height: PHONE_H_BASE });

  // Same "PhoneEmbed" dial key as the live component, so the poster always
  // matches its size exactly — this used to be a fixed 280×580px with no
  // scale-to-fit at all, so in a grid tile smaller than that it was silently
  // being center-cropped by the card's own overflow:hidden (looking zoomed
  // in), while the live embed correctly scaled the whole phone down to fit.
  // Swapping from the (properly scaled, smaller-looking) live embed to the
  // (fixed-size, cropped-looking) poster on click read as the card itself
  // resizing. Giving the poster the identical scale-to-fit math fixes that.
  const dk = useDialKit("PhoneEmbed", { sizeScale: [1.4, 0.5, 2.5, 0.05] });
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

  const scale = Math.min(containerSize.width / PHONE_W, containerSize.height / PHONE_H);

  const frameSrc = theme === 'dark' ? phoneFrameDark.src : phoneFrameLight.src;

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
        transition: `opacity ${PANEL_DURATION.embed.enter}s ${EASE_CSS}`,
      }}
    >
      <div style={{ position: "relative", width: PHONE_W, height: PHONE_H, flexShrink: 0, transform: `scale(${scale})` }}>
        <div
          style={{
            position: "absolute",
            zIndex: 1,
            top: "3.07%",
            bottom: "3.64%",
            left: "3.3%",
            right: "3.3%",
            borderRadius: "12.86%",
            overflow: "hidden",
            background: "#000",
          }}
        />
        <img
          src={frameSrc}
          alt=""
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
