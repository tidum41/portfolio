"use client";

import { useEffect } from "react";
import { useDialKit } from "dialkit";

/**
 * Live left/right nudges for case-study hero lane alignment.
 * Values are px offsets applied via CSS variables — tune on each breakpoint
 * in DialKit, then we hard-code the confirmed numbers.
 */
export default function CaseStudyAlignDials() {
  const dk = useDialKit("CS Align", {
    Mobile: {
      backX:    [0,  -32, 32, 1],
      taglineX: [-1, -32, 32, 1],
      titleX:   [-2, -32, 32, 1],
    },
    Desktop: {
      backX:    [0,  -32, 32, 1],
      taglineX: [0,  -32, 32, 1],
      titleX:   [0,  -32, 32, 1],
    },
  });

  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty("--cs-align-m-back",    `${dk.Mobile.backX}px`);
    root.setProperty("--cs-align-m-tagline", `${dk.Mobile.taglineX}px`);
    root.setProperty("--cs-align-m-title",   `${dk.Mobile.titleX}px`);
    root.setProperty("--cs-align-d-back",    `${dk.Desktop.backX}px`);
    root.setProperty("--cs-align-d-tagline", `${dk.Desktop.taglineX}px`);
    root.setProperty("--cs-align-d-title",   `${dk.Desktop.titleX}px`);
  }, [
    dk.Mobile.backX, dk.Mobile.taglineX, dk.Mobile.titleX,
    dk.Desktop.backX, dk.Desktop.taglineX, dk.Desktop.titleX,
  ]);

  return null;
}
