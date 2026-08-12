"use client";

/**
 * Idle-warm About/Archive JS + critical About images while the user is still
 * on Work — so the first soft-nav click isn't a cold parse/decode.
 */
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const ABOUT_IMAGES = [
  "/images/about/bento-large.jpg",
  "/images/about/bento-top-right.webp",
  "/images/about/bento-bottom-right.avif",
];

export default function PrimaryRouteWarmup() {
  const pathname = usePathname();

  useEffect(() => {
    // Warm from Work (and keep warm elsewhere — cheap if already cached).
    let idleId = 0;
    let timeoutId = 0;
    const warm = () => {
      void import("@/components/AboutPageContent");
      void import("@/app/archive/ArchivePageClient");
      void import("@/components/BentoGallery");
      void import("@/components/BentoHero");
      void import("@/components/CDPlayer");
      for (const src of ABOUT_IMAGES) {
        const img = new window.Image();
        img.decoding = "async";
        img.src = src;
      }
    };
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(warm, { timeout: pathname === "/" ? 2200 : 4000 });
    } else {
      timeoutId = window.setTimeout(warm, pathname === "/" ? 900 : 1500);
    }
    return () => {
      if (idleId && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [pathname]);

  return null;
}
