"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useId } from "react";

export default function HalftoneNavLink({ href, label, isActive, dk }: any) {
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const rawId = useId();
  const filterId = "halftone-" + rawId.replace(/[^a-zA-Z0-9]/g, "");

  const baseColor = isActive ? "var(--color-text-muted)" : "var(--color-text-primary)";
  const hoverColor = "var(--color-text-primary)"; // Or read from dk
  
  // Spring physics
  const springConfig = {
    type: "spring",
    stiffness: dk.stiffness ?? 400,
    damping: dk.damping ?? 30,
  };
  
  const isEffectActive = isHovered && !isTapped && dk.enabled;

  // --- SVG Filter Pipeline ---
  const dotSize = dk.dotSize ?? 4;
  
  // Generate soft dot pattern
  const svgPattern = `<svg width="${dotSize}" height="${dotSize}" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="g" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-opacity="1" stop-color="white" /><stop offset="100%" stop-opacity="0" stop-color="white" /></radialGradient></defs><circle cx="${dotSize / 2}" cy="${dotSize / 2}" r="${dotSize / 2}" fill="url(#g)" /></svg>`;
  
  const dataUri = `data:image/svg+xml,${encodeURIComponent(svgPattern)}`;

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
      <svg width="0" height="0" style={{ position: "absolute", pointerEvents: "none", color: hoverColor }}>
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation={dk.blurAmount ?? 1.5} result="blurredText" />
            
            <feImage href={dataUri} x="0" y="0" width={dotSize} height={dotSize} preserveAspectRatio="none" result="dot" />
            <feTile in="dot" result="pattern" />
            
            <feComposite 
              in="blurredText" 
              in2="pattern" 
              operator="arithmetic" 
              k1="1" 
              k2="0" 
              k3="0" 
              k4="0" 
              result="added" 
            />
            
            <feColorMatrix type="matrix" in="added" values={`
              0 0 0 0 1
              0 0 0 0 1
              0 0 0 0 1
              0 0 0 ${dk.thresholdMult ?? 20} -${(dk.thresholdOffset ?? 20) / 10}
            `} result="halftoneMask" />
            
            <feFlood floodColor="currentColor" result="flood" />
            <feComposite in="flood" in2="halftoneMask" operator="in" />
          </filter>
        </defs>
      </svg>

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
        }}
      >
        {label}
      </motion.span>

      {/* Halftone Overlay Text (Filtered) */}
      <motion.span
        aria-hidden
        initial={false}
        animate={{
          opacity: isEffectActive ? 1 : 0,
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
        }}
      >
        {label}
      </motion.span>
    </Link>
  );
}
