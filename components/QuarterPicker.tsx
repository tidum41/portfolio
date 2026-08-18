"use client";

import {
    useState,
    useRef,
    useEffect,
    useLayoutEffect,
    useId,
    CSSProperties,
    KeyboardEvent,
} from "react";
import InteractiveBadge from "@/components/InteractiveBadge";

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

// iPhone-width design canvas. Every breakpoint renders this same layout
// and only changes `transform: scale` — never min-size, wrap, or padding.
const DESIGN_W = 393

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

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

function injectPickerStyles() {
    if (typeof document === "undefined") return
    if (document.getElementById("qfm-date-styles")) return
    const el = document.createElement("style")
    el.id = "qfm-date-styles"
    el.textContent = `
        .qfm-date-card,
        .qfm-quarter-chip {
            min-height: 0;
            min-width: 0;
        }
        .qfm-date-card:focus-visible {
            outline: none;
            box-shadow: 0 0 0 2px rgba(45,104,196,0.25), 0 1px 2px rgba(0,0,0,0.05);
        }
        .qfm-quarter-chip:focus-visible {
            outline: 2px solid #2d68c4;
            outline-offset: 2px;
            border-radius: 9999px;
        }
        .qfm-cal-nav:focus-visible,
        .qfm-cal-day:focus-visible {
            outline: 2px solid #2d68c4;
            outline-offset: 1px;
        }
        .qfm-cal-day:hover:not([aria-disabled="true"]):not([aria-selected="true"]) {
            background: rgba(45,104,196,0.1);
            color: #2d68c4;
        }
        .qfm-cal-nav:hover {
            background: rgba(45,104,196,0.1);
            color: #2d68c4;
        }
        .qfm-cal-nav:active,
        .qfm-cal-day:active:not([aria-disabled="true"]) {
            transform: scale(0.96);
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

function toIso(year: number, month: number, day: number): string {
    const m = String(month + 1).padStart(2, "0")
    const d = String(day).padStart(2, "0")
    return `${year}-${m}-${d}`
}

function parseIso(iso: string): { year: number; month: number; day: number } {
    const [y, m, d] = iso.split("-").map(Number)
    return { year: y, month: m - 1, day: d }
}

function monthLabel(year: number, month: number): string {
    return new Date(year, month, 1).toLocaleDateString("en-US", {
        month: "long",
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
            aria-hidden="true"
        >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    )
}

function ChevronIcon({ dir }: { dir: "prev" | "next" }) {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{ display: "block" }}
        >
            {dir === "prev" ? (
                <polyline points="15 18 9 12 15 6" />
            ) : (
                <polyline points="9 18 15 12 9 6" />
            )}
        </svg>
    )
}

function buildMonthGrid(year: number, month: number) {
    const firstDow = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells: Array<{ day: number; iso: string } | null> = []
    for (let i = 0; i < firstDow; i++) cells.push(null)
    for (let day = 1; day <= daysInMonth; day++) {
        cells.push({ day, iso: toIso(year, month, day) })
    }
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
}

function DateCalendar({
    selected,
    onSelect,
    onClose,
    labelledBy,
}: {
    selected: string | null
    onSelect: (iso: string) => void
    onClose: () => void
    labelledBy: string
}) {
    const initial = selected ? parseIso(selected) : (() => {
        const now = new Date()
        return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() }
    })()
    const [viewYear, setViewYear] = useState(initial.year)
    const [viewMonth, setViewMonth] = useState(initial.month)
    const [focusIso, setFocusIso] = useState(
        selected ?? toIso(initial.year, initial.month, initial.day)
    )
    const pendingFocusRef = useRef<string | null>(selected ?? toIso(initial.year, initial.month, initial.day))
    const panelRef = useRef<HTMLDivElement>(null)
    const gridId = useId()

    useLayoutEffect(() => {
        const iso = pendingFocusRef.current
        if (!iso) return
        const el = panelRef.current?.querySelector<HTMLElement>(`.qfm-cal-day[data-iso="${iso}"]`)
        el?.focus({ preventScroll: true })
        pendingFocusRef.current = null
    }, [viewYear, viewMonth, focusIso])

    function shiftMonth(delta: number) {
        const d = new Date(viewYear, viewMonth + delta, 1)
        setViewYear(d.getFullYear())
        setViewMonth(d.getMonth())
        // Keep focus on same day-of-month when possible
        const day = Math.min(parseIso(focusIso).day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate())
        const nextIso = toIso(d.getFullYear(), d.getMonth(), day)
        pendingFocusRef.current = nextIso
        setFocusIso(nextIso)
    }

    function moveFocusTo(next: Date) {
        const nYear = next.getFullYear()
        const nMonth = next.getMonth()
        const nextIso = toIso(nYear, nMonth, next.getDate())
        pendingFocusRef.current = nextIso
        if (nYear !== viewYear || nMonth !== viewMonth) {
            setViewYear(nYear)
            setViewMonth(nMonth)
        }
        setFocusIso(nextIso)
    }

    function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
        if (e.key === "Escape") {
            e.preventDefault()
            e.stopPropagation()
            onClose()
            return
        }

        const target = e.target as HTMLElement
        if (!target.classList.contains("qfm-cal-day")) return

        const iso = target.getAttribute("data-iso")
        if (!iso) return
        const { year, month, day } = parseIso(iso)

        switch (e.key) {
            case "ArrowLeft":
                e.preventDefault()
                moveFocusTo(new Date(year, month, day - 1))
                break
            case "ArrowRight":
                e.preventDefault()
                moveFocusTo(new Date(year, month, day + 1))
                break
            case "ArrowUp":
                e.preventDefault()
                moveFocusTo(new Date(year, month, day - 7))
                break
            case "ArrowDown":
                e.preventDefault()
                moveFocusTo(new Date(year, month, day + 7))
                break
            case "Home":
                e.preventDefault()
                moveFocusTo(new Date(year, month, 1))
                break
            case "End":
                e.preventDefault()
                moveFocusTo(new Date(year, month + 1, 0))
                break
            case "PageUp":
                e.preventDefault()
                shiftMonth(e.shiftKey ? -12 : -1)
                break
            case "PageDown":
                e.preventDefault()
                shiftMonth(e.shiftKey ? 12 : 1)
                break
            case "Enter":
            case " ":
                e.preventDefault()
                onSelect(iso)
                break
            default:
                break
        }
    }

    const cells = buildMonthGrid(viewYear, viewMonth)
    const todayIso = (() => {
        const n = new Date()
        return toIso(n.getFullYear(), n.getMonth(), n.getDate())
    })()

    const navBtn: CSSProperties = {
        width: 32,
        height: 32,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
        background: "transparent",
        borderRadius: 8,
        color: C.slateGray,
        cursor: "pointer",
        padding: 0,
        transition: "background 0.12s ease, color 0.12s ease, transform 0.1s ease",
        WebkitTapHighlightColor: "transparent",
    }

    return (
        <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            onKeyDown={onKeyDown}
            style={{
                background: C.white,
                borderRadius: 10,
                border: `1px solid ${C.border}`,
                boxShadow: "0 8px 28px rgba(15,23,42,0.14), 0 2px 6px rgba(0,0,0,0.06)",
                padding: "14px 12px 12px",
                fontFamily: C.font,
                userSelect: "none",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                    padding: "0 2px",
                }}
            >
                <button
                    type="button"
                    className="qfm-cal-nav"
                    aria-label="Previous month"
                    onClick={() => shiftMonth(-1)}
                    style={navBtn}
                >
                    <ChevronIcon dir="prev" />
                </button>
                <span
                    id={gridId}
                    style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: C.darkSlate,
                        fontFamily: C.font,
                        lineHeight: "20px",
                    }}
                >
                    {monthLabel(viewYear, viewMonth)}
                </span>
                <button
                    type="button"
                    className="qfm-cal-nav"
                    aria-label="Next month"
                    onClick={() => shiftMonth(1)}
                    style={navBtn}
                >
                    <ChevronIcon dir="next" />
                </button>
            </div>

            <div
                role="grid"
                aria-labelledby={gridId}
                style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}
            >
                {WEEKDAYS.map((d) => (
                    <div
                        key={d}
                        role="columnheader"
                        aria-label={d}
                        style={{
                            textAlign: "center",
                            fontSize: 11,
                            fontWeight: 500,
                            color: C.lightSlate,
                            fontFamily: C.font,
                            lineHeight: "20px",
                            paddingBottom: 4,
                        }}
                    >
                        {d}
                    </div>
                ))}
                {cells.map((cell, i) => {
                    if (!cell) {
                        return <div key={`e-${i}`} role="gridcell" aria-hidden="true" />
                    }
                    const isSelected = selected === cell.iso
                    const isToday = todayIso === cell.iso
                    const isFocused = focusIso === cell.iso
                    return (
                        <div key={cell.iso} role="gridcell" style={{ aspectRatio: "1" }}>
                            <button
                                type="button"
                                className="qfm-cal-day"
                                data-iso={cell.iso}
                                aria-label={formatDate(cell.iso)}
                                aria-selected={isSelected}
                                tabIndex={isFocused ? 0 : -1}
                                onClick={() => onSelect(cell.iso)}
                                onFocus={() => setFocusIso(cell.iso)}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    border: isToday && !isSelected ? `1px solid ${C.uclaBlue}` : "1px solid transparent",
                                    borderRadius: 8,
                                    background: isSelected ? C.uclaBlue : "transparent",
                                    color: isSelected ? C.white : C.darkSlate,
                                    fontSize: 13,
                                    fontWeight: isSelected || isToday ? 500 : 400,
                                    fontFamily: C.font,
                                    cursor: "pointer",
                                    padding: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "background 0.12s ease, color 0.12s ease, transform 0.1s ease",
                                    WebkitTapHighlightColor: "transparent",
                                }}
                            >
                                {cell.day}
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function DateCard({
    date,
    label,
    open,
    onToggle,
    triggerRef,
    controlsId,
}: {
    date: string | null
    label: string
    open: boolean
    onToggle: () => void
    triggerRef: (el: HTMLButtonElement | null) => void
    controlsId: string
}) {
    const card: CSSProperties = {
        background: C.white,
        borderRadius: 8,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: open
            ? `0 0 0 2px rgba(45,104,196,0.25), 0 1px 2px rgba(0,0,0,0.05)`
            : "0 1px 2px rgba(0,0,0,0.05)",
        width: "100%",
        boxSizing: "border-box",
        position: "relative",
        transition: "box-shadow 0.15s ease",
        cursor: "pointer",
        border: "none",
        textAlign: "left",
        fontFamily: C.font,
        WebkitTapHighlightColor: "transparent" as any,
    }

    return (
        <button
            ref={triggerRef}
            type="button"
            className="qfm-date-card"
            aria-label={label}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={open ? controlsId : undefined}
            onClick={onToggle}
            style={card}
        >
            <span
                style={{
                    fontSize: 14,
                    color: date ? C.darkSlate : C.lightSlate,
                    fontFamily: C.font,
                    fontWeight: 400,
                    lineHeight: "20px",
                    userSelect: "none",
                }}
            >
                {date ? formatDate(date) : "Select date"}
            </span>
            <CalendarIcon active={open} />
        </button>
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
    const moveInBtnRef = useRef<HTMLButtonElement | null>(null)
    const moveOutBtnRef = useRef<HTMLButtonElement | null>(null)
    const calendarWrapRef = useRef<HTMLDivElement>(null)
    const [scale, setScale] = useState(1)
    const [offsetX, setOffsetX] = useState(0)
    const [naturalHeight, setNaturalHeight] = useState(0)
    const [openField, setOpenField] = useState<"in" | "out" | null>(null)
    // Floating popover geometry in unscaled inner coordinates
    const [popover, setPopover] = useState<{ top: number; left: number; width: number } | null>(null)

    useEffect(() => { injectPickerStyles() }, [])

    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        const ro = new ResizeObserver(([entry]) => {
            const w = entry.contentRect.width
            // Same composition at every width. Only the uniform scale changes:
            // desktop sits at ~46% of the column; mobile matches the phone
            // mockup frame (~77%) so the artifact reads at a similar size.
            const factor = w <= 520 ? 0.77 : 0.46
            const s = (w / DESIGN_W) * factor
            setScale(s)
            setOffsetX((w - DESIGN_W * s) / 2)
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    // Outer clip height = unscaled inner height × scale.
    // Calendar is position:absolute, so open/close must not change height.
    useLayoutEffect(() => {
        const el = innerRef.current
        if (!el) return
        const measure = () => setNaturalHeight(el.offsetHeight)
        measure()
        const ro = new ResizeObserver(measure)
        ro.observe(el)
        return () => ro.disconnect()
    }, [scale])

    // Anchor the floating calendar under the active field (iOS-style popover).
    useLayoutEffect(() => {
        if (!openField) {
            setPopover(null)
            return
        }
        const inner = innerRef.current
        const trigger = (openField === "in" ? moveInBtnRef : moveOutBtnRef).current
        if (!inner || !trigger) return

        const place = () => {
            const innerRect = inner.getBoundingClientRect()
            const triggerRect = trigger.getBoundingClientRect()
            // Convert screen coords → unscaled inner coords (parent is scaled).
            const s = scale > 0 ? scale : 1
            const gap = 8
            const pad = 20
            const maxWidth = inner.clientWidth - pad * 2
            // Compact panel: at least the field width, up to content width.
            const fieldWidth = triggerRect.width / s
            const width = Math.min(maxWidth, Math.max(fieldWidth, Math.min(300, maxWidth)))
            const triggerLeft = (triggerRect.left - innerRect.left) / s
            const triggerRight = (triggerRect.right - innerRect.left) / s
            // Prefer aligning to the active field; right-align for Move Out so
            // the panel stays visually tethered when it would overflow the mock.
            let left = openField === "out" ? triggerRight - width : triggerLeft
            left = Math.max(pad, Math.min(left, inner.clientWidth - pad - width))
            const top = (triggerRect.bottom - innerRect.top) / s + gap
            setPopover({ top, left, width })
        }

        place()
    }, [openField, scale])

    // Focusing a day inside the scaled tree can scroll an overflow shell.
    // Keep scroll locked at 0 when the shell is clipping (calendar closed).
    useLayoutEffect(() => {
        const el = containerRef.current
        if (!el || openField) return
        el.scrollTop = 0
        const lock = () => { if (el.scrollTop) el.scrollTop = 0 }
        el.addEventListener("scroll", lock, { passive: true })
        return () => el.removeEventListener("scroll", lock)
    }, [openField])

    // Esc + click outside to close
    useEffect(() => {
        if (!openField) return

        function onKey(e: globalThis.KeyboardEvent) {
            if (e.key === "Escape") {
                e.preventDefault()
                const field = openField
                setOpenField(null)
                requestAnimationFrame(() => {
                    ;(field === "in" ? moveInBtnRef : moveOutBtnRef).current?.focus({ preventScroll: true })
                })
            }
        }

        function onPointerDown(e: PointerEvent) {
            const target = e.target as Node
            if (calendarWrapRef.current?.contains(target)) return
            if (moveInBtnRef.current?.contains(target)) return
            if (moveOutBtnRef.current?.contains(target)) return
            setOpenField(null)
        }

        document.addEventListener("keydown", onKey)
        document.addEventListener("pointerdown", onPointerDown)
        return () => {
            document.removeEventListener("keydown", onKey)
            document.removeEventListener("pointerdown", onPointerDown)
        }
    }, [openField])

    const [selected, setSelected] = useState<string[]>([defaultQuarter])
    const [manualMoveIn, setManualMoveIn] = useState<string | null>(null)
    const [manualMoveOut, setManualMoveOut] = useState<string | null>(null)

    function handleToggle(value: string) {
        setSelected((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        )
        setManualMoveIn(null)
        setManualMoveOut(null)
        setOpenField(null)
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

    function closeCalendar(returnFocus = true) {
        const field = openField
        setOpenField(null)
        if (returnFocus && field) {
            requestAnimationFrame(() => {
                ;(field === "in" ? moveInBtnRef : moveOutBtnRef).current?.focus({ preventScroll: true })
            })
        }
    }

    function handleSelect(iso: string) {
        if (openField === "in") setManualMoveIn(iso)
        else if (openField === "out") setManualMoveOut(iso)
        closeCalendar(true)
    }

    const calendarTitleId = useId()
    const calendarPanelId = useId()

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%" }}>
            {showBadge && <InteractiveBadge />}
            <div
                ref={containerRef}
                style={{
                    width: "100%",
                    height: naturalHeight ? naturalHeight * scale : "auto",
                    // Visible while open so the floating calendar can hang over
                    // the card edge; clipped when closed for scaled corner polish.
                    overflow: openField ? "visible" : "clip",
                    borderRadius: 8,
                    // translateZ forces a compositing layer so overflow clipping
                    // correctly clips the transformed child's rounded corners.
                    transform: "translateZ(0)",
                    // Let the popover paint above neighboring case-study content
                    zIndex: openField ? 5 : 0,
                    position: "relative",
                }}
            >
                <div
                    ref={innerRef}
                    style={{
                        width: DESIGN_W,
                        minWidth: DESIGN_W,
                        maxWidth: DESIGN_W,
                        transformOrigin: "top left",
                        transform: `translateX(${offsetX}px) scale(${scale})`,
                        background: C.background,
                        // Scale-compensated radius so corners read as ~8px after scaling
                        borderRadius: scale > 0 ? Math.round(8 / scale) : 8,
                        padding: "24px 20px",
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                        fontFamily: C.font,
                        position: "relative",
                    }}
                >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: 12, color: C.slateGray, fontFamily: C.font }}>Move In</span>
                        <span style={{ fontSize: 12, color: C.slateGray, fontFamily: C.font }}>Move Out</span>
                    </div>
                    <div
                        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}
                    >
                        <DateCard
                            date={moveIn}
                            label="Move In date"
                            open={openField === "in"}
                            onToggle={() => setOpenField((f) => (f === "in" ? null : "in"))}
                            triggerRef={(el) => { moveInBtnRef.current = el }}
                            controlsId={calendarPanelId}
                        />
                        <DateCard
                            date={moveOut}
                            label="Move Out date"
                            open={openField === "out"}
                            onToggle={() => setOpenField((f) => (f === "out" ? null : "out"))}
                            triggerRef={(el) => { moveOutBtnRef.current = el }}
                            controlsId={calendarPanelId}
                        />
                    </div>

                    {openField && popover && (
                        <div
                            ref={calendarWrapRef}
                            id={calendarPanelId}
                            style={{
                                position: "absolute",
                                top: popover.top,
                                left: popover.left,
                                width: popover.width,
                                zIndex: 30,
                            }}
                        >
                            <span id={calendarTitleId} style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                                {openField === "in" ? "Choose move-in date" : "Choose move-out date"}
                            </span>
                            <DateCalendar
                                key={openField}
                                selected={openField === "in" ? moveIn : moveOut}
                                onSelect={handleSelect}
                                onClose={() => closeCalendar(true)}
                                labelledBy={calendarTitleId}
                            />
                        </div>
                    )}

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
                                whiteSpace: "nowrap",
                                userSelect: "none",
                                boxSizing: "border-box",
                            }
                            return (
                                <button
                                    key={q.value}
                                    type="button"
                                    className="qfm-quarter-chip"
                                    aria-pressed={isSelected}
                                    onClick={() => handleToggle(q.value)}
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        padding: 0,
                                        margin: 0,
                                        cursor: "pointer",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flex: "0 0 auto",
                                        WebkitTapHighlightColor: "transparent",
                                    }}
                                >
                                    <span style={chip}>{q.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
