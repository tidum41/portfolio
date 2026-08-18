"use client";

import { memo } from "react";
import { usePathname } from "next/navigation";
import AboutPageContent from "@/components/AboutPageContent";
import { useResolvedPrimaryTab } from "@/lib/usePrimaryTab";
import { useTabArrival } from "@/lib/useTabArrival";

/**
 * About keep-alive — same hide contract as Work/Archive (`display: none` +
 * inert). Mounted once from the root layout so Work → About is a display
 * flip, not a remount of CDPlayer + BentoHero.
 *
 * Content enter replays on every About click via `enterEpoch` (finished
 * `.ps3-enter` will not restart on the same node). Back snaps at rest.
 * The shell itself is instant.
 */
export default function PersistentAboutShell() {
  const pathname = usePathname();
  const tab = useResolvedPrimaryTab(pathname);
  const visible = tab === "about";
  const { snap, epoch } = useTabArrival(visible);
  const playEnter = visible && !snap;

  return (
    <div
      data-primary-shell="about"
      style={{ display: visible ? "block" : "none" }}
      aria-hidden={!visible}
      inert={!visible}
      {...(!visible ? { "data-nosnippet": true } : {})}
    >
      <AboutKeepAlive visible={visible} playEnter={playEnter} enterEpoch={epoch} />
    </div>
  );
}

const AboutKeepAlive = memo(function AboutKeepAlive({
  visible,
  playEnter,
  enterEpoch,
}: {
  visible: boolean;
  playEnter: boolean;
  enterEpoch: number;
}) {
  return <AboutPageContent visible={visible} playEnter={playEnter} enterEpoch={enterEpoch} />;
}, (prev, next) => {
  if (
    !prev.visible &&
    !next.visible &&
    prev.playEnter === next.playEnter &&
    prev.enterEpoch === next.enterEpoch
  ) {
    return true;
  }
  return (
    prev.visible === next.visible &&
    prev.playEnter === next.playEnter &&
    prev.enterEpoch === next.enterEpoch
  );
});
