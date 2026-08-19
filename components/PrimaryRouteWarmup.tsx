"use client";

/**
 * Prefetch About/Archive JS after the Work intro so first-load silk + Mux
 * posters aren't competing with About images / CDPlayer / archive LQIPs.
 * Work → About/Archive still hits a warm cache once idle completes.
 */
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { afterIntroIdle } from "@/lib/introReady";

const CD_POSTERS = [
  "/images/cd-player-poster-light.webp",
  "/images/cd-player-poster-dark.webp",
];

export default function PrimaryRouteWarmup() {
  const pathname = usePathname();

  useEffect(() => {
    let idleId = 0;
    let timeoutId = 0;
    let heavyIdleId = 0;
    let heavyTimeoutId = 0;

    const warmJs = () => {
      void import("@/components/AboutPageContent");
      void import("@/components/BentoHero");
      void import("@/app/archive/ArchivePageClient");
      void import("@/components/BentoGallery");
      void import("@/lib/archiveGalleryCache").then((m) => {
        void m.warmArchiveGallery();
      });
    };

    const warmAssets = () => {
      for (const src of CD_POSTERS) {
        const img = new window.Image();
        img.decoding = "async";
        img.src = src;
      }
    };

    const warmHeavy = () => {
      void import("@/components/CDPlayer");
    };

    const schedule = () => {
      warmJs();
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(warmAssets, { timeout: 2500 });
        heavyIdleId = window.requestIdleCallback(warmHeavy, { timeout: 4000 });
      } else {
        timeoutId = window.setTimeout(warmAssets, 400);
        heavyTimeoutId = window.setTimeout(warmHeavy, 1200);
      }
    };

    const cancelIntro = afterIntroIdle(schedule, pathname === "/" ? 2500 : 800);

    return () => {
      cancelIntro();
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
