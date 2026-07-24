"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect as _useLayoutEffect, useRef, useState } from "react";
import { useGridFirstLoadActive } from "@/components/GridFirstLoad";
import { IntroOrchestrator } from "@/components/IntroOrchestrator";
import HeroTextWithRabbit from "@/components/HeroTextWithRabbit";
import HeroLegibilityScrim from "@/components/HeroLegibilityScrim";
import InteractiveBadge from "@/components/InteractiveBadge";
import { EntranceItem, useEntranceDials } from "@/components/ScrollReveal";
import { CARD_HOVER_SPRING, CARD_HOVER_SCALE } from "@/components/cardHover";
import ProjectPopup from "@/components/ProjectPopup";
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

// Northeast arrow, same shape GlobalCustomCursor's own pill icon uses by
// default (see components/GlobalCustomCursor.tsx's ARROW_ICON_SVG) — one
// canonical "there's more here" glyph reused site-wide rather than a
// second, different icon. Sized proportionate to CardLabel's 18px title.
function OpensInPopupIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", flexShrink: 0 }}>
      <line x1="2" y1="10" x2="10" y2="2" />
      <polyline points="4,2 10,2 10,8" />
    </svg>
  );
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
function cursorLabelAttrs(p: SanityProject): { "data-cursor-label"?: string } {
  if (p.caseStudy) return { "data-cursor-label": "View Case Study" };
  if (p._id === "project-todolist") return { "data-cursor-label": "try demo!" };
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
  // Which "play with it in a popup" tile is currently expanded, if any. The
  // grid's own inline CDPlayer/PhoneEmbed unmounts while its popup is open
  // (see the `openPopup !== "..."` guards below) rather than rendering a
  // second concurrent iframe — critical for CDPlayer specifically, since two
  // live instances would mean two overlapping audio sources.
  const [openPopup, setOpenPopup] = useState<null | "cd" | "habit">(null);
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
      <div className="intro-hide" data-nosnippet style={{ maxWidth: "var(--grid-max-w)", marginInline: "auto", paddingLeft: "var(--page-px)", paddingRight: "var(--page-px)" }}>
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

            {/* CDPlayer — always in left column after Sanity projects. No
                longer directly interactive in-grid: the whole card opens the
                popup on click, where the real drag-to-play interaction
                lives. The grid instance stays mounted (pointer-events: none)
                purely as a visual preview — never unmounted, so the tile
                never looks like it lost content — but can't itself receive
                input, so there's no double-audio risk from two interactive
                copies. */}
            <EntranceItem
              active={gridActive}
              instant={instant}
              delay={rankDelay(projects.length)}
              role="button"
              tabIndex={0}
              aria-label="Open Drag a CD in a larger view"
              data-cursor-label="open"
              onClick={() => setOpenPopup("cd")}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpenPopup("cd"); } }}
              style={{ display: "flex", flexDirection: "column", gap: 6, cursor: "pointer" }}
            >
              <div className="project-image" style={{ borderRadius: 4, overflow: "hidden", position: "relative", aspectRatio: "4 / 3", background: "var(--color-modal-bg)" }}>
                <div style={{ pointerEvents: "none" }}>
                  {hasEverBeenActive && <CDPlayer dialKitKey="CDPlayerWork" defaults={{ zoom: 1.28, offsetX: 0, offsetY: -40, cardW: 1296, cardH: 1080, canvasW: 1296, canvasH: 1080, iframeW: 1296, iframeH: 1080 }} />}
                </div>
                <div style={{ position: "absolute", top: 5, right: 5, zIndex: 10, pointerEvents: "none" }}>
                  <InteractiveBadge />
                </div>
              </div>
              <CardLabel title="Drag a CD" sub="exploration" showPopupIcon />
            </EntranceItem>
          </div>

          {/* Wider than the default 560px — this and the CD player's own
              aspect ratio (1296:1080) are what "fill more of the viewport"
              in practice; the panel's own 85vh cap plus overflowY:auto
              remain the safety net on short viewports. */}
          <ProjectPopup open={openPopup === "cd"} onClose={() => setOpenPopup(null)} title="Drag a CD" sub="exploration" maxWidth={800} panelBg="var(--color-modal-bg)">
            <div className="project-image" style={{ borderRadius: 4, overflow: "hidden", position: "relative", aspectRatio: "4 / 3", background: "var(--color-modal-bg)" }}>
              {openPopup === "cd" && <CDPlayer dialKitKey="CDPlayerPopup" defaults={{ zoom: 1.28, offsetX: 0, offsetY: -40, cardW: 1296, cardH: 1080, canvasW: 1296, canvasH: 1080, iframeW: 1296, iframeH: 1080 }} />}
            </div>
          </ProjectPopup>

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

            {/* Habit tracker — phone embed. Same "whole card opens the
                popup, grid copy is a non-interactive preview" treatment as
                the CD player above. */}
            <EntranceItem
              active={gridActive}
              instant={instant}
              delay={rankDelay(projects.length + 1)}
              role="button"
              tabIndex={0}
              aria-label="Open Dumb Habit Tracker in a larger view"
              data-cursor-label="open"
              onClick={() => setOpenPopup("habit")}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpenPopup("habit"); } }}
              style={{ display: "flex", flexDirection: "column", gap: 6, cursor: "pointer" }}
            >
              <div style={{ borderRadius: 4, overflow: "hidden", background: "var(--color-phone-bg)", position: "relative" }}>
                <div style={{ position: "absolute", top: 5, right: 5, zIndex: 10, pointerEvents: "none" }}>
                  <InteractiveBadge />
                </div>
                <div style={{ pointerEvents: "none" }}>
                  {hasEverBeenActive && (
                    <PhoneEmbed
                      url="https://sprightly-stroopwafel-8f1061.netlify.app/"
                      title="Dumb Habit Tracker interactive preview"
                      frameSrcLight="/phonemockup-light.webp"
                      frameSrcDark="/phonemockup-dark.webp"
                    />
                  )}
                </div>
              </div>
              <CardLabel title="Dumb Habit Tracker" sub="product design + frontend" showPopupIcon />
            </EntranceItem>
          </div>

          {/* Narrower panel than the CD player's — the phone mockup is
              tall/narrow, so a narrower panel lets it fill the same 20px
              gutter edge-to-edge that the wider CD-player panel gets,
              instead of floating in extra empty space. Sized up from the
              original 300/260 pairing to actually fill more of the
              viewport while staying comfortably under the panel's 85vh cap
              (340px-wide phone → ~607px tall embed). */}
          <ProjectPopup open={openPopup === "habit"} onClose={() => setOpenPopup(null)} title="Dumb Habit Tracker" sub="product design + frontend" maxWidth={380} panelBg="var(--color-phone-bg)">
            <div style={{ borderRadius: 4, overflow: "hidden", position: "relative", display: "flex", justifyContent: "center" }}>
              {openPopup === "habit" && (
                <PhoneEmbed
                  url="https://sprightly-stroopwafel-8f1061.netlify.app/"
                  title="Dumb Habit Tracker interactive preview"
                  frameSrcLight="/phonemockup-light.webp"
                  frameSrcDark="/phonemockup-dark.webp"
                  style={{ maxWidth: 340 }}
                />
              )}
            </div>
          </ProjectPopup>
        </section>

        {hasEverBeenActive && isWorkRoute && <PS3ControlPanel />}
      </div>
    </div>
  );
}
