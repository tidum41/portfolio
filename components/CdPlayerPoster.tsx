"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { EASE_OPACITY, PANEL_DURATION } from "@/lib/motion";

const EASE_CSS = `cubic-bezier(${EASE_OPACITY.join(", ")})`;

function readPageIsDark() {
  return typeof document !== "undefined"
    && document.documentElement.getAttribute("data-theme") === "dark";
}

/** Static grid-tile stand-in while the live CDPlayer is portaled into the modal. */
export default function CdPlayerPoster({ opacity = 1 }: { opacity?: number }) {
  const [isDark, setIsDark] = useState(readPageIsDark);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const read = () => setIsDark(readPageIsDark());
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

  const src = isDark
    ? "/images/cd-player-poster-dark.webp"
    : "/images/cd-player-poster-light.webp";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 2,
        pointerEvents: "none",
        background: "var(--color-modal-bg)",
        opacity,
        transition: `opacity ${PANEL_DURATION.embed.enter}s ${EASE_CSS}`,
      }}
    >
      {!failed && (
        <Image
          src={src}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit: "cover" }}
          onError={() => setFailed(true)}
          priority={false}
        />
      )}
    </div>
  );
}
