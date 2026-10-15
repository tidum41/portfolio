"use client";

import { useRef } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { HLS_LIGHT_SRC } from "@/lib/hlsLight";

const THEME_INTRO_BOOT = `(function(){var t=localStorage.getItem("theme");if(t==="light")document.documentElement.setAttribute("data-theme","light");try{sessionStorage.clear();}catch(e){}if(location.pathname!=="/")document.documentElement.removeAttribute("data-intro")})()`;

// Start the grid player while the intro is still on screen. The bytes are
// preloaded from the homepage; this only executes them. Other routes and
// reduced-motion sessions leave it unloaded.
const HLS_BOOT = `(function(){if(location.pathname!=="/")return;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;if(document.querySelector("script[data-hls-light]"))return;var s=document.createElement("script");s.src="${HLS_LIGHT_SRC}";s.async=true;s.setAttribute("data-hls-light","1");document.head.appendChild(s)})()`;

/**
 * Injects blocking boot + JSON-LD scripts into the SSR HTML stream outside
 * the React component tree. Raw <script> / next/script inside layout still
 * trip React 19's "Encountered a script tag while rendering" warning (and
 * can contribute to hydration recovery remounts that wipe client state).
 */
export default function BootScripts({
  jsonLd,
  playlists = {},
}: {
  jsonLd: string;
  /** playbackId → 480p playlist already preloaded on the homepage. */
  playlists?: Record<string, string>;
}) {
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
          id="hls-light-boot"
          dangerouslySetInnerHTML={{ __html: HLS_BOOT }}
        />
        <script
          id="mux-card-warm"
          type="application/json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(playlists) }}
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
