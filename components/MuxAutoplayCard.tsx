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
  /** When false (work shell off-route), tear down Mux/HLS entirely and show
   *  the poster. Remount on return — posters keep cards feeling instant
   *  without holding paused MediaSource buffers in memory. */
  active?: boolean;
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

  // Stagger player attach on return so N× HLS doesn't hitch one frame.
  // Reset happens in cleanup (when leaving "/" or rescheduling), not sync
  // at effect start — keeps the set-state-in-effect lint happy.
  useEffect(() => {
    if (!active || !shouldLoad) return;
    let cancelled = false;
    const delay = Math.max(0, mountOrder) * MOUNT_STAGGER_MS;
    const id = window.setTimeout(() => {
      if (!cancelled) setMountReady(true);
    }, delay);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
      setMountReady(false);
    };
  }, [active, shouldLoad, mountOrder]);

  // Poster stays painted under the player so tear-down/remount never blanks
  // the card. Player only exists while the work route is active + scheduled.
  const posterUrl = `https://image.mux.com/${playbackId}/thumbnail.webp?time=1&width=640`;
  const showPlayer = active && shouldLoad && mountReady;

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
