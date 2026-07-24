"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect as _useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useGridFirstLoadActive } from "@/components/GridFirstLoad";
import { IntroOrchestrator } from "@/components/IntroOrchestrator";
import HeroTextWithRabbit from "@/components/HeroTextWithRabbit";
import HeroLegibilityScrim from "@/components/HeroLegibilityScrim";
import InteractiveBadge from "@/components/InteractiveBadge";
import { EntranceItem, useEntranceDials } from "@/components/ScrollReveal";
import { CARD_HOVER_SPRING, CARD_HOVER_SCALE } from "@/components/cardHover";
import ProjectPopup from "@/components/ProjectPopup";
import CdPlayerPoster from "@/components/CdPlayerPoster";
import PhonePoster from "@/components/PhonePoster";
import NortheastArrow from "@/components/icons/NortheastArrow";
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

type PopupId = "cd" | "habit";

const POPUP_EMBED_MAX_W = 800;

function EmbedPortal({ container, children }: { container: HTMLDivElement | null; children: ReactNode }) {
  if (!container) return null;
  return createPortal(children, container);
}

// Northeast arrow — shared with MuxAutoplayCard external-link titles.
function OpensInPopupIcon() {
  return <NortheastArrow size={13} />;
}

// ─── Card label ────────────────────────────────────────────────────────
function CardLabel({ title, sub, showPopupIcon }: { title: string; sub?: string; showPopupIcon?: boolean }) {
  return (
    <div style={{ padding: 0 }}>
      <p style={{
        fontFamily: "var(--font-sans-medium)",
        fontWeight: "var(--fw-card-title)" as React.CSSProperties["fontWeight"],
        fontSize: 18,
        lineHeight: 1.4,
        color: "var(--color-text-primary)",
        margin: 0,
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}>
        {title}
        {showPopupIcon && <OpensInPopupIcon />}
      </p>
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

// External-demo tiles (no in-house case study, e.g. project-todolist) get
// the same custom-cursor hover-label affordance as real case studies, so
// hovering signals "this leaves the site" before the click does.
function cursorLabelAttrs(p: SanityProject): Record<string, string | undefined> {
  if (p.caseStudy) return { "data-cursor-label": "View Case Study" };
  if (p._id === "project-todolist") return { "data-cursor-label": "try demo!", "data-cursor-no-icon": "" };
  return {};
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
  // Which embed's popup is active, and whether the modal is visibly open.
  // openPopup stays set through the exit animation so the single portaled
  // iframe doesn't unmount until onExitComplete fires.
  const [openPopup, setOpenPopup] = useState<PopupId | null>(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const [gridCdEl, setGridCdEl] = useState<HTMLDivElement | null>(null);
  const [popupCdEl, setPopupCdEl] = useState<HTMLDivElement | null>(null);
  const [warmCdEl, setWarmCdEl] = useState<HTMLDivElement | null>(null);
  const [gridHabitEl, setGridHabitEl] = useState<HTMLDivElement | null>(null);
  const [popupHabitEl, setPopupHabitEl] = useState<HTMLDivElement | null>(null);
  const [warmHabitEl, setWarmHabitEl] = useState<HTMLDivElement | null>(null);
  const [cdPortalTarget, setCdPortalTarget] = useState<HTMLDivElement | null>(null);
  const [habitPortalTarget, setHabitPortalTarget] = useState<HTMLDivElement | null>(null);
  const [cdPosterOpacity, setCdPosterOpacity] = useState(0);
  const [habitPosterOpacity, setHabitPosterOpacity] = useState(0);
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

  // Replay intro when the user returns to this tab from outside the site.
  // visibilitychange covers tab-switch; pageshow(persisted) covers BFCache
  // (navigated away in same tab and pressed Back). Neither event fires during
  // client-side navigation, so /about → / remains instant with no delay.
  //
  // Exception: a target="_blank" link click fires the exact same
  // hidden→visible sequence on this tab as a genuine tab-switch-away-and-back
  // (the new tab steals focus, then the user switches back). To tell those
  // apart, track the last click time and, if this tab went hidden within 1s
  // of a click, treat that as "a link on the page opened a new tab" and skip
  // the next replay — a real away-and-back (another app, an already-open
  // tab, idle-then-return) has no such recent click and still replays.
  useEffect(() => {
    const lastClickAtRef = { current: 0 };
    const hiddenByClickRef = { current: false };
    const replay = () => {
      if (!isWorkRoute) return;
      document.documentElement.setAttribute("data-intro", "playing");
      window.dispatchEvent(new CustomEvent("intro-replay"));
    };
    const onClick = () => {
      lastClickAtRef.current = Date.now();
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenByClickRef.current = Date.now() - lastClickAtRef.current < 1000;
        return;
      }
      if (document.visibilityState === "visible") {
        if (hiddenByClickRef.current) {
          hiddenByClickRef.current = false;
          return;
        }
        replay();
      }
    };
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) replay();
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
    };
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

  const openPopupHandler = (id: PopupId) => {
    if (id === "cd") setCdPosterOpacity(1);
    else setHabitPosterOpacity(1);
    setOpenPopup(id);
    setPopupVisible(true);
  };

  const closePopup = () => {
    setPopupVisible(false);
    // Crossfade poster out as the embed portals back to the grid slot.
    if (openPopup === "cd") setCdPosterOpacity(0);
    else if (openPopup === "habit") setHabitPosterOpacity(0);
  };

  const handlePopupExitComplete = (id: PopupId) => {
    setOpenPopup(null);
  };

  // Portal to popup only while visibly open; return to grid immediately on
  // close so the embed is back under the poster before the exit animation ends.
  useLayoutEffect(() => {
    if (openPopup === "cd" && popupVisible && popupCdEl) {
      setCdPortalTarget(popupCdEl);
    } else if (gridCdEl) {
      setCdPortalTarget(gridCdEl);
    } else if (warmCdEl) {
      setCdPortalTarget(warmCdEl);
    }
  }, [openPopup, popupVisible, popupCdEl, gridCdEl, warmCdEl]);

  useLayoutEffect(() => {
    if (openPopup === "habit" && popupVisible && popupHabitEl) {
      setHabitPortalTarget(popupHabitEl);
    } else if (gridHabitEl) {
      setHabitPortalTarget(gridHabitEl);
    } else if (warmHabitEl) {
      setHabitPortalTarget(warmHabitEl);
    }
  }, [openPopup, popupVisible, popupHabitEl, gridHabitEl, warmHabitEl]);

  const cdDefaults = { zoom: 1.28, offsetX: 0, offsetY: -40, cardW: 1296, cardH: 1080, canvasW: 1296, canvasH: 1080, iframeW: 1296, iframeH: 1080 } as const;
  const habitUrl = "https://sprightly-stroopwafel-8f1061.netlify.app/";

  return (
    <div
      style={{ display: isWorkRoute ? "block" : "none", fontFamily: "var(--font-sans)" }}
      aria-hidden={!isWorkRoute}
      inert={!isWorkRoute}
      // When this shell is hidden on other routes, its hero + grid still sit in
      // the DOM — exclude all of it from Google snippets so project titles like
      // "Simplifying UCLA subleasing" don't get stitched onto the homepage blurb.
      {...(!isWorkRoute ? { "data-nosnippet": true } : {})}
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
        <HeroLegibilityScrim />
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

      {/* ── Project grid — data-nosnippet keeps card titles out of the Google
          blurb; the meta description + hero above should be the only candidates. */}
      <div className="intro-hide" data-nosnippet style={{ maxWidth: "var(--grid-max-w)", marginInline: "auto", paddingLeft: "var(--page-px)", paddingRight: "var(--page-px)", paddingBottom: 40 }}>
        <section
          aria-label="Portfolio"
          className="project-grid portfolio-grid"
          style={{
            paddingTop: 48,
            paddingBottom: 96,
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
                  <EntranceItem key={p._id} active={gridActive} instant={instant} delay={rankDelay(rank)} {...cursorLabelAttrs(p)}>
                    {hasEverBeenActive && (
                      <MuxAutoplayCard
                        playbackId={p.muxPlaybackId}
                        href={p.href}
                        title={p.title}
                        sub={p.subtitle}
                        aspectRatio={p.aspectRatio}
                        active={isWorkRoute}
                        hoverScale={p._id !== "project-todolist"}
                        showExternalArrow={p._id === "project-todolist"}
                      />
                    )}
                  </EntranceItem>
                ) : p.image?.asset?.url ? (
                  <EntranceItem key={p._id} active={gridActive} instant={instant} delay={rankDelay(rank)} className="project-card" whileHover={{ scale: CARD_HOVER_SCALE }} transition={CARD_HOVER_SPRING} style={{ display: "flex", flexDirection: "column", gap: 8 }} {...cursorLabelAttrs(p)}>
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

            {/* CDPlayer — whole card opens the popup; one live instance is
                portaled between this grid slot and the modal (see below). */}
            <EntranceItem
              active={gridActive}
              instant={instant}
              delay={rankDelay(projects.length)}
              role="button"
              tabIndex={0}
              aria-label="Open Drag a CD in a larger view"
              data-cursor-label="open"
              data-cursor-no-icon=""
              onClick={() => openPopupHandler("cd")}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPopupHandler("cd"); } }}
              style={{ display: "flex", flexDirection: "column", gap: 6, cursor: "pointer" }}
            >
              <div className="project-image" style={{ borderRadius: 4, overflow: "hidden", position: "relative", aspectRatio: "4 / 3", background: "var(--color-modal-bg)" }}>
                <CdPlayerPoster opacity={cdPosterOpacity} />
                <div
                  ref={setGridCdEl}
                  style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    visibility: (openPopup === "cd" && popupVisible) ? "hidden" : "visible",
                  }}
                />
                <div style={{ position: "absolute", top: 5, right: 5, zIndex: 10, pointerEvents: "none" }}>
                  <InteractiveBadge />
                </div>
              </div>
              <CardLabel title="Drag a CD" sub="exploration" showPopupIcon />
            </EntranceItem>
          </div>

          {openPopup === "cd" && (
            <ProjectPopup
              open={popupVisible}
              onClose={closePopup}
              onExitComplete={() => handlePopupExitComplete("cd")}
              title="Drag a CD"
              sub="exploration"
              maxWidth={POPUP_EMBED_MAX_W}
              panelBg="var(--color-modal-bg)"
            >
              <div className="project-image" style={{ borderRadius: 4, overflow: "hidden", position: "relative", aspectRatio: "4 / 3", background: "var(--color-modal-bg)" }}>
                <div ref={setPopupCdEl} style={{ position: "absolute", inset: 0 }} />
              </div>
            </ProjectPopup>
          )}

          {/* ── Right column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 48, minWidth: 0 }}>
            {projects
              .filter((_, i) => i % 2 === 1)
              .map((p, k) => {
                const rank = k * 2 + 1;
                return p.mediaType === "video" && p.muxPlaybackId ? (
                  <EntranceItem key={p._id} active={gridActive} instant={instant} delay={rankDelay(rank)} {...cursorLabelAttrs(p)}>
                    {hasEverBeenActive && (
                      <MuxAutoplayCard
                        playbackId={p.muxPlaybackId}
                        href={p.href}
                        title={p.title}
                        sub={p.subtitle}
                        aspectRatio={p.aspectRatio}
                        active={isWorkRoute}
                        hoverScale={p._id !== "project-todolist"}
                        showExternalArrow={p._id === "project-todolist"}
                      />
                    )}
                  </EntranceItem>
                ) : p.image?.asset?.url ? (
                  <EntranceItem key={p._id} active={gridActive} instant={instant} delay={rankDelay(rank)} className="project-card" whileHover={{ scale: CARD_HOVER_SCALE }} transition={CARD_HOVER_SPRING} style={{ display: "flex", flexDirection: "column", gap: 8 }} {...cursorLabelAttrs(p)}>
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

            {/* Habit tracker — same single-instance portal treatment as CD. */}
            <EntranceItem
              active={gridActive}
              instant={instant}
              delay={rankDelay(projects.length + 1)}
              role="button"
              tabIndex={0}
              aria-label="Open Dumb Habit Tracker in a larger view"
              data-cursor-label="open"
              data-cursor-no-icon=""
              onClick={() => openPopupHandler("habit")}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPopupHandler("habit"); } }}
              style={{ display: "flex", flexDirection: "column", gap: 6, cursor: "pointer" }}
            >
              <div style={{ borderRadius: 4, overflow: "hidden", background: "var(--color-phone-bg)", position: "relative", aspectRatio: "4 / 3" }}>
                <div style={{ position: "absolute", top: 5, right: 5, zIndex: 10, pointerEvents: "none" }}>
                  <InteractiveBadge />
                </div>
                <PhonePoster opacity={habitPosterOpacity} />
                <div
                  ref={setGridHabitEl}
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                    visibility: (openPopup === "habit" && popupVisible) ? "hidden" : "visible",
                  }}
                />
              </div>
              <CardLabel title="Dumb Habit Tracker" sub="product design + frontend" showPopupIcon />
            </EntranceItem>
          </div>

          {openPopup === "habit" && (
            <ProjectPopup
              open={popupVisible}
              onClose={closePopup}
              onExitComplete={() => handlePopupExitComplete("habit")}
              title="Dumb Habit Tracker"
              sub="product design + frontend"
              maxWidth={POPUP_EMBED_MAX_W}
              panelBg="var(--color-phone-bg)"
            >
              <div style={{ borderRadius: 4, overflow: "hidden", position: "relative", aspectRatio: "4 / 3", background: "var(--color-phone-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div ref={setPopupHabitEl} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }} />
              </div>
            </ProjectPopup>
          )}
        </section>

        {hasEverBeenActive && isWorkRoute && <PS3ControlPanel />}
      </div>

      {hasEverBeenActive && (
        <>
          {/* Offscreen warm slots — popup-sized preload before grid refs exist. */}
          <div
            ref={setWarmCdEl}
            aria-hidden
            style={{
              position: "fixed",
              left: -10000,
              top: 0,
              width: POPUP_EMBED_MAX_W,
              aspectRatio: "4 / 3",
              visibility: "hidden",
              pointerEvents: "none",
            }}
          />
          <div
            ref={setWarmHabitEl}
            aria-hidden
            style={{
              position: "fixed",
              left: -10000,
              top: 0,
              width: POPUP_EMBED_MAX_W,
              aspectRatio: "4 / 3",
              visibility: "hidden",
              pointerEvents: "none",
            }}
          />
          <EmbedPortal container={cdPortalTarget}>
            <CDPlayer dialKitKey="CDPlayerWork" eager defaults={cdDefaults} />
          </EmbedPortal>
          <EmbedPortal container={habitPortalTarget}>
            <PhoneEmbed
              eager
              url={habitUrl}
              title="Dumb Habit Tracker interactive preview"
              frameSrcLight="/phonemockup-light.webp"
              frameSrcDark="/phonemockup-dark.webp"
            />
          </EmbedPortal>
        </>
      )}
    </div>
  );
}
