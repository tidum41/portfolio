"use client";

import { useEffect } from "react";

/**
 * Soft-hide portfolio chrome while reviewing the B2B prototype under /dev.
 * Restores on unmount so other routes stay untouched.
 */
export default function ProtoChrome() {
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.joolaProto = "1";
    return () => {
      delete html.dataset.joolaProto;
    };
  }, []);

  return (
    <style>{`
      html[data-joola-proto="1"] .site-nav,
      html[data-joola-proto="1"] footer.intro-hide,
      html[data-joola-proto="1"] .dialkit-root,
      html[data-joola-proto="1"] [data-custom-cursor],
      html[data-joola-proto="1"] [class*="agentation"] {
        display: none !important;
      }
      html[data-joola-proto="1"] body {
        cursor: auto !important;
      }
    `}</style>
  );
}
