"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useId } from "react";
import { HalftoneFilterDef } from "./HalftoneFilterDef";

export default function HalftoneNavLink({ href, label, isActive, dk }: any) {
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const rawId = useId();
  const filterId = "halftone-" + rawId.replace(/[^a-zA-Z0-9]/g, "");

  const baseColor = isActive ? "var(--color-text-primary)" : "var(--color-text-muted)";
  const hoverColor = "var(--color-text-primary)"; // Or read from dk
  // The effect plays on hover. If it's already the active page, don't show the hover effect.
  // We use `isHovered` for desktop, and because mobile Safari treats a tap as a hover (which persists until nav),
  // this automatically covers the "animate on tap then reverse" requirement for mobile.
  const isEffectActive = !isActive && isHovered && dk.enabled;

  // Spring physics: Fast morph in, slow morph out
  const springConfig = {
    type: "spring",
    stiffness: isEffectActive ? (dk.stiffnessIn ?? 150) : (dk.stiffnessOut ?? 40),
    damping: isEffectActive ? (dk.dampingIn ?? 15) : (dk.dampingOut ?? 12),
  };

  // --- SVG Filter Pipeline ---
  const dotSize = dk.dotSize ?? 4;

  return (
    <Link
      href={href}
      prefetch
      aria-current={isActive ? "page" : undefined}
      className="nav-link"
      style={{
        position: "relative",
        textDecoration: "none",
        fontSize: 16,
        fontWeight: 400,
        lineHeight: "24px",
        outline: "none",
        userSelect: "none",
        WebkitTapHighlightColor: "transparent"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsTapped(false);
      }}
      onPointerDown={() => setIsTapped(true)}
      onPointerUp={() => setIsTapped(false)}
      onPointerCancel={() => setIsTapped(false)}
    >
      {/* SVG Filter Definition */}
      <HalftoneFilterDef id={filterId} dk={dk} hoverColor={hoverColor} />

      {/* Base Text (Solid) */}
      <motion.span
        initial={false}
        animate={{
          opacity: isEffectActive ? 0 : 1,
          scale: isEffectActive ? (dk.hoverScaleBase ?? 0.95) : 1,
        }}
        transition={springConfig}
        style={{
          color: baseColor,
          position: "relative",
          zIndex: 1,
          display: "inline-flex",
          alignItems: "center",
          willChange: "transform, opacity",
        }}
      >
        {label}
      </motion.span>

      {/* Halftone Overlay Text (Filtered) */}
      <motion.span
        aria-hidden
        initial={false}
        animate={{
          opacity: isEffectActive ? 1 : 0.0001,
          scale: isEffectActive ? (dk.hoverScaleHalf ?? 1.05) : 1,
        }}
        transition={springConfig}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
          
          // Apply the SVG Filter
          filter: `url(#${filterId})`,
          
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center", // ensure alignment matches
          
          color: hoverColor, // fallback/source color
          willChange: "transform, opacity, filter",
        }}
      >
        {label}
      </motion.span>
    </Link>
  );
}
