"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { useThemeTransitionMode } from "@/hooks/useThemeTransitionMode";
import type { ThemeTransitionMode } from "@/lib/theme-transition/preference";
import { setThemeTransitionMode } from "@/lib/theme-transition/preference";

const MODES: { id: ThemeTransitionMode; label: string; hint: string }[] = [
  { id: "default", label: "Instant", hint: "Snap with no mask" },
  { id: "dither", label: "A — Bayer dither", hint: "Default. 2px grain, ~440ms, reverses mid-click" },
  { id: "halftone", label: "B — Halftone dots", hint: "Radial dot grid ~500ms, also reversible" },
];

function syncQueryParam(mode: ThemeTransitionMode) {
  const url = new URL(window.location.href);
  if (mode === "default") url.searchParams.delete("transition");
  else url.searchParams.set("transition", mode);
  window.history.replaceState({}, "", url.toString());
}

export default function ThemeTransitionLabClient() {
  const [mode, setModeState] = useThemeTransitionMode();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const read = () =>
      setIsDark(document.documentElement.getAttribute("data-theme") !== "light");
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

  const setMode = useCallback(
    (next: ThemeTransitionMode) => {
      setThemeTransitionMode(next);
      setModeState(next);
      syncQueryParam(next);
    },
    [setModeState],
  );

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--color-bg)",
        color: "var(--color-text-primary)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          borderBottom: "1px solid var(--color-border-subtle)",
          background: "color-mix(in srgb, var(--color-bg) 92%, transparent)",
          backdropFilter: "blur(8px)",
          padding: "12px var(--page-px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)", letterSpacing: "0.06em" }}>
            DEV · THEME TRANSITION LAB
          </p>
          <h1 style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 500 }}>Light / dark prototypes</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" className="nav-link" style={{ fontSize: 14 }}>
            Home
          </Link>
          <div data-testid="lab-theme-toggle">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "32px var(--page-px) 80px" }}>
        <p style={{ lineHeight: 1.65, color: "var(--color-text-secondary)", marginTop: 0 }}>
          Bayer dither is the default theme change. Pick another mode, then use the toggle (top right).
          The choice sticks for this tab. Add <code>?transition=halftone</code>, <code>?transition=dither</code>,
          or <code>?transition=default</code> to override. Click again while a mask is running and it reverses
          from the current frame.
        </p>

        <fieldset
          style={{
            border: "1px solid var(--color-border-subtle)",
            borderRadius: "var(--radius-panel)",
            padding: 16,
            margin: "24px 0",
          }}
        >
          <legend style={{ padding: "0 6px", fontSize: 13, color: "var(--color-text-muted)" }}>
            Transition mode
          </legend>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {MODES.map((m) => (
              <label
                key={m.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  cursor: "pointer",
                  padding: "8px 10px",
                  borderRadius: "var(--radius-control)",
                  background: mode === m.id ? "var(--color-accent-subtle)" : "transparent",
                }}
              >
                <input
                  type="radio"
                  name="transition-mode"
                  checked={mode === m.id}
                  onChange={() => setMode(m.id)}
                  style={{ marginTop: 3 }}
                />
                <span>
                  <strong style={{ fontWeight: 500 }}>{m.label}</strong>
                  <br />
                  <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{m.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <section
          aria-label="Sample content"
          style={{
            borderRadius: "var(--radius-panel)",
            border: "1px solid var(--color-border-subtle)",
            padding: 24,
            background: "color-mix(in srgb, var(--color-bg) 70%, var(--color-warm-bg))",
          }}
        >
          <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--color-text-muted)" }}>
            Current theme: <strong>{isDark ? "dark" : "light"}</strong> · Active transition:{" "}
            <strong>{mode}</strong>
          </p>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 400, margin: "0 0 16px" }}>
            Sample mosaic card
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 12,
            }}
          >
            {["#9590C2", "#2D68C4", "#EBE6DF", "#2E2E2E"].map((c) => (
              <div
                key={c}
                style={{
                  aspectRatio: "4/3",
                  borderRadius: "var(--radius-mosaic)",
                  background: c,
                  opacity: isDark ? 0.85 : 1,
                }}
              />
            ))}
          </div>
          <p style={{ margin: "20px 0 0", fontSize: 14, lineHeight: 1.6, color: "var(--color-text-secondary)" }}>
            Toggle several times in each direction to judge crispness, timing, and whether the origin from the
            nav button feels right. With <code>prefers-reduced-motion</code>, prototypes fall back to a short
            crossfade.
          </p>
        </section>

        <p style={{ marginTop: 32, fontSize: 13, color: "var(--color-text-muted)" }}>
          Try on the real homepage:{" "}
          <Link href={`/?transition=${mode === "default" ? "dither" : mode}`}>/?transition=…</Link>
        </p>
      </main>
    </div>
  );
}
