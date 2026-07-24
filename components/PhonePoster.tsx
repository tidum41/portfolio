"use client";

import { useEffect, useState } from "react";

const REF_W = 344;
const REF_H = 614;
const PHONE_W = 280;
const PHONE_H = 580;

/** Phone frame only — no iframe. Shown in the grid while the live embed is in the modal. */
export default function PhonePoster({ style }: { style?: React.CSSProperties }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const read = () => setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

  const frameSrc = isDark ? "/phonemockup-dark.webp" : "/phonemockup-light.webp";
  const phoneScale = 1;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: REF_W,
        height: REF_W * (REF_H / REF_W),
        margin: "0 auto",
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
          transform: `translate(-50%, -50%) scale(${phoneScale})`,
          transformOrigin: "center center",
        }}
      >
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
