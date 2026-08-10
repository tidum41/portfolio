"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), { ssr: false });

/**
 * Poster-first LCP: paint the Mux thumbnail immediately via next/image
 * (priority), then mount MuxPlayer on idle / in-view / first interaction.
 * Invisible sizing img preserves the exact aspect ratio (CLS) before and
 * after the player mounts — same end visual as always-on MuxPlayer.
 */
export default function MuxHero({ playbackId }: { playbackId: string }) {
  const thumbnail = `https://image.mux.com/${playbackId}/thumbnail.webp`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [mountPlayer, setMountPlayer] = useState(false);

  useEffect(() => {
    if (mountPlayer) return;
    const root = rootRef.current;
    if (!root) return;

    let cancelled = false;
    const mount = () => {
      if (!cancelled) setMountPlayer(true);
    };

    const onInteract = () => mount();
    root.addEventListener("pointerdown", onInteract, { once: true });
    root.addEventListener("focusin", onInteract, { once: true });

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) mount();
      },
      { rootMargin: "200px 0px" },
    );
    obs.observe(root);

    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(() => mount(), { timeout: 1500 });
    } else {
      timeoutId = setTimeout(mount, 600);
    }

    return () => {
      cancelled = true;
      root.removeEventListener("pointerdown", onInteract);
      root.removeEventListener("focusin", onInteract);
      obs.disconnect();
      if (idleId != null && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId != null) clearTimeout(timeoutId);
    };
  }, [mountPlayer]);

  return (
    <div ref={rootRef} style={{ position: "relative", width: "100%" }}>
      {/* Invisible thumbnail sets the exact aspect ratio before/while the
          poster + player paint — Mux serves this from CDN near-instantly. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- intrinsic AR probe; visible LCP is next/image below */}
      <img
        src={thumbnail}
        alt=""
        aria-hidden
        fetchPriority="high"
        style={{ display: "block", width: "100%", height: "auto", visibility: "hidden" }}
      />
      <Image
        src={thumbnail}
        alt=""
        fill
        priority
        sizes="(max-width: 767px) 100vw, 750px"
        unoptimized
        style={{ objectFit: "cover" }}
      />
      {mountPlayer && (
        <MuxPlayer
          playbackId={playbackId}
          autoPlay="muted"
          loop
          muted
          playsInline
          nohotkeys
          poster={thumbnail}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            display: "block",
            "--controls": "none",
            "--media-background-color": "transparent",
          }}
        />
      )}
    </div>
  );
}
