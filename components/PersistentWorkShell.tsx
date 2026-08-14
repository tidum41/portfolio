"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect as _useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useGridFirstLoadActive } from "@/components/GridFirstLoad";
import { IntroOrchestrator } from "@/components/IntroOrchestrator";
import HeroTextWithRabbit from "@/components/HeroTextWithRabbit";
import HeroLegibilityScrim from "@/components/HeroLegibilityScrim";
import InteractiveBadge from "@/components/InteractiveBadge";
import { EntranceItem, useEntranceDials } from "@/components/ScrollReveal";
import ProjectCardLift from "@/components/ProjectCardLift";
import ProjectPopup from "@/components/ProjectPopup";
import CdPlayerPoster from "@/components/CdPlayerPoster";
import PhonePoster from "@/components/PhonePoster";
import NortheastArrow from "@/components/icons/NortheastArrow";
import { clearInstantBack, peekInstantWorkContent } from "@/lib/instantNav";
import { isCaseStudyHref, warmCaseStudyNav, commitCaseStudyNav } from "@/lib/caseStudyNav";
import type { SanityProject } from "@/lib/sanity/queries";

/** Leaves the site (or opens a non-app URL) — blue northeast arrow only for these. */
function isExternalHref(href: string) {
  return /^(https?:|mailto:|tel:)/i.test(href);
}

const CARD_LINK_STYLE = {
  textDecoration: "none",
  color: "inherit",
  display: "flex",
  flexDirection: "column",
  gap: "inherit",
  cursor: "pointer",
} as const;

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

const PS3ControlPanel = dynamic(() => import("@/components/PS3ControlPanel"));
const CDPlayer        = dynamic(() => import("@/components/CDPlayer"));
const MuxAutoplayCard = dynamic(() => import("@/components/MuxAutoplayCard"));
const PhoneEmbed      = dynamic(() => import("@/components/PhoneEmbed"));

type PopupId = "cd" | "habit";

const POPUP_EMBED_MAX_W = 1100;
const HABIT_POPUP_MAX_W = 560;
// Grid tiles keep 4:3; the CD popup needs a taller slot so vertical
// carousel + drag hint aren't clipped at narrow modal widths. Sized to
// fill more of the viewport while leaving room for panel chrome.
// Width stays ≥ CDPlayerWork's mobileBreakpoint (1000) so desktop modals
// keep the horizontal player + grid layout instead of the carousel.
const CD_POPUP_EMBED_H = "min(76dvh, 880px)";
// Phone mockup is ~9:19 — a 4:3 popup slot caps height and shrinks the
// embed; give the habit popup a portrait slot so the phone can scale up.
const HABIT_POPUP_EMBED_H = "min(calc(92dvh - 88px), 900px)";

// React's reconciler recreates a Portal's entire subtree (destroying its
// component state) whenever createPortal's target DOM node differs from the
// previous render — see ReactChildFiber's updatePortal, which only reuses
// the existing fiber when `containerInfo` is referentially the same. Moving
// the live embed between grid/popup slots by changing `container`
// directly would therefore reset it (WebAudio graph, calendar selection,
// etc.) on every open/close — invisible for the old iframe embeds, where a
// reload was cheap, but a real bug for native components.
//
// Fix: portal into one permanent, off-tree div created once and never swapped
// (so createPortal's container never changes, and React treats every
// re-render as a plain update). Move that stable div between the logical
// grid/popup target elements with a plain DOM appendChild, which the
// browser treats as a reparent, not a destroy/recreate.
function EmbedPortal({ container, children }: { container: HTMLDivElement | null; children: ReactNode }) {
  // Create the host node during the first client render so children can paint
  // in the same frame as append (useEffect deferred one paint and flashed).
  const [portalEl] = useState(() => {
    if (typeof document === "undefined") return null;
    const el = document.createElement("div");
    el.style.position = "absolute";
    el.style.inset = "0";
    el.style.width = "100%";
    el.style.height = "100%";
    return el;
  });

  useLayoutEffect(() => {
    if (!container || !portalEl) return;
    container.appendChild(portalEl);
  }, [container, portalEl]);

  if (!portalEl) return null;
  return createPortal(children, portalEl);
}

// Northeast arrow — shared glyph. Blue is reserved for external links only;
// in-page popup tiles use currentColor so they match the title (not a hyperlink).
function OpensInPopupIcon() {
  return <NortheastArrow size={13} />;
}

// ─── Card label ────────────────────────────────────────────────────────
function CardLabel({
  title,
  sub,
  showPopupIcon,
  external,
}: {
  title: string;
  sub?: string;
  showPopupIcon?: boolean;
  /** External project link — blue northeast arrow. */
  external?: boolean;
}) {
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
        {external && <NortheastArrow size={13} color="var(--color-link-blue)" />}
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

// Northeast arrow blue = external only. Popup tiles keep a neutral arrow;
// InteractiveBadge already marks the media as explorable.

/** Mounted once, unconditionally, by the root layout — never unmounts across
 *  client-side navigation. Visibility is toggled purely with CSS based on the
 *  current route, so returning to "/" restores scroll and shell chrome without
 *  remounting the page tree.
 *
 *  Heavy media (Mux grid players, live CD) unmount while off "/" and remount
 *  on return — posters keep cards feeling instant without holding paused HLS /
 *  audio graphs in memory. Habit live embed remains popup-only.
 *
 *  `hasEverBeenActive` lazily gates the heavy embeds so sessions that never
 *  visit "/" don't pay for them. Once true it never resets.
 *
 *  Entrance animation has three distinct cases:
 *   - True first load at "/" (data-intro gate active): hero + PS3Silk's own
 *     slow first-load animation is the whole show — this wrapper stays
 *     instant so it doesn't double-animate on top of that. The grid waits
 *     for "intro-done" (via useGridFirstLoadActive), then plays its stagger.
 *   - Case-study "Back" and primary-nav returns: content stays at rest while
 *     `display: none`, then snaps. Tab switches must not replay the 1.14s fade.
 *   - Hero wrapper stays instant during intro.
 */
export function PersistentWorkShell({ projects }: { projects: SanityProject[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const isWorkRoute = pathname === "/";
  const warmProjectNav = (href: string) => {
    if (isCaseStudyHref(href)) warmCaseStudyNav(href, router);
  };
  const commitProjectNav = (href: string) => {
    if (isCaseStudyHref(href)) commitCaseStudyNav(href, router);
  };

  const [hasEverBeenActive, setHasEverBeenActive] = useState(isWorkRoute);
  // Which embed's popup is active, and whether the modal is visibly open.
  // openPopup stays set through the exit animation so the single portaled
  // iframe doesn't unmount until onExitComplete fires.
  const [openPopup, setOpenPopup] = useState<PopupId | null>(null);
  const [popupVisible, setPopupVisible] = useState(false);
  // CD: live grid preview once "/" visited (perf-gated via active=false + Disc
  // RAF idle-stop). Habit: high-quality poster in grid; live PhoneEmbed only
  // while the popup is open (state persists in localStorage across remounts).
  const [gridCdEl, setGridCdEl] = useState<HTMLDivElement | null>(null);
  const [popupCdEl, setPopupCdEl] = useState<HTMLDivElement | null>(null);
  const [popupHabitEl, setPopupHabitEl] = useState<HTMLDivElement | null>(null);
  const [cdPortalTarget, setCdPortalTarget] = useState<HTMLDivElement | null>(null);
  const [habitPortalTarget, setHabitPortalTarget] = useState<HTMLDivElement | null>(null);
  // CD poster only covers while the modal is open. Habit poster is the grid.
  const [cdPosterOpacity, setCdPosterOpacity] = useState(0);
  const [habitPosterOpacity, setHabitPosterOpacity] = useState(1);
  // Poster opacity transitions only on close (reveal live embed). Open snaps
  // opaque so the grid card behind the backdrop doesn't empty/morph mid-blur.
  const [cdPosterFade, setCdPosterFade] = useState(false);
  const [habitPosterFade, setHabitPosterFade] = useState(false);
  // Habit poster frame/theme: site theme until the live widget reports its own.
  const [habitWidgetTheme, setHabitWidgetTheme] = useState<'light' | 'dark'>(() => {
    if (typeof document === "undefined") return "light";
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  });
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
    instantArrivalRef.current = peekInstantWorkContent();
  }
  wasWorkRouteRef.current = isWorkRoute;
  // Case-study Back AND primary-nav returns snap. Replaying the 1.14s
  // fade-up on Work/About/Archive tab switches felt like a load delay.
  // First load still uses intro + grid enter (`instant` stays false).
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
  // Read the live intro attribute during render (not only the layout-effect
  // grid gate). Hydration reuses useState(true) for the gate, so the first
  // client frame used to start the hero EntranceItem tween before the gate
  // closed — nested 8px + HeroText's own slide, which is the first-load jitter.
  const introPlaying =
    typeof document !== "undefined" &&
    document.documentElement.getAttribute("data-intro") === "playing";
  const heroInstant =
    instant ||
    introPlaying ||
    (Boolean(isFirstLoadIntroRef.current) && !gridGateOpen);

  const dk = useEntranceDials();

  // Pause Mux/CD on leave. Reclaim after a long idle off-route — never on
  // the About click frame. Grid CD poster only covers once live media unmounts.
  const HEAVY_TEARDOWN_MS = 15000;
  const [heavyMediaLive, setHeavyMediaLive] = useState(isWorkRoute);
  useEffect(() => {
    if (isWorkRoute) {
      setHeavyMediaLive(true);
      return;
    }
    let cancelled = false;
    let idleId = 0;
    const tearDown = () => {
      if (cancelled) return;
      setHeavyMediaLive(false);
    };
    const timeoutId = window.setTimeout(() => {
      if (cancelled) return;
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(tearDown, { timeout: 1500 });
      } else {
        tearDown();
      }
    }, HEAVY_TEARDOWN_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      if (idleId && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
    };
  }, [isWorkRoute]);

  // Resume Mux after Work paints — double-rAF + short delay so silk/shell
  // show first without decode competing on the arrival frame.
  const [mediaPlaying, setMediaPlaying] = useState(isWorkRoute);
  useEffect(() => {
    if (!isWorkRoute) {
      setMediaPlaying(false);
      return;
    }
    let cancelled = false;
    let timeoutId = 0;
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        timeoutId = window.setTimeout(() => {
          if (!cancelled) setMediaPlaying(true);
        }, 80);
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [isWorkRoute]);

  // Leaving "/" — close popups. Live CD stays in the hidden work shell until
  // idle teardown; the grid poster covers the slot only when that happens.
  useEffect(() => {
    if (isWorkRoute) return;
    setPopupVisible(false);
    setOpenPopup(null);
    setHabitPortalTarget(null);
  }, [isWorkRoute]);

  useEffect(() => {
    if (heavyMediaLive) return;
    setCdPosterOpacity(1);
    setCdPosterFade(false);
  }, [heavyMediaLive]);

  // Back on "/": once the remounted live CD is in place, fade the poster out
  // (unless the modal is open — poster stays opaque behind the blur).
  useEffect(() => {
    if (!isWorkRoute || !hasEverBeenActive) return;
    if (openPopup === "cd") return;
    setCdPosterFade(true);
    setCdPosterOpacity(0);
  }, [isWorkRoute, hasEverBeenActive, openPopup]);

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
  // later transitions (e.g. about -> archive).
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
    if (id === "cd") {
      setHasEverBeenActive(true);
      setHeavyMediaLive(true);
      setCdPosterFade(false);
      setCdPosterOpacity(1);
    } else {
      setHabitPosterFade(false);
      setHabitPosterOpacity(1);
    }
    setOpenPopup(id);
    setPopupVisible(true);
  };

  const closePopup = () => {
    setPopupVisible(false);
    // CD: fade poster out so the live grid preview returns.
    // Habit: poster stays the grid face (no live-under-card).
    if (openPopup === "cd") {
      setCdPosterFade(true);
      setCdPosterOpacity(0);
    }
  };

  const handlePopupExitComplete = (_id: PopupId) => {
    setOpenPopup(null);
  };

  // Seed habit poster theme from the site only until the live widget reports
  // its own (don't overwrite session widget theme on every site toggle/close).
  const habitThemeFromWidgetRef = useRef(false);
  useEffect(() => {
    if (openPopup === "habit") return;
    if (habitThemeFromWidgetRef.current) return;
    const sync = () => {
      if (habitThemeFromWidgetRef.current) return;
      const dark = document.documentElement.getAttribute("data-theme") === "dark";
      setHabitWidgetTheme(dark ? "dark" : "light");
    };
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, [openPopup]);

  const onHabitWidgetThemeChange = (theme: "light" | "dark") => {
    habitThemeFromWidgetRef.current = true;
    setHabitWidgetTheme(theme);
  };

  // CD portals between grid ↔ popup. Habit live instance only targets the popup.
  useLayoutEffect(() => {
    if (!hasEverBeenActive) return;
    if (openPopup === "cd" && popupVisible && popupCdEl) {
      setCdPortalTarget(popupCdEl);
    } else if (gridCdEl) {
      setCdPortalTarget(gridCdEl);
    }
  }, [hasEverBeenActive, openPopup, popupVisible, popupCdEl, gridCdEl]);

  useLayoutEffect(() => {
    if (openPopup === "habit" && popupHabitEl) {
      setHabitPortalTarget(popupHabitEl);
    } else {
      setHabitPortalTarget(null);
    }
  }, [openPopup, popupHabitEl]);

  return (
    <>
    <div
      style={{ display: isWorkRoute ? "block" : "none", fontFamily: "var(--font-sans)", position: "relative", zIndex: 1 }}
      aria-hidden={!isWorkRoute}
      inert={!isWorkRoute}
      {...(!isWorkRoute ? { "data-nosnippet": true } : {})}
    >
      <IntroOrchestrator />

      {/* ── Hero — more top/bottom breathing room; cards still peek ── */}
      <section
        aria-label="Introduction"
        className="work-hero"
        data-work-hero
        style={{
          position: "relative",
          overflow: "visible",
          paddingTop: "var(--hero-pt)",
          paddingBottom: "var(--hero-pb)",
        }}
      >
        <HeroLegibilityScrim />
        <EntranceItem active={isWorkRoute} instant={heroInstant} delay={0} style={{
          position: "relative",
          maxWidth: "var(--grid-max-w)",
          marginInline: "auto",
          paddingLeft: "var(--page-px)",
          paddingRight: "var(--page-px)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
        }}>
          <HeroTextWithRabbit />
        </EntranceItem>
      </section>

      {/* ── Project grid — data-nosnippet keeps card titles out of the Google
          blurb; the meta description + hero above should be the only candidates. */}
      <div className="intro-hide intro-hide--snap" data-nosnippet style={{ maxWidth: "var(--grid-max-w)", marginInline: "auto", paddingLeft: "var(--page-px)", paddingRight: "var(--page-px)", paddingBottom: "var(--space-5)" }}>
        <section
          aria-label="Portfolio"
          className="project-grid portfolio-grid"
          style={{
            paddingTop: "var(--space-5)",
            paddingBottom: "var(--space-8)",
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(1px, 1fr))",
            gap: "var(--grid-gutter)",
            alignItems: "start",
          }}
        >
          {/* ── Left column ── */}
          <div className="portfolio-grid-col">
            {projects
              .filter((_, i) => i % 2 === 0)
              .map((p, k) => {
                const rank = k * 2;
                return p.mediaType === "video" && p.muxPlaybackId ? (
                  <EntranceItem key={p._id} active={gridActive} instant={instant} delay={rankDelay(rank)} className="portfolio-grid-card" data-grid-card={p._id} style={{ order: rank }}>
                    {hasEverBeenActive && (
                      <MuxAutoplayCard
                        playbackId={p.muxPlaybackId}
                        href={p.href}
                        title={p.title}
                        sub={p.subtitle}
                        aspectRatio={p.aspectRatio}
                        active={heavyMediaLive}
                        playing={mediaPlaying}
                        mountOrder={rank}
                      />
                    )}
                  </EntranceItem>
                ) : p.image?.asset?.url ? (
                  <EntranceItem key={p._id} active={gridActive} instant={instant} delay={rankDelay(rank)} className="project-card portfolio-grid-card" data-grid-card={p._id} style={{ gap: 8, order: rank }}>
                    <ProjectCardLift style={{ gap: 8 }}>
                      <Link
                        href={p.href}
                        prefetch
                        style={CARD_LINK_STYLE}
                        onMouseEnter={() => warmProjectNav(p.href)}
                        onFocus={() => warmProjectNav(p.href)}
                        onPointerDown={() => commitProjectNav(p.href)}
                        onClick={() => commitProjectNav(p.href)}
                      >
                        <div className="project-media">
                          <div className="project-img-wrap" style={{ borderRadius: "var(--radius-card)", overflow: "hidden", background: "var(--color-placeholder)", aspectRatio: p.aspectRatio, position: "relative" }}>
                            <Image
                              src={p.image.asset.url}
                              alt={p.title}
                              fill
                              className="project-image"
                              style={{ objectFit: "cover" }}
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          </div>
                        </div>
                        <CardLabel title={p.title} sub={p.subtitle} external={isExternalHref(p.href)} />
                      </Link>
                    </ProjectCardLift>
                  </EntranceItem>
                ) : null;
              })}

            {/* CDPlayer — whole card opens the popup; one live instance is
                portaled between this grid slot and the modal (see below). */}
            <EntranceItem
              active={gridActive}
              instant={instant}
              delay={rankDelay(projects.length)}
              className="project-card portfolio-grid-card"
              data-grid-card="cd"
              role="button"
              tabIndex={0}
              aria-label="Open Drag a CD in a larger view"
              onClick={() => openPopupHandler("cd")}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPopupHandler("cd"); } }}
              style={{ gap: 6, cursor: "pointer", order: projects.length }}
            >
              <ProjectCardLift style={{ gap: 6 }}>
                <div className="project-media">
                  <div className="project-image project-img-wrap" style={{ borderRadius: "var(--radius-card)", overflow: "hidden", position: "relative", aspectRatio: "4 / 3", background: "var(--color-modal-bg)", colorScheme: "inherit" }}>
                    <CdPlayerPoster opacity={cdPosterOpacity} fade={cdPosterFade} />
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
                </div>
                <CardLabel title="Drag a CD" sub="exploration" showPopupIcon />
              </ProjectCardLift>
            </EntranceItem>
          </div>

          {/* ── Right column ── */}
          <div className="portfolio-grid-col">
            {projects
              .filter((_, i) => i % 2 === 1)
              .map((p, k) => {
                const rank = k * 2 + 1;
                return p.mediaType === "video" && p.muxPlaybackId ? (
                  <EntranceItem key={p._id} active={gridActive} instant={instant} delay={rankDelay(rank)} className="portfolio-grid-card" data-grid-card={p._id} style={{ order: rank }}>
                    {hasEverBeenActive && (
                      <MuxAutoplayCard
                        playbackId={p.muxPlaybackId}
                        href={p.href}
                        title={p.title}
                        sub={p.subtitle}
                        aspectRatio={p.aspectRatio}
                        active={heavyMediaLive}
                        playing={mediaPlaying}
                        mountOrder={rank}
                      />
                    )}
                  </EntranceItem>
                ) : p.image?.asset?.url ? (
                  <EntranceItem key={p._id} active={gridActive} instant={instant} delay={rankDelay(rank)} className="project-card portfolio-grid-card" data-grid-card={p._id} style={{ gap: 8, order: rank }}>
                    <ProjectCardLift style={{ gap: 8 }}>
                      <Link
                        href={p.href}
                        prefetch
                        style={CARD_LINK_STYLE}
                        onMouseEnter={() => warmProjectNav(p.href)}
                        onFocus={() => warmProjectNav(p.href)}
                        onPointerDown={() => commitProjectNav(p.href)}
                        onClick={() => commitProjectNav(p.href)}
                      >
                        <div className="project-media">
                          <div className="project-img-wrap" style={{ borderRadius: "var(--radius-card)", overflow: "hidden", background: "var(--color-placeholder)", aspectRatio: p.aspectRatio, position: "relative" }}>
                            <Image
                              src={p.image.asset.url}
                              alt={p.title}
                              fill
                              className="project-image"
                              style={{ objectFit: "cover" }}
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          </div>
                        </div>
                        <CardLabel title={p.title} sub={p.subtitle} external={isExternalHref(p.href)} />
                      </Link>
                    </ProjectCardLift>
                  </EntranceItem>
                ) : null;
              })}

            {/* Habit tracker — same single-instance portal treatment as CD. */}
            <EntranceItem
              active={gridActive}
              instant={instant}
              delay={rankDelay(projects.length + 1)}
              className="project-card portfolio-grid-card"
              data-grid-card="habit"
              role="button"
              tabIndex={0}
              aria-label="Open Dumb Habit Tracker in a larger view"
              onClick={() => openPopupHandler("habit")}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPopupHandler("habit"); } }}
              style={{ gap: 6, cursor: "pointer", order: projects.length + 1 }}
            >
              <ProjectCardLift style={{ gap: 6 }}>
                <div className="project-media">
                  <div className="project-img-wrap" style={{ borderRadius: "var(--radius-card)", overflow: "hidden", background: "var(--color-phone-bg)", position: "relative", aspectRatio: "4 / 3" }}>
                    <div style={{ position: "absolute", top: 5, right: 5, zIndex: 10, pointerEvents: "none" }}>
                      <InteractiveBadge />
                    </div>
                    <PhonePoster
                      opacity={habitPosterOpacity}
                      fade={habitPosterFade}
                      theme={habitWidgetTheme}
                      // Keep the inert screen mounted after the first "/" visit
                      // so the poster reflects this session's habit state across
                      // navigations (no cold remount flash on return).
                      showScreen={hasEverBeenActive}
                    />
                  </div>
                </div>
                <CardLabel title="Dumb Habit Tracker" sub="product design + frontend" showPopupIcon />
              </ProjectCardLift>
            </EntranceItem>
          </div>
        </section>

        {/* Keep the panel mounted across soft-nav — it portals to document.body
            so parent display:none cannot hide it; `visible` toggles the portal. */}
        {hasEverBeenActive && (
          <PS3ControlPanel
            instantReturn={instant}
            visible={isWorkRoute}
          />
        )}
      </div>
    </div>

      {isWorkRoute && openPopup === "cd" && (
        <ProjectPopup
          open={popupVisible}
          onClose={closePopup}
          onExitComplete={() => handlePopupExitComplete("cd")}
          title="Drag a CD"
          sub="exploration"
          maxWidth={POPUP_EMBED_MAX_W}
          panelBg="var(--color-modal-bg)"
        >
          <div
            className="project-image"
            style={{
              borderRadius: 4,
              overflow: "hidden",
              position: "relative",
              height: CD_POPUP_EMBED_H,
              flex: "1 1 auto",
              minHeight: 280,
              background: "var(--color-modal-bg)",
              colorScheme: "inherit",
            }}
          >
            <div
              ref={(el) => {
                setPopupCdEl(el);
                if (el) setCdPortalTarget(el);
                else if (gridCdEl) setCdPortalTarget(gridCdEl);
              }}
              style={{ position: "absolute", inset: 0 }}
            />
          </div>
        </ProjectPopup>
      )}

      {isWorkRoute && openPopup === "habit" && (
        <ProjectPopup
          open={popupVisible}
          onClose={closePopup}
          onExitComplete={() => handlePopupExitComplete("habit")}
          title="Dumb Habit Tracker"
          sub="product design + frontend"
          maxWidth={HABIT_POPUP_MAX_W}
          panelBg="var(--color-phone-bg)"
        >
          <div
            style={{
              borderRadius: 4,
              overflow: "hidden",
              position: "relative",
              height: HABIT_POPUP_EMBED_H,
              flex: "1 1 auto",
              minHeight: 0,
              background: "var(--color-phone-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div ref={setPopupHabitEl} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }} />
          </div>
        </ProjectPopup>
      )}

      {/*
        CD mounts while heavy media is live, or immediately when the modal
        opens (idle teardown may have unmounted it). Habit stays popup-only.
      */}
      {hasEverBeenActive && (heavyMediaLive || openPopup === "cd") && (
        <EmbedPortal container={cdPortalTarget}>
          <CDPlayer active={isWorkRoute && openPopup === "cd" && popupVisible} />
        </EmbedPortal>
      )}
      {openPopup === "habit" && isWorkRoute && habitPortalTarget && (
        <EmbedPortal container={habitPortalTarget}>
          <PhoneEmbed
            expanded
            initialTheme={habitWidgetTheme}
            onWidgetThemeChange={onHabitWidgetThemeChange}
          />
        </EmbedPortal>
      )}
    </>
  );
}
