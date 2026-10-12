"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BootScripts from "@/components/BootScripts";
import GlobalCustomCursor from "@/components/GlobalCustomCursor";
import UiSoundRoot from "@/components/UiSoundRoot";
import AnimationProvider from "@/components/AnimationProvider";
import DevToolbar from "@/components/DevToolbar";
import DevDialRoot from "@/components/DevDialRoot";
import { PersistentWorkShell } from "@/components/PersistentWorkShell";
import PersistentArchiveShell from "@/components/PersistentArchiveShell";
import PersistentAboutShell from "@/components/PersistentAboutShell";
import PersistentSilkLayer from "@/components/PersistentSilkLayer";
import PrimaryRouteWarmup from "@/components/PrimaryRouteWarmup";
import PrimaryTabSync from "@/components/PrimaryTabSync";
import { Analytics } from "@vercel/analytics/next";
import type { SanityProject } from "@/lib/sanity/queries";

/**
 * Site chrome for every route except /dev/card-lab.
 * Card lab must not mount Nav, Footer, cursor, sound, shells, warmup,
 * DialKit, DevToolbar, or Analytics — gated here by pathname so a nested
 * layout cannot leave them in the tree (CSS hide is not enough).
 */
export default function SiteChrome({
  children,
  projects,
  jsonLd,
}: {
  children: ReactNode;
  projects: SanityProject[];
  jsonLd: string;
}) {
  const pathname = usePathname();
  const isCardLab =
    pathname === "/dev/card-lab" || pathname.startsWith("/dev/card-lab/");

  if (isCardLab) {
    return <>{children}</>;
  }

  return (
    <>
      <BootScripts jsonLd={jsonLd} />
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <GlobalCustomCursor />
      <UiSoundRoot />
      <Nav />
      <PrimaryRouteWarmup />
      <PrimaryTabSync />
      <main id="main-content" style={{ position: "relative" }}>
        <PersistentSilkLayer />
        <PersistentWorkShell projects={projects} />
        <PersistentAboutShell />
        <PersistentArchiveShell />
        <AnimationProvider>{children}</AnimationProvider>
        {process.env.NODE_ENV === "development" && <DevDialRoot />}
      </main>
      <Footer />
      {process.env.NODE_ENV === "development" && <DevToolbar />}
      <Analytics />
    </>
  );
}
