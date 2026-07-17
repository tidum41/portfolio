"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const dark = saved !== "light";
    setIsDark(dark);
  }, []);

  const toggle = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    const theme = newDark ? "dark" : "light";
    const html = document.documentElement;
    html.classList.add("theme-switching");
    html.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    setTimeout(() => html.classList.remove("theme-switching"), 300);
  };

  // Reduced-motion: keep the opacity crossfade (aids comprehension), drop
  // scale and blur (position/filter changes removed per prefers-reduced-motion).
  const spring = reduced
    ? { duration: 0.15 }
    : { type: "spring" as const, duration: 0.3, bounce: 0 };

  const visibleAnim   = { opacity: 1, scale: 1,                       filter: "blur(0px)" };
  const hiddenAnim    = { opacity: 0, scale: reduced ? 1 : 0.25,      filter: reduced ? "blur(0px)" : "blur(4px)" };

  return (
    <button
      onClick={toggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="nav-link theme-toggle-btn"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "4px",
        color: isHovered ? "var(--color-text-primary)" : "var(--color-text-muted)",
        display: "flex",
        alignItems: "center",
        lineHeight: 0,
        transition: "color 0.25s ease",
        WebkitTapHighlightColor: "transparent",
        // Fixed size so stacked absolute icons don't shift layout
        position: "relative",
        width: 15,
        height: 15,
      }}
    >
      <motion.span
        aria-hidden
        style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
        initial={false}
        animate={isDark ? visibleAnim : hiddenAnim}
        transition={spring}
      >
        <SunIcon />
      </motion.span>
      <motion.span
        aria-hidden
        style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
        initial={false}
        animate={isDark ? hiddenAnim : visibleAnim}
        transition={spring}
      >
        <MoonIcon />
      </motion.span>
    </button>
  );
}
