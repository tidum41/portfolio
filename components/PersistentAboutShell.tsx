"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import AboutPageContent from "@/components/AboutPageContent";
import { peekSoftNav } from "@/lib/instantNav";
import { parkShellStyle } from "@/lib/shellPark";

/**
 * Session keep-alive for /about.
 * Idle-premount while still on Work so the first About click is a display
 * toggle (not a first React commit). Soft-nav latches instant arrival.
 */
export default function PersistentAboutShell() {
  const pathname = usePathname();
  const onAbout = pathname === "/about";
  const [hasVisited, setHasVisited] = useState(onAbout);
  const softLatched = useRef(false);
  if (onAbout && peekSoftNav()) softLatched.current = true;

  useLayoutEffect(() => {
    if (onAbout) setHasVisited(true);
  }, [onAbout]);

  useEffect(() => {
    if (hasVisited) return;
    let idleId = 0;
    let timeoutId = 0;
    const warm = () => setHasVisited(true);
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(warm, { timeout: 2800 });
    } else {
      timeoutId = window.setTimeout(warm, 1200);
    }
    return () => {
      if (idleId && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [hasVisited]);

  if (!hasVisited) return null;

  return (
    <div
      style={{ ...parkShellStyle(onAbout) }}
      aria-hidden={!onAbout}
      inert={!onAbout}
      {...(!onAbout ? { "data-nosnippet": true } : {})}
    >
      <AboutPageContent active={onAbout} softArrival={softLatched.current} />
    </div>
  );
}
