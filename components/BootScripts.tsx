"use client";

import { useRef } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { HLS_LIGHT_SRC } from "@/lib/hlsLight";
import type { MuxWarmEntry } from "@/lib/muxCardWarmup";

const THEME_INTRO_BOOT = `(function(){var t=localStorage.getItem("theme");if(t==="light")document.documentElement.setAttribute("data-theme","light");try{sessionStorage.clear();}catch(e){}if(location.pathname!=="/")document.documentElement.removeAttribute("data-intro")})()`;

/**
 * Home-only Mux CDN preconnects + hls-light boot + segment preloads.
 * Path-gated in JS (not React head) so router.prefetch("/") from About/Archive
 * cannot apply these hints onto non-Work documents.
 */
function buildHomeVideoBoot(preconnect: string[]) {
  const origins = JSON.stringify([
    "https://image.mux.com",
    "https://stream.mux.com",
    ...preconnect,
  ]);
  return `(function(){if(location.pathname!=="/")return;var origins=${origins};for(var i=0;i<origins.length;i++){var o=origins[i];if(!o||document.head.querySelector('link[rel="preconnect"][href="'+o+'"]'))continue;var c=document.createElement("link");c.rel="preconnect";c.href=o;c.crossOrigin="anonymous";document.head.appendChild(c)}if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;if(!document.querySelector("script[data-hls-light]")){var s=document.createElement("script");s.src="${HLS_LIGHT_SRC}";s.async=true;s.setAttribute("data-hls-light","1");document.head.appendChild(s)}try{var raw=document.getElementById("mux-card-warm");if(!raw||!raw.textContent)return;var map=JSON.parse(raw.textContent);var conn=navigator.connection;var slow=Boolean(conn&&(conn.saveData||conn.effectiveType==="slow-2g"||conn.effectiveType==="2g"||conn.effectiveType==="3g"||(typeof conn.downlink==="number"&&conn.downlink>0&&conn.downlink<2)||(typeof conn.rtt==="number"&&conn.rtt>=250)));var narrow=window.innerWidth<800||slow;var keys=Object.keys(map);for(var i=0;i<keys.length;i++){if(narrow&&window.innerWidth<768&&i>0)break;var e=map[keys[i]];if(!e||typeof e!=="object")continue;var segs=narrow?(e.segs480||e.segs720):(e.segs720||e.segs480);if(!segs)continue;for(var j=0;j<segs.length;j++){var u=segs[j];if(document.head.querySelector('link[rel="preload"][href="'+u+'"]'))continue;var l=document.createElement("link");l.rel="preload";l.as="fetch";l.crossOrigin="anonymous";l.href=u;document.head.appendChild(l)}}}catch(err){}})()`;
}

/**
 * Injects blocking boot + JSON-LD scripts into the SSR HTML stream outside
 * the React component tree. Raw <script> / next/script inside layout still
 * trip React 19's "Encountered a script tag while rendering" warning (and
 * can contribute to hydration recovery remounts that wipe client state).
 */
export default function BootScripts({
  jsonLd,
  playlists = {},
  preconnect = [],
}: {
  jsonLd: string;
  /** playbackId → pre-resolved 480p/720p playlists on the homepage. */
  playlists?: Record<string, string | MuxWarmEntry>;
  /** Mux CDN origins — injected only when pathname is `/`. */
  preconnect?: string[];
}) {
  const inserted = useRef(false);
  const homeVideoBoot = buildHomeVideoBoot(preconnect);

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
          id="mux-card-warm"
          type="application/json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(playlists) }}
        />
        <script
          id="hls-light-boot"
          dangerouslySetInnerHTML={{ __html: homeVideoBoot }}
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
