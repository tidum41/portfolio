"use client";

import { useRef } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { HLS_LIGHT_SRC } from "@/lib/hlsLight";
import { CONTACT_EMAIL } from "@/lib/site";

const THEME_INTRO_BOOT = `(function(){var t=localStorage.getItem("theme");if(t==="light")document.documentElement.setAttribute("data-theme","light");try{sessionStorage.clear();}catch(e){}if(location.pathname!=="/")document.documentElement.removeAttribute("data-intro")})()`;

// Start the grid player and preload the exact startup rendition's initial
// segments (480p on narrow/constrained connections, 720p on desktop broadband)
// while the intro is still on screen.
const HLS_BOOT = `(function(){if(location.pathname!=="/")return;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;if(!document.querySelector("script[data-hls-light]")){var s=document.createElement("script");s.src="${HLS_LIGHT_SRC}";s.async=true;s.setAttribute("data-hls-light","1");document.head.appendChild(s)}try{var raw=document.getElementById("mux-card-warm");if(!raw||!raw.textContent)return;var map=JSON.parse(raw.textContent);var c=navigator.connection;var slow=Boolean(c&&(c.saveData||c.effectiveType==="slow-2g"||c.effectiveType==="2g"||c.effectiveType==="3g"||(typeof c.downlink==="number"&&c.downlink>0&&c.downlink<2)||(typeof c.rtt==="number"&&c.rtt>=250)));var narrow=window.innerWidth<800||slow;var keys=Object.keys(map);for(var i=0;i<keys.length;i++){if(narrow&&window.innerWidth<768&&i>0)break;var e=map[keys[i]];if(!e||typeof e!=="object")continue;var segs=narrow?(e.segs480||e.segs720):(e.segs720||e.segs480);if(!segs)continue;for(var j=0;j<segs.length;j++){var u=segs[j];if(document.head.querySelector('link[rel="preload"][href="'+u+'"]'))continue;var l=document.createElement("link");l.rel="preload";l.as="fetch";l.crossOrigin="anonymous";l.href=u;document.head.appendChild(l)}}}catch(err){}})()`;

// Copy-email works before hydration: a capture-phase listener handles clicks
// until CopyEmail mounts and sets window.__copyEmailReady.
const COPY_EMAIL_BOOT = `(function(){document.addEventListener("click",function(e){if(window.__copyEmailReady)return;var b=e.target&&e.target.closest&&e.target.closest(".copy-email-btn");if(!b||b.getAttribute("data-copied")==="true")return;try{navigator.clipboard&&navigator.clipboard.writeText(${JSON.stringify(CONTACT_EMAIL)})}catch(x){}var t=b.querySelector(".copy-email-track"),i=b.querySelector(".copy-email-layer--idle"),c=b.querySelector(".copy-email-layer--copied");if(t&&i&&c&&!matchMedia("(prefers-reduced-motion: reduce)").matches){t.style.width=i.getBoundingClientRect().width+"px";t.offsetWidth;t.style.width=Math.ceil(c.getBoundingClientRect().width)+"px"}b.setAttribute("data-copied","true");setTimeout(function(){b.setAttribute("data-copied","false");if(t){t.style.width=Math.ceil(i.getBoundingClientRect().width)+"px";setTimeout(function(){t.style.width=""},200)}},1100)},true)})()`;

/**
 * Injects blocking boot + JSON-LD scripts into the SSR HTML stream outside
 * the React component tree. Raw <script> / next/script inside layout still
 * trip React 19's "Encountered a script tag while rendering" warning (and
 * can contribute to hydration recovery remounts that wipe client state).
 */
import type { MuxWarmEntry } from "@/lib/muxCardWarmup";

export default function BootScripts({
  jsonLd,
  playlists = {},
}: {
  jsonLd: string;
  /** playbackId → pre-resolved 480p/720p playlists on the homepage. */
  playlists?: Record<string, string | MuxWarmEntry>;
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
          id="copy-email-boot"
          dangerouslySetInnerHTML={{ __html: COPY_EMAIL_BOOT }}
        />
        <script
          id="mux-card-warm"
          type="application/json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(playlists) }}
        />
        <script
          id="hls-light-boot"
          dangerouslySetInnerHTML={{ __html: HLS_BOOT }}
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
