"use client";

/**
 * Prefetch About/Archive JS after the Work intro so first-load silk + Mux
 * posters aren't competing with About images / CDPlayer / archive LQIPs.
 * Work → About/Archive still hits a warm cache once idle completes.
 */
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { afterIntroIdle } from "@/lib/introReady";
import { allowIdlePrefetch } from "@/lib/networkHint";

export default function PrimaryRouteWarmup() {
  const pathname = usePathname();

  useEffect(() => {
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

    // About still embeds the CD player — warm its chunk after lighter JS.
    const warmHeavy = () => {
      void import("@/components/CDPlayer");
    };

    const schedule = () => {
      if (!allowIdlePrefetch()) return;
      warmJs();
      if (typeof window.requestIdleCallback === "function") {
        heavyIdleId = window.requestIdleCallback(warmHeavy, { timeout: 4000 });
      } else {
        heavyTimeoutId = window.setTimeout(warmHeavy, 1200);
      }
    };

    const cancelIntro = afterIntroIdle(schedule, pathname === "/" ? 2500 : 800);

    return () => {
      cancelIntro();
      if (heavyIdleId && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(heavyIdleId);
      }
      if (heavyTimeoutId) window.clearTimeout(heavyTimeoutId);
    };
  }, [pathname]);

  return null;
}
