"use client";

/**
 * Side-effect polyfill for iOS/macOS Safari `navigator.vibrate`.
 * Kept on this demo route only — do not import from the root layout
 * (it overlays/wraps DOM and can fight the custom cursor + portals).
 *
 * iOS 18.4+ policy we honor here:
 * - Never call enableMainThreadBlocking (perf poison)
 * - Keep patterns under ~1s (see lib/haptics.ts)
 * - Prefer click / pointerup; drag demos are labeled as unreliable
 */
import "ios-vibrator-pro-max";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  HAPTIC_PRESETS,
  HAPTIC_SAFE_BUDGET_MS,
  detectHapticEnvironment,
  haptic,
  type HapticPattern,
  type HapticResult,
} from "@/lib/haptics";

type LogEntry = {
  id: number;
  at: string;
  label: string;
  result: HapticResult;
  source: "click" | "pointerup" | "input" | "pointermove";
};

function formatPattern(pattern: HapticPattern): string {
  return typeof pattern === "number" ? `${pattern}ms` : `[${pattern.join(", ")}]`;
}

export default function HapticsDemoClient() {
  const env = useMemo(() => detectHapticEnvironment(), []);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [lastTickAt, setLastTickAt] = useState(0);
  const [dragArmed, setDragArmed] = useState(false);

  const pushLog = useCallback((label: string, result: HapticResult, source: LogEntry["source"]) => {
    const at = new Date().toLocaleTimeString();
    setLog((prev) => [{ id: Date.now() + Math.random(), at, label, result, source }, ...prev].slice(0, 24));
  }, []);

  const fire = useCallback((label: string, pattern: HapticPattern, source: LogEntry["source"]) => {
    const result = haptic(pattern);
    pushLog(label, result, source);
  }, [pushLog]);

  useEffect(() => {
    // Document that polyfill is loaded for the log header.
    pushLog("polyfill ready", { ok: true, durationMs: 0 }, "click");
  }, [pushLog]);

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "calc(var(--nav-h) + 32px) var(--page-px) 80px",
        fontFamily: "var(--font-sans)",
        color: "var(--color-text-primary)",
      }}
    >
      <p style={{ fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-text-tertiary)", margin: "0 0 12px" }}>
        Dev demo · not linked from nav
      </p>
      <h1 style={{ fontFamily: "var(--font-page-title)", fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 500, margin: "0 0 12px", letterSpacing: "-0.02em" }}>
        Haptics
      </h1>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--color-text-secondary)", margin: "0 0 28px", maxWidth: 540 }}>
        Demo of <code style={codeStyle}>ios-vibrator-pro-max</code> under iOS 18.4+ rules:
        click-gated grant (~1s), no main-thread blocking, patterns capped at {HAPTIC_SAFE_BUDGET_MS}ms.
        Expect little/nothing on most MacBooks; best signal is a physical iPhone.
      </p>

      <section style={cardStyle}>
        <h2 style={h2Style}>Environment</h2>
        <dl style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px", margin: 0, fontSize: 13 }}>
          <EnvRow label="navigator.vibrate" value={String(env.vibrateApi)} />
          <EnvRow label="coarse pointer" value={String(env.coarsePointer)} />
          <EnvRow label="Apple touch UA" value={String(env.isAppleTouch)} />
          <EnvRow label="Safari-ish UA" value={String(env.isSafari)} />
          <EnvRow label="platform" value={env.platform} />
          <EnvRow label="safe budget" value={`${HAPTIC_SAFE_BUDGET_MS}ms`} />
        </dl>
      </section>

      <section style={cardStyle}>
        <h2 style={h2Style}>Click-gated presets (iOS 18.4–safe)</h2>
        <p style={helpStyle}>
          These run inside <code style={codeStyle}>onClick</code> — the only gesture Apple still trusts after 18.4.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {(Object.entries(HAPTIC_PRESETS) as [keyof typeof HAPTIC_PRESETS, HapticPattern][]).map(([key, pattern]) => (
            <button
              key={key}
              type="button"
              onClick={() => fire(`${key} ${formatPattern(pattern)}`, pattern, "click")}
              style={btnStyle}
            >
              {key}
              <span style={{ opacity: 0.45, fontWeight: 400, marginLeft: 6 }}>{formatPattern(pattern)}</span>
            </button>
          ))}
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={h2Style}>Slider (onInput)</h2>
        <p style={helpStyle}>
          Range inputs can still tick on some iOS builds; treat as experimental. Pattern is a light tick, throttled.
        </p>
        <input
          type="range"
          min={0}
          max={100}
          defaultValue={40}
          onInput={() => {
            const now = performance.now();
            if (now - lastTickAt < 40) return;
            setLastTickAt(now);
            fire("slider tick", HAPTIC_PRESETS.tick, "input");
          }}
          style={{ width: "100%" }}
        />
      </section>

      <section style={cardStyle}>
        <h2 style={h2Style}>Drag scrub (often broken on iOS 18.4+)</h2>
        <p style={helpStyle}>
          Apple no longer counts drag as a trusted haptic grant. Arm with a tap, then drag —
          ticks may work briefly inside the ~1s window, then die. This is intentional demo of the limit.
        </p>
        <button type="button" onClick={() => { setDragArmed(true); fire("drag armed", HAPTIC_PRESETS.tap, "click"); }} style={{ ...btnStyle, marginBottom: 12 }}>
          {dragArmed ? "Armed — drag below" : "Tap to arm drag haptics"}
        </button>
        <div
          role="presentation"
          onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
          onPointerMove={(e) => {
            if (!dragArmed || e.buttons === 0) return;
            const now = performance.now();
            if (now - lastTickAt < 55) return;
            setLastTickAt(now);
            fire("drag tick", HAPTIC_PRESETS.tick, "pointermove");
          }}
          style={{
            height: 120,
            borderRadius: "var(--radius-card)",
            border: "1px dashed var(--color-border-subtle)",
            background: "var(--color-placeholder)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-text-tertiary)",
            fontSize: 13,
            touchAction: "none",
            userSelect: "none",
          }}
        >
          Drag here after arming
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={h2Style}>Blocked on purpose</h2>
        <p style={helpStyle}>
          Patterns over {HAPTIC_SAFE_BUDGET_MS}ms are rejected — the polyfill would need{" "}
          <code style={codeStyle}>enableMainThreadBlocking(true)</code>, which freezes the UI.
        </p>
        <button
          type="button"
          onClick={() => fire("2s pattern (rejected)", 2000, "click")}
          style={btnStyle}
        >
          Try 2000ms (should fail safely)
        </button>
      </section>

      <section style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
          <h2 style={{ ...h2Style, margin: 0 }}>Log</h2>
          <button type="button" onClick={() => setLog([])} style={{ ...btnStyle, padding: "4px 10px", fontSize: 12 }}>
            Clear
          </button>
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0", fontSize: 12, fontFamily: "var(--font-mono)", lineHeight: 1.55 }}>
          {log.length === 0 && (
            <li style={{ color: "var(--color-text-tertiary)" }}>No events yet.</li>
          )}
          {log.map((entry) => (
            <li key={entry.id} style={{ color: entry.result.ok ? "var(--color-text-secondary)" : "#c45c5c" }}>
              [{entry.at}] {entry.source} · {entry.label} →{" "}
              {entry.result.ok
                ? `ok (${entry.result.durationMs}ms)`
                : `fail:${entry.result.reason}${entry.result.error ? ` (${entry.result.error})` : ""}`}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function EnvRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt style={{ color: "var(--color-text-tertiary)", margin: 0 }}>{label}</dt>
      <dd style={{ margin: "2px 0 0", fontFamily: "var(--font-mono)", fontSize: 12 }}>{value}</dd>
    </div>
  );
}

const codeStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.92em",
  color: "var(--color-text-primary)",
};

const cardStyle: CSSProperties = {
  marginBottom: 20,
  padding: 16,
  borderRadius: "var(--radius-panel)",
  border: "1px solid var(--color-border-subtle)",
  background: "color-mix(in srgb, var(--color-bg) 92%, var(--color-text-primary) 4%)",
};

const h2Style: CSSProperties = {
  fontSize: 15,
  fontWeight: 500,
  margin: "0 0 8px",
};

const helpStyle: CSSProperties = {
  fontSize: 13,
  lineHeight: 1.5,
  color: "var(--color-text-tertiary)",
  margin: "0 0 14px",
};

const btnStyle: CSSProperties = {
  appearance: "none",
  border: "1px solid var(--color-border-subtle)",
  background: "var(--color-bg)",
  color: "var(--color-text-primary)",
  borderRadius: 8,
  padding: "8px 12px",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
};
