"use client";

import { useState } from "react";

const INSTANCES = [
  { key: "hero",      label: "Hero",              sanityField: "heroPhonePos" },
  { key: "d2",        label: "Decision 2",         sanityField: "d2PhonePos" },
  { key: "d3-before", label: "Decision 3 — before", sanityField: "d3BeforePhonePos" },
  { key: "d3-after",  label: "Decision 3 — after",  sanityField: "d3AfterPhonePos" },
  { key: "solution",  label: "Solution",           sanityField: "solutionPhonePos" },
];

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
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 10, color: "#888", fontFamily: "monospace" }}>{label}</span>
        <span style={{ fontSize: 11, color: "#222", fontFamily: "monospace", fontWeight: 600 }}>
          {value.toFixed(2)}
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

type Vals = {
  videoX: number; videoY: number; videoScale: number;
  insetTop: number; insetBottom: number; insetSide: number; screenRadius: number;
};

const DEFAULTS: Vals = {
  insetTop: 1.5, insetBottom: 1.5, insetSide: 4,
  screenRadius: 7.5, videoX: 0, videoY: 0, videoScale: 1,
};

// Read / write dialkit localStorage so changes reflect live in the phone
function dialKey(instanceKey: string) {
  return `dialkit/PhoneMockup/${instanceKey}`;
}

function readDialkit(instanceKey: string): Vals {
  try {
    const raw = localStorage.getItem(dialKey(instanceKey));
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { return { ...DEFAULTS }; }
}

function writeDialkit(instanceKey: string, vals: Vals) {
  try {
    localStorage.setItem(dialKey(instanceKey), JSON.stringify(vals));
    // Trigger storage event so dialkit picks it up
    window.dispatchEvent(new StorageEvent("storage", {
      key: dialKey(instanceKey),
      newValue: JSON.stringify(vals),
      storageArea: localStorage,
    }));
  } catch { /* noop */ }
}

export default function PhoneMockupDevPanel() {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const instance = INSTANCES[activeIdx];

  const [vals, setValsState] = useState<Vals>(() => readDialkit(INSTANCES[0].key));

  function switchInstance(idx: number) {
    setActiveIdx(idx);
    setValsState(readDialkit(INSTANCES[idx].key));
  }

  function setVal(key: keyof Vals) {
    return (v: number) => {
      const next = { ...vals, [key]: v };
      setValsState(next);
      writeDialkit(instance.key, next);
    };
  }

  function reset() {
    const next = { ...DEFAULTS };
    setValsState(next);
    writeDialkit(instance.key, next);
  }

  function copySanity() {
    const json = JSON.stringify({
      videoX:       parseFloat(vals.videoX.toFixed(2)),
      videoY:       parseFloat(vals.videoY.toFixed(2)),
      videoScale:   parseFloat(vals.videoScale.toFixed(2)),
      insetTop:     parseFloat(vals.insetTop.toFixed(2)),
      insetBottom:  parseFloat(vals.insetBottom.toFixed(2)),
      insetSide:    parseFloat(vals.insetSide.toFixed(2)),
      screenRadius: parseFloat(vals.screenRadius.toFixed(2)),
    }, null, 2);
    navigator.clipboard.writeText(
      `// Paste into Sanity > ${instance.sanityField}\n${json}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div style={{ position: "fixed", bottom: 24, left: 24, zIndex: 9999, fontFamily: "var(--font-sans, system-ui)" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        title="PhoneMockup dev panel"
        style={{
          width: 36, height: 36, borderRadius: "50%",
          background: open ? "#2E7D32" : "#222",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
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

      {open && (
        <div style={{
          position: "absolute", bottom: 44, left: 0, width: 264,
          background: "white", borderRadius: 10,
          boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
          padding: 14, display: "flex", flexDirection: "column", gap: 10,
          border: "1px solid rgba(0,0,0,0.08)",
        }}>
          {/* Instance tabs */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {INSTANCES.map((inst, i) => (
              <button
                key={inst.key}
                onClick={() => switchInstance(i)}
                style={{
                  fontSize: 10, padding: "3px 7px", borderRadius: 4, border: "none",
                  cursor: "pointer", fontFamily: "monospace",
                  background: i === activeIdx ? "#2E7D32" : "#f0f0f0",
                  color: i === activeIdx ? "white" : "#444",
                  transition: "background 120ms",
                }}
              >
                {inst.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#222", fontFamily: "monospace" }}>
              PhoneMockup/{instance.key}
            </span>
            <button onClick={reset} style={{ fontSize: 10, color: "#888", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>reset</button>
          </div>

          <div style={{ borderTop: "1px solid #eee", paddingTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 9, color: "#aaa", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>Screen insets (%)</span>
            <Slider label="insetTop"     value={vals.insetTop}     min={0} max={20} step={0.1} onChange={setVal("insetTop")} />
            <Slider label="insetBottom"  value={vals.insetBottom}  min={0} max={20} step={0.1} onChange={setVal("insetBottom")} />
            <Slider label="insetSide"    value={vals.insetSide}    min={0} max={20} step={0.1} onChange={setVal("insetSide")} />
            <Slider label="screenRadius" value={vals.screenRadius} min={0} max={30} step={0.1} onChange={setVal("screenRadius")} />
          </div>

          <div style={{ borderTop: "1px solid #eee", paddingTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 9, color: "#aaa", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>Video pan/zoom</span>
            <Slider label="videoX (%)"  value={vals.videoX}     min={-50} max={50}  step={0.1}  onChange={setVal("videoX")} />
            <Slider label="videoY (%)"  value={vals.videoY}     min={-50} max={50}  step={0.1}  onChange={setVal("videoY")} />
            <Slider label="videoScale"  value={vals.videoScale} min={0.5} max={2.0} step={0.01} onChange={setVal("videoScale")} />
          </div>

          <button
            onClick={copySanity}
            style={{
              background: copied ? "#2E7D32" : "#111",
              color: "white", border: "none", borderRadius: 6,
              padding: "7px 0", fontSize: 11, fontWeight: 500,
              cursor: "pointer", transition: "background 150ms ease",
            }}
          >
            {copied ? "Copied!" : `Copy → Sanity (${instance.sanityField})`}
          </button>
        </div>
      )}
    </div>
  );
}
