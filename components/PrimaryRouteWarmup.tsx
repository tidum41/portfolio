"use client";

/**
 * Prefetch About/Archive JS + About images while still on Work so the first
 * nav click does not wait on a late chunk.
 */
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const ABOUT_IMAGES = [
  "/images/about/bento-large.jpg",
  "/images/about/bento-top-right.webp",
  "/images/about/bento-bottom-right.avif",
];

const CD_POSTERS = [
  "/images/cd-player-poster-light.webp",
  "/images/cd-player-poster-dark.webp",
];

export default function PrimaryRouteWarmup() {
  const pathname = usePathname();

  useEffect(() => {
    void import("@/components/AboutPageContent");
    void import("@/components/BentoHero");
    void import("@/app/archive/ArchivePageClient");
    void import("@/components/BentoGallery");
    void import("@/lib/archiveGalleryCache").then((m) => {
      void m.warmArchiveGallery().then((items) => {
        // Posters only — full archive images attach when the keep-alive
        // shell becomes visible. Preloading full srcs here competed with Work.
        for (const it of items.slice(0, 12)) {
          const poster = it.blurDataURL;
          if (!poster || poster.startsWith("data:")) continue;
          const img = new window.Image();
          img.decoding = "async";
          img.src = poster;
        }
      });
    });

    let idleId = 0;
    let timeoutId = 0;
    let heavyIdleId = 0;
    let heavyTimeoutId = 0;
    const warmAssets = () => {
      for (const src of [...ABOUT_IMAGES, ...CD_POSTERS]) {
        const img = new window.Image();
        img.decoding = "async";
        img.src = src;
      }
    };
    const warmHeavy = () => {
      void import("@/components/CDPlayer");
    };
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(warmAssets, { timeout: pathname === "/" ? 1200 : 3000 });
      heavyIdleId = window.requestIdleCallback(warmHeavy, { timeout: pathname === "/" ? 2800 : 5000 });
    } else {
      timeoutId = window.setTimeout(warmAssets, pathname === "/" ? 400 : 900);
      heavyTimeoutId = window.setTimeout(warmHeavy, pathname === "/" ? 1600 : 3200);
    }
    return () => {
      if (idleId && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (heavyIdleId && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(heavyIdleId);
      }
      if (timeoutId) window.clearTimeout(timeoutId);
      if (heavyTimeoutId) window.clearTimeout(heavyTimeoutId);
    };
  }, [pathname]);

  return null;
}
