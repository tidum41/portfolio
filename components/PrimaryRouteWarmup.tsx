"use client";

/**
 * Prefetch About/Archive JS after the Work intro so first-load silk + Mux
 * posters aren't competing with About images / CDPlayer / archive LQIPs.
 * Work → About/Archive still hits a warm cache once idle completes.
 *
 * Archive cold loads skip About warmup — AboutPageContent's CD embed loads
 * Geist, and Next can prefetch that dynamic chunk when the parent module is
 * imported.
 *
 * From Work, also idle-prefetch case-study routes + LCP heroes so the first
 * project-card click is usually a soft-nav into a warm cache.
 */
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { afterIntroIdle } from "@/lib/introReady";
import { allowIdlePrefetch } from "@/lib/networkHint";
import { clearPendingCaseStudy, warmAllCaseStudyNav } from "@/lib/caseStudyNav";

const CD_POSTERS = [
  "/images/cd-player-poster-light.webp",
  "/images/cd-player-poster-dark.webp",
];

export default function PrimaryRouteWarmup() {
  const pathname = usePathname();
  const router = useRouter();

  // Drop in-flight case-study pending once the URL catches up (or user left).
  useEffect(() => {
    clearPendingCaseStudy();
  }, [pathname]);

  useEffect(() => {
    let idleId = 0;
    let timeoutId = 0;
    let heavyIdleId = 0;
    let heavyTimeoutId = 0;
    let caseIdleId = 0;
    let caseTimeoutId = 0;

    const warmAbout = () => {
      void import("@/components/AboutPageContent");
      void import("@/components/BentoHero");
    };

    const warmArchive = () => {
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

    // CD player pulls Geist — only warm it on Work, where the grid embed lives.
    const warmHeavy = () => {
      if (pathname !== "/") return;
      void import("@/components/CDPlayer");
    };

    const warmCaseStudies = () => {
      if (pathname !== "/") return;
      warmAllCaseStudyNav(router);
    };

    const schedule = () => {
      if (!allowIdlePrefetch()) return;
      if (pathname === "/") {
        warmAbout();
        warmArchive();
      } else if (pathname === "/about") {
        warmArchive();
        router.prefetch("/");
      } else if (pathname === "/archive") {
        router.prefetch("/");
        router.prefetch("/about");
      }
      // `/archive`: do not warm About chunk (avoids Geist/CD on Archive).
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(warmAssets, { timeout: 2500 });
        heavyIdleId = window.requestIdleCallback(warmHeavy, { timeout: 4000 });
        caseIdleId = window.requestIdleCallback(warmCaseStudies, {
          timeout: 3500,
        });
      } else {
        timeoutId = window.setTimeout(warmAssets, 400);
        heavyTimeoutId = window.setTimeout(warmHeavy, 1200);
        caseTimeoutId = window.setTimeout(warmCaseStudies, 600);
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
      if (caseIdleId && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(caseIdleId);
      }
      if (timeoutId) window.clearTimeout(timeoutId);
      if (heavyTimeoutId) window.clearTimeout(heavyTimeoutId);
      if (caseTimeoutId) window.clearTimeout(caseTimeoutId);
    };
  }, [pathname, router]);

  return null;
}
