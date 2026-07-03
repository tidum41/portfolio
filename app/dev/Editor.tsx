"use client";

import { useRef, useState, useCallback, useEffect, useTransition } from "react";
import { patchCaseStudy, patchDesignSystem } from "./actions";
import type {
  CaseStudyData, DesignSystemData, CompRow, Stat, ToolItem, ReflectionItem, TocItem,
} from "@/lib/sanity/queries";
import { DS_DEFAULTS } from "@/lib/sanity/queries";

// ── Palette ───────────────────────────────────────────────────────────────────
const BG      = "#161616";
const PANEL   = "#1e1e1e";
const PANEL2  = "#252525";
const BORDER  = "rgba(255,255,255,0.07)";
const BORDER2 = "rgba(255,255,255,0.12)";
const TEXT    = "#e8e8e8";
const MUTED   = "#666";
const MUTED2  = "#999";
const ACCENT  = "#4f8ef7";
const GREEN   = "#3ecf8e";

// ── Atoms ─────────────────────────────────────────────────────────────────────

function Label({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 600, color: MUTED2, textTransform: "uppercase",
      letterSpacing: "0.08em", margin: 0, fontFamily: mono ? "monospace" : "inherit",
    }}>
      {children}
    </p>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: MUTED2, textTransform: "uppercase",
      letterSpacing: "0.1em", padding: "14px 12px 6px", borderTop: `1px solid ${BORDER}`,
      marginTop: 4,
    }}>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, mono }: { value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean }) {
  return (
    <input
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%", background: PANEL2, border: `1px solid ${BORDER}`, borderRadius: 5,
        padding: "6px 8px", color: TEXT, fontSize: 12, fontFamily: mono ? "monospace" : "inherit",
        outline: "none", boxSizing: "border-box",
      }}
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = "auto";
    ref.current.style.height = Math.min(ref.current.scrollHeight, 200) + "px";
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: "100%", background: PANEL2, border: `1px solid ${BORDER}`, borderRadius: 5,
        padding: "6px 8px", color: TEXT, fontSize: 12, fontFamily: "inherit", outline: "none",
        resize: "none", boxSizing: "border-box", lineHeight: 1.5, overflow: "hidden",
      }}
    />
  );
}

function NumInput({ value, onChange, min, max, step = 1, unit = "" }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; unit?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, background: PANEL2, border: `1px solid ${BORDER}`, borderRadius: 5, padding: "4px 8px", minWidth: 0 }}>
      <input
        type="number" value={value} min={min} max={max} step={step}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        style={{ background: "none", border: "none", color: TEXT, fontSize: 12, fontFamily: "monospace", outline: "none", width: "4ch", textAlign: "right", padding: 0 }}
      />
      {unit && <span style={{ fontSize: 10, color: MUTED2, flexShrink: 0 }}>{unit}</span>}
    </div>
  );
}

function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 12px", minHeight: 32 }}>
      <span style={{ fontSize: 12, color: MUTED2, width: 76, flexShrink: 0, letterSpacing: "-0.01em" }}>{label}</span>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}

function ColorSwatch({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const [hex, setHex] = useState(value);
  useEffect(() => setHex(value), [value]);
  const commit = () => {
    const clean = hex.startsWith("#") ? hex : "#" + hex;
    if (/^#[0-9a-fA-F]{6}$/.test(clean)) onChange(clean);
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px" }}>
      <label style={{ position: "relative", cursor: "pointer" }}>
        <div style={{
          width: 22, height: 22, borderRadius: 4, background: value,
          border: `1px solid ${BORDER2}`, flexShrink: 0,
        }} />
        <input type="color" value={value || "#ffffff"} onChange={(e) => { onChange(e.target.value); setHex(e.target.value); }}
          style={{ position: "absolute", opacity: 0, inset: 0, width: "100%", cursor: "pointer" }} />
      </label>
      <span style={{ fontSize: 12, color: MUTED2, width: 90, flexShrink: 0 }}>{label}</span>
      <input value={hex} onChange={(e) => setHex(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === "Enter" && commit()}
        style={{ flex: 1, background: PANEL2, border: `1px solid ${BORDER}`, borderRadius: 4, padding: "3px 6px", color: TEXT, fontSize: 11, fontFamily: "monospace", outline: "none" }} />
    </div>
  );
}

function Slider2({ value, onChange, min, max, step = 1 }: { value: number; onChange: (v: number) => void; min: number; max: number; step?: number }) {
  return (
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      style={{ flex: 1, accentColor: ACCENT, cursor: "pointer", height: 3 }} />
  );
}

function NumPropRow({ label, value, onChange, onReset, defaultValue, min, max, step = 1, unit = "px", highlighted }: {
  label: string; value: number; onChange: (v: number) => void; onReset?: () => void; defaultValue?: number;
  min: number; max: number; step?: number; unit?: string; highlighted?: boolean;
}) {
  const isDirty = defaultValue !== undefined && value !== defaultValue;
  return (
    <div style={{
      borderLeft: `2px solid ${highlighted ? ACCENT : "transparent"}`,
      background: highlighted ? ACCENT + "09" : "transparent",
      transition: "background 0.2s",
    }}>
      <PropRow label={label}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <Slider2 value={value} onChange={onChange} min={min} max={max} step={step} />
          <NumInput value={value} onChange={onChange} min={min} max={max} step={step} unit={unit} />
          {onReset && (
            <button
              onClick={onReset}
              title="Reset to default"
              style={{
                background: "none", border: "none", cursor: "pointer", padding: "2px 4px",
                color: isDirty ? ACCENT : MUTED, fontSize: 13, lineHeight: 1, flexShrink: 0,
                opacity: isDirty ? 1 : 0.3, transition: "opacity 0.15s, color 0.15s",
              }}
            >↺</button>
          )}
        </div>
      </PropRow>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: BORDER, margin: "6px 0" }} />;
}

function SaveBtn({ saving, saved, onClick }: { saving: boolean; saved: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={saving}
      style={{
        background: saved ? GREEN + "22" : ACCENT + "22",
        border: `1px solid ${saved ? GREEN : ACCENT}40`,
        borderRadius: 6, color: saved ? GREEN : ACCENT, fontSize: 12, fontWeight: 600,
        padding: "6px 14px", cursor: saving ? "default" : "pointer", transition: "all 0.15s",
      }}>
      {saving ? "Saving…" : saved ? "✓ Saved" : "Save to Sanity"}
    </button>
  );
}

function AddBtn({ onClick, label = "+ Add" }: { onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick}
      style={{
        background: "none", border: `1px dashed ${BORDER2}`, borderRadius: 5,
        color: MUTED2, fontSize: 11, padding: "5px 10px", cursor: "pointer", width: "100%",
      }}>
      {label}
    </button>
  );
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      style={{
        background: "none", border: "none", color: MUTED, fontSize: 14,
        cursor: "pointer", lineHeight: 1, padding: "2px 4px", flexShrink: 0,
      }}>
      ×
    </button>
  );
}

// ── String list editor ─────────────────────────────────────────────────────────
function StringList({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {value.map((s, i) => (
        <div key={i} style={{ display: "flex", gap: 4 }}>
          <TextInput value={s} onChange={(v) => { const n = [...value]; n[i] = v; onChange(n); }} />
          <RemoveBtn onClick={() => onChange(value.filter((_, j) => j !== i))} />
        </div>
      ))}
      <AddBtn onClick={() => onChange([...value, ""])} />
    </div>
  );
}

// ── CompRow list ───────────────────────────────────────────────────────────────
function CompRowList({ value, onChange }: { value: CompRow[]; onChange: (v: CompRow[]) => void }) {
  const types = ["right", "wrong", "neutral"] as const;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {value.map((row, i) => (
        <div key={row._key} style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <select value={row.type} onChange={(e) => { const n = [...value]; n[i] = { ...row, type: e.target.value as CompRow["type"] }; onChange(n); }}
            style={{ background: PANEL2, border: `1px solid ${BORDER}`, borderRadius: 4, color: TEXT, fontSize: 11, padding: "4px 5px", flexShrink: 0 }}>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <TextInput value={row.text} onChange={(v) => { const n = [...value]; n[i] = { ...row, text: v }; onChange(n); }} />
          <RemoveBtn onClick={() => onChange(value.filter((_, j) => j !== i))} />
        </div>
      ))}
      <AddBtn onClick={() => onChange([...value, { _key: Math.random().toString(36).slice(2), type: "right", text: "" }])} />
    </div>
  );
}

// ── Left sidebar — section navigator ─────────────────────────────────────────
type SectionId = "hero" | "problem" | "research" | "process" | "decision-1" | "decision-2" | "decision-3" | "decision-4" | "solution" | "reflection";

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: "hero",       label: "Hero" },
  { id: "problem",    label: "Problem" },
  { id: "research",   label: "Research" },
  { id: "process",    label: "Process" },
  { id: "decision-1", label: "Design Decision 1" },
  { id: "decision-2", label: "Design Decision 2" },
  { id: "decision-3", label: "Design Decision 3" },
  { id: "decision-4", label: "Design Decision 4" },
  { id: "solution",   label: "Solution" },
  { id: "reflection", label: "Reflection" },
];

function LeftSidebar({
  active, onSelect, caseStudyLabel,
}: {
  active: SectionId; onSelect: (id: SectionId) => void; caseStudyLabel: string;
}) {
  return (
    <div style={{ width: 210, flexShrink: 0, background: PANEL, borderRight: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Studio header */}
      <div style={{ padding: "12px 14px 10px", borderBottom: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>Dev Studio</span>
        <span style={{ fontSize: 11, color: MUTED2 }}>dev only · localhost</span>
      </div>

      {/* Case study label */}
      <div style={{ padding: "10px 14px 6px" }}>
        <Label>Case study</Label>
        <div style={{ marginTop: 4, padding: "6px 8px", background: ACCENT + "18", borderRadius: 5, border: `1px solid ${ACCENT}30`, fontSize: 12, color: ACCENT, fontWeight: 600 }}>
          {caseStudyLabel}
        </div>
      </div>

      {/* Section list */}
      <div style={{ padding: "8px 0 12px", flex: 1, overflow: "auto" }}>
        <div style={{ padding: "0 14px 6px" }}><Label>Sections</Label></div>
        {SECTIONS.map(({ id, label }) => (
          <button key={id} onClick={() => onSelect(id)}
            style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 14px",
              background: active === id ? ACCENT + "18" : "none",
              border: "none", borderLeft: `2px solid ${active === id ? ACCENT : "transparent"}`,
              color: active === id ? TEXT : MUTED2, fontSize: 12, cursor: "pointer",
              textAlign: "left", transition: "all 0.1s",
            }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: active === id ? ACCENT : BORDER2, flexShrink: 0 }} />
            {label}
          </button>
        ))}
      </div>

      {/* Links */}
      <div style={{ borderTop: `1px solid ${BORDER}`, padding: "10px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
        <a href="/dev" style={{ fontSize: 11, color: MUTED, textDecoration: "none" }}>↺ Reload editor</a>
        <a href="http://localhost:3333" target="_blank" rel="noreferrer" style={{ fontSize: 11, color: MUTED, textDecoration: "none" }}>↗ Sanity Studio</a>
      </div>
    </div>
  );
}

// ── CSS builder (mirrors designSystemToCss from queries.ts, client-safe) ────────
function buildCss(ds: Required<DesignSystemData>): string {
  const a = ds.colorAccent;
  return `:root{
    --fs-display:${ds.fsDisplay}px;--fs-hero:${ds.fsHero}px;--fs-h2:${ds.fsH2}px;
    --fw-hero:${ds.fwHero * 10};--fw-h2:${ds.fwH2 * 10};--fw-card-title:${ds.fwCardTitle * 10};
    --fs-section-label:${ds.fsSectionLabel}px;
    --fs-h3:${ds.fsH3}px;--fs-body:${ds.fsBody}px;--fs-label:${ds.fsLabel}px;
    --fs-meta:${ds.fsMeta}px;--fs-caption:${ds.fsCaption}px;
    --fs-stat:${ds.fsStat}px;--fs-card-title:${ds.fsCardTitle}px;
    --lh-body:${ds.lhBody};--lh-h2:${ds.lhH2};
    --ls-hero:${ds.lsHero}px;--ls-h2:${ds.lsH2}px;
    --section-gap:${ds.sectionGap}px;--section-pb:${ds.sectionPb}px;
    --page-px:${ds.pagePx}px;--content-max-w:${ds.contentMaxW}px;--radius-card:${ds.cardRadius}px;
    --color-bg:${ds.colorBg};--color-text-primary:${ds.colorTextPrimary};
    --color-text-secondary:${ds.colorTextSecondary};--color-text-tertiary:${ds.colorTextTertiary};
    --color-text-muted:${ds.colorTextMuted};--color-placeholder:${ds.colorPlaceholder};
    --color-border-subtle:${ds.colorBorderSubtle};
    --color-accent:${a};--color-accent-subtle:${a}1a;
  }`;
}

// ── Center — iframe preview ───────────────────────────────────────────────────
type Device = "mobile" | "desktop";

function Preview({ section, device, onDeviceChange, reloadKey, iframeRef, liveIndicator, inspecting, onInspectToggle }: {
  section: SectionId; device: Device; onDeviceChange: (d: Device) => void; reloadKey: number;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  liveIndicator: boolean;
  inspecting: boolean;
  onInspectToggle: () => void;
}) {
  // When section changes, tell the iframe to scroll there
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const send = () => iframe.contentWindow?.postMessage({ type: "dev:navigate", sectionId: section }, "*");
    const t = setTimeout(send, 300);
    return () => clearTimeout(t);
  }, [section, reloadKey, iframeRef]);

  return (
    <div style={{ flex: 1, background: "#111", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
        borderBottom: `1px solid ${BORDER}`, flexShrink: 0,
      }}>
        <div style={{ display: "flex", background: PANEL2, borderRadius: 6, padding: 2, gap: 2 }}>
          {(["mobile", "desktop"] as Device[]).map((d) => (
            <button key={d} onClick={() => onDeviceChange(d)}
              style={{
                background: device === d ? PANEL : "none",
                border: "none", borderRadius: 4, color: device === d ? TEXT : MUTED2,
                fontSize: 11, padding: "4px 10px", cursor: "pointer",
              }}>
              {d === "mobile" ? "📱 Mobile" : "🖥 Desktop"}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 11, color: MUTED, fontFamily: "monospace", marginLeft: 4 }}>
          /ucla-sublease
        </span>
        {liveIndicator && (
          <span style={{
            fontSize: 10, fontWeight: 600, color: "#f59e0b", background: "#f59e0b18",
            border: "1px solid #f59e0b40", borderRadius: 4, padding: "2px 7px", letterSpacing: "0.04em",
          }}>
            live · unsaved
          </span>
        )}
        <div style={{ flex: 1 }} />
        <button
          onClick={onInspectToggle}
          title="Click any element in the preview to edit its typography"
          style={{
            background: inspecting ? ACCENT + "22" : "none",
            border: `1px solid ${inspecting ? ACCENT + "60" : BORDER2}`,
            borderRadius: 5, color: inspecting ? ACCENT : MUTED2,
            fontSize: 11, fontWeight: inspecting ? 600 : 400,
            padding: "3px 10px", cursor: "pointer", transition: "all 0.15s",
          }}
        >
          {inspecting ? "◉ Inspecting" : "◎ Inspect"}
        </button>
        <a href="http://localhost:3005/ucla-sublease" target="_blank" rel="noreferrer"
          style={{ fontSize: 11, color: MUTED, textDecoration: "none" }}>↗ open</a>
      </div>

      {/* Preview frame */}
      <div style={{ flex: 1, overflow: "auto", display: "flex", justifyContent: "center", padding: device === "mobile" ? "20px 0" : 0 }}>
        <iframe
          key={reloadKey}
          ref={iframeRef}
          src="http://localhost:3005/ucla-sublease"
          style={{
            width: device === "mobile" ? 390 : "100%",
            height: device === "mobile" ? 844 : "100%",
            border: device === "mobile" ? `1px solid ${BORDER2}` : "none",
            borderRadius: device === "mobile" ? 12 : 0,
            background: "#fff",
            flexShrink: 0,
          }}
          title="Case study preview"
        />
      </div>
    </div>
  );
}

// ── Right panel tabs ──────────────────────────────────────────────────────────
type RightTab = "Content" | "Design";
type DesignTab = "Type" | "Space" | "Color";

// ── Minimal group label ───────────────────────────────────────────────────────
function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: "10px 12px 4px", display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em" }}>{children}</span>
      <div style={{ flex: 1, height: 1, background: BORDER }} />
    </div>
  );
}

// ── Design System inspector (shared) ─────────────────────────────────────────
const DETECTED_TYPE_MAP: { keys: (keyof DesignSystemData)[]; label: string; cssVars: string; htmlEl: string }[] = [
  { keys: ["fsHero", "fwHero"],            label: "Hero H1",       cssVars: "--fs-hero, --fw-hero",         htmlEl: "h1" },
  { keys: ["fsH2", "fwH2", "lhH2"],       label: "Section H2",    cssVars: "--fs-h2, --fw-h2, --lh-h2",   htmlEl: "h2" },
  { keys: ["fsH3"],                        label: "Subheading H3", cssVars: "--fs-h3",                      htmlEl: "h3" },
  { keys: ["fsSectionLabel"],              label: "Section label", cssVars: "--fs-section-label",           htmlEl: "small" },
  { keys: ["fwCardTitle"],                 label: "Card title",    cssVars: "--fw-card-title",              htmlEl: "p.card-title" },
  { keys: ["fsBody", "lhBody"],            label: "Body text",     cssVars: "--fs-body, --lh-body",         htmlEl: "p" },
];

function getDetectedType(keys: (keyof DesignSystemData)[]) {
  return DETECTED_TYPE_MAP.find(m => m.keys.some(k => keys.includes(k)))
    ?? { label: "Element", cssVars: "", htmlEl: "element" };
}

function DesignInspector({ ds, defaults, onChange, onSave, saving, saved, highlightedKeys = [], selectedEl }: {
  ds: Required<DesignSystemData>;
  defaults: Required<DesignSystemData>;
  onChange: <K extends keyof DesignSystemData>(k: K, v: DesignSystemData[K]) => void;
  onSave: () => void; saving: boolean; saved: boolean;
  highlightedKeys?: (keyof DesignSystemData)[];
  selectedEl?: { tag: string; textSnippet: string; fontSize: string; fontWeight: string } | null;
}) {
  const [dsTab, setDsTab] = useState<DesignTab>("Type");
  const num = (k: keyof DesignSystemData) => ds[k] as number;
  const str = (k: keyof DesignSystemData) => ds[k] as string;
  const def = (k: keyof DesignSystemData) => defaults[k] as number;
  const hl  = (k: keyof DesignSystemData) => highlightedKeys.includes(k);
  const row = (label: string, k: keyof DesignSystemData, min: number, max: number, step = 1, unit = "px") => (
    <NumPropRow
      key={k} label={label} value={num(k)}
      onChange={(v) => onChange(k, v)}
      onReset={() => onChange(k, def(k))}
      defaultValue={def(k)} min={min} max={max} step={step} unit={unit}
      highlighted={hl(k)}
    />
  );

  // Auto-switch to Type tab when an element is selected
  useEffect(() => { if (highlightedKeys.length > 0) setDsTab("Type"); }, [highlightedKeys.length]);

  const DS_TABS: DesignTab[] = ["Type", "Space", "Color"];
  const detected = highlightedKeys.length > 0 ? getDetectedType(highlightedKeys) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>

      {/* Sub-tab bar */}
      <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
        {DS_TABS.map((t) => (
          <button key={t} onClick={() => setDsTab(t)}
            style={{
              flex: 1, padding: "8px 0", background: "none", border: "none",
              borderBottom: `2px solid ${dsTab === t ? MUTED2 : "transparent"}`,
              color: dsTab === t ? TEXT : MUTED, fontSize: 11, fontWeight: dsTab === t ? 600 : 400,
              cursor: "pointer", letterSpacing: "0.02em",
            }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>

        {/* ── Type tab ─────────────────────────────────────────── */}
        {dsTab === "Type" && (<>
          {detected && (
            <div style={{ padding: "9px 12px 8px", background: ACCENT + "0e", borderBottom: `1px solid ${ACCENT}22`, flexShrink: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: ACCENT, fontWeight: 700, letterSpacing: "0.03em" }}>{detected.label}</div>
                  {detected.cssVars && (
                    <div style={{ fontSize: 9, color: MUTED, marginTop: 3, fontFamily: "monospace", letterSpacing: "0.02em" }}>{detected.cssVars}</div>
                  )}
                  <div style={{ fontSize: 9, color: MUTED, marginTop: 2, opacity: 0.55 }}>CSS vars · updates all {detected.htmlEl} elements sitewide</div>
                </div>
                <button onClick={() => onChange("fsBody", num("fsBody"))} style={{ fontSize: 13, color: MUTED, background: "none", border: "none", cursor: "pointer", padding: "0 2px", flexShrink: 0, lineHeight: 1 }}>×</button>
              </div>
              {selectedEl?.textSnippet && (
                <div style={{ fontSize: 9, color: MUTED, marginTop: 6, opacity: 0.45, fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  &ldquo;{selectedEl.textSnippet}&rdquo;
                </div>
              )}
            </div>
          )}

          <GroupLabel>Sizes</GroupLabel>
          {row("Hero H1",     "fsHero",        24, 96)}
          {row("Section H2",  "fsH2",          16, 64)}
          {row("H3",          "fsH3",          12, 48)}
          {row("Body",        "fsBody",        10, 22)}
          {row("Meta",        "fsMeta",        10, 20)}
          {row("Label",       "fsLabel",       10, 24)}
          {row("Section lbl", "fsSectionLabel", 8, 16)}
          {row("Stat number", "fsStat",        20, 80)}
          {row("Card title",  "fsCardTitle",   12, 28)}
          {row("Caption",     "fsCaption",      8, 18)}

          <GroupLabel>Weights  <span style={{ fontSize: 9, color: MUTED, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>10–50</span></GroupLabel>
          {row("Hero",        "fwHero",      10, 50, 5, "")}
          {row("H2",          "fwH2",        10, 50, 5, "")}
          {row("Card title",  "fwCardTitle", 10, 50, 5, "")}

          <GroupLabel>Leading &amp; Tracking</GroupLabel>
          {row("Body LH",     "lhBody",  1,   2.5,  0.05, "")}
          {row("H2 LH",       "lhH2",    0.8, 1.6,  0.05, "")}
          {row("Hero LS",     "lsHero", -3,   2,    0.25, "px")}
          {row("H2 LS",       "lsH2",   -3,   2,    0.25, "px")}
        </>)}

        {/* ── Space tab ────────────────────────────────────────── */}
        {dsTab === "Space" && (<>
          <GroupLabel>Layout</GroupLabel>
          {row("Section gap", "sectionGap",  16, 200)}
          {row("Section pb",  "sectionPb",   16, 200)}
          {row("Page px",     "pagePx",      12, 100)}
          {row("Max width",   "contentMaxW", 400, 1200)}
          <GroupLabel>Elements</GroupLabel>
          {row("Card radius", "cardRadius",   0, 24)}
        </>)}

        {/* ── Color tab ────────────────────────────────────────── */}
        {dsTab === "Color" && (<>
          <GroupLabel>Surfaces</GroupLabel>
          <ColorSwatch value={str("colorBg")}           onChange={(v) => onChange("colorBg", v)}           label="Background" />
          <ColorSwatch value={str("colorAccent")}       onChange={(v) => onChange("colorAccent", v)}       label="Accent" />
          <ColorSwatch value={str("colorBorderSubtle")} onChange={(v) => onChange("colorBorderSubtle", v)} label="Border" />
          <ColorSwatch value={str("colorPlaceholder")}  onChange={(v) => onChange("colorPlaceholder", v)}  label="Placeholder" />
          <GroupLabel>Text</GroupLabel>
          <ColorSwatch value={str("colorTextPrimary")}   onChange={(v) => onChange("colorTextPrimary", v)}   label="Primary" />
          <ColorSwatch value={str("colorTextSecondary")} onChange={(v) => onChange("colorTextSecondary", v)} label="Secondary" />
          <ColorSwatch value={str("colorTextTertiary")}  onChange={(v) => onChange("colorTextTertiary", v)}  label="Tertiary" />
          <ColorSwatch value={str("colorTextMuted")}     onChange={(v) => onChange("colorTextMuted", v)}     label="Muted" />
        </>)}

        <div style={{ padding: "14px 12px 18px" }}>
          <SaveBtn saving={saving} saved={saved} onClick={onSave} />
        </div>
      </div>
    </div>
  );
}

// ── Content inspector (per-section, per-case-study) ──────────────────────────
function ContentInspector({ section, data, onChange, onSave, saving, saved }: {
  section: SectionId;
  data: CaseStudyData;
  onChange: <K extends keyof CaseStudyData>(k: K, v: CaseStudyData[K]) => void;
  onSave: () => void; saving: boolean; saved: boolean;
}) {
  function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div style={{ padding: "4px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        <Label>{label}</Label>
        {children}
      </div>
    );
  }

  function renderSection() {
    switch (section) {
      case "hero": return (
        <>
          <SectionHeader>Hero</SectionHeader>
          <Field label="Tagline"><TextInput value={data.heroTagline ?? ""} onChange={(v) => onChange("heroTagline", v)} /></Field>
          <Field label="Title"><TextArea value={data.heroTitle ?? ""} onChange={(v) => onChange("heroTitle", v)} rows={2} /></Field>
          <Field label="Background color">
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="color" value={data.heroBg ?? "#dde6ef"} onChange={(e) => onChange("heroBg", e.target.value)}
                style={{ width: 32, height: 32, border: "none", borderRadius: 5, cursor: "pointer", padding: 2, background: "transparent" }} />
              <TextInput value={data.heroBg ?? ""} onChange={(v) => onChange("heroBg", v)} mono placeholder="#dde6ef" />
            </div>
          </Field>
          <Field label="Mux Playback ID"><TextInput value={data.heroMuxId ?? ""} onChange={(v) => onChange("heroMuxId", v)} mono /></Field>
          <SectionHeader>Metadata rows</SectionHeader>
          <div style={{ padding: "4px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
            {(data.metadata ?? []).map((item, i) => (
              <div key={item._key} style={{ background: PANEL2, borderRadius: 6, padding: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Label>{item.label}</Label>
                  <RemoveBtn onClick={() => onChange("metadata", (data.metadata ?? []).filter((_, j) => j !== i))} />
                </div>
                <TextInput value={item.label} onChange={(v) => { const n = [...(data.metadata ?? [])]; n[i] = { ...item, label: v }; onChange("metadata", n); }} placeholder="Label" />
                <TextInput value={item.values.join(", ")} onChange={(v) => { const n = [...(data.metadata ?? [])]; n[i] = { ...item, values: v.split(",").map((s) => s.trim()) }; onChange("metadata", n); }} placeholder="Value, Value" />
              </div>
            ))}
            <AddBtn onClick={() => onChange("metadata", [...(data.metadata ?? []), { _key: Math.random().toString(36).slice(2), label: "", values: [] }])} />
          </div>
        </>
      );

      case "problem": return (
        <>
          <SectionHeader>Problem</SectionHeader>
          <Field label="Section label"><TextInput value={data.problemLabel ?? ""} onChange={(v) => onChange("problemLabel", v)} /></Field>
          <Field label="Heading"><TextArea value={data.problemHeading ?? ""} onChange={(v) => onChange("problemHeading", v)} rows={2} /></Field>
          <Field label="Body"><TextArea value={data.problemBody ?? ""} onChange={(v) => onChange("problemBody", v)} rows={4} /></Field>
          <Field label="Image caption"><TextInput value={data.problemImageCaption ?? ""} onChange={(v) => onChange("problemImageCaption", v)} /></Field>
          <SectionHeader>Pain points</SectionHeader>
          <div style={{ padding: "4px 16px" }}>
            <StringList value={data.painPoints ?? []} onChange={(v) => onChange("painPoints", v)} />
          </div>
        </>
      );

      case "research": return (
        <>
          <SectionHeader>Research</SectionHeader>
          <Field label="Section label"><TextInput value={data.researchLabel ?? ""} onChange={(v) => onChange("researchLabel", v)} /></Field>
          <Field label="Heading"><TextArea value={data.researchHeading ?? ""} onChange={(v) => onChange("researchHeading", v)} rows={2} /></Field>
          <Field label="Body"><TextArea value={data.researchBody ?? ""} onChange={(v) => onChange("researchBody", v)} rows={4} /></Field>
          <SectionHeader>Stats</SectionHeader>
          <div style={{ padding: "4px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
            {(data.stats ?? []).map((stat, i) => (
              <div key={stat._key} style={{ background: PANEL2, borderRadius: 6, padding: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Label>Stat #{i + 1}</Label>
                  <RemoveBtn onClick={() => onChange("stats", (data.stats ?? []).filter((_, j) => j !== i))} />
                </div>
                <TextInput value={stat.value} onChange={(v) => { const n = [...(data.stats ?? [])]; n[i] = { ...stat, value: v }; onChange("stats", n); }} placeholder="83%" />
                <TextArea value={stat.label} onChange={(v) => { const n = [...(data.stats ?? [])]; n[i] = { ...stat, label: v }; onChange("stats", n); }} rows={2} placeholder="description" />
              </div>
            ))}
            <AddBtn onClick={() => onChange("stats", [...(data.stats ?? []), { _key: Math.random().toString(36).slice(2), value: "", label: "" } as Stat])} />
          </div>
        </>
      );

      case "process": return (
        <>
          <SectionHeader>Process</SectionHeader>
          <Field label="Section label"><TextInput value={data.processLabel ?? ""} onChange={(v) => onChange("processLabel", v)} /></Field>
          <Field label="Heading"><TextArea value={data.processHeading ?? ""} onChange={(v) => onChange("processHeading", v)} rows={2} /></Field>
          <Field label="Body"><TextArea value={data.processBody ?? ""} onChange={(v) => onChange("processBody", v)} rows={3} /></Field>
          <SectionHeader>Tools</SectionHeader>
          <div style={{ padding: "4px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
            {(data.processTools ?? []).map((tool, i) => (
              <div key={tool._key} style={{ background: PANEL2, borderRadius: 6, padding: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Label>{tool.tool || "Tool"}</Label>
                  <RemoveBtn onClick={() => onChange("processTools", (data.processTools ?? []).filter((_, j) => j !== i))} />
                </div>
                <TextInput value={tool.tool} onChange={(v) => { const n = [...(data.processTools ?? [])]; n[i] = { ...tool, tool: v }; onChange("processTools", n); }} placeholder="Tool name" />
                <TextArea value={tool.desc} onChange={(v) => { const n = [...(data.processTools ?? [])]; n[i] = { ...tool, desc: v }; onChange("processTools", n); }} rows={2} />
              </div>
            ))}
            <AddBtn onClick={() => onChange("processTools", [...(data.processTools ?? []), { _key: Math.random().toString(36).slice(2), tool: "", desc: "" } as ToolItem])} />
          </div>
        </>
      );

      case "decision-1": return (
        <>
          <SectionHeader>Design Decision 1</SectionHeader>
          <Field label="Label"><TextInput value={data.d1Label ?? ""} onChange={(v) => onChange("d1Label", v)} /></Field>
          <Field label="Heading"><TextArea value={data.d1Heading ?? ""} onChange={(v) => onChange("d1Heading", v)} rows={2} /></Field>
          <Field label="Body"><TextArea value={data.d1Body ?? ""} onChange={(v) => onChange("d1Body", v)} rows={3} /></Field>
          <SectionHeader>Card captions</SectionHeader>
          <div style={{ padding: "4px 16px", display: "flex", gap: 6 }}>
            {[0, 1, 2].map((i) => (
              <TextInput key={i} value={(data.d1CardLabels ?? [])[i] ?? ""} onChange={(v) => { const n = [...(data.d1CardLabels ?? ["", "", ""])]; n[i] = v; onChange("d1CardLabels", n); }} placeholder={["initial", "condensed", "final"][i]} />
            ))}
          </div>
          <SectionHeader>Comparison columns</SectionHeader>
          {(["d1CompCol1", "d1CompCol2", "d1CompCol3"] as const).map((key, ci) => (
            <div key={key} style={{ padding: "4px 16px" }}>
              <Label>Column {ci + 1}</Label>
              <div style={{ marginTop: 4 }}>
                <CompRowList value={data[key] ?? []} onChange={(v) => onChange(key, v)} />
              </div>
            </div>
          ))}
          <SectionHeader>Research insights</SectionHeader>
          <div style={{ padding: "4px 16px" }}>
            <StringList value={data.d1Insights ?? []} onChange={(v) => onChange("d1Insights", v)} />
          </div>
        </>
      );

      case "decision-2": return (
        <>
          <SectionHeader>Design Decision 2</SectionHeader>
          <Field label="Label"><TextInput value={data.d2Label ?? ""} onChange={(v) => onChange("d2Label", v)} /></Field>
          <Field label="Heading"><TextArea value={data.d2Heading ?? ""} onChange={(v) => onChange("d2Heading", v)} rows={2} /></Field>
          <Field label="Body"><TextArea value={data.d2Body ?? ""} onChange={(v) => onChange("d2Body", v)} rows={4} /></Field>
        </>
      );

      case "decision-3": return (
        <>
          <SectionHeader>Design Decision 3</SectionHeader>
          <Field label="Label"><TextInput value={data.d3Label ?? ""} onChange={(v) => onChange("d3Label", v)} /></Field>
          <Field label="Heading"><TextArea value={data.d3Heading ?? ""} onChange={(v) => onChange("d3Heading", v)} rows={2} /></Field>
          <Field label="Body"><TextArea value={data.d3Body ?? ""} onChange={(v) => onChange("d3Body", v)} rows={4} /></Field>
        </>
      );

      case "decision-4": return (
        <>
          <SectionHeader>Design Decision 4</SectionHeader>
          <Field label="Label"><TextInput value={data.d4Label ?? ""} onChange={(v) => onChange("d4Label", v)} /></Field>
          <Field label="Heading"><TextArea value={data.d4Heading ?? ""} onChange={(v) => onChange("d4Heading", v)} rows={2} /></Field>
          <Field label="Body"><TextArea value={data.d4Body ?? ""} onChange={(v) => onChange("d4Body", v)} rows={4} /></Field>
        </>
      );

      case "solution": return (
        <>
          <SectionHeader>Solution</SectionHeader>
          <Field label="Section label"><TextInput value={data.solutionLabel ?? ""} onChange={(v) => onChange("solutionLabel", v)} /></Field>
          <Field label="Heading"><TextArea value={data.solutionHeading ?? ""} onChange={(v) => onChange("solutionHeading", v)} rows={2} /></Field>
          <Field label="Body"><TextArea value={data.solutionBody ?? ""} onChange={(v) => onChange("solutionBody", v)} rows={3} /></Field>
          <Field label="Background color">
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="color" value={data.solutionBg ?? "#dde6ef"} onChange={(e) => onChange("solutionBg", e.target.value)}
                style={{ width: 32, height: 32, border: "none", borderRadius: 5, cursor: "pointer", padding: 2, background: "transparent" }} />
              <TextInput value={data.solutionBg ?? ""} onChange={(v) => onChange("solutionBg", v)} mono placeholder="#dde6ef" />
            </div>
          </Field>
          <Field label="Mux Playback ID"><TextInput value={data.solutionMuxId ?? ""} onChange={(v) => onChange("solutionMuxId", v)} mono /></Field>
        </>
      );

      case "reflection": return (
        <>
          <SectionHeader>Reflection</SectionHeader>
          <div style={{ padding: "4px 16px" }}>
            <Label>Section label</Label>
            <div style={{ marginTop: 4 }}><TextInput value={data.reflectionLabel ?? ""} onChange={(v) => onChange("reflectionLabel", v)} /></div>
          </div>
          <SectionHeader>Items</SectionHeader>
          <div style={{ padding: "4px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            {(data.reflectionItems ?? []).map((item, i) => (
              <div key={item._key} style={{ background: PANEL2, borderRadius: 6, padding: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Label>Item #{i + 1}</Label>
                  <RemoveBtn onClick={() => onChange("reflectionItems", (data.reflectionItems ?? []).filter((_, j) => j !== i))} />
                </div>
                <TextInput value={item.heading} onChange={(v) => { const n = [...(data.reflectionItems ?? [])]; n[i] = { ...item, heading: v }; onChange("reflectionItems", n); }} placeholder="Heading" />
                <TextArea value={item.body} onChange={(v) => { const n = [...(data.reflectionItems ?? [])]; n[i] = { ...item, body: v }; onChange("reflectionItems", n); }} rows={3} />
              </div>
            ))}
            <AddBtn onClick={() => onChange("reflectionItems", [...(data.reflectionItems ?? []), { _key: Math.random().toString(36).slice(2), heading: "", body: "" }])} />
          </div>
        </>
      );
    }
  }

  // Build the fields to save for current section
  const SECTION_FIELDS: Record<SectionId, (keyof CaseStudyData)[]> = {
    "hero":       ["heroTagline", "heroTitle", "heroBg", "heroMuxId", "metadata"],
    "problem":    ["problemLabel", "problemHeading", "problemBody", "problemImageCaption", "painPoints"],
    "research":   ["researchLabel", "researchHeading", "researchBody", "stats"],
    "process":    ["processLabel", "processHeading", "processBody", "processTools"],
    "decision-1": ["d1Label", "d1Heading", "d1Body", "d1CardLabels", "d1CompCol1", "d1CompCol2", "d1CompCol3", "d1Insights"],
    "decision-2": ["d2Label", "d2Heading", "d2Body"],
    "decision-3": ["d3Label", "d3Heading", "d3Body"],
    "decision-4": ["d4Label", "d4Heading", "d4Body"],
    "solution":   ["solutionLabel", "solutionHeading", "solutionBody", "solutionBg", "solutionMuxId"],
    "reflection": ["reflectionLabel", "reflectionItems"],
  };

  const saveFields = SECTION_FIELDS[section];

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div style={{ flex: 1, overflow: "auto", paddingBottom: 8 }}>
        {renderSection()}
      </div>
      <div style={{ padding: "10px 16px", borderTop: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: MUTED }}>BruinLease · {section}</span>
        <SaveBtn saving={saving} saved={saved} onClick={onSave} />
      </div>
    </div>
  );
}

// ── Root component ────────────────────────────────────────────────────────────
interface Props {
  initialData: CaseStudyData;
  initialDs: Required<DesignSystemData>;
}

export default function DevEditor({ initialData, initialDs }: Props) {
  const [section, setSection] = useState<SectionId>("hero");
  const [rightTab, setRightTab] = useState<RightTab>("Content");
  const [device, setDevice] = useState<Device>("desktop");
  const [reloadKey, setReloadKey] = useState(0);

  const [data, setData] = useState<CaseStudyData>(initialData);
  const [ds, setDs] = useState<Required<DesignSystemData>>(initialDs);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dsUnsaved, setDsUnsaved] = useState(false);
  const [inspecting, setInspecting] = useState(false);
  const [selectedEl, setSelectedEl] = useState<{
    tag: string; textSnippet: string; fontWeight: string; fontSize: string;
    lineHeight: string; letterSpacing: string;
  } | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Determine which DS token keys are relevant for the selected element
  const highlightedKeys = (() => {
    if (!selectedEl) return [] as (keyof DesignSystemData)[];
    const fw = parseFloat(selectedEl.fontWeight);
    const fs = parseFloat(selectedEl.fontSize);
    const tag = selectedEl.tag;
    if (tag === "h1" || fs > 42) return ["fsHero", "fwHero"] as (keyof DesignSystemData)[];
    if (tag === "h2" || fs > 28) return ["fsH2", "fwH2", "lhH2", "lsH2"] as (keyof DesignSystemData)[];
    if (tag === "h3" || fs > 18) return ["fsH3"] as (keyof DesignSystemData)[];
    if (fs <= 13) return ["fsSectionLabel"] as (keyof DesignSystemData)[];
    if (fw >= 550) return ["fwCardTitle"] as (keyof DesignSystemData)[];
    return ["fsBody", "lhBody"] as (keyof DesignSystemData)[];
  })();

  // Listen for element selection messages from the iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "dev:element") {
        setSelectedEl(e.data.payload);
        setRightTab("Design");
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Inject/remove the inspect script when inspecting mode changes
  const INSPECT_SCRIPT_ID = "__dev-inspector-script";
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const activate = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        // Remove old if any
        doc.getElementById(INSPECT_SCRIPT_ID)?.remove();
        if (!inspecting) {
          // Remove overlay + reset pointer cursor
          doc.getElementById("__dev-highlight")?.remove();
          doc.body.style.cursor = "";
          return;
        }
        const s = doc.createElement("script");
        s.id = INSPECT_SCRIPT_ID;
        s.textContent = `(function(){
          var overlay = document.getElementById('__dev-highlight');
          if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = '__dev-highlight';
            overlay.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483647;border:2px solid #4f8ef7;border-radius:3px;background:rgba(79,142,247,0.06);box-sizing:border-box;transition:top 0.08s,left 0.08s,width 0.08s,height 0.08s;display:none;';
            document.body.appendChild(overlay);
          }
          document.body.style.cursor = 'crosshair';
          function show(el) {
            var r = el.getBoundingClientRect();
            overlay.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483647;border:2px solid #4f8ef7;border-radius:3px;background:rgba(79,142,247,0.06);box-sizing:border-box;top:'+r.top+'px;left:'+r.left+'px;width:'+r.width+'px;height:'+r.height+'px;';
          }
          document.addEventListener('mousemove', function(e) {
            var el = e.target;
            if (!el || el === overlay || el === document.body || el === document.documentElement) return;
            show(el);
          }, {passive:true});
          document.addEventListener('click', function(e) {
            var el = e.target;
            if (!el || el === overlay) return;
            e.preventDefault(); e.stopPropagation();
            var c = window.getComputedStyle(el);
            window.parent.postMessage({type:'dev:element',payload:{
              tag: el.tagName.toLowerCase(),
              textSnippet: (el.innerText||el.textContent||'').trim().slice(0,100),
              fontWeight: c.fontWeight, fontSize: c.fontSize,
              lineHeight: c.lineHeight, letterSpacing: c.letterSpacing,
              color: c.color,
            }}, '*');
          }, true);
        })();`;
        doc.head.appendChild(s);
      } catch { /* cross-origin guard */ }
    };
    // Run after a short delay (iframe may still be loading)
    const t = setTimeout(activate, 200);
    return () => clearTimeout(t);
  }, [inspecting, reloadKey]);

  // Live CSS injection — no Sanity save needed to see changes
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const inject = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        let tag = doc.getElementById("__dev-live-css") as HTMLStyleElement | null;
        if (!tag) {
          tag = doc.createElement("style");
          tag.id = "__dev-live-css";
          doc.head.appendChild(tag);
        }
        tag.textContent = buildCss(ds);
      } catch {
        // cross-origin (shouldn't happen on localhost but guard it)
      }
    };
    // Run after a brief delay to let the iframe finish a potential reload
    const t = setTimeout(inject, 150);
    return () => clearTimeout(t);
  }, [ds, reloadKey]);

  const flashSaved = () => { setSaved(true); setDsUnsaved(false); setTimeout(() => setSaved(false), 2000); };

  const updateData = useCallback(<K extends keyof CaseStudyData>(k: K, v: CaseStudyData[K]) => {
    setData((d) => ({ ...d, [k]: v }));
    setSaved(false);
  }, []);

  const updateDs = useCallback(<K extends keyof DesignSystemData>(k: K, v: DesignSystemData[K]) => {
    setDs((d) => ({ ...d, [k]: v }));
    setSaved(false);
    setDsUnsaved(true);
  }, []);

  // Section fields for saving
  const SECTION_FIELDS: Record<SectionId, (keyof CaseStudyData)[]> = {
    "hero":       ["heroTagline", "heroTitle", "heroBg", "heroMuxId", "metadata"],
    "problem":    ["problemLabel", "problemHeading", "problemBody", "problemImageCaption", "painPoints"],
    "research":   ["researchLabel", "researchHeading", "researchBody", "stats"],
    "process":    ["processLabel", "processHeading", "processBody", "processTools"],
    "decision-1": ["d1Label", "d1Heading", "d1Body", "d1CardLabels", "d1CompCol1", "d1CompCol2", "d1CompCol3", "d1Insights"],
    "decision-2": ["d2Label", "d2Heading", "d2Body"],
    "decision-3": ["d3Label", "d3Heading", "d3Body"],
    "decision-4": ["d4Label", "d4Heading", "d4Body"],
    "solution":   ["solutionLabel", "solutionHeading", "solutionBody", "solutionBg", "solutionMuxId"],
    "reflection": ["reflectionLabel", "reflectionItems"],
  };

  const saveContent = async () => {
    setSaving(true);
    try {
      const fields: Record<string, unknown> = {};
      for (const k of SECTION_FIELDS[section]) {
        if (data[k] !== undefined) fields[k] = data[k];
      }
      await patchCaseStudy("ucla-sublease", fields);
      setReloadKey((k) => k + 1);
      flashSaved();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const saveDesign = async () => {
    setSaving(true);
    try {
      await patchDesignSystem(ds);
      setReloadKey((k) => k + 1);
      flashSaved();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // Switch to section in left sidebar → also update right tab to Content
  const handleSectionSelect = (id: SectionId) => {
    setSection(id);
    if (rightTab === "Design") return; // keep design tab if already there
    setRightTab("Content");
  };

  return (
    <div style={{
      display: "flex", height: "100vh", background: BG, color: TEXT,
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", overflow: "hidden",
    }}>
      {/* Left — section navigator */}
      <LeftSidebar active={section} onSelect={handleSectionSelect} caseStudyLabel="BruinLease" />

      {/* Center — preview */}
      <Preview
        section={section} device={device} onDeviceChange={setDevice} reloadKey={reloadKey}
        iframeRef={iframeRef} liveIndicator={dsUnsaved}
        inspecting={inspecting}
        onInspectToggle={() => { setInspecting((v) => !v); if (inspecting) setSelectedEl(null); }}
      />

      {/* Right — inspector */}
      <div style={{ width: 304, flexShrink: 0, background: PANEL, borderLeft: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Tab bar */}
        <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
          {(["Content", "Design"] as RightTab[]).map((t) => (
            <button key={t} onClick={() => setRightTab(t)}
              style={{
                flex: 1, padding: "10px 0", background: "none",
                border: "none", borderBottom: `2px solid ${rightTab === t ? ACCENT : "transparent"}`,
                color: rightTab === t ? TEXT : MUTED2, fontSize: 12, fontWeight: rightTab === t ? 600 : 400,
                cursor: "pointer", transition: "all 0.1s",
              }}>
              {t}
            </button>
          ))}
        </div>

        {/* Selected element banner */}
        {selectedEl && rightTab === "Design" && (
          <div style={{ padding: "8px 14px", background: PANEL2, borderBottom: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: 3, flexShrink: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                &lt;{selectedEl.tag}&gt;
              </span>
              <button onClick={() => setSelectedEl(null)} style={{ background: "none", border: "none", color: MUTED, fontSize: 13, cursor: "pointer", padding: "0 2px" }}>×</button>
            </div>
            <span style={{ fontSize: 11, color: MUTED2, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {selectedEl.textSnippet || "(no text)"}
            </span>
            <span style={{ fontSize: 10, color: MUTED, fontFamily: "monospace" }}>
              {selectedEl.fontSize} · w{selectedEl.fontWeight} · lh{parseFloat(selectedEl.lineHeight).toFixed(2)}
            </span>
          </div>
        )}

        {rightTab === "Content" ? (
          <ContentInspector
            section={section}
            data={data}
            onChange={updateData}
            onSave={saveContent}
            saving={saving}
            saved={saved}
          />
        ) : (
          <DesignInspector
            ds={ds}
            defaults={DS_DEFAULTS}
            onChange={updateDs}
            onSave={saveDesign}
            highlightedKeys={highlightedKeys}
            selectedEl={selectedEl}
            saving={saving}
            saved={saved}
          />
        )}
      </div>
    </div>
  );
}
