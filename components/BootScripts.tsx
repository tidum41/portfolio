"use client";

import { useRef } from "react";
import { useServerInsertedHTML } from "next/navigation";

const THEME_INTRO_BOOT = `(function(){var t=localStorage.getItem("theme");if(t==="light")document.documentElement.setAttribute("data-theme","light");try{sessionStorage.clear();}catch(e){}if(location.pathname!=="/")document.documentElement.removeAttribute("data-intro")})()`;

/**
 * Injects blocking boot + JSON-LD scripts into the SSR HTML stream outside
 * the React component tree. Raw <script> / next/script inside layout still
 * trip React 19's "Encountered a script tag while rendering" warning (and
 * can contribute to hydration recovery remounts that wipe client state).
 */
export default function BootScripts({ jsonLd }: { jsonLd: string }) {
  const inserted = useRef(false);

  useServerInsertedHTML(() => {
    if (inserted.current) return null;
    inserted.current = true;
    return (
      <>
        <script
          id="theme-intro-boot"
          dangerouslySetInnerHTML={{ __html: THEME_INTRO_BOOT }}
        />
        <script
          id="site-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      </>
    );
  });

  return null;
}
