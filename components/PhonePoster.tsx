"use client";

import { useEffect, useState } from "react";
import { EASE_OPACITY, PANEL_DURATION } from "@/lib/motion";

const PHONE_W = 280;
const PHONE_H = 580;
const EASE_CSS = `cubic-bezier(${EASE_OPACITY.join(", ")})`;

function readPageIsDark() {
  return typeof document !== "undefined"
    && document.documentElement.getAttribute("data-theme") === "dark";
}

/** Phone frame only — no iframe. Shown in the grid while the live embed is in the modal. */
export default function PhonePoster({ opacity = 1 }: { opacity?: number }) {
  const [isDark, setIsDark] = useState(readPageIsDark);

  useEffect(() => {
    const read = () => setIsDark(readPageIsDark());
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

  const frameSrc = isDark ? "/phonemockup-dark.webp" : "/phonemockup-light.webp";

  return (
    <div
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
      <div style={{ position: "relative", width: PHONE_W, height: PHONE_H, flexShrink: 0 }}>
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
