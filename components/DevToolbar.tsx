"use client";
import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Agentation } from "agentation";
import { useDialKit } from "dialkit";
import LayoutDials from "./LayoutDials";
import IntroDials from "./IntroDials";
import CaseStudyAlignDials from "./CaseStudyAlignDials";
import { RulerModeOverlay } from "./ruler-mode";
import { isCaseStudyHref } from "@/lib/caseStudyNav";

function subscribe() {
  return () => {};
}

function isTopWindow() {
  return window.self === window.top;
}

function RulerDials() {
  const dk = useDialKit("Dev Tools", {
    rulerMode: true,
  });
  if (!dk.rulerMode) return null;
  return <RulerModeOverlay appearance="dark" />;
}

/**
 * Registers only the DialKit sections that apply to the current route.
 * DialRoot itself lives next to {children} in the root layout (dev only).
 */
export default function DevToolbar() {
  const pathname = usePathname();
  const top = useSyncExternalStore(subscribe, isTopWindow, () => true);

  if (!top || pathname.startsWith("/dev")) return null;

  const isWork = pathname === "/";
  const isCaseStudy = isCaseStudyHref(pathname);

  return (
    <>
      <RulerDials />
      <Agentation />
      <LayoutDials />
      {isWork && <IntroDials />}
      {isCaseStudy && <CaseStudyAlignDials />}
    </>
  );
}
