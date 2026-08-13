"use client";

/**
 * Idle-warm About/Archive JS + critical About images while the user is still
 * on Work — so the first soft-nav click isn't a cold parse/decode.
 */
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { warmAboutShell, warmArchiveShell } from "@/lib/keepAliveWarm";

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
    // Warm from Work (and keep warm elsewhere — cheap if already cached).
    let idleId = 0;
    let timeoutId = 0;
    let heavyIdleId = 0;
    let heavyTimeoutId = 0;
    const warm = () => {
      void import("@/components/AboutPageContent");
      void import("@/components/BentoHeroStatic");
      void import("@/components/CssEntrance");
      void import("@/app/archive/ArchivePageClient");
      void import("@/components/BentoGallery");
      warmAboutShell();
      warmArchiveShell();
      for (const src of [...ABOUT_IMAGES, ...CD_POSTERS]) {
        const img = new window.Image();
        img.decoding = "async";
        img.src = src;
      }
    };
    // CD chunk warms sooner than before — About shows a poster first, then
    // mounts live ~0.5s after settle. Still after About JS/images.
    const warmHeavy = () => {
      void import("@/components/CDPlayer");
    };
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(warm, { timeout: pathname === "/" ? 2200 : 4000 });
      heavyIdleId = window.requestIdleCallback(warmHeavy, { timeout: pathname === "/" ? 4500 : 7000 });
    } else {
      timeoutId = window.setTimeout(warm, pathname === "/" ? 900 : 1500);
      heavyTimeoutId = window.setTimeout(warmHeavy, pathname === "/" ? 2800 : 5000);
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
