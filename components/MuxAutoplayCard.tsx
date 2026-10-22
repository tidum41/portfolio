"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDialKit } from "dialkit";
import MuxMediaSlot, { muxCardStreamUrl, muxPosterUrl, preloadHlsModule } from "@/components/MuxMediaSlot";
import { constrainedNetwork, warmRootMargin } from "@/lib/networkHint";
import NortheastArrow from "@/components/icons/NortheastArrow";
import ProjectCardLift from "@/components/ProjectCardLift";
import { commitCaseStudyNav, isCaseStudyHref, warmCaseStudyNav } from "@/lib/caseStudyNav";
import { cardFocusPlay } from "@/lib/cardFocusVideo";

/** Later cards start a beat after the two that are on screen at intro end. */
const LATER_CARD_STAGGER_MS = 120;
/** Spread Mux teardown when leaving "/" so About/Archive paint + cursor
 *  aren't blocked by N× MediaSource destroys on one commit. */
const UNMOUNT_STAGGER_MS = 90;
const UNMOUNT_BASE_MS = 120;

function CardLabel({
  title,
  label,
  labelFontSize,
  external,
}: {
  title: string;
  /** Quiet meta line above the main title (PS3 XMB hierarchy). */
  label?: string;
  labelFontSize: number;
  external?: boolean;
}) {
  return (
    <div style={{ padding: "3px 0 0" }}>
      {label && (
        <p className="card-label-tag" style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 400,
          fontSize: "var(--fs-caption)",
          lineHeight: 1.4,
          color: "var(--color-text-muted)",
          margin: "0 0 2px",
          letterSpacing: "0.01em",
        }}>{label}</p>
      )}
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
        textWrap: "balance",
      }}>
        {title}
        {external && <NortheastArrow size={13} color="var(--color-link-blue)" />}
      </p>
    </div>
  );
}

interface Props {
  playbackId: string;
  /** When omitted, the card is display-only (no link, no pointer). */
  href?: string;
  title: string;
  /** Small quiet line above the title. */
  label?: string;
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
  label,
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
  const clickable = Boolean(href);
  const warmCaseStudy = () => {
    if (href && isCaseStudyHref(href)) warmCaseStudyNav(href, router);
  };
  const commitCaseStudy = () => {
    if (href && isCaseStudyHref(href)) commitCaseStudyNav(href, router);
  };

  useEffect(() => {
    if (shouldLoad || !active) return;
    const container = containerRef.current;
    if (!container) return;
    let obs: IntersectionObserver | null = null;
    const arm = (rootMargin: string) => {
      obs?.disconnect();
      obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            obs?.disconnect();
          }
        },
        { rootMargin },
      );
      obs.observe(container);
    };
    // Tight until the first scroll, so the card below the fold does not
    // compete with the two on screen during the intro. A flick then uses the
    // wider margin; a slow or metered connection stays close to the card.
    const resting = "80px 0px 140px 0px";
    if (window.scrollY > 8) arm(warmRootMargin());
    else arm(resting);
    const widen = () => {
      if (window.scrollY <= 8) return;
      arm(warmRootMargin());
      window.removeEventListener("scroll", widen);
    };
    window.addEventListener("scroll", widen, { passive: true });
    return () => {
      obs?.disconnect();
      window.removeEventListener("scroll", widen);
    };
  }, [shouldLoad, active]);

  // The manifest for the on-screen cards is fetched as soon as they are near
  // the viewport, during the intro. The player attaches a moment later so the
  // silk shader can take the opening frames. Reduced motion keeps the still.
  // Leave still yields a paint first so soft-nav to About/Archive isn't one
  // long Mux-destroy frame. mountReady alone gates the player.
  useEffect(() => {
    let cancelled = false;
    let timeoutId = 0;

    if (active && shouldLoad) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }
      preloadHlsModule();
      // Phone cards already have their playlist and first segment preloaded
      // from the HTML. Fetching the master again only steals that bandwidth.
      const narrow = window.innerWidth < 800 || constrainedNetwork();
      if (mountOrder <= 1 && !narrow) {
        void fetch(muxCardStreamUrl(playbackId), { mode: "cors", credentials: "omit" }).catch(() => {});
      }
      const arm = () => {
        if (!cancelled) setMountReady(true);
      };
      // A short beat so the silk shader can take the first frames, then the
      // player attaches while the intro is still on screen.
      const wait = mountOrder <= 1
        ? 120
        : (mountOrder - 1) * LATER_CARD_STAGGER_MS;
      timeoutId = window.setTimeout(arm, wait);
      return () => {
        cancelled = true;
        window.clearTimeout(timeoutId);
      };
    }

    const delay = UNMOUNT_BASE_MS + Math.max(0, mountOrder) * UNMOUNT_STAGGER_MS;
    timeoutId = window.setTimeout(() => {
      if (!cancelled) setMountReady(false);
    }, delay);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [active, shouldLoad, mountOrder, playbackId]);

  // Soft-nav leave: pause immediately so decode doesn't fight About paint,
  // but keep the element mounted until `active` deferred-teardown fires.
  useEffect(() => {
    const root = containerRef.current;
    const pauseEl = () => {
      const el = root?.querySelector("video");
      try { el?.pause(); } catch { /* ignore */ }
    };
    const playEl = () => {
      const el = root?.querySelector("video");
      if (el instanceof HTMLVideoElement) cardFocusPlay(el);
    };

    // Sync with soft-nav click — don't wait for React playing=false effect.
    window.addEventListener("soft-nav-start", pauseEl);
    if (!playing) pauseEl();
    else playEl();
    return () => window.removeEventListener("soft-nav-start", pauseEl);
  }, [playing, mountReady]);

  // Poster stays painted under the player so tear-down/remount never blanks
  // the card. Player only exists while scheduled (see mountReady).
  const posterUrl = muxPosterUrl(playbackId, 640);
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
          fetchPriority={mountOrder <= 1 ? "high" : "auto"}
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
          <MuxMediaSlot
            playbackId={playbackId}
            fill
            playing={playing}
          />
        )}
      </div>
    </div>
  );

  const linkStyle = { textDecoration: "none", display: "block", color: "inherit", cursor: "pointer" } as const;
  // Blue northeast arrow only when the card leaves the site — derived from
  // href, not a hard-coded project id.
  const external = Boolean(href && /^(https?:|mailto:|tel:)/i.test(href));

  const body = (
    <ProjectCardLift style={{ gap: dk.cardGap }}>
      {video}
      <CardLabel title={title} label={label} labelFontSize={dk.labelFontSize} external={external} />
    </ProjectCardLift>
  );

  return (
    <div
      className={["project-card", "project-card--video", !clickable && "project-card--inert"].filter(Boolean).join(" ")}
      style={{ gap: dk.cardGap, ...(!clickable ? { cursor: "default" } : null) }}
    >
      {!clickable ? (
        body
      ) : external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" style={linkStyle}>
          {body}
        </a>
      ) : (
        <Link
          href={href!}
          prefetch
          style={linkStyle}
          onMouseEnter={warmCaseStudy}
          onFocus={warmCaseStudy}
          onPointerDown={(e) => (e.pointerType === "touch" ? warmCaseStudy() : commitCaseStudy())}
          onClick={commitCaseStudy}
        >
          {body}
        </Link>
      )}
    </div>
  );
}
