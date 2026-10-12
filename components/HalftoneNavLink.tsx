"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import OutlineMorphWord, { OUTLINE_MORPH_S } from "./OutlineMorphWord";
import { markSoftNav, markPrimaryShow, hrefToPrimaryTab, isAlreadyShowingPrimary } from "@/lib/instantNav";

const PRIMARY_NAV = new Set(["/", "/about", "/archive"]);

// Finger jitter / scroll-intent threshold. Beyond this, treat the gesture as
// a scroll (or aborted press), not a tap — don't navigate, don't leave the
// "hover" morph stuck on.
const TAP_MOVE_THRESHOLD_PX = 10;

// After a nav commit, ignore hover for this long so a soft-nav layout shift
// under the cursor (leave→enter) can't restart the morph and double-flicker
// before the link settles into its solid active state.
const POST_NAV_HOVER_IGNORE_MS = 450;

function canHover() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function commitPrimary(href: string) {
  const tab = hrefToPrimaryTab(href);
  if (!tab) return;
  markSoftNav();
  // router.push is a transition. Without flushSync the tab store update is
  // deferred with the RSC payload — the whole point of markPrimaryShow.
  flushSync(() => {
    markPrimaryShow(tab);
  });
}

function warmPrimary(href: string) {
  if (href === "/archive") {
    void import("@/lib/archiveGalleryCache").then((m) => m.warmArchiveGallery());
    void import("@/app/archive/ArchivePageClient");
    void import("@/components/BentoGallery");
  } else if (href === "/about") {
    void import("@/components/AboutPageContent");
  }
}

export default function HalftoneNavLink({ href, label, isActive, dk }: any) {
  const router = useRouter();
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
    pointerType: string;
  } | null>(null);
  // Set when we already committed navigation on touch/pen pointerup, so the
  // synthetic click that follows doesn't double-push the same route.
  const touchNavRef = useRef(false);
  // This press committed a route change to `href` — when isActive flips true,
  // settle the morph once into solid active instead of leaving hover/tap on
  // (which double-flickered as soft-nav shifted layout under the cursor).
  const pendingNavSettleRef = useRef(false);
  const ignoreHoverUntilRef = useRef(0);

  // Hover works on the current page's own link (work on `/`). Tap always
  // works. After a nav commit to this link we clear both and briefly ignore
  // hover so the solid active state can land once — see settle effect below.
  // dk.keepEffectOn (DialKit) pins the effect while dragging dials.
  // enabled: false leaves the solid letter. The shape itself is baked, so
  // the melt sliders no longer restyle these three words.
  const morphOn =
    dk?.enabled !== false && Boolean(dk?.keepEffectOn || isHovered || isTapped);
  const reduced = useReducedMotion();
  const morphMs = reduced ? 0 : OUTLINE_MORPH_S * 1000;

  const clearTapTimer = () => {
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
      tapTimeoutRef.current = null;
    }
  };

  const clearSettleTimer = () => {
    if (settleTimeoutRef.current) {
      clearTimeout(settleTimeoutRef.current);
      settleTimeoutRef.current = null;
    }
  };

  const armTap = () => {
    setIsTapped(true);
    clearTapTimer();
    // Failsafe if navigation doesn't land (modifier-click, aborted gesture,
    // same-route tap). Nav settle / mouseleave also clears it.
    tapTimeoutRef.current = setTimeout(() => setIsTapped(false), 1000);
  };

  const disarmTap = () => {
    clearTapTimer();
    setIsTapped(false);
  };

  const markNavCommit = () => {
    pendingNavSettleRef.current = true;
    // Ignore hover immediately — soft-nav can leave→enter under the cursor
    // during the morph-in window, which restarted the effect (double flicker)
    // before the settle timeout below could clear state.
    ignoreHoverUntilRef.current =
      performance.now() + morphMs + POST_NAV_HOVER_IGNORE_MS;
  };

  // One morph-in on press, then settle to solid active when this link becomes
  // the current page — without this, isHovered stays true (cursor still on
  // the link) and soft-nav's layout shift under the cursor leave→enter fires
  // a second morph before the active solid state can stick.
  useEffect(() => {
    if (!isActive || !pendingNavSettleRef.current) return;
    pendingNavSettleRef.current = false;

    clearTapTimer();
    clearSettleTimer();
    // Hold isTapped through the morph-in so a mouseleave mid-nav doesn't
    // kill the press feedback early; then clear hover+tap together.
    settleTimeoutRef.current = setTimeout(() => {
      setIsTapped(false);
      setIsHovered(false);
      ignoreHoverUntilRef.current =
        performance.now() + POST_NAV_HOVER_IGNORE_MS;
    }, morphMs);

    return () => clearSettleTimer();
  }, [isActive, morphMs]);

  // Don't let mouseleave clear the press morph while we're settling into the
  // active solid state after a nav commit — that off/on pair was the flicker.
  const onLinkMouseLeave = () => {
    if (pendingNavSettleRef.current || settleTimeoutRef.current) {
      setIsHovered(false);
      return;
    }
    setIsHovered(false);
    disarmTap();
  };

  // Global sticky-hover killer: any touch on the page clears isHovered.
  // Hybrid / "desktop site" mobile browsers can report hover:hover and leave
  // mouseenter stuck with no mouseleave — mobile itself has no hover.
  useEffect(() => {
    const onTouchStart = () => setIsHovered(false);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    return () => window.removeEventListener("touchstart", onTouchStart);
  }, []);

  useEffect(() => () => {
    clearTapTimer();
    clearSettleTimer();
  }, []);

  return (
    <Link
      href={href}
      prefetch
      aria-current={isActive ? "page" : undefined}
      className="nav-link"
      data-ui-sound="option"
      style={{
        position: "relative",
        textDecoration: "none",
        fontSize: 16,
        fontWeight: 400,
        lineHeight: "24px",
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
        // Drops the old 300ms double-tap-zoom delay and reduces gesture
        // conflicts that can swallow the follow-up click on mobile.
        touchAction: "manipulation",
      }}
      // Guarded — without this, a tap on touch devices can trigger a
      // synthetic mouseenter with no matching mouseleave ever firing (no
      // cursor to leave), leaving isHovered stuck true forever.
      onMouseEnter={() => {
        if (performance.now() < ignoreHoverUntilRef.current) return;
        if (canHover()) setIsHovered(true);
        warmPrimary(href);
        if (PRIMARY_NAV.has(href)) router.prefetch(href);
      }}
      onMouseLeave={onLinkMouseLeave}
      // A real tap fires pointerup (often <150ms after pointerdown) and then
      // click/navigation almost immediately after that — well before the
      // ~200ms "in" spring has become visible. Resetting isTapped on
      // pointerup cut the effect off before it could ever be seen. Instead,
      // leave it active through the tap; the post-nav settle / mouseleave
      // clears it after one morph-in.
      //
      // On touch, we also *commit navigation on pointerup*. Relying on the
      // later click is what made taps sometimes flash the morph (pointerdown)
      // without ever changing route — slight finger movement cancels click
      // while leaving isTapped on. Unmodified left-clicks use router.push so
      // archive isn't stuck waiting on Sanity; cmd/middle-click stay native.
      onPointerDown={(e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        warmPrimary(href);
        if (PRIMARY_NAV.has(href)) router.prefetch(href);

        if (e.pointerType === "touch" || e.pointerType === "pen") {
          setIsHovered(false);
        }

        pressRef.current = {
          pointerId: e.pointerId,
          x: e.clientX,
          y: e.clientY,
          pointerType: e.pointerType,
        };
        armTap();
      }}
      onPointerUp={(e) => {
        const press = pressRef.current;
        if (!press || press.pointerId !== e.pointerId) return;
        pressRef.current = null;

        const dx = Math.abs(e.clientX - press.x);
        const dy = Math.abs(e.clientY - press.y);
        if (dx > TAP_MOVE_THRESHOLD_PX || dy > TAP_MOVE_THRESHOLD_PX) {
          disarmTap();
          return;
        }

        if (press.pointerType === "touch" || press.pointerType === "pen") {
          touchNavRef.current = true;
          // If the ghost click never arrives, don't leave the flag stuck
          // blocking the *next* real tap's click handler.
          window.setTimeout(() => {
            touchNavRef.current = false;
          }, 500);

          // Same-route tap: keep morph feedback, skip a useless push that
          // only races the work shell wake and can kill the animation.
          if (isAlreadyShowingPrimary(href, pathname)) return;

          markNavCommit();
          commitPrimary(href);
          router.push(href);
          return;
        }

        // Mouse: soft-nav flag belongs with the actual click, not the press.
      }}
      onPointerCancel={() => {
        pressRef.current = null;
        disarmTap();
      }}
      onClick={(e) => {
        if (touchNavRef.current) {
          // Already navigated on pointerup — block the ghost click.
          e.preventDefault();
          touchNavRef.current = false;
          return;
        }
        if (isAlreadyShowingPrimary(href, pathname)) {
          // Already here — don't soft-nav / re-push.
          e.preventDefault();
          return;
        }
        // cmd/ctrl/shift/middle-click: keep native Link (new tab).
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
          if (PRIMARY_NAV.has(href)) markSoftNav();
          return;
        }
        markNavCommit();
        commitPrimary(href);
        // Keep-alive shells are already in the tree; push() syncs the URL.
        // cmd/middle-click stay native above.
        e.preventDefault();
        router.push(href);
      }}
    >
      <span
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clipPath: "inset(50%)",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <OutlineMorphWord label={label} active={morphOn} emphasized={!!isActive} />
    </Link>
  );
}
