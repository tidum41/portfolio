"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect as _useLayoutEffect, useRef, useState } from "react";
import { useGridFirstLoadActive } from "@/components/GridFirstLoad";
import { IntroOrchestrator } from "@/components/IntroOrchestrator";
import HeroTextWithRabbit from "@/components/HeroTextWithRabbit";
import InteractiveBadge from "@/components/InteractiveBadge";
import { EntranceItem, useEntranceDials } from "@/components/ScrollReveal";
import { clearInstantBack, peekInstantBack } from "@/lib/instantNav";
import type { SanityProject } from "@/lib/sanity/queries";

// SSR-safe useLayoutEffect, matching the pattern used elsewhere in this codebase.
const useLayoutEffect = typeof window !== "undefined" ? _useLayoutEffect : useEffect;

// Take over scroll restoration entirely — the useLayoutEffect below (instant
// restore of scrollYRef on the case-study "Back" button's router.back()) is
// meant to be the sole source of truth for the work grid's scroll position.
// Without this, the browser's own popstate scroll restoration also fires and
// races with it: once <html> carries data-scroll-behavior="smooth" (needed
// so Next's scroll-to-top on *forward* navigation stays instant instead of
// animating), Next's restoration call also honors that CSS smooth-scroll
// rather than snapping instantly, producing a visible re-scroll after the
// manual one already landed correctly. Module-scope (not an effect) so it's
// set before any navigation can occur, not just before this component paints.
if (typeof window !== "undefined") {
  window.history.scrollRestoration = "manual";
}

const PS3Silk         = dynamic(() => import("@/components/PS3Silk"));
const PS3ControlPanel = dynamic(() => import("@/components/PS3ControlPanel"));
const CDPlayer        = dynamic(() => import("@/components/CDPlayer"));
const MuxAutoplayCard = dynamic(() => import("@/components/MuxAutoplayCard"));
const PhoneEmbed      = dynamic(() => import("@/components/PhoneEmbed"));

// ─── Card label ────────────────────────────────────────────────────────
function CardLabel({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ padding: 0 }}>
      <p style={{
        fontFamily: "var(--font-sans-medium)",
        fontWeight: "var(--fw-card-title)" as React.CSSProperties["fontWeight"],
        fontSize: 18,
        lineHeight: 1.4,
        color: "var(--color-text-primary)",
        margin: 0,
      }}>{title}</p>
      {sub && (
        <p style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 400,
          fontSize: 13,
          lineHeight: 1.5,
          color: "var(--color-text-tertiary)",
          margin: "4px 0 0",
          letterSpacing: "0.01em",
        }}>{sub}</p>
      )}
    </div>
  );
}

/** Mounted once, unconditionally, by the root layout — never unmounts across
 *  client-side navigation. Visibility is toggled purely with CSS based on the
 *  current route, so returning to "/" (via the case-study Back control, the
 *  Nav "work" link, or browser back/forward) never remounts, refetches, or
 *  reloads video/iframes — the DOM was simply never destroyed.
 *
 *  `hasEverBeenActive` lazily gates the heavy embeds (autoplay videos, the
 *  two live iframes) so sessions that never visit "/" don't pay for them.
 *  Once true it never resets, so the grid never has to "reload" again.
 *
 *  Entrance animation has three distinct cases:
 *   - True first load at "/" (data-intro gate active): hero + PS3Silk's own
 *     slow first-load animation is the whole show — this wrapper stays
 *     instant so it doesn't double-animate on top of that. The grid waits
 *     for "intro-done" (via useGridFirstLoadActive), then plays the same
 *     entrance stagger as every other case, giving the hero its moment.
 *   - Case-study "Back" (peekInstantBack()): stays fully instant, exactly as
 *     before — this is the fix that avoids remounting PS3Silk's WebGL canvas.
 *   - Everything else (Nav "work" link, browser back from about/playground,
 *     etc.): hero settles in first, then the grid cascades in shortly after,
 *     replaying on every such arrival since hero/grid re-hide when you leave. */
export function PersistentWorkShell({ projects }: { projects: SanityProject[] }) {
  const pathname = usePathname();
  const isWorkRoute = pathname === "/";

  const [hasEverBeenActive, setHasEverBeenActive] = useState(isWorkRoute);
  const scrollYRef = useRef(0);
  // See the click-capture / scroll-tracking effects below for why this exists.
  const suppressTrackingRef = useRef(false);

  // Captured synchronously during render, the moment isWorkRoute flips to
  // true — before any effect (including clearInstantBack, below) has a
  // chance to run. Using a ref comparison here (not a state update inside an
  // effect) avoids an extra render pass that could show one frame of the
  // wrong variant.
  const wasWorkRouteRef = useRef(isWorkRoute);
  const instantArrivalRef = useRef(false);
  if (isWorkRoute && !wasWorkRouteRef.current) {
    instantArrivalRef.current = peekInstantBack();
  }
  wasWorkRouteRef.current = isWorkRoute;
  const instant = instantArrivalRef.current;

  // Whether this session's very first paint had the first-load intro gate
  // active at all (i.e. the literal first page load was "/"). Captured once,
  // lazily, since `document` isn't available during SSR. Used only to keep
  // the hero wrapper out of HeroText's way while that gate is still closed.
  const isFirstLoadIntroRef = useRef<boolean | null>(null);
  if (isFirstLoadIntroRef.current === null && typeof document !== "undefined") {
    isFirstLoadIntroRef.current = document.documentElement.hasAttribute("data-intro");
  }

  const gridGateOpen = useGridFirstLoadActive();
  const gridActive = gridGateOpen && isWorkRoute;
  const heroInstant = instant || (Boolean(isFirstLoadIntroRef.current) && !gridGateOpen);

  const dk = useEntranceDials();

  // Restore scroll synchronously, before paint, whenever we become visible again.
  // `behavior: "instant"` is required here — `html` has `scroll-behavior: smooth`
  // globally (for anchor-link nav), which would otherwise make this snap-back
  // visibly animate instead of landing exactly where it was immediately.
  useLayoutEffect(() => {
    if (!isWorkRoute) return;
    if (!hasEverBeenActive) setHasEverBeenActive(true);
    window.scrollTo({ top: scrollYRef.current, left: 0, behavior: "instant" });
    // Resume normal tracking now that we're confirmed back — the suppression
    // was only ever meant to survive the single departing transition.
    suppressTrackingRef.current = false;
  }, [isWorkRoute]); // eslint-disable-line react-hooks/exhaustive-deps

  // AnimationProvider reads the instant-back flag once, synchronously, to
  // decide whether the outgoing case study's exit should skip its fade. Clear
  // it shortly after landing back here so it doesn't leak into unrelated,
  // later transitions (e.g. about -> playground).
  useEffect(() => {
    if (isWorkRoute) clearInstantBack();
  }, [isWorkRoute]);

  // Continuously track scroll position while visible, so it's always current
  // by the moment we're hidden. Suppressed after a navigating click (see
  // below) — without that guard, this alone isn't enough: AnimationProvider's
  // TransitionLayer (components/AnimationProvider.tsx) detaches the exiting
  // page via `position: absolute` the instant the route changes, instantly
  // collapsing document height, which clamps window.scrollY toward 0. That
  // clamp fires its own 'scroll' events — one or more, across a few frames —
  // and this still-attached passive listener (cleanup is a regular effect,
  // too slow to beat this) would otherwise capture those and silently
  // overwrite the real position with a collapsed one.
  useEffect(() => {
    if (!isWorkRoute) return;
    let rafId: number | null = null;
    const onScroll = () => {
      if (rafId != null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (suppressTrackingRef.current) return;
        scrollYRef.current = window.scrollY;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId != null) cancelAnimationFrame(rafId);
    };
  }, [isWorkRoute]);

  // Freeze the scroll position synchronously the instant a project card is
  // clicked — a *capturing*-phase listener runs before the Link's own click
  // handling, so this always wins the race — and suppress the passive
  // tracker above from then on, so the post-click layout-collapse scroll
  // noise described above can't overwrite the frozen value before this
  // component is hidden. Un-suppressed by the restore effect once we're
  // confirmed back on "/", so normal tracking resumes for next time.
  useEffect(() => {
    if (!isWorkRoute) return;
    const onClickCapture = () => {
      scrollYRef.current = window.scrollY;
      suppressTrackingRef.current = true;
    };
    window.addEventListener("click", onClickCapture, { capture: true });
    return () => window.removeEventListener("click", onClickCapture, { capture: true });
  }, [isWorkRoute]);

  // Manual cross-column stagger rank: the two DOM columns (even/odd project
  // index) need to read as one interleaved sequence — project[0] (left),
  // project[1] (right), project[2] (left), ... — which the original Sanity
  // index already encodes, since the columns are split by its parity. The
  // two trailing "extra" cards (CDPlayer, PhoneEmbed) continue that sequence
  // as the last left/right slots. Capped so a long grid doesn't take forever.
  const totalItems = projects.length + 2;
  const perItemStagger = totalItems > 1
    ? Math.min(dk.stagger, dk.maxSpread / (totalItems - 1))
    : dk.stagger;
  const rankDelay = (rank: number) => rank * perItemStagger;

  return (
    <div
      style={{ display: isWorkRoute ? "block" : "none", fontFamily: "var(--font-sans)" }}
      aria-hidden={!isWorkRoute}
      inert={!isWorkRoute}
    >
      <IntroOrchestrator />

      {/* ── Hero — full-viewport width, no max-width constraint ── */}
      <section
        aria-label="Introduction"
        style={{
          position: "relative",
          overflow: "hidden",
          paddingTop: 80,
          paddingBottom: 64,
        }}
      >
        <PS3Silk
          mode={1}
          active={isWorkRoute}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        />
        <EntranceItem active={isWorkRoute} instant={heroInstant} delay={0} style={{
          position: "relative",
          maxWidth: "var(--grid-max-w)",
          marginInline: "auto",
          paddingLeft: "var(--page-px)",
          paddingRight: "var(--page-px)",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}>
          <HeroTextWithRabbit />
        </EntranceItem>
      </section>

      {/* ── Project grid ── */}
      <div style={{ maxWidth: "var(--grid-max-w)", marginInline: "auto", paddingLeft: "var(--page-px)", paddingRight: "var(--page-px)" }}>
        <section
          aria-label="Portfolio"
          className="project-grid portfolio-grid"
          style={{
            paddingTop: 48,
            paddingBottom: 48,
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(1px, 1fr))",
            gap: "var(--grid-gutter)",
            alignItems: "start",
          }}
        >
          {/* ── Left column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 48, minWidth: 0 }}>
            {projects
              .filter((_, i) => i % 2 === 0)
              .map((p, k) => {
                const rank = k * 2;
                return p.mediaType === "video" && p.muxPlaybackId ? (
                  <EntranceItem key={p._id} active={gridActive} instant={instant} delay={rankDelay(rank)} {...(p.caseStudy ? { "data-cursor-label": "View Case Study" } : {})}>
                    {hasEverBeenActive && (
                      <MuxAutoplayCard
                        playbackId={p.muxPlaybackId}
                        href={p.href}
                        title={p.title}
                        sub={p.subtitle}
                        aspectRatio={p.aspectRatio}
                        active={isWorkRoute}
                      />
                    )}
                  </EntranceItem>
                ) : p.image?.asset?.url ? (
                  <EntranceItem key={p._id} active={gridActive} instant={instant} delay={rankDelay(rank)} className="project-card" style={{ display: "flex", flexDirection: "column", gap: 8 }} {...(p.caseStudy ? { "data-cursor-label": "View Case Study" } : {})}>
                    <Link href={p.href} prefetch style={{ textDecoration: "none", display: "block" }}>
                      <div className="project-img-wrap" style={{ borderRadius: 4, overflow: "hidden", background: "var(--color-placeholder)", aspectRatio: p.aspectRatio, position: "relative" }}>
                        <Image
                          src={p.image.asset.url}
                          alt={p.title}
                          fill
                          className="project-image"
                          style={{ objectFit: "cover" }}
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    </Link>
                    <CardLabel title={p.title} sub={p.subtitle} />
                  </EntranceItem>
                ) : null;
              })}

            {/* CDPlayer — always in left column after Sanity projects */}
            <EntranceItem active={gridActive} instant={instant} delay={rankDelay(projects.length)} data-cursor-label="click around!" data-cursor-timed style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div className="project-image" style={{ borderRadius: 4, overflow: "hidden", position: "relative", aspectRatio: "4 / 3" }}>
                {hasEverBeenActive && <CDPlayer dialKitKey="CDPlayerWork" defaults={{ zoom: 1.28, offsetX: 0, offsetY: -40, cardW: 1296, cardH: 1080, canvasW: 1296, canvasH: 1080, iframeW: 1296, iframeH: 1080 }} />}
                <div style={{ position: "absolute", top: 5, right: 5, zIndex: 10, pointerEvents: "none" }}>
                  <InteractiveBadge />
                </div>
              </div>
              <CardLabel title="Drag a CD" sub="exploration" />
            </EntranceItem>
          </div>

          {/* ── Right column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 48, minWidth: 0 }}>
            {projects
              .filter((_, i) => i % 2 === 1)
              .map((p, k) => {
                const rank = k * 2 + 1;
                return p.mediaType === "video" && p.muxPlaybackId ? (
                  <EntranceItem key={p._id} active={gridActive} instant={instant} delay={rankDelay(rank)} {...(p.caseStudy ? { "data-cursor-label": "View Case Study" } : {})}>
                    {hasEverBeenActive && (
                      <MuxAutoplayCard
                        playbackId={p.muxPlaybackId}
                        href={p.href}
                        title={p.title}
                        sub={p.subtitle}
                        aspectRatio={p.aspectRatio}
                        active={isWorkRoute}
                      />
                    )}
                  </EntranceItem>
                ) : p.image?.asset?.url ? (
                  <EntranceItem key={p._id} active={gridActive} instant={instant} delay={rankDelay(rank)} className="project-card" style={{ display: "flex", flexDirection: "column", gap: 8 }} {...(p.caseStudy ? { "data-cursor-label": "View Case Study" } : {})}>
                    <Link href={p.href} prefetch style={{ textDecoration: "none", display: "block" }}>
                      <div className="project-img-wrap" style={{ borderRadius: 4, overflow: "hidden", background: "var(--color-placeholder)", aspectRatio: p.aspectRatio, position: "relative" }}>
                        <Image
                          src={p.image.asset.url}
                          alt={p.title}
                          fill
                          className="project-image"
                          style={{ objectFit: "cover" }}
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    </Link>
                    <CardLabel title={p.title} sub={p.subtitle} />
                  </EntranceItem>
                ) : null;
              })}

            {/* Habit tracker — phone embed */}
            <EntranceItem active={gridActive} instant={instant} delay={rankDelay(projects.length + 1)} data-cursor-label="click around!" data-cursor-timed style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ borderRadius: 4, overflow: "hidden", background: "var(--color-phone-bg)", position: "relative" }}>
                <div style={{ position: "absolute", top: 5, right: 5, zIndex: 10, pointerEvents: "none" }}>
                  <InteractiveBadge />
                </div>
                {hasEverBeenActive && (
                  <PhoneEmbed
                    url="https://sprightly-stroopwafel-8f1061.netlify.app/"
                    frameSrcLight="/phonemockup-light.webp"
                    frameSrcDark="/phonemockup-dark.webp"
                  />
                )}
              </div>
              <CardLabel title="Dumb Habit Tracker" sub="product design + frontend" />
            </EntranceItem>
          </div>
        </section>

        {hasEverBeenActive && isWorkRoute && <PS3ControlPanel />}
      </div>
    </div>
  );
}
