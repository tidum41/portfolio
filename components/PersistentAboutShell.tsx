"use client";

import { memo, startTransition, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useResolvedPrimaryTab } from "@/lib/usePrimaryTab";
import { useTabArrival } from "@/lib/useTabArrival";
import { afterIntroIdle } from "@/lib/introReady";
import { allowIdlePrefetch } from "@/lib/networkHint";

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
    // This build hydrates sooner than main, so its first idle lands right
    // where people tap a tab after the intro. Wait 2.5 s past idle, push the
    // pre-mount back after any link press, and render it as a transition,
    // so it doesn't compete with the tab the visitor just chose.
    let quietId = 0;
    let lastPress = 0;
    const onPress = (e: Event) => {
      if ((e.target as Element | null)?.closest?.("a[href]")) lastPress = performance.now();
    };
    document.addEventListener("pointerdown", onPress, { capture: true, passive: true });
    const tryMount = () => {
      const since = performance.now() - lastPress;
      if (since < 2500) {
        quietId = window.setTimeout(tryMount, 2500 - since);
        return;
      }
      // Album covers are about a megabyte. On a slow or metered connection
      // they wait until About is actually opened.
      if (!allowIdlePrefetch()) return;
      // Interruptible, so a tab tap during this render wins.
      startTransition(() => setHasShown(true));
    };
    const cancelIdle = afterIntroIdle(() => {
      quietId = window.setTimeout(tryMount, 2500);
    }, 4000);
    return () => {
      cancelIdle();
      window.clearTimeout(quietId);
      document.removeEventListener("pointerdown", onPress, true);
    };
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
