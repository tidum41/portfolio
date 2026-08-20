"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useDialKit } from "dialkit";
import { EASE_OPACITY, PANEL_DURATION } from "@/lib/motion";
// Static imports (see matching comment in PhoneEmbed.tsx) so Next.js
// content-hashes the served filename instead of a plain public/ path that
// never changes URL even when the file's bytes are swapped.
import phoneFrameLight from "@/public/phonemockup-light.webp";
import phoneFrameDark from "@/public/phonemockup-dark.webp";

const HabitTrackerApp = dynamic(
  () => import("@/components/embeds/habit-tracker/HabitTrackerApp"),
  { ssr: false },
);

const PHONE_W_BASE = 280;
const PHONE_H_BASE = 580;
// Matches PhoneEmbed's own non-expanded reference box exactly (344×614, ~20%
// larger than the phone body) — using PHONE_W_BASE/PHONE_H_BASE directly here
// used to fit the phone tighter to the container than PhoneEmbed does for the
// same box, rendering the poster's phone graphic ~5.9% larger (614/580) than
// the live embed. Fixed in 2c55487 (Jul 29).
const REF_W_BASE = 344;
const REF_H_BASE = 614;
const CONTENT_W = 394;
const EASE_CSS = `cubic-bezier(${EASE_OPACITY.join(", ")})`;

const FRAME_IMG: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  objectFit: "contain",
  zIndex: 2,
  pointerEvents: "none",
  userSelect: "none",
  transition: "none",
};

/**
 * Grid-tile stand-in while the live PhoneEmbed is portaled into the modal.
 * Matches PhoneEmbed's scale-to-fit math, and when `showScreen` is on, renders
 * a non-interactive HabitTrackerApp clone in the screen cutout so the card
 * doesn't flash an empty black bezel while the live instance is in the popup.
 *
 * `fade` is only for the close crossfade (poster → live). On open, opacity
 * must snap to 1 with fade=false so the card behind the modal blur doesn't
 * briefly empty out while the live phone is hidden/portaled.
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
  const [containerSize, setContainerSize] = useState({ width: REF_W_BASE, height: REF_H_BASE });

  // Same "PhoneEmbed" dial key as the live component, so the poster always
  // matches its size exactly.
  const dk = useDialKit("PhoneEmbed", {
    sizeScale: [1.4, 0.5, 2.5, 0.05],
    insetTop: [3.07, 0, 15, 0.01],
    insetBottom: [3.64, 0, 15, 0.01],
    insetSide: [3.3, 0, 15, 0.01],
    screenRadius: [12.86, 0, 25, 0.01],
    iframeOffsetX: [0, -10, 10, 0.01],
    iframeOffsetY: [-0.41, -10, 10, 0.01],
  });
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

  // Scale-to-fit against the same padded reference box PhoneEmbed's
  // non-expanded state uses (REF_W/REF_H, not the phone's own tighter
  // PHONE_W/PHONE_H) — see the REF_W_BASE/REF_H_BASE comment above.
  const REF_W = REF_W_BASE * dk.sizeScale;
  const REF_H = REF_H_BASE * dk.sizeScale;
  const scaleByW = Math.min(containerSize.width, REF_W) / REF_W;
  const scaleByH = containerSize.height / REF_H;
  const scale = Math.min(scaleByW, scaleByH);

  const screenLocalW = PHONE_W * (1 - (dk.insetSide * 2) / 100);
  const screenLocalH = PHONE_H * (1 - dk.insetTop / 100 - dk.insetBottom / 100);
  const contentH = Math.ceil(CONTENT_W * (screenLocalH / screenLocalW));
  const contentScale = screenLocalW / CONTENT_W;

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
      <div style={{ position: "relative", width: PHONE_W, height: PHONE_H, flexShrink: 0, transform: `scale(${scale})` }}>
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
            background: theme === "dark" ? "#0a0a0a" : "#f5f5f0",
          }}
        >
          {showScreen && (
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
              <HabitTrackerApp forcedTheme={theme} inert />
            </div>
          )}
        </div>
        {/* Both frames stay mounted — opacity toggle is instant, no src-swap flash. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={phoneFrameLight.src}
          alt=""
          decoding="async"
          draggable={false}
          aria-hidden={theme !== "light"}
          style={{ ...FRAME_IMG, opacity: theme === "light" ? 1 : 0 }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={phoneFrameDark.src}
          alt=""
          decoding="async"
          draggable={false}
          aria-hidden={theme !== "dark"}
          style={{ ...FRAME_IMG, opacity: theme === "dark" ? 1 : 0 }}
        />
      </div>
    </div>
  );
}
