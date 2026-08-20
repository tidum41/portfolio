"use client";

import { memo, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useResolvedPrimaryTab } from "@/lib/usePrimaryTab";
import { useTabArrival } from "@/lib/useTabArrival";
import { afterIntroIdle } from "@/lib/introReady";

const AboutPageContent = dynamic(() => import("@/components/AboutPageContent"));

/**
 * About keep-alive — same hide contract as Work/Archive (`display: none` +
 * inert). Not mounted on first Work paint (that pulled CDPlayer + BentoHero
 * + priority About images into `/`). Idle-mounts after intro so Work → About
 * is still a display flip once warmed.
 */
export default function PersistentAboutShell() {
  const pathname = usePathname();
  const tab = useResolvedPrimaryTab(pathname);
  const visible = tab === "about";
  const { snap, epoch } = useTabArrival(visible);
  const playEnter = visible && !snap;

  const [hasShown, setHasShown] = useState(visible);
  if (visible && !hasShown) setHasShown(true);

  useEffect(() => {
    if (hasShown) return;
    return afterIntroIdle(() => setHasShown(true), 4000);
  }, [hasShown]);

  return (
    <div
      data-primary-shell="about"
      style={{ display: visible ? "block" : "none" }}
      aria-hidden={!visible}
      inert={!visible}
      {...(!visible ? { "data-nosnippet": true } : {})}
    >
      {hasShown ? (
        <AboutKeepAlive visible={visible} playEnter={playEnter} enterEpoch={epoch} />
      ) : null}
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
