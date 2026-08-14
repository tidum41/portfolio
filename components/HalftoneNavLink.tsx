"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion, useTransform } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";
import { HalftoneDotField } from "./HalftoneDotField";
import { useHalftoneMorph } from "./useHalftoneMorph";
import { markSoftNav } from "@/lib/instantNav";

const PRIMARY_NAV = new Set(["/", "/about", "/archive"]);

// Shared between the base span's own inline style and the dot-field's mask
// bake, so the two can't drift apart (see useHalftoneMorph.ts's comment on
// how exactly this kind of duplication caused the old opacity bug).
// lineHeightPx matters for alignment too — the bake uses it to reproduce
// the exact baseline position CSS line-height centering puts the real text
// at, see halftoneMask.ts's buildTextMask.
const TEXT_STYLE = { fontWeight: 400, fontSizePx: 16, lineHeightPx: 24 };

type NavLinkDials = {
  enabled: boolean;
  keepEffectOn: boolean;
  bouncePhysics?: { textEndScale?: number; dotsEndScale?: number };
  showHideSpeed?: { showDurationMs?: number; hideDurationMs?: number };
};

interface HalftoneNavLinkProps {
  href: string;
  label: string;
  isActive: boolean;
  dk: NavLinkDials;
}

export default function HalftoneNavLink({ href, label, isActive, dk }: HalftoneNavLinkProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const pathname = usePathname();

  const baseColor = isActive ? "var(--color-text-primary)" : "var(--color-text-muted)";
  const hoverColor = "var(--color-text-primary)"; // Or read from dk
  
  // isHovered drives desktop; isTapped is the touch equivalent. Hover also
  // works on the current page's own link (work on `/`) so the morph doesn't
  // look like it "skipped" that item. dk.keepEffectOn pins the effect while
  // dragging DialKit sliders.
  const active = dk.enabled ? (dk.keepEffectOn || isHovered || isTapped) : false;

  const { filterId, t } = useHalftoneMorph(dk, active);
  const reduced = useReducedMotion();

  // Scale is still a pure function of the same `t` that drives the dot
  // field's own per-dot sweep (see HalftoneDotField) — the overlay is never a
  // static end-state fading in, it's visibly changing shape as it becomes
  // visible, which is what actually reads as a morph instead of a crossfade.
  const baseScale = useTransform(t, [0, 1], [1, dk.bouncePhysics?.textEndScale ?? 1]);
  const overlayScale = useTransform(t, [0, 1], [1, dk.bouncePhysics?.dotsEndScale ?? 1]);

  // Overlay uses the long hide tween; base type restores faster. The settle
  // spring collapses `t` (empty dots) well before hideDurationMs, so a 550ms
  // complementary fade left both layers empty — the label vanished.
  const showMs = dk?.showHideSpeed?.showDurationMs ?? 220;
  const hideMs = dk?.showHideSpeed?.hideDurationMs ?? 550;
  const overlayMs = reduced ? 1 : active ? showMs : hideMs;
  const baseMs = reduced ? 1 : active ? showMs : Math.min(hideMs, 120);
  const overlayTransition = { duration: overlayMs / 1000, ease: "easeInOut" as const };
  const baseTransition = { duration: baseMs / 1000, ease: "easeInOut" as const };

  // Clicking a nav item does not fire mouseleave (pointer never left). After
  // the route commits, restore hover if the cursor is still on this link.
  useLayoutEffect(() => {
    const el = linkRef.current;
    if (!el) return;
    if (
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      el.matches(":hover")
    ) {
      setIsHovered(true);
    }
  }, [pathname]);

  return (
    <Link
      ref={linkRef}
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
        touchAction: "manipulation",
      }}
      // Guarded like VolumeControl.tsx's onEnter — without this, a tap on
      // touch devices can trigger a synthetic mouseenter with no matching
      // mouseleave ever firing (no cursor to leave), leaving isHovered
      // stuck true forever and the link permanently dimmed/halftoned.
      onMouseEnter={() => {
        if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) setIsHovered(true);
        if (href === "/archive") {
          void import("@/app/archive/ArchivePageClient");
          void import("@/components/BentoGallery");
        } else if (href === "/about") {
          void import("@/components/AboutPageContent");
        }
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsTapped(false);
      }}
      // A real tap fires pointerup (often <150ms after pointerdown) and then
      // click/navigation almost immediately after that — well before the
      // ~200ms "in" spring has become visible. Resetting isTapped on
      // pointerup cut the effect off before it could ever be seen. Instead,
      // leave it active through the tap. The timeout is a failsafe if
      // navigation doesn't happen (e.g. a modifier-click opening a new tab).
      onPointerDown={() => {
        if (href === "/archive") {
          void import("@/app/archive/ArchivePageClient");
          void import("@/components/BentoGallery");
        } else if (href === "/about") {
          void import("@/components/AboutPageContent");
        }
        // Soft-skip the route opacity crossfade for primary chrome navigations
        // (work / about / archive). Do not snap-kill hover: the pointer is
        // still on the link, and killing it raced the settle spring against
        // the 550ms hide tween so the label went fully transparent.
        if (PRIMARY_NAV.has(href)) {
          markSoftNav();
          return;
        }
        setIsTapped(true);
        if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = setTimeout(() => setIsTapped(false), 1000);
      }}
      onClick={() => {
        // Keyboard navigation has no pointerdown, so commit the same
        // soft-nav skip at click time. Repeated calls are harmless.
        if (PRIMARY_NAV.has(href)) markSoftNav();
      }}
      onPointerCancel={() => {
        if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
        setIsTapped(false);
      }}
    >
      {/* Base Text (Solid) */}
      <motion.span
        style={{
          scale: baseScale,
          color: baseColor,
          fontWeight: TEXT_STYLE.fontWeight,
          fontSize: TEXT_STYLE.fontSizePx,
          position: "relative",
          zIndex: 1,
          display: "inline-flex",
          alignItems: "center",
          willChange: "transform, opacity",
        }}
        initial={false}
        animate={{ opacity: active ? 0 : 1 }}
        transition={baseTransition}
      >
        {label}
      </motion.span>

      {/* Halftone Overlay (independently-animated dots, see HalftoneDotField) */}
      <motion.span
        aria-hidden
        style={{
          scale: overlayScale,
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
          willChange: "transform, opacity",
        }}
        initial={false}
        animate={{ opacity: active ? 1 : 0 }}
        transition={overlayTransition}
      >
        <HalftoneDotField
          id={filterId}
          dk={dk}
          hoverColor={hoverColor}
          t={t}
          content={{ type: "text", text: label, fontWeight: TEXT_STYLE.fontWeight, fontSizePx: TEXT_STYLE.fontSizePx, lineHeightPx: TEXT_STYLE.lineHeightPx }}
        />
      </motion.span>
    </Link>
  );
}
