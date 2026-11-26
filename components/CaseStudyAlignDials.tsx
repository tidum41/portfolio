"use client";

import { useEffect } from "react";
import { useDialKit } from "dialkit";

const STYLE_ID = "cs-align-dials-live";

/**
 * Live left/right nudges for case-study hero lane alignment.
 * Injects a <style> tag (not only CSS vars) so offsets always win over
 * page rules like `margin-left: 0 !important`, and so DialKit changes
 * are visible immediately at the matching breakpoint.
 */
export default function CaseStudyAlignDials() {
  const dk = useDialKit("CS Align", {
    Mobile: {
      titleX:   [-2, -48, 48, 1],
    },
    Desktop: {
      titleX:   [-2, -48, 48, 1],
    },
  });

  // Single snapshot keeps the effect dep length stable across HMR.
  const snap = JSON.stringify(dk);

  useEffect(() => {
    const m = dk.Mobile;
    const d = dk.Desktop;
    const css = `
/* CS Align — live DialKit overrides */
:root {
  --cs-align-m-title: ${m.titleX}px;
  --cs-align-d-title: ${d.titleX}px;
}
@media (min-width: 768px) {
  .cs-hero-title {
    transform: translateX(${d.titleX}px) !important;
  }
}
@media (max-width: 767px) {
  .cs-hero-title {
    transform: translateX(${m.titleX}px) !important;
  }
}
`;
    let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = css;

    return () => {
      // Keep styles while the app is up; only clear on full unmount paths
      // that remove this component permanently.
    };
  }, [snap]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
