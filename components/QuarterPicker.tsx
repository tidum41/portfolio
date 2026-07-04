"use client";

import { useState, useRef, useEffect, CSSProperties } from "react";

// ── Design tokens ─────────────────────────────────────────────────────────
const C = {
    uclaBlue: "#2d68c4",
    blueBg: "rgba(45,104,196,0.1)",
    darkSlate: "#0f172a",
    slateGray: "#64748b",
    lightSlate: "#94a3b8",
    border: "#E2E8F0",
    background: "#efefef",
    white: "#ffffff",
    font: "Helvetica Neue, Arial, sans-serif",
}

const QUARTERS = [
    { value: "spring", label: "Spring 2026", moveIn: "2026-03-25", moveOut: "2026-06-12" },
    { value: "summer", label: "Summer 2026", moveIn: "2026-06-22", moveOut: "2026-09-11" },
    { value: "fall",   label: "Fall 2026",   moveIn: "2026-09-21", moveOut: "2026-12-11" },
    { value: "winter", label: "Winter 2027", moveIn: "2027-01-04", moveOut: "2027-03-19" },
]

const QUARTER_DATES: Record<string, { moveIn: string; moveOut: string }> = {
    spring: { moveIn: "2026-03-25", moveOut: "2026-06-12" },
    summer: { moveIn: "2026-06-22", moveOut: "2026-09-11" },
    fall:   { moveIn: "2026-09-21", moveOut: "2026-12-11" },
    winter: { moveIn: "2027-01-04", moveOut: "2027-03-19" },
}

function injectDateInputStyles() {
    if (typeof document === "undefined") return
    if (document.getElementById("qfm-date-styles")) return
    const el = document.createElement("style")
    el.id = "qfm-date-styles"
    el.textContent = `
        .qfm-date-input {
            -webkit-tap-highlight-color: transparent;
            outline: none;
            border: none;
            background: transparent;
            padding: 0;
            margin: 0;
            font-family: Helvetica Neue, Arial, sans-serif;
            font-size: 14px;
            font-weight: 400;
            line-height: 20px;
            color: #0f172a;
            width: 100%;
            cursor: pointer;
            -webkit-appearance: none;
            appearance: none;
        }
        .qfm-date-input::-webkit-calendar-picker-indicator {
            opacity: 0;
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            cursor: pointer;
        }
        .qfm-date-input::-webkit-inner-spin-button,
        .qfm-date-input::-webkit-outer-spin-button {
            display: none;
        }
        .qfm-date-input:empty::before {
            content: attr(placeholder);
            color: #94a3b8;
        }
        .qfm-date-card:focus-within {
            box-shadow: 0 0 0 2px rgba(45,104,196,0.25), 0 1px 2px rgba(0,0,0,0.05);
        }
    `
    document.head.appendChild(el)
}

function formatDate(iso: string): string {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    })
}

function CalendarIcon({ active = false }: { active?: boolean }) {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={active ? C.uclaBlue : C.lightSlate}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0, transition: "stroke 0.15s ease", pointerEvents: "none" }}
        >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    )
}

function DateCard({ date, onChange }: { date: string | null; onChange: (iso: string) => void }) {
    const [focused, setFocused] = useState(false)

    const card: CSSProperties = {
        background: C.white,
        borderRadius: 8,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: focused
            ? `0 0 0 2px rgba(45,104,196,0.25), 0 1px 2px rgba(0,0,0,0.05)`
            : "0 1px 2px rgba(0,0,0,0.05)",
        minHeight: 44,
        position: "relative",
        overflow: "hidden",
        transition: "box-shadow 0.15s ease",
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent" as any,
    }

    return (
        <div className="qfm-date-card" style={card}>
            <span
                style={{
                    fontSize: 14,
                    color: date ? C.darkSlate : C.lightSlate,
                    fontFamily: C.font,
                    fontWeight: 400,
                    lineHeight: "20px",
                    pointerEvents: "none",
                    userSelect: "none",
                    zIndex: 1,
                    position: "relative",
                }}
            >
                {date ? formatDate(date) : "Select date"}
            </span>
            <CalendarIcon active={focused} />
            <input
                type="date"
                className="qfm-date-input"
                value={date ?? ""}
                onChange={(e) => { if (e.target.value) onChange(e.target.value) }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0,
                    width: "100%",
                    height: "100%",
                    cursor: "pointer",
                    zIndex: 2,
                    fontSize: 16,
                    WebkitTapHighlightColor: "transparent",
                } as CSSProperties}
            />
        </div>
    )
}

function InteractiveBadge() {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 10px",
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: 99,
                fontSize: 12,
                color: "#64748b",
                fontFamily: C.font,
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                pointerEvents: "none",
                userSelect: "none",
                whiteSpace: "nowrap",
            }}
        >
            <span style={{ fontSize: 10 }}>✦</span>
            <span>Interactive</span>
        </div>
    )
}

export default function QuarterPicker({
    defaultQuarter = "summer",
    showBadge = true,
}: {
    defaultQuarter?: string
    showBadge?: boolean
}) {
    const containerRef = useRef<HTMLDivElement>(null)
    const innerRef = useRef<HTMLDivElement>(null)
    const [scale, setScale] = useState(1)
    const [naturalHeight, setNaturalHeight] = useState(0)

    useEffect(() => { injectDateInputStyles() }, [])

    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        const ro = new ResizeObserver(([entry]) => {
            setScale(entry.contentRect.width / 393)
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    useEffect(() => {
        if (innerRef.current) setNaturalHeight(innerRef.current.offsetHeight)
    }, [])

    const [selected, setSelected] = useState<string[]>([defaultQuarter])
    const [manualMoveIn, setManualMoveIn] = useState<string | null>(null)
    const [manualMoveOut, setManualMoveOut] = useState<string | null>(null)

    function handleToggle(value: string) {
        setSelected((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        )
        setManualMoveIn(null)
        setManualMoveOut(null)
    }

    const dates = selected.map((v) => QUARTER_DATES[v]).filter(Boolean)
    const derivedMoveIn = dates.length > 0
        ? dates.reduce((min, d) => (d.moveIn < min ? d.moveIn : min), dates[0].moveIn)
        : null
    const derivedMoveOut = dates.length > 0
        ? dates.reduce((max, d) => (d.moveOut > max ? d.moveOut : max), dates[0].moveOut)
        : null

    const moveIn = manualMoveIn ?? derivedMoveIn
    const moveOut = manualMoveOut ?? derivedMoveOut

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%" }}>
            {showBadge && <InteractiveBadge />}
            <div
                ref={containerRef}
                style={{
                    width: "100%",
                    height: naturalHeight ? naturalHeight * scale : "auto",
                    overflow: "hidden",
                    borderRadius: 4,
                }}
            >
                <div
                    ref={innerRef}
                    style={{
                        width: 393,
                        transformOrigin: "top left",
                        transform: `scale(${scale})`,
                        background: C.background,
                        padding: "24px 20px",
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                        fontFamily: C.font,
                    }}
                >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: 12, color: C.slateGray, fontFamily: C.font }}>Move In</span>
                        <span style={{ fontSize: 12, color: C.slateGray, fontFamily: C.font }}>Move Out</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                        <DateCard date={moveIn} onChange={(iso) => setManualMoveIn(iso)} />
                        <DateCard date={moveOut} onChange={(iso) => setManualMoveOut(iso)} />
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {QUARTERS.map((q) => {
                            const isSelected = selected.includes(q.value)
                            const chip: CSSProperties = {
                                padding: "8px 16px",
                                borderRadius: 9999,
                                border: isSelected ? `1px solid ${C.uclaBlue}` : `1px solid ${C.border}`,
                                background: isSelected ? C.blueBg : C.white,
                                color: isSelected ? C.uclaBlue : C.slateGray,
                                fontWeight: 400,
                                fontSize: 14,
                                fontFamily: C.font,
                                lineHeight: "20px",
                                cursor: "pointer",
                                transition: "background 0.08s ease, border-color 0.08s ease, color 0.08s ease",
                                outline: "none",
                                whiteSpace: "nowrap",
                                userSelect: "none",
                                WebkitTapHighlightColor: "transparent",
                            }
                            return (
                                <button key={q.value} style={chip} onClick={() => handleToggle(q.value)}>
                                    {q.label}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
