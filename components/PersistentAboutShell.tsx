"use client";

import { usePathname } from "next/navigation";
import AboutPageContent from "@/components/AboutPageContent";
import { useKeepAliveInstant } from "@/lib/useKeepAliveInstant";
import { useKeepAliveVisit } from "@/lib/useKeepAliveVisit";
import { onWarmAbout, wasAboutWarmed } from "@/lib/keepAliveWarm";

/**
 * Session keep-alive for /about. First visit (or idle/hover warm) mounts;
 * later visits toggle display.
 */
export default function PersistentAboutShell() {
  const pathname = usePathname();
  const onAbout = pathname === "/about";
  const hasVisited = useKeepAliveVisit(onAbout, wasAboutWarmed(), onWarmAbout);
  const instant = useKeepAliveInstant(onAbout);

  if (!hasVisited) return null;

  return (
    <div
      style={{ display: onAbout ? "block" : "none", position: "relative", zIndex: 1 }}
      aria-hidden={!onAbout}
      inert={!onAbout}
      {...(!onAbout ? { "data-nosnippet": true } : {})}
    >
      <AboutPageContent active={onAbout} instant={instant} />
    </div>
  );
}
