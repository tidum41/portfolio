"use client";

import { useEffect } from "react";

const WAVE_DARK  = "#ffffff";
const WAVE_LIGHT = "#B8B4D0";

export default function PS3ThemeSync() {
  useEffect(() => {
    const isDark = document.documentElement.getAttribute("data-theme") !== "light";
    window.dispatchEvent(
      new CustomEvent("ps3-update", {
        detail: { waveColor: isDark ? WAVE_DARK : WAVE_LIGHT },
      })
    );
  }, []);

  return null;
}
