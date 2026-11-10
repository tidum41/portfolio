"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, memo, useEffect, useLayoutEffect as _useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useGridFirstLoadActive } from "@/components/GridFirstLoad";
import { IntroOrchestrator } from "@/components/IntroOrchestrator";
import HeroTextWithRabbit from "@/components/HeroTextWithRabbit";
import HeroLegibilityScrim from "@/components/HeroLegibilityScrim";
import InteractiveBadge from "@/components/InteractiveBadge";
import { EntranceItem, useEntranceDials } from "@/components/ScrollReveal";
import ProjectCardLift from "@/components/ProjectCardLift";
import ProjectPopup from "@/components/ProjectPopup";
import AllinoneHalftoneLoader from "@/components/AllinoneHalftoneLoader";
import PhonePoster from "@/components/PhonePoster";
import NortheastArrow from "@/components/icons/NortheastArrow";
import { clearInstantBack } from "@/lib/instantNav";
import { useResolvedPrimaryTab } from "@/lib/usePrimaryTab";
import { useTabArrival } from "@/lib/useTabArrival";
import { isCaseStudyHref, warmCaseStudyNav, commitCaseStudyNav } from "@/lib/caseStudyNav";
import { CASE_STUDY_PAGES } from "@/lib/caseStudyRegistry";
import { useIntroReleased } from "@/lib/useIntroReleased";
import { completeIntro, onIntroDone } from "@/lib/introReady";
import { ALLINONE_APP_URL, DIALOGUE_PROJECT_ID, type SanityProject } from "@/lib/sanity/queries";
import DialogueCardMedia from "@/components/DialogueCard";
import DialogueCardTap, {
  DIALOGUE_TAP_LABEL,
} from "@/components/DialogueCardTap";

/** Native media box for each home-grid card (width / height). */
const GRID_MEDIA_ASPECTS: Record<string, { css: string; ratio: number }> = {
  "project-bruinlease": { css: "6 / 5", ratio: 6 / 5 },
  "project-joola-b2b": { css: "4 / 3", ratio: 4 / 3 },
  [DIALOGUE_PROJECT_ID]: { css: "4 / 3", ratio: 4 / 3 },
  "project-sviz": { css: "1572 / 1080", ratio: 1572 / 1080 },
  "project-todolist": { css: "1362 / 1080", ratio: 1362 / 1080 },
  habit: { css: "4 / 3", ratio: 4 / 3 },
};
const FALLBACK_ASPECT = { css: "4 / 3", ratio: 4 / 3 };

function gridAspect(id?: string | null) {
  return (id && GRID_MEDIA_ASPECTS[id]) || FALLBACK_ASPECT;
}

/** Shared card chrome. `order` keeps reading order when columns flatten on mobile. */
function gridCardStyle(rank: number, extra?: CSSProperties): CSSProperties {
  return { minWidth: 0, order: rank, ...extra };
}

/** Cheap Dialogue tap cover: token fill matching DialogueCardMedia ground.
 *  Avoids mounting a second DialogueCardMedia (hover/TBT cost). Static
 *  filter:blur is applied by DialogueCardTap on this layer. */
const DIALOGUE_BLUR_LAYER = (
  <div className="project-media" aria-hidden>
    <div
      className="project-img-wrap"
      style={{
        borderRadius: "var(--radius-card)",
        overflow: "hidden",
        aspectRatio: gridAspect(DIALOGUE_PROJECT_ID).css,
        position: "relative",
        background: "var(--color-dialogue-ground, #F6F5F2)",
      }}
    />
  </div>
);


import CardFocusGrid from "@/components/CardFocusGrid";

/** Leaves the site (or opens a non-app URL) — blue northeast arrow only for these. */
function isExternalHref(href?: string) {
  return Boolean(href && /^(https?:|mailto:|tel:)/i.test(href));
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

import MuxAutoplayCard from "@/components/MuxAutoplayCard";

const PS3ControlPanel = dynamic(() => import("@/components/PS3ControlPanel"));
const PhoneEmbed      = dynamic(() => import("@/components/PhoneEmbed"));

type PopupId = "habit" | "allinone";

const POPUP_EMBED_MAX_W = 1100;
const HABIT_POPUP_MAX_W = 560;

const ALLINONE_INFO_META = [
  { label: "Built with", values: ["React", "Vite", "PWA"] },
  { label: "AI", values: ["Groq"] },
  { label: "Data", values: ["Google Sheets API", "Supabase"] },
  { label: "Designed with", values: ["Paper", "Claude Code"] },
  { label: "Timeline", values: ["2 weeks"] },
];

const ALLINONE_WHY_BUILT =
  "I found myself dumping all my tasks into one Apple Note, so I built a tool (all-in-one) that allows users to define how they want categories grouped, then have a model sort tasks accordingly. I imagined it as a stripped down version of Notes, with an organized list feature and standard notes.";
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
  label,
  showPopupIcon,
  external,
}: {
  title: string;
  /** Quiet meta line above the main title (PS3 XMB hierarchy). */
  label?: string;
  showPopupIcon?: boolean;
  /** External project link — blue northeast arrow. */
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
        fontWeight: "var(--fw-card-title)" as React.CSSProperties["fontWeight"],
        fontSize: 18,
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
        {showPopupIcon && <OpensInPopupIcon />}
      </p>
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
 *  Heavy media (Mux grid players) unmount while off "/" and remount
 *  on return — posters keep cards feeling instant without holding paused HLS
 *  in memory. Habit live embed remains popup-only.
 *
 *  `hasEverBeenActive` lazily gates the heavy embeds so sessions that never
 *  visit "/" don't pay for them. Once true it never resets.
 *
 *  Entrance animation has three distinct cases:
 *   - True first load at "/" (data-intro gate active): hero + PS3Silk's own
 *     slow first-load animation is the whole show — this wrapper stays
 *     instant so it doesn't double-animate on top of that. The grid waits
 *     for "intro-done" (via useGridFirstLoadActive), then plays its stagger.
 *   - Case-study "Back": content stays at rest while hidden, then snaps.
 *   - Primary-nav returns: shell is instant; hero + grid play the enter.
 *   - Hero wrapper stays instant during intro so it doesn't stack on HeroText.
 */
export function PersistentWorkShell({ projects }: { projects: SanityProject[] }) {
  const pathname = usePathname();
  const visible = useResolvedPrimaryTab(pathname) === "work";
  return <WorkKeepAlive visible={visible} projects={projects} />;
}

const WorkKeepAlive = memo(function WorkKeepAlive({
  visible,
  projects,
}: {
  visible: boolean;
  projects: SanityProject[];
}) {
  const router = useRouter();
  const warmProjectNav = (href?: string) => {
    if (href && isCaseStudyHref(href)) warmCaseStudyNav(href, router);
  };
  const commitProjectNav = (href?: string) => {
    if (href && isCaseStudyHref(href)) commitCaseStudyNav(href, router);
  };

  // First click into a case study used to race a cold ~700KB RSC fetch against
  // Mux HLS boot + the 6s About/Archive/PostHog idle timer. Idle-warm the
  // live case-study hrefs as soon as intro-done fires — never before, so the
  // cinematic intro timing stays untouched.
  useEffect(() => {
    if (!visible) return;
    let idleId = 0;
    let timeoutId = 0;
    const warmVisibleCaseStudies = () => {
      const warmed = new Set<string>();
      // Prefer hrefs actually on the work grid (visible cards).
      document
        .querySelectorAll<HTMLAnchorElement>(".portfolio-grid-card a[href^='/']")
        .forEach((a) => {
          const href = a.getAttribute("href");
          if (!href || warmed.has(href) || !isCaseStudyHref(href)) return;
          warmed.add(href);
          warmCaseStudyNav(href, router);
        });
      // Registry fallback if the grid hasn't painted yet.
      if (warmed.size === 0) {
        for (const page of CASE_STUDY_PAGES) {
          warmCaseStudyNav(page.href, router);
        }
      }
    };
    const schedule = () => {
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(warmVisibleCaseStudies, { timeout: 1200 });
      } else {
        timeoutId = window.setTimeout(warmVisibleCaseStudies, 0);
      }
    };
    const cancelIntro = onIntroDone(schedule);
    return () => {
      cancelIntro();
      if (idleId && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [visible, router]);

  const [hasEverBeenActive, setHasEverBeenActive] = useState(visible);
  const introReleased = useIntroReleased();
  // Which embed's popup is active, and whether the modal is visibly open.
  // openPopup stays set through the exit animation so the single portaled
  // iframe doesn't unmount until onExitComplete fires.
  const [openPopup, setOpenPopup] = useState<PopupId | null>(null);
  const [popupVisible, setPopupVisible] = useState(false);
  // Habit: high-quality poster in grid; live PhoneEmbed only
  // while the popup is open (state persists in localStorage across remounts).
  const [popupHabitEl, setPopupHabitEl] = useState<HTMLDivElement | null>(null);
  const [habitPortalTarget, setHabitPortalTarget] = useState<HTMLDivElement | null>(null);
  // Habit poster is the grid.
  const [habitPosterOpacity, setHabitPosterOpacity] = useState(1);
  // Poster opacity transitions only on close (reveal live embed). Open snaps
  // opaque so the grid card behind the backdrop doesn't empty/morph mid-blur.
  const [habitPosterFade, setHabitPosterFade] = useState(false);
  // Habit poster frame/theme: site theme until the live widget reports its own.
  // Initialized to "dark" to match <html data-theme="dark"> on SSR so hydration
  // never mismatches; the effect below syncs if BootScripts flipped to "light".
  const [habitWidgetTheme, setHabitWidgetTheme] = useState<'light' | 'dark'>("dark");
  // Allinone: defer iframe src until the open animation settles, then
  // fade a delayed (~150ms) halftone loader and post allinone-enter so the
  // embed can stagger its chrome in.
  const [allinoneAllowSrc, setAllinoneAllowSrc] = useState(false);
  const [allinoneFrameSrc, setAllinoneFrameSrc] = useState<string | undefined>(undefined);
  const [allinoneFrameReady, setAllinoneFrameReady] = useState(false);
  const [allinoneLoaderVisible, setAllinoneLoaderVisible] = useState(false);
  const [allinoneLoaderFading, setAllinoneLoaderFading] = useState(false);
  const allinoneIframeRef = useRef<HTMLIFrameElement | null>(null);
  const allinoneEnterSentRef = useRef(false);
  const allinoneReadyLatchedRef = useRef(false);
  const scrollYRef = useRef(0);
  // See the click-capture / scroll-tracking effects below for why this exists.
  const suppressTrackingRef = useRef(false);

  // Rising-edge latch: Back snaps; every other Work show bumps `epoch` so
  // keep-alive EntranceItems replay instead of sitting at rest.
  const { snap, epoch } = useTabArrival(visible);
  const instant = snap;

  // Whether this session's very first paint had the first-load intro gate
  // active at all (i.e. the literal first page load was "/"). Captured once,
  // lazily, since `document` isn't available during SSR. Used only to keep
  // the hero wrapper out of HeroText's way while that gate is still closed.
  const isFirstLoadIntroRef = useRef<boolean | null>(null);
  if (isFirstLoadIntroRef.current === null && typeof document !== "undefined") {
    isFirstLoadIntroRef.current = document.documentElement.hasAttribute("data-intro");
  }

  const gridGateOpen = useGridFirstLoadActive();
  const gridActive = gridGateOpen && visible;
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

  // Pause Mux on leave. Reclaim after a long idle off-route — never on
  // the About click frame.
  const HEAVY_TEARDOWN_MS = 15000;
  const [heavyMediaLive, setHeavyMediaLive] = useState(visible);
  useEffect(() => {
    if (visible) {
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
  }, [visible]);

  // Resume Mux on the frame after Work paints so shell shows first without
  // adding an artificial timer delay.
  const [mediaPlaying, setMediaPlaying] = useState(visible);
  useEffect(() => {
    if (!visible) {
      setMediaPlaying(false);
      return;
    }
    const raf = requestAnimationFrame(() => {
      setMediaPlaying(true);
    });
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  // Leaving "/" — close popups.
  useEffect(() => {
    if (visible) return;
    setPopupVisible(false);
    setOpenPopup(null);
    setHabitPortalTarget(null);
  }, [visible]);


  // Restore scroll synchronously, before paint, whenever we become visible again.
  // `behavior: "instant"` is required here — `html` has `scroll-behavior: smooth`
  // globally (for anchor-link nav), which would otherwise make this snap-back
  // visibly animate instead of landing exactly where it was immediately.
  useLayoutEffect(() => {
    if (!visible) return;
    if (!hasEverBeenActive) setHasEverBeenActive(true);
    window.scrollTo({ top: scrollYRef.current, left: 0, behavior: "instant" });
    // Resume normal tracking now that we're confirmed back — the suppression
    // was only ever meant to survive the single departing transition.
    suppressTrackingRef.current = false;
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  // AnimationProvider reads the instant-back flag once, synchronously, to
  // decide whether the outgoing case study's exit should skip its fade. Clear
  // it shortly after landing back here so it doesn't leak into unrelated,
  // later transitions (e.g. about -> archive).
  useEffect(() => {
    if (visible) clearInstantBack();
  }, [visible]);

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
    if (!visible) return;
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
  }, [visible]);

  // Freeze the scroll position synchronously the instant a project card is
  // clicked — a *capturing*-phase listener runs before the Link's own click
  // handling, so this always wins the race — and suppress the passive
  // tracker above from then on, so the post-click layout-collapse scroll
  // noise described above can't overwrite the frozen value before this
  // component is hidden. Un-suppressed by the restore effect once we're
  // confirmed back on "/", so normal tracking resumes for next time.
  //
  // Same capture pass: if the first-load intro is still playing and the
  // click landed on a project card, end the intro immediately so soft nav
  // / commitCaseStudyNav stay coherent (and so
  // nav/footer aren't left opacity-gated after we leave "/").
  useEffect(() => {
    if (!visible) return;
    const onClickCapture = (e: MouseEvent) => {
      scrollYRef.current = window.scrollY;
      suppressTrackingRef.current = true;
      const el = e.target;
      if (!(el instanceof Element)) return;
      if (
        el.closest(
          '.portfolio-grid-card a, .portfolio-grid-card[role="button"], .portfolio-grid-card [role="button"], .project-card a',
        )
      ) {
        completeIntro();
      }
    };
    window.addEventListener("click", onClickCapture, { capture: true });
    return () => window.removeEventListener("click", onClickCapture, { capture: true });
  }, [visible]);

  // Manual cross-column stagger rank: the two DOM columns (even/odd project
  // index) need to read as one interleaved sequence — project[0] (left),
  // project[1] (right), project[2] (left), ... — which the original Sanity
  // index already encodes, since the columns are split by its parity. The
  // trailing "extra" card (PhoneEmbed) continues that sequence
  // as the last left/right slots. Capped so a long grid doesn't take forever.
  const totalItems = projects.length + 1;
  const perItemStagger = totalItems > 1
    ? Math.min(dk.stagger, dk.maxSpread / (totalItems - 1))
    : dk.stagger;
  const rankDelay = (rank: number) => rank * perItemStagger;

  const openPopupHandler = (id: PopupId) => {
    if (id === "habit") {
      setHabitPosterFade(false);
      setHabitPosterOpacity(1);
    }
    setOpenPopup(id);
    setPopupVisible(true);
  };

  const closePopup = () => {
    setPopupVisible(false);
  };

  const handlePopupExitComplete = (id: PopupId) => {
    setOpenPopup(null);
    if (id === "allinone") {
      setAllinoneAllowSrc(false);
      setAllinoneFrameSrc(undefined);
      setAllinoneFrameReady(false);
      setAllinoneLoaderVisible(false);
      setAllinoneLoaderFading(false);
      allinoneEnterSentRef.current = false;
      allinoneReadyLatchedRef.current = false;
      allinoneIframeRef.current = null;
    }
  };

  // Show the halftone loader only after ~150ms so fast paints never flash it.
  useEffect(() => {
    if (openPopup !== "allinone" || !popupVisible || allinoneFrameReady) {
      return;
    }
    const t = window.setTimeout(() => setAllinoneLoaderVisible(true), 150);
    return () => window.clearTimeout(t);
  }, [openPopup, popupVisible, allinoneFrameReady]);

  // Arm the iframe only after the panel enter finishes, then on idle so the
  // open animation + topbar hover stay on the main thread.
  useEffect(() => {
    if (!allinoneAllowSrc || allinoneFrameSrc) return;
    let cancelled = false;
    const arm = () => {
      if (cancelled) return;
      setAllinoneFrameSrc(ALLINONE_APP_URL);
    };
    const ric = window.requestIdleCallback?.bind(window);
    const cic = window.cancelIdleCallback?.bind(window);
    if (ric && cic) {
      const id = ric(arm, { timeout: 320 });
      return () => {
        cancelled = true;
        cic(id);
      };
    }
    const t = window.setTimeout(arm, 48);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [allinoneAllowSrc, allinoneFrameSrc]);

  const signalAllinoneEnter = (iframe: HTMLIFrameElement | null) => {
    if (!iframe || allinoneEnterSentRef.current) return;
    allinoneEnterSentRef.current = true;
    try {
      iframe.contentWindow?.postMessage(
        { type: "allinone-enter" },
        window.location.origin,
      );
    } catch {
      /* ignore */
    }
  };

  const completeAllinoneReady = (iframe?: HTMLIFrameElement | null) => {
    if (allinoneReadyLatchedRef.current) {
      signalAllinoneEnter(iframe ?? allinoneIframeRef.current);
      return;
    }
    allinoneReadyLatchedRef.current = true;
    const el = iframe ?? allinoneIframeRef.current;
    setAllinoneFrameReady(true);
    setAllinoneLoaderFading(true);
    setAllinoneLoaderVisible(false);
    // Let the loader opacity transition finish, then unmount.
    window.setTimeout(() => setAllinoneLoaderFading(false), 220);
    signalAllinoneEnter(el);
  };

  // Same-origin: prefer the demo's allinone-ready postMessage; fall back to
  // load + double rAF. Either path fades the loader and posts allinone-enter.
  useEffect(() => {
    if (openPopup !== "allinone") return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const data = e.data;
      if (
        data === "allinone-ready" ||
        (data && typeof data === "object" && (data as { type?: string }).type === "allinone-ready")
      ) {
        completeAllinoneReady(allinoneIframeRef.current);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [openPopup]);

  const markAllinonePainted = (iframe: HTMLIFrameElement | null) => {
    if (!iframe) return;
    allinoneIframeRef.current = iframe;
    if (allinoneFrameReady) {
      signalAllinoneEnter(iframe);
      return;
    }
    try {
      const doc = iframe.contentDocument;
      if (!doc) {
        completeAllinoneReady(iframe);
        return;
      }
      // Two frames after load ≈ first paint of the embed (fallback if the
      // demo's ready message is late or missing).
      requestAnimationFrame(() => {
        requestAnimationFrame(() => completeAllinoneReady(iframe));
      });
    } catch {
      completeAllinoneReady(iframe);
    }
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


  useLayoutEffect(() => {
    if (openPopup === "habit" && popupHabitEl) {
      setHabitPortalTarget(popupHabitEl);
    } else {
      setHabitPortalTarget(null);
    }
  }, [openPopup, popupHabitEl]);

  // Homepage sequence: projects (BruinLease, JOOLA, Dialogue, SViz) then
  // All in One, then the Habit phone demo (`null` slot). HABIT_RANK sits
  // just past todolist (5th project) so Habit lands after it.
  const HABIT_RANK = Math.min(5, projects.length);
  const gridSlots: (SanityProject | null)[] = [
    ...projects.slice(0, HABIT_RANK),
    null,
    ...projects.slice(HABIT_RANK),
  ];
  const habitCard = (
    <EntranceItem
              active={gridActive}
              instant={instant}
              replayToken={epoch}
              delay={rankDelay(HABIT_RANK)}
              className="project-card portfolio-grid-card"
              data-grid-card="habit"
              role="button"
              tabIndex={0}
              aria-label="Open Habit tracker focused on offering less"
              onClick={() => openPopupHandler("habit")}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPopupHandler("habit"); } }}
              style={gridCardStyle(HABIT_RANK, { gap: 6, cursor: "pointer" })}
            >
              <ProjectCardLift style={{ gap: 6 }}>
                <div className="project-media">
                  <div className="project-img-wrap" style={{ borderRadius: "var(--radius-card)", overflow: "hidden", background: "var(--color-phone-bg)", position: "relative", aspectRatio: gridAspect("habit").css }}>
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
                      showScreen={hasEverBeenActive && introReleased}
                    />
                  </div>
                </div>
                <CardLabel title="Habit tracker focused on offering less" label="Exploration" showPopupIcon />
              </ProjectCardLift>
            </EntranceItem>
  );

  const renderGridCard = (p: SanityProject | null, rank: number) => {
    if (p === null) return <Fragment key="habit">{habitCard}</Fragment>;
    const aspect = gridAspect(p._id).css;
    if (p._id === DIALOGUE_PROJECT_ID) {
      return (
        <EntranceItem key={p._id} active={gridActive} instant={instant} replayToken={epoch} delay={rankDelay(rank)} className="project-card portfolio-grid-card" data-grid-card={p._id} aria-describedby="grid-pill-desc-dialogue" style={gridCardStyle(rank, { gap: 6 })}>
          <ProjectCardLift style={{ gap: 6 }}>
            <DialogueCardTap
              media={
                <div className="project-media">
                  <div className="project-img-wrap" style={{ borderRadius: "var(--radius-card)", overflow: "hidden", aspectRatio: aspect, position: "relative" }}>
                    <DialogueCardMedia />
                  </div>
                </div>
              }
              blurLayer={DIALOGUE_BLUR_LAYER}
              label={<CardLabel title={p.title} label={p.label} />}
            />
          </ProjectCardLift>
        </EntranceItem>
      );
    }
    if (p.mediaType === "video" && p.muxPlaybackId) {
      return (
        <EntranceItem key={p._id} active={gridActive} instant={instant} replayToken={epoch} delay={rankDelay(rank)} className="portfolio-grid-card" data-grid-card={p._id} style={gridCardStyle(rank)}>
          {hasEverBeenActive && (
            <MuxAutoplayCard
              playbackId={p.muxPlaybackId}
              href={p._id === "project-todolist" ? undefined : p.href}
              onOpen={p._id === "project-todolist" ? () => openPopupHandler("allinone") : undefined}
              title={p.title}
              label={p.label}
              aspectRatio={aspect}
              objectFit="contain"
              active={heavyMediaLive}
              playing={mediaPlaying}
              mountOrder={rank}
            />
          )}
        </EntranceItem>
      );
    }
    if (p.image?.asset?.url && p.href) {
      return (
        <EntranceItem key={p._id} active={gridActive} instant={instant} replayToken={epoch} delay={rankDelay(rank)} className="project-card portfolio-grid-card" data-grid-card={p._id} style={gridCardStyle(rank, { gap: 8 })}>
          <ProjectCardLift style={{ gap: 8 }}>
            <Link
              href={p.href}
              prefetch={false}
              style={CARD_LINK_STYLE}
              onMouseEnter={() => warmProjectNav(p.href)}
              onFocus={() => warmProjectNav(p.href)}
              onPointerDown={() => warmProjectNav(p.href)}
              onClick={() => commitProjectNav(p.href)}
            >
              <div className="project-media">
                <div className="project-img-wrap" style={{ borderRadius: "var(--radius-card)", overflow: "hidden", background: "var(--color-placeholder)", aspectRatio: aspect, position: "relative" }}>
                  <Image
                    src={p.image.asset.url}
                    alt={p.title}
                    fill
                    className="project-image"
                    style={{ objectFit: "contain" }}
                    sizes="(max-width: 767px) calc(100vw - 48px), 55vw"
                  />
                </div>
              </div>
              <CardLabel title={p.title} label={p.label} external={isExternalHref(p.href)} />
            </Link>
          </ProjectCardLift>
        </EntranceItem>
      );
    }
    return null;
  };

  // Desktop masonry: two equal-width columns. Reading order is L-R then down
  // (rank 0,1,2…), which is also the mobile stack via `order`.
  //   Left  (even): BruinLease 6:5, Dialogue 4:3, All in One 1362:1080
  //   Right (odd):  JOOLA 4:3, SViz 1572:1080, Habit 4:3 frame
  const leftCol = gridSlots.map((p, rank) => ({ p, rank })).filter(({ rank }) => rank % 2 === 0);
  const rightCol = gridSlots.map((p, rank) => ({ p, rank })).filter(({ rank }) => rank % 2 === 1);

  return (
    <>
    <div
      data-primary-shell="work"
      style={{ display: visible ? "block" : "none", fontFamily: "var(--font-sans)", position: "relative", zIndex: 1 }}
      aria-hidden={!visible}
      inert={!visible}
      {...(!visible ? { "data-nosnippet": true } : {})}
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
        <EntranceItem active={visible} instant={heroInstant} replayToken={epoch} delay={0} style={{
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
        <CardFocusGrid visible={visible}>
          <div className="portfolio-grid-col">
            {leftCol.map(({ p, rank }) => renderGridCard(p, rank))}
          </div>
          <div className="portfolio-grid-col">
            {rightCol.map(({ p, rank }) => renderGridCard(p, rank))}
          </div>
        </CardFocusGrid>
        <span id="grid-pill-desc-dialogue" hidden>{DIALOGUE_TAP_LABEL}</span>

        {/* Keep the panel mounted across soft-nav — it portals to document.body
            so parent display:none cannot hide it; `visible` toggles the portal.
            Mount it with the shell, NOT after introReleased: like HeroText and
            the grid, it must be mounted (at opacity 0, non-interactive) while
            data-intro="playing" so its own onIntroDone listener is registered
            before IntroOrchestrator fires "intro-done". Gating the mount on
            introReleased started its whole portal/position/reveal chain only
            after the gate lifted, so its fade ran late or, when the reveal
            states batched into one commit, not at all. It just appeared. */}
        {hasEverBeenActive && (
          <PS3ControlPanel
            instantReturn={instant}
            visible={visible}
          />
        )}
      </div>
    </div>


      {visible && openPopup === "habit" && (
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

      {visible && openPopup === "allinone" && (
        <ProjectPopup
          open={popupVisible}
          onClose={closePopup}
          onExitComplete={() => handlePopupExitComplete("allinone")}
          onEntered={() => setAllinoneAllowSrc(true)}
          title="Designing a to-do list with AI organization"
          size="large"
          panelBg="var(--color-bg)"
          infoMeta={[...ALLINONE_INFO_META]}
          infoLink={{ href: ALLINONE_APP_URL, label: "Open full app" }}
          whyBuilt={ALLINONE_WHY_BUILT}
        >
          <div className="aio-demo-embed">
            <AllinoneHalftoneLoader
              visible={allinoneLoaderVisible && !allinoneFrameReady}
              fading={allinoneLoaderFading}
            />
            {/* Src armed after open animation + idle — keeps × / info at 60fps. */}
            {allinoneFrameSrc ? (
              <iframe
                ref={allinoneIframeRef}
                className="project-popup-iframe"
                src={allinoneFrameSrc}
                title="Allinone — AI to-do list"
                allow="clipboard-write"
                loading="lazy"
                data-ready={allinoneFrameReady ? "true" : "false"}
                onLoad={(e) => markAllinonePainted(e.currentTarget)}
              />
            ) : null}
          </div>
        </ProjectPopup>
      )}

      {openPopup === "habit" && visible && habitPortalTarget && (
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
}, (prev, next) => {
  // Hidden work must not reconcile on About ↔ Archive. Leave/enter still
  // re-renders so Mux can pause without destroying HLS on the click frame.
  if (!prev.visible && !next.visible) return true;
  return prev.visible === next.visible && prev.projects === next.projects;
});
