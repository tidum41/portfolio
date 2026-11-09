"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDialKit } from "dialkit";
import MuxMediaSlot, { muxPosterUrl, preloadHlsModule } from "@/components/MuxMediaSlot";
import { warmRootMargin } from "@/lib/networkHint";
import NortheastArrow from "@/components/icons/NortheastArrow";
import ProjectCardLift from "@/components/ProjectCardLift";
import { commitCaseStudyNav, isCaseStudyHref, warmCaseStudyNav } from "@/lib/caseStudyNav";
import { onIntroDone } from "@/lib/introReady";

/** Later cards start a short beat after the two on screen during the intro. */
const LATER_CARD_STAGGER_MS = 40;
/** Spread Mux teardown when leaving "/" so About/Archive paint + cursor
 *  aren't blocked by N× MediaSource destroys on one commit. */
const UNMOUNT_STAGGER_MS = 90;
const UNMOUNT_BASE_MS = 120;

function CardLabel({
  title,
  label,
  labelFontSize,
  external,
  showPopupIcon,
}: {
  title: string;
  /** Quiet meta line above the main title (PS3 XMB hierarchy). */
  label?: string;
  labelFontSize: number;
  external?: boolean;
  /** In-page popup tile — neutral northeast arrow (not the blue leave-site one). */
  showPopupIcon?: boolean;
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
        {showPopupIcon && <NortheastArrow size={13} />}
      </p>
    </div>
  );
}

interface Props {
  playbackId: string;
  /** When omitted, the card is display-only (no link, no pointer) unless onOpen. */
  href?: string;
  title: string;
  /** Small quiet line above the title. */
  label?: string;
  aspectRatio: string;
  /** How poster + video fit inside the aspectRatio box (default "cover"). */
  objectFit?: "cover" | "contain";
  /** Card backdrop color (e.g. matching video background when objectFit="contain"). */
  background?: string;
  /** When false, tear down Mux/HLS after a deferred window (memory). */
  active?: boolean;
  /** When false, pause playback immediately without unmounting (soft-nav). */
  playing?: boolean;
  /** Grid order for staggered remount (0 first). */
  mountOrder?: number;
  /**
   * In-page popup opener (Allinone, etc.). When set, the card does not
   * navigate — click/keyboard activate this instead of href.
   */
  onOpen?: () => void;
}

export default function MuxAutoplayCard({
  playbackId,
  href,
  title,
  label,
  aspectRatio,
  objectFit = "cover",
  background,
  active = true,
  playing = true,
  mountOrder = 0,
  onOpen,
}: Props) {
  const dk = useDialKit("ProjectCard", {
    cardRadius:    [4,  0, 24],
    cardGap:       [6,  0, 24],
    labelFontSize: [18, 10, 32],
  });

  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  // Above-the-fold pair (mountOrder <= 1) loads immediately without waiting on
  // an IntersectionObserver tick; later cards latch after first intersection.
  const [shouldLoad, setShouldLoad] = useState(mountOrder <= 1);
  const [mountReady, setMountReady] = useState(false);
  const isPopup = Boolean(onOpen);
  const clickable = Boolean(href) || isPopup;
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
    const resting = "160px 0px 360px 0px";
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

  useEffect(() => {
    let cancelled = false;
    let timeoutId = 0;

    if (active && shouldLoad) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }
      const arm = () => {
        if (cancelled) return;
        preloadHlsModule();
        setMountReady(true);
      };
      const introActive = document.documentElement.hasAttribute("data-intro");
      const startAfterGate = () => {
        if (cancelled) return;
        const wait = introActive
          ? 650 + mountOrder * 120
          : mountOrder <= 1
            ? 0
            : (mountOrder - 1) * LATER_CARD_STAGGER_MS;
        if (wait <= 0) arm();
        else timeoutId = window.setTimeout(arm, wait);
      };
      // Wait until the first-load hero intro gate lifts (1.9s, while the grid
      // is hidden via .intro-hide) before booting HLS/MSE video players so
      // segment fetches and video decode never stall the PS3 silk intro fade.
      const cancelIntro = onIntroDone(startAfterGate);
      return () => {
        cancelled = true;
        cancelIntro();
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
  }, [active, shouldLoad, mountOrder]);

  // Soft-nav leave: unmount the player this frame so MuxMediaSlot's cleanup
  // (and its sync soft-nav destroy) stop HLS bandwidth. Remount when Work
  // resumes playing — posters stay painted underneath the whole time.
  const tornDownByNavRef = useRef(false);
  useEffect(() => {
    const onSoftStart = () => {
      tornDownByNavRef.current = true;
      setMountReady(false);
    };
    window.addEventListener("soft-nav-start", onSoftStart);
    return () => window.removeEventListener("soft-nav-start", onSoftStart);
  }, []);

  useEffect(() => {
    // Only remount after a soft-nav teardown once `playing` is true again.
    // Do not key this on mountReady — soft-nav sets it false while playing
    // is still true for a frame, which would remount immediately.
    if (!playing || !active || !shouldLoad) return;
    if (!tornDownByNavRef.current) return;
    tornDownByNavRef.current = false;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    preloadHlsModule();
    setMountReady(true);
  }, [playing, active, shouldLoad]);

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
          background: background ?? "var(--color-placeholder)",
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
            objectFit,
            pointerEvents: "none",
          }}
        />
        {showPlayer && (
          <MuxMediaSlot
            playbackId={playbackId}
            fill
            playing={playing}
            objectFit={objectFit !== "cover" ? objectFit : undefined}
            videoBackground={background}
          />
        )}
      </div>
    </div>
  );

  const linkStyle = { textDecoration: "none", display: "block", color: "inherit", cursor: "pointer" } as const;
  // Blue northeast arrow only when the card leaves the site — derived from
  // href, not a hard-coded project id. Popup tiles never count as external.
  const external = !isPopup && Boolean(href && /^(https?:|mailto:|tel:)/i.test(href));

  const body = (
    <ProjectCardLift style={{ gap: dk.cardGap }}>
      {video}
      <CardLabel
        title={title}
        label={label}
        labelFontSize={dk.labelFontSize}
        external={external}
        showPopupIcon={isPopup}
      />
    </ProjectCardLift>
  );

  return (
    <div
      className={["project-card", "project-card--video", !clickable && "project-card--inert"].filter(Boolean).join(" ")}
      style={{ gap: dk.cardGap, ...(!clickable ? { cursor: "default" } : null) }}
    >
      {!clickable ? (
        body
      ) : isPopup ? (
        <div
          role="button"
          tabIndex={0}
          style={linkStyle}
          onClick={onOpen}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpen?.();
            }
          }}
        >
          {body}
        </div>
      ) : external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" style={linkStyle}>
          {body}
        </a>
      ) : (
        <Link
          href={href!}
          prefetch={false}
          style={linkStyle}
          onMouseEnter={warmCaseStudy}
          onFocus={warmCaseStudy}
          onPointerDown={warmCaseStudy}
          onClick={commitCaseStudy}
        >
          {body}
        </Link>
      )}
    </div>
  );
}
