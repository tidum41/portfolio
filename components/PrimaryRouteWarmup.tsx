"use client";

/**
 * Prefetch About/Archive JS after the Work intro so first-load silk + Mux
 * posters aren't competing with About images / CDPlayer / archive LQIPs.
 * Work → About/Archive still hits a warm cache once idle completes.
 */
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { afterIntroIdle, onIntroDoneAndLoaded } from "@/lib/introReady";
import { allowIdlePrefetch } from "@/lib/networkHint";

const CD_POSTER = {
  light: "/images/cd-player-poster-light.webp",
  dark: "/images/cd-player-poster-dark.webp",
} as const;

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
      // Only the poster for the current theme; a theme toggle fetches the
      // other one when it's shown, as on any image.
      const theme = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
      const img = new window.Image();
      img.decoding = "async";
      img.src = CD_POSTER[theme];
    };

    // The live CD player (and its dnd-kit) is warmed by the Work shell once
    // its card nears the viewport, or on open; nothing to do here.
    const warmHeavy = () => {};

    const schedule = () => {
      if (!allowIdlePrefetch()) return;
      warmJsOnce();
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(warmAssets, { timeout: 2500 });
        heavyIdleId = window.requestIdleCallback(warmHeavy, { timeout: 4000 });
      } else {
        timeoutId = window.setTimeout(warmAssets, 400);
        heavyTimeoutId = window.setTimeout(warmHeavy, 1200);
      }
    };

    // The About/Archive code no longer rides in first-load JS, so fetch it as
    // soon as the intro and load are done (not on idle), and right away on a
    // nav press, so a tab tap just after the intro doesn't wait on a download.
    let jsWarmed = false;
    const warmJsOnce = () => {
      if (jsWarmed) return;
      jsWarmed = true;
      warmJs();
    };
    const cancelJs = onIntroDoneAndLoaded(() => {
      if ((window as Window & { __leavingHome?: number }).__leavingHome) return;
      warmJsOnce();
    });
    const onIntent = (e: Event) => {
      const a = (e.target as Element | null)?.closest?.("a.nav-link");
      const href = a?.getAttribute("href");
      if (href === "/about" || href === "/archive") warmJsOnce();
    };
    document.addEventListener("pointerdown", onIntent, { capture: true, passive: true });
    document.addEventListener("focusin", onIntent, true);
    const cancelIntro = afterIntroIdle(schedule, pathname === "/" ? 2500 : 800);

    return () => {
      cancelIntro();
      cancelJs();
      document.removeEventListener("pointerdown", onIntent, true);
      document.removeEventListener("focusin", onIntent, true);
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
