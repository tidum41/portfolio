"use client";

import { useRef } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { HLS_LIGHT_SRC } from "@/lib/hlsLight";
import { CONTACT_EMAIL } from "@/lib/site";

const THEME_INTRO_BOOT = `(function(){var t=localStorage.getItem("theme");if(t==="light")document.documentElement.setAttribute("data-theme","light");try{sessionStorage.clear();}catch(e){}if(location.pathname!=="/")document.documentElement.removeAttribute("data-intro")})()`;

// Start the grid player and preload the exact startup rendition's initial
// segments (480p on narrow/constrained connections, 720p on desktop broadband)
// while the intro is still on screen.
const HLS_BOOT = `(function(){if(location.pathname!=="/")return;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;var wp=fetch("/api/mux-warm").then(function(r){return r.ok?r.json():null}).then(function(m){if(m)window.__muxWarm=m;return m}).catch(function(){return null});var away=false,down=false,held=false;function leave(e){var a=e.target&&e.target.closest&&e.target.closest("a[href]");var u=a&&a.getAttribute("href");if(u&&u.charAt(0)==="/"&&u.charAt(1)!=="/"&&u!=="/"){away=true;window.__leavingHome=1}}document.addEventListener("click",leave,true);document.addEventListener("pointerdown",function(e){down=true;window.__ptrDown=1;if(e.pointerType!=="touch"&&e.button===0)leave(e)},true);function up(){down=false;window.__ptrDown=0;if(held){held=false;setTimeout(go,0)}}document.addEventListener("pointerup",up,true);document.addEventListener("pointercancel",up,true);var h=document.documentElement;if(h.getAttribute("data-intro")==="playing"){window.addEventListener("intro-done",go,{once:true});return}go();function go(){if(away)return;if(down){held=true;return}if(!document.querySelector("script[data-hls-light]")){var s=document.createElement("script");s.src="${HLS_LIGHT_SRC}";s.async=true;s.setAttribute("data-hls-light","1");document.head.appendChild(s)}wp.then(function(map){if(!map)return;try{var c=navigator.connection;var slow=Boolean(c&&(c.saveData||c.effectiveType==="slow-2g"||c.effectiveType==="2g"||c.effectiveType==="3g"||(typeof c.downlink==="number"&&c.downlink>0&&c.downlink<2)||(typeof c.rtt==="number"&&c.rtt>=250)));var narrow=window.innerWidth<800||slow;var keys=Object.keys(map);for(var i=0;i<keys.length;i++){if(narrow&&window.innerWidth<768&&i>0)break;var e=map[keys[i]];if(!e||typeof e!=="object")continue;var segs=narrow?(e.segs480||e.segs720):(e.segs720||e.segs480);if(!segs)continue;for(var j=0;j<segs.length;j++){var u=segs[j];if(document.head.querySelector('link[rel="preload"][href="'+u+'"]'))continue;var l=document.createElement("link");l.rel="preload";l.as="fetch";l.crossOrigin="anonymous";l.href=u;document.head.appendChild(l)}}}catch(err){}})}})()`;

// Copy-email works before hydration: a capture-phase listener handles clicks
// until CopyEmail mounts and sets window.__copyEmailReady.
const COPY_EMAIL_BOOT = `(function(){document.addEventListener("click",function(e){if(window.__copyEmailReady)return;var b=e.target&&e.target.closest&&e.target.closest(".copy-email-btn");if(!b||b.getAttribute("data-copied")==="true")return;try{navigator.clipboard&&navigator.clipboard.writeText(${JSON.stringify(CONTACT_EMAIL)})}catch(x){}b.setAttribute("data-copied","true");setTimeout(function(){b.setAttribute("data-copied","false")},1600)},true)})()`;

/**
 * Injects blocking boot + JSON-LD scripts into the SSR HTML stream outside
 * the React component tree. Raw <script> / next/script inside layout still
 * trip React 19's "Encountered a script tag while rendering" warning (and
 * can contribute to hydration recovery remounts that wipe client state).
 */

export default function BootScripts({
  jsonLd,
}: {
  jsonLd: string;
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
