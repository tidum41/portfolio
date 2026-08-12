"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import AboutPageContent from "@/components/AboutPageContent";
import { peekSoftNav } from "@/lib/instantNav";

/**
 * Session keep-alive for /about — same contract as PersistentWorkShell.
 * First soft visit: latch soft intent in layout, then mount body after two
 * frames so leave-Work (Mux pause / shell hide) gets the click frame first.
 * Later soft-navs only toggle display.
 */
export default function PersistentAboutShell() {
  const pathname = usePathname();
  const onAbout = pathname === "/about";
  const [hasVisited, setHasVisited] = useState(onAbout);
  const [softFirst, setSoftFirst] = useState(false);
  const [bodyReady, setBodyReady] = useState(() => {
    // Hard land on /about (refresh): mount immediately.
    if (typeof window === "undefined") return onAbout;
    return onAbout && !peekSoftNav();
  });
  const softLatched = useRef(false);

  useLayoutEffect(() => {
    if (!onAbout) return;
    if (peekSoftNav()) {
      softLatched.current = true;
      setSoftFirst(true);
    }
    setHasVisited(true);
  }, [onAbout]);

  useEffect(() => {
    if (!hasVisited || bodyReady) return;
    if (!softLatched.current && !softFirst) {
      setBodyReady(true);
      return;
    }
    // Yield two frames so soft-nav leave-Work paints before About commit.
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setBodyReady(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [hasVisited, bodyReady, softFirst]);

  if (!hasVisited || !bodyReady) return null;

  return (
    <div
      style={{ display: onAbout ? "block" : "none", position: "relative", zIndex: 1 }}
      aria-hidden={!onAbout}
      inert={!onAbout}
      {...(!onAbout ? { "data-nosnippet": true } : {})}
    >
      <AboutPageContent active={onAbout} softArrival={softFirst} />
    </div>
  );
}
