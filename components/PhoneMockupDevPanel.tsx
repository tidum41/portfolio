"use client";

import { useState, useEffect } from "react";
import type { PhoneMockupValues } from "./PhoneMockup";

const DEFAULTS: PhoneMockupValues = {
  insetTop: 9,
  insetBottom: 3,
  insetSide: 4,
  screenRadius: 12,
  videoX: 0,
  videoY: 0,
  videoScale: 1,
};

function Slider({
  label,
  value,
  min,
  max,
  step = 0.5,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 11, color: "#888", fontFamily: "monospace" }}>{label}</span>
        <span style={{ fontSize: 12, color: "#222", fontFamily: "monospace", fontWeight: 600 }}>
          {value.toFixed(1)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: "#2E7D32" }}
      />
    </div>
  );
}

export default function PhoneMockupDevPanel() {
  const [open, setOpen] = useState(false);
  const [vals, setVals] = useState<PhoneMockupValues>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  // Emit values to all PhoneMockup instances on the page
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("phone-mockup-update", { detail: vals }));
  }, [vals]);

  const set = (key: keyof PhoneMockupValues) => (v: number) =>
    setVals((prev) => ({ ...prev, [key]: v }));

  const reset = () => setVals(DEFAULTS);

  const copyValues = () => {
    const lines = Object.entries(vals)
      .map(([k, v]) => `  ${k}={${v.toFixed(1)}}`)
      .join("\n");
    navigator.clipboard.writeText(`<PhoneMockup\n${lines}\n/>`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: 24,
        zIndex: 9999,
        fontFamily: "var(--font-sans, system-ui)",
      }}
    >
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        title="PhoneMockup dev panel"
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: open ? "#2E7D32" : "#222",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
          transition: "background 150ms ease",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="3" width="14" height="2" rx="1" fill="white" />
          <rect x="1" y="7" width="14" height="2" rx="1" fill="white" />
          <rect x="1" y="11" width="14" height="2" rx="1" fill="white" />
          <circle cx="5" cy="4" r="2" fill="#2E7D32" stroke="white" strokeWidth="1.5" />
          <circle cx="10" cy="8" r="2" fill="#2E7D32" stroke="white" strokeWidth="1.5" />
          <circle cx="6" cy="12" r="2" fill="#2E7D32" stroke="white" strokeWidth="1.5" />
        </svg>
      </button>

      {/* Panel */}
      {open && (
        <div
          style={{
            position: "absolute",
            bottom: 44,
            left: 0,
            width: 240,
            background: "white",
            borderRadius: 10,
            boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            border: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#222" }}>PhoneMockup</span>
            <button
              onClick={reset}
              style={{
                fontSize: 11,
                color: "#888",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                textDecoration: "underline",
              }}
            >
              reset
            </button>
          </div>

          <div style={{ borderTop: "1px solid #eee", paddingTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={{ fontSize: 10, color: "#aaa", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>Screen insets (%)</span>
            <Slider label="insetTop"    value={vals.insetTop}    min={0} max={20} onChange={set("insetTop")} />
            <Slider label="insetBottom" value={vals.insetBottom} min={0} max={20} onChange={set("insetBottom")} />
            <Slider label="insetSide"   value={vals.insetSide}   min={0} max={20} onChange={set("insetSide")} />
            <Slider label="screenRadius" value={vals.screenRadius} min={0} max={30} onChange={set("screenRadius")} />
          </div>

          <div style={{ borderTop: "1px solid #eee", paddingTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={{ fontSize: 10, color: "#aaa", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>Video pan/zoom</span>
            <Slider label="videoX (%)"   value={vals.videoX}     min={-50} max={50} onChange={set("videoX")} />
            <Slider label="videoY (%)"   value={vals.videoY}     min={-50} max={50} onChange={set("videoY")} />
            <Slider label="videoScale"   value={vals.videoScale} min={0.5} max={2} step={0.05} onChange={set("videoScale")} />
          </div>

          <button
            onClick={copyValues}
            style={{
              background: copied ? "#2E7D32" : "#222",
              color: "white",
              border: "none",
              borderRadius: 6,
              padding: "7px 0",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              transition: "background 150ms ease",
            }}
          >
            {copied ? "Copied!" : "Copy JSX values"}
          </button>
        </div>
      )}
    </div>
  );
}
