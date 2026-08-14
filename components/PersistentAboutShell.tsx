"use client";

import { memo } from "react";
import { usePathname } from "next/navigation";
import AboutPageContent from "@/components/AboutPageContent";
import { useResolvedPrimaryTab } from "@/lib/usePrimaryTab";

/**
 * About keep-alive — same hide contract as Work/Archive (`display: none` +
 * inert). Mounted once from the root layout so Work → About is a display
 * flip, not a remount of CDPlayer + BentoHero.
 *
 * `.ps3-enter` is on while visible so display:none → block retriggers the
 * content enter on every About arrival. The shell itself is instant.
 */
export default function PersistentAboutShell() {
  const pathname = usePathname();
  const tab = useResolvedPrimaryTab(pathname);
  const visible = tab === "about";

  return (
    <div
      data-primary-shell="about"
      style={{ display: visible ? "block" : "none" }}
      aria-hidden={!visible}
      inert={!visible}
      {...(!visible ? { "data-nosnippet": true } : {})}
    >
      <AboutKeepAlive visible={visible} playEnter={visible} />
    </div>
  );
}

const AboutKeepAlive = memo(function AboutKeepAlive({
  visible,
  playEnter,
}: {
  visible: boolean;
  playEnter: boolean;
}) {
  return <AboutPageContent visible={visible} playEnter={playEnter} />;
}, (prev, next) => {
  if (!prev.visible && !next.visible && prev.playEnter === next.playEnter) return true;
  return prev.visible === next.visible && prev.playEnter === next.playEnter;
});
