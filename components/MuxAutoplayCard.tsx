"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MuxPlayer from "@mux/mux-player-react";
import { useDialKit } from "dialkit";
import NortheastArrow from "@/components/icons/NortheastArrow";
import ProjectCardLift from "@/components/ProjectCardLift";
import { commitCaseStudyNav, isCaseStudyHref, warmCaseStudyNav } from "@/lib/caseStudyNav";

/** Spread Mux remounts on work return so HLS/MSE init isn't one-frame. */
const MOUNT_STAGGER_MS = 140;
/** Spread Mux teardown when leaving "/" so About/Archive paint + cursor
 *  aren't blocked by N× MediaSource destroys on one commit. */
const UNMOUNT_STAGGER_MS = 45;
const UNMOUNT_BASE_MS = 48;

function CardLabel({
  title,
  sub,
  labelFontSize,
  external,
}: {
  title: string;
  sub?: string;
  labelFontSize: number;
  external?: boolean;
}) {
  return (
    <div style={{ padding: "3px 2px" }}>
      <p style={{
        fontFamily: "var(--font-sans-medium)",
        fontWeight: 500,
        fontSize: labelFontSize,
        lineHeight: 1.4,
        color: "var(--color-text-primary)",
        margin: 0,
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}>
        {title}
        {external && <NortheastArrow size={13} color="var(--color-link-blue)" />}
      </p>
      {sub && (
        <p style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 400,
          fontSize: 13,
          lineHeight: 1.5,
          color: "var(--color-text-tertiary)",
          margin: "5px 0 0",
          letterSpacing: "0.01em",
        }}>{sub}</p>
      )}
    </div>
  );
}

interface Props {
  playbackId: string;
  href: string;
  title: string;
  sub?: string;
  aspectRatio: string;
  /** When false, tear down Mux/HLS after a deferred window (memory). */
  active?: boolean;
  /** When false, pause playback immediately without unmounting (soft-nav). */
  playing?: boolean;
  /** Grid order for staggered remount (0 first). */
  mountOrder?: number;
}

export default function MuxAutoplayCard({
  playbackId,
  href,
  title,
  sub,
  aspectRatio,
  active = true,
  playing = true,
  mountOrder = 0,
}: Props) {
  const dk = useDialKit("ProjectCard", {
    cardRadius:    [4,  0, 24],
    cardGap:       [6,  0, 24],
    labelFontSize: [18, 10, 32],
  });

  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  // Latches after first in-view hit so returning to "/" can remount without
  // waiting on IntersectionObserver again.
  const [shouldLoad, setShouldLoad] = useState(false);
  const [mountReady, setMountReady] = useState(false);
  const warmCaseStudy = () => {
    if (isCaseStudyHref(href)) warmCaseStudyNav(href, router);
  };
  const commitCaseStudy = () => {
    if (isCaseStudyHref(href)) commitCaseStudyNav(href, router);
  };

  useEffect(() => {
    if (shouldLoad || !active) return;
    const container = containerRef.current;
    if (!container) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          obs.disconnect();
        }
      },
      { rootMargin: "0px 0px 200px 0px" },
    );
    obs.observe(container);
    return () => obs.disconnect();
  }, [shouldLoad, active]);

  // Attach/detach are both staggered. Leave yields a paint first so soft-nav
  // to About/Archive isn't one long Mux-destroy frame (cursor tip freezes).
  // mountReady alone gates the player — `active` only schedules the timers.
  useEffect(() => {
    let cancelled = false;
    if (active && shouldLoad) {
      const delay = Math.max(0, mountOrder) * MOUNT_STAGGER_MS;
      const id = window.setTimeout(() => {
        if (!cancelled) setMountReady(true);
      }, delay);
      return () => {
        cancelled = true;
        window.clearTimeout(id);
      };
    }
    const delay = UNMOUNT_BASE_MS + Math.max(0, mountOrder) * UNMOUNT_STAGGER_MS;
    const id = window.setTimeout(() => {
      if (!cancelled) setMountReady(false);
    }, delay);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [active, shouldLoad, mountOrder]);

  // Soft-nav leave: pause immediately so decode doesn't fight About paint,
  // but keep the element mounted until `active` deferred-teardown fires.
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const el = root.querySelector("mux-player") as HTMLElement & {
      pause?: () => void;
      play?: () => Promise<void> | void;
    } | null;
    if (!el) return;
    if (!playing) {
      try { el.pause?.(); } catch { /* ignore */ }
      return;
    }
    try {
      const p = el.play?.();
      if (p && typeof (p as Promise<void>).catch === "function") {
        (p as Promise<void>).catch(() => {});
      }
    } catch { /* ignore */ }
  }, [playing, mountReady]);

  // Poster stays painted under the player so tear-down/remount never blanks
  // the card. Player only exists while scheduled (see mountReady).
  const posterUrl = `https://image.mux.com/${playbackId}/thumbnail.webp?time=1&width=640`;
  const showPlayer = shouldLoad && mountReady;

  const video = (
    <div className="project-media">
      <div
        ref={containerRef}
        className="project-image project-img-wrap"
        style={{
          borderRadius: "var(--radius-card)",
          overflow: "hidden",
          background: "var(--color-placeholder)",
          aspectRatio,
          position: "relative",
          width: "100%",
        }}
      >
        <img
          src={posterUrl}
          alt=""
          aria-hidden
          decoding="async"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            pointerEvents: "none",
          }}
        />
        {showPlayer && (
          <MuxPlayer
            playbackId={playbackId}
            autoPlay="muted"
            loop
            muted
            playsInline
            nohotkeys
            preload="none"
            poster={posterUrl}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              "--controls": "none",
              "--media-background-color": "transparent",
            }}
          />
        )}
      </div>
    </div>
  );

  const linkStyle = { textDecoration: "none", display: "block" } as const;
  // Blue northeast arrow only when the card leaves the site — derived from
  // href, not a hard-coded project id.
  const external = /^(https?:|mailto:|tel:)/i.test(href);

  return (
    <div className="project-card project-card--video" style={{ gap: dk.cardGap }}>
      <ProjectCardLift style={{ gap: dk.cardGap }}>
        {external ? (
          <a href={href} target="_blank" rel="noopener noreferrer" style={linkStyle}>{video}</a>
        ) : (
          <Link
            href={href}
            prefetch
            style={linkStyle}
            onMouseEnter={warmCaseStudy}
            onFocus={warmCaseStudy}
            onPointerDown={commitCaseStudy}
            onClick={commitCaseStudy}
          >
            {video}
          </Link>
        )}
        <CardLabel title={title} sub={sub} labelFontSize={dk.labelFontSize} external={external} />
      </ProjectCardLift>
    </div>
  );
}
