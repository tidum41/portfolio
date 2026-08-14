"use client";

import { memo, useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AboutPageContent from "@/components/AboutPageContent";
import { peekSoftNav, useResolvedPrimaryTab } from "@/lib/instantNav";

/**
 * About keep-alive — same hide contract as Work/Archive (`display: none` +
 * inert). Mounted once from the root layout so Work → About is a display
 * flip, not a remount of CDPlayer + BentoHero.
 *
 * Enter plays only on a hard load of `/about`. Soft-nav first show and
 * every later tab return snap at rest — `.ps3-enter` restarts when
 * `display` goes none → block, which reads as a load delay.
 */
export default function PersistentAboutShell() {
  const pathname = usePathname();
  const tab = useResolvedPrimaryTab(pathname);
  const visible = tab === "about";
  const [playEnter, setPlayEnter] = useState(
    () => pathname === "/about" && !peekSoftNav(),
  );

  useLayoutEffect(() => {
    if (!visible && playEnter) setPlayEnter(false);
  }, [visible, playEnter]);

  return (
    <div
      data-primary-shell="about"
      style={{ display: visible ? "block" : "none" }}
      aria-hidden={!visible}
      inert={!visible}
      {...(!visible ? { "data-nosnippet": true } : {})}
    >
      <AboutKeepAlive visible={visible} playEnter={playEnter} />
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
