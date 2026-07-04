"use client";

import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    startTransition,
    type CSSProperties,
} from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface GalleryItem {
    src: string;
    alt?: string;
    caption?: string;
    colSpan?: 1 | 2;
    rowSpan?: 1 | 2;
}
interface PixPos {
    left: number;
    top: number;
}
interface Tx {
    x: number;
    y: number;
    s: number;
}
interface BBox {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}
interface Props {
    items?: GalleryItem[];
    columns?: number;
    gap?: number;
    cellAspect?: number;
    overviewMode?: "width" | "fit";
    maxZoom?: number;
    minZoomFactor?: number;
    style?: CSSProperties;
}

// ── Pure utilities ─────────────────────────────────────────────────────────────
const clamp = (v: number, lo: number, hi: number) =>
    Math.max(lo, Math.min(hi, v));
const elastic = (v: number, lo: number, hi: number, k = 0.22) =>
    v < lo ? lo + (v - lo) * k : v > hi ? hi + (v - hi) * k : v;

// ── Slider geometry (horizontal) ──────────────────────────────────────────────
const TRACK_W = 110;
const TRACK_PADH = 12;

const scaleToThumbX = (s: number, zMin: number, zMax: number) => {
    const lMin = Math.log(zMin),
        lMax = Math.log(zMax);
    return ((Math.log(clamp(s, zMin, zMax)) - lMin) / (lMax - lMin)) * TRACK_W;
};
const thumbXToScale = (px: number, zMin: number, zMax: number) => {
    const lMin = Math.log(zMin),
        lMax = Math.log(zMax);
    return Math.exp(lMin + (clamp(px, 0, TRACK_W) / TRACK_W) * (lMax - lMin));
};

// ── Masonry packer ─────────────────────────────────────────────────────────────
function packMasonry(
    items: GalleryItem[],
    cols: number,
    colUnit: number,
    imgUnitH: number,
    captionH: number,
    hasCaps: boolean,
    gap: number
): PixPos[] {
    const colH = new Array(cols).fill(0);
    const fullH = (rs: number) =>
        rs * imgUnitH + (rs - 1) * gap + (hasCaps ? captionH : 0);

    return items.map((item) => {
        const cs = clamp(item.colSpan ?? 1, 1, cols);
        const rs = item.rowSpan ?? 1;
        if (cs === 1) {
            let best = 0;
            for (let c = 1; c < cols; c++) if (colH[c] < colH[best]) best = c;
            const top = colH[best];
            colH[best] += fullH(rs) + gap;
            return { left: best * (colUnit + gap), top };
        } else {
            let bestStart = 0,
                bestTop = Infinity;
            for (let c = 0; c <= cols - cs; c++) {
                const h = Math.max(...colH.slice(c, c + cs));
                if (h < bestTop) {
                    bestTop = h;
                    bestStart = c;
                }
            }
            const top = bestTop;
            for (let i = 0; i < cs; i++)
                colH[bestStart + i] = top + fullH(rs) + gap;
            return { left: bestStart * (colUnit + gap), top };
        }
    });
}

// ── Constants ─────────────────────────────────────────────────────────────────
const CAPTION_H = 24;
const CLICK_PX = 8;
const EDGE_PAD = 240;  // large pad = canvas can scroll freely past edges
const ZOOM_MIN = 0.06;
const ZOOM_ABS = 8;

// ── Dark mode hook ─────────────────────────────────────────────────────────────
function useIsDark() {
    const [isDark, setIsDark] = useState(false);
    useEffect(() => {
        const check = () =>
            setIsDark(
                document.documentElement.dataset.theme === "dark" ||
                    document.documentElement.classList.contains("dark")
            );
        check();
        const obs = new MutationObserver(check);
        obs.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["data-theme", "class"],
        });
        return () => obs.disconnect();
    }, []);
    return isDark;
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function Crosshair({ show, isDark }: { show: boolean; isDark: boolean }) {
    const line: CSSProperties = {
        position: "absolute",
        background: isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.22)",
        margin: "auto",
    };
    return (
        <div
            style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: 38,
                height: 38,
                pointerEvents: "none",
                zIndex: 9,
                opacity: show ? 1 : 0,
                transition: "opacity 0.5s ease",
            }}
        >
            <div
                style={{
                    ...line,
                    width: 1,
                    top: 0,
                    bottom: 0,
                    left: "50%",
                    transform: "translateX(-0.5px)",
                }}
            />
            <div
                style={{
                    ...line,
                    height: 1,
                    left: 0,
                    right: 0,
                    top: "50%",
                    transform: "translateY(-0.5px)",
                }}
            />
        </div>
    );
}

function PanIcon({ isDark }: { isDark: boolean }) {
    return (
        <svg
            viewBox="0 0 20 20"
            width="13"
            height="13"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: "block", flexShrink: 0 }}
        >
            <path
                d="M 7.5 4.583 L 9.117 2.967 C 9.605 2.479 10.395 2.479 10.883 2.967 L 12.5 4.583 M 4.583 7.5 L 2.967 9.117 C 2.479 9.605 2.479 10.395 2.967 10.883 L 4.583 12.5 M 15.417 7.5 L 17.033 9.117 C 17.521 9.605 17.521 10.395 17.033 10.883 L 15.417 12.5 M 12.5 15.417 L 10.883 17.033 C 10.395 17.521 9.605 17.521 9.117 17.033 L 7.5 15.417 M 10 3.333 L 10 10 M 10 10 L 10 16.667 M 10 10 L 3.333 10 M 10 10 L 16.667 10"
                fill="none"
                strokeWidth="1.5"
                stroke={isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)"}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function TapIcon({ isDark }: { isDark: boolean }) {
    return (
        <svg
            viewBox="0 0 20 20"
            width="13"
            height="13"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: "block", flexShrink: 0 }}
        >
            <path
                d="M 10 2 L 10 11 M 10 11 L 7 8.5 M 10 11 L 13 8.5 M 7 14 C 7 15.657 8.343 17 10 17 C 11.657 17 13 15.657 13 14 L 13 11 C 13 11 12 10.5 10 10.5 C 8 10.5 7 11 7 11 Z"
                fill="none"
                strokeWidth="1.5"
                stroke={isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)"}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

// ── BentoGallery ───────────────────────────────────────────────────────────────
export default function BentoGallery({
    items = [],
    columns = 4,
    gap = 16,
    cellAspect = 0.65,
    overviewMode = "width",
    maxZoom = 4,
    minZoomFactor = 0,
    style,
}: Props) {
    const isStatic = false;
    const isDark = useIsDark();

    const zMax = clamp(maxZoom, 1, ZOOM_ABS);

    const rootRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const thumbRef = useRef<HTMLDivElement>(null);
    const selectorRef = useRef<HTMLDivElement>(null);
    const tx = useRef<Tx>({ x: 0, y: 0, s: 1 });
    const zMaxRef = useRef(zMax);
    zMaxRef.current = zMax;
    const zMinRef = useRef(ZOOM_MIN);

    const [vw, setVw] = useState(1280);
    const [vh, setVh] = useState(720);
    const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    // Fade-in once all images are loaded
    const [ready, setReady] = useState(false);
    const loadedCountRef = useRef(0);
    const totalImages = items.filter((i) => i.src).length;
    const markLoaded = useCallback(() => {
        loadedCountRef.current++;
        if (loadedCountRef.current >= totalImages) setReady(true);
    }, [totalImages]);
    // Fallback: show after 800ms even if some images stall
    useEffect(() => {
        const t = setTimeout(() => setReady(true), 800);
        return () => clearTimeout(t);
    }, []);

    const focusedRef = useRef<number | null>(null);
    focusedRef.current = focusedIdx;


    useLayoutEffect(() => {
        if (typeof window === "undefined") return;
        const root = rootRef.current;
        if (!root) return;
        const ro = new ResizeObserver(() =>
            startTransition(() => {
                setVw(root.offsetWidth);
                setVh(root.offsetHeight);
            })
        );
        ro.observe(root);
        setVw(root.offsetWidth);
        setVh(root.offsetHeight);
        return () => ro.disconnect();
    }, []);

    useLayoutEffect(() => {
        const th = thumbRef.current;
        if (!th) return;
        const thumbX = scaleToThumbX(tx.current.s, zMinRef.current, zMaxRef.current);
        th.style.left = TRACK_PADH + thumbX - 4 + "px";
    }, []);

    // ── Grid geometry ─────────────────────────────────────────────────────────
    const colUnit = Math.max(80, (vw - (columns - 1) * gap) / columns);
    const imgUnitH = colUnit * cellAspect;
    const hasCaps = items.some((it) => it.caption);

    const cW = (cs: number) =>
        clamp(cs, 1, columns) * colUnit + (clamp(cs, 1, columns) - 1) * gap;
    const cImgH = (rs: number) => rs * imgUnitH + (rs - 1) * gap;

    const positions = useMemo(
        () =>
            packMasonry(
                items,
                columns,
                colUnit,
                imgUnitH,
                CAPTION_H,
                hasCaps,
                gap
            ),
        [items, columns, colUnit, imgUnitH, hasCaps, gap]
    );

    const canvasW = columns * colUnit + (columns - 1) * gap;
    const canvasH = useMemo(() => {
        let max = 1;
        positions.forEach((pos, i) => {
            const item = items[i];
            if (!item) return;
            const b =
                pos.top + cImgH(item.rowSpan ?? 1) + (hasCaps ? CAPTION_H : 0);
            if (b > max) max = b;
        });
        return max;
    }, [positions, items, imgUnitH, hasCaps, gap]);

    // ── Bounds ────────────────────────────────────────────────────────────────
    const getBounds = useCallback(
        (s: number): BBox => {
            const cws = canvasW * s,
                chs = canvasH * s;
            return {
                minX: cws > vw ? -(cws - vw) - EDGE_PAD : (vw - cws) / 2,
                maxX: cws > vw ? EDGE_PAD : (vw - cws) / 2,
                minY: chs > vh ? -(chs - vh) - EDGE_PAD : (vh - chs) / 2,
                maxY: chs > vh ? EDGE_PAD : (vh - chs) / 2,
            };
        },
        [canvasW, canvasH, vw, vh]
    );

    // ── Apply transform ───────────────────────────────────────────────────────
    const applyTransform = useCallback(
        (
            x: number,
            y: number,
            s: number,
            easing: "none" | "focus" | "snap" | "spring" | "flow" = "none"
        ) => {
            tx.current = { x, y, s };
            const el = canvasRef.current;
            if (!el) return;

            const DUR: Record<string, string> = {
                none: "none",
                focus: "transform 1.5s cubic-bezier(0.16, 1, 0.3, 1)",
                snap: "transform .45s cubic-bezier(.22,1,.36,1)",
                spring: "transform .5s cubic-bezier(.34,1.4,.64,1)",
                flow: "transform .6s cubic-bezier(.4,0,.2,1)",
            };
            el.style.transition = DUR[easing];
            el.style.transform = `translate(${x}px,${y}px) scale(${s})`;

            const th = thumbRef.current;
            if (th) {
                const thumbX = scaleToThumbX(s, zMinRef.current, zMaxRef.current);
                th.style.left = TRACK_PADH + thumbX - 4 + "px";
            }
        },
        [vw, vh]
    );

    const snapToBounds = useCallback(
        (easing: "spring" | "flow" = "spring") => {
            const { x, y, s } = tx.current;
            const b = getBounds(s);
            const nx = clamp(x, b.minX, b.maxX);
            const ny = clamp(y, b.minY, b.maxY);
            if (Math.abs(nx - x) > 0.5 || Math.abs(ny - y) > 0.5)
                applyTransform(nx, ny, s, easing);
        },
        [getBounds, applyTransform]
    );

    // ── Overview + Focus ──────────────────────────────────────────────────────
    const getOverviewT = useCallback((): Tx => {
        if (overviewMode === "fit") {
            const s =
                Math.min(vw / Math.max(1, canvasW), vh / Math.max(1, canvasH)) *
                0.88;
            return { x: (vw - canvasW * s) / 2, y: (vh - canvasH * s) / 2, s };
        }
        const s = (vw / Math.max(1, canvasW)) * 0.96;
        const scaledH = canvasH * s;
        // Start grid with 48px breathing room from top (consistent with page padding)
        const y = scaledH <= vh ? (vh - scaledH) / 2 : 48;
        return { x: (vw - canvasW * s) / 2, y, s };
    }, [vw, vh, canvasW, canvasH, overviewMode]);

    const getFocusT = useCallback(
        (idx: number): Tx => {
            const pos = positions[idx];
            const item = items[idx];
            if (!pos || !item) return getOverviewT();
            const cs = item.colSpan ?? 1,
                rs = item.rowSpan ?? 1;
            const iw = cW(cs),
                ih = cImgH(rs);
            const s_ov = getOverviewT().s;
            const s = Math.max(
                s_ov * 1.25,
                Math.min(
                    s_ov * 3.5,
                    Math.min(
                        (vw * 0.38) / Math.max(1, iw),
                        (vh * 0.5) / Math.max(1, ih)
                    )
                )
            );
            return {
                x: (vw - iw * s) / 2 - pos.left * s,
                y: (vh - ih * s) / 2 - pos.top * s,
                s,
            };
        },
        [positions, items, getOverviewT, vw, vh, colUnit, imgUnitH, gap, columns]
    );

    // ── Selector border ───────────────────────────────────────────────────────
    const FOCUS_E = "cubic-bezier(0.16,1,0.3,1)";

    const showSelector = useCallback(
        (idx: number, animate: boolean) => {
            const sel = selectorRef.current;
            if (!sel) return;
            const item = items[idx];
            if (!item) return;
            const t = getFocusT(idx);
            const cs = clamp(item.colSpan ?? 1, 1, columns);
            const rs = item.rowSpan ?? 1;
            const iw = cs * colUnit + (cs - 1) * gap;
            const ih = rs * imgUnitH + (rs - 1) * gap;
            sel.style.transition = animate
                ? `width 1.5s ${FOCUS_E}, height 1.5s ${FOCUS_E}, opacity 0.4s ease`
                : "none";
            sel.style.width = iw * t.s + "px";
            sel.style.height = ih * t.s + "px";
            sel.style.opacity = "1";
        },
        [getFocusT, items, columns, colUnit, gap, imgUnitH]
    );

    const hideSelector = useCallback((animate = true) => {
        const sel = selectorRef.current;
        if (!sel) return;
        sel.style.transition = animate ? "opacity 0.45s ease" : "none";
        sel.style.opacity = "0";
    }, []);

    const goOverview = useCallback(() => {
        startTransition(() => setFocusedIdx(null));
        const t = getOverviewT();
        applyTransform(t.x, t.y, t.s, "flow");
        hideSelector();
        if (rootRef.current) rootRef.current.style.cursor = "crosshair";
    }, [getOverviewT, applyTransform, hideSelector]);

    const focusCell = useCallback(
        (idx: number) => {
            startTransition(() => setFocusedIdx(idx));
            const t = getFocusT(idx);
            applyTransform(t.x, t.y, t.s, "focus");
            showSelector(idx, true);
            if (rootRef.current) rootRef.current.style.cursor = "crosshair";
        },
        [getFocusT, applyTransform, showSelector]
    );

    // ── Zoom helpers ──────────────────────────────────────────────────────────
    const zoomToCenter = useCallback(
        (
            ns: number,
            easing: "none" | "snap" | "focus" | "spring" | "flow" = "snap"
        ) => {
            const zm = zMaxRef.current;
            ns = clamp(ns, zMinRef.current, zm);
            const { x, y, s } = tx.current;
            const cx = vw / 2,
                cy = vh / 2;
            const nx = cx - (cx - x) * (ns / s);
            const ny = cy - (cy - y) * (ns / s);
            const b = getBounds(ns);
            applyTransform(
                clamp(nx, b.minX, b.maxX),
                clamp(ny, b.minY, b.maxY),
                ns,
                easing
            );
        },
        [vw, vh, getBounds, applyTransform]
    );

    const zoomBy = useCallback(
        (factor: number) => {
            zoomToCenter(tx.current.s * factor, "snap");
            setTimeout(() => snapToBounds("spring"), 500);
        },
        [zoomToCenter, snapToBounds]
    );

    // ── Slider drag ───────────────────────────────────────────────────────────
    const onThumbDown = useCallback(
        (e: React.PointerEvent) => {
            e.stopPropagation();
            e.preventDefault();
            const startX = e.clientX;
            const zm = zMaxRef.current;
            const startPx = scaleToThumbX(tx.current.s, zMinRef.current, zm);

            const onMove = (ev: PointerEvent) => {
                const newPx = clamp(startPx + (ev.clientX - startX), 0, TRACK_W);
                const ns = thumbXToScale(newPx, zMinRef.current, zm);
                const { x, y, s } = tx.current;
                const cx = vw / 2,
                    cy = vh / 2;
                const ratio = ns / Math.max(s, 0.001);
                const nx = cx - (cx - x) * ratio;
                const ny = cy - (cy - y) * ratio;
                const b = getBounds(ns);
                applyTransform(
                    clamp(nx, b.minX, b.maxX),
                    clamp(ny, b.minY, b.maxY),
                    ns,
                    "none"
                );
            };
            const onUp = () => {
                window.removeEventListener("pointermove", onMove);
                window.removeEventListener("pointerup", onUp);
                snapToBounds("spring");
            };
            window.addEventListener("pointermove", onMove);
            window.addEventListener("pointerup", onUp);
        },
        [vw, vh, getBounds, applyTransform, snapToBounds]
    );

    const onTrackClick = useCallback(
        (e: React.MouseEvent) => {
            if ((e.target as HTMLElement) === thumbRef.current) return;
            const rect = (
                e.currentTarget as HTMLElement
            ).getBoundingClientRect();
            const px = clamp(e.clientX - rect.left - TRACK_PADH, 0, TRACK_W);
            zoomToCenter(thumbXToScale(px, zMinRef.current, zMaxRef.current), "snap");
            setTimeout(() => snapToBounds("spring"), 500);
        },
        [zoomToCenter, snapToBounds]
    );

    // ── Init / resize — always "none" to avoid jarring scale-in ──────────────
    useEffect(() => {
        // Recompute dynamic min zoom whenever layout changes
        if (minZoomFactor > 0) {
            zMinRef.current = Math.max(ZOOM_MIN, getOverviewT().s * minZoomFactor);
        }
        const fi = focusedRef.current;
        if (fi !== null) {
            const t = getFocusT(fi);
            applyTransform(t.x, t.y, t.s, "none");
            showSelector(fi, false);
        } else {
            const t = getOverviewT();
            applyTransform(t.x, t.y, t.s, "none");
        }
    }, [vw, vh, canvasW, canvasH]);


    // ── Keyboard ──────────────────────────────────────────────────────────────
    useEffect(() => {
        if (typeof window === "undefined") return;
        const onKey = (e: KeyboardEvent) => {
            const fi = focusedRef.current;
            if (e.key === "Escape") {
                goOverview();
                return;
            }
            if (fi === null) return;
            const dirs: Record<string, [number, number]> = {
                ArrowLeft: [-1, 0],
                ArrowRight: [1, 0],
                ArrowUp: [0, -1],
                ArrowDown: [0, 1],
            };
            const d = dirs[e.key];
            if (!d) return;
            e.preventDefault();
            const [dx, dy] = d;
            const curPos = positions[fi];
            if (!curPos) return;
            const item = items[fi];
            const cx = curPos.left + cW(item?.colSpan ?? 1) / 2;
            const cy = curPos.top + cImgH(item?.rowSpan ?? 1) / 2;
            let best = fi,
                bScore = Infinity;
            positions.forEach((p, i) => {
                if (i === fi) return;
                const it = items[i];
                const ex = p.left + cW(it?.colSpan ?? 1) / 2;
                const ey = p.top + cImgH(it?.rowSpan ?? 1) / 2;
                const rX = ex - cx,
                    rY = ey - cy;
                if (rX * dx + rY * dy <= 0) return;
                const sc =
                    Math.hypot(rX, rY) + Math.abs(rX * dy - rY * dx) * 0.8;
                if (sc < bScore) {
                    bScore = sc;
                    best = i;
                }
            });
            if (best !== fi) focusCell(best);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [positions, items, goOverview, focusCell]);

    // ── Wheel ─────────────────────────────────────────────────────────────────
    const wheelTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    useEffect(() => {
        if (typeof window === "undefined") return;
        const el = rootRef.current;
        if (!el) return;
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            const { x, y, s } = tx.current;
            const zm = zMaxRef.current;
            if (e.ctrlKey || e.metaKey) {
                const factor = e.deltaY < 0 ? 1.07 : 0.93;
                const ns = clamp(s * factor, zMinRef.current, zm);
                const nx = e.clientX - (e.clientX - x) * (ns / s);
                const ny = e.clientY - (e.clientY - y) * (ns / s);
                const b = getBounds(ns);
                applyTransform(
                    clamp(nx, b.minX, b.maxX),
                    clamp(ny, b.minY, b.maxY),
                    ns,
                    "none"
                );
            } else {
                // Free scroll — elastic resistance past edges but no hard clamp
                const b = getBounds(s);
                applyTransform(
                    elastic(x - e.deltaX, b.minX, b.maxX),
                    elastic(y - e.deltaY, b.minY, b.maxY),
                    s,
                    "none"
                );
            }
            clearTimeout(wheelTimer.current);
        };
        el.addEventListener("wheel", onWheel, { passive: false });
        return () => {
            el.removeEventListener("wheel", onWheel);
            clearTimeout(wheelTimer.current);
        };
    }, [applyTransform, getBounds]);

    // ── Pointer drag + pinch ──────────────────────────────────────────────────
    const ptrs = useRef(new Map<number, { x: number; y: number }>());
    const gst = useRef({
        startX: 0,
        startY: 0,
        panX: 0,
        panY: 0,
        moved: false,
        p2: false,
        p2dist: 0,
        p2scale: 1,
        p2mx: 0,
        p2my: 0,
        p2px: 0,
        p2py: 0,
    });

    const onPointerDown = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
            if (ptrs.current.size === 1) {
                const g = gst.current;
                g.startX = e.clientX;
                g.startY = e.clientY;
                g.panX = tx.current.x;
                g.panY = tx.current.y;
                g.moved = false;
                g.p2 = false;
            } else if (ptrs.current.size === 2) {
                const pts = [...ptrs.current.values()];
                const g = gst.current;
                g.p2 = true;
                g.moved = true;
                g.p2dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
                g.p2scale = tx.current.s;
                g.p2mx = (pts[0].x + pts[1].x) / 2;
                g.p2my = (pts[0].y + pts[1].y) / 2;
                g.p2px = tx.current.x;
                g.p2py = tx.current.y;
            }
        },
        []
    );

    const onPointerMove = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            if (e.buttons === 0) return;
            ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
            const g = gst.current;
            const zm = zMaxRef.current;

            if (g.p2 && ptrs.current.size >= 2) {
                const pts = [...ptrs.current.values()];
                const dist = Math.hypot(
                    pts[1].x - pts[0].x,
                    pts[1].y - pts[0].y
                );
                const mid = {
                    x: (pts[0].x + pts[1].x) / 2,
                    y: (pts[0].y + pts[1].y) / 2,
                };
                const ns = clamp(
                    (g.p2scale * dist) / Math.max(1, g.p2dist),
                    zMinRef.current,
                    zm
                );
                const sr = ns / g.p2scale;
                const nx = mid.x - (g.p2mx - g.p2px) * sr;
                const ny = mid.y - (g.p2my - g.p2py) * sr;
                const b = getBounds(ns);
                applyTransform(
                    elastic(nx, b.minX, b.maxX),
                    elastic(ny, b.minY, b.maxY),
                    ns,
                    "none"
                );
            } else if (ptrs.current.size === 1) {
                const dx = e.clientX - g.startX,
                    dy = e.clientY - g.startY;
                if (!g.moved && Math.hypot(dx, dy) > CLICK_PX) {
                    g.moved = true;
                    try {
                        (e.currentTarget as HTMLElement).setPointerCapture(
                            e.pointerId
                        );
                    } catch {}
                    if (rootRef.current)
                        rootRef.current.style.cursor = "grabbing";
                }
                if (g.moved) {
                    const b = getBounds(tx.current.s);
                    applyTransform(
                        elastic(g.panX + dx, b.minX, b.maxX),
                        elastic(g.panY + dy, b.minY, b.maxY),
                        tx.current.s,
                        "none"
                    );
                }
            }
        },
        [applyTransform, getBounds]
    );

    const onPointerUp = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            ptrs.current.delete(e.pointerId);
            if (ptrs.current.size < 2) gst.current.p2 = false;
            if (ptrs.current.size === 0) {
                // Canvas rests wherever it lands — no snap-to-bounds or auto-focus
                if (rootRef.current) rootRef.current.style.cursor = "crosshair";
                setTimeout(() => { gst.current.moved = false; }, 0);
            }
        },
        []
    );

    const onCellClick = useCallback(
        (e: React.MouseEvent, idx: number) => {
            e.stopPropagation();
            if (gst.current.moved) return;
            if (focusedRef.current === idx) goOverview();
            else focusCell(idx);
        },
        [goOverview, focusCell]
    );

    const onBgClick = useCallback(() => {
        if (!gst.current.moved && focusedRef.current !== null) goOverview();
    }, [goOverview]);

    const zoomed = focusedIdx !== null;

    // ── Theme-aware styles ────────────────────────────────────────────────────
    const panelBg = isDark
        ? "rgba(24,24,24,0.92)"
        : "rgba(252,252,252,0.95)";
    const panelBorder = isDark
        ? "1px solid rgba(255,255,255,0.1)"
        : "1px solid rgba(0,0,0,0.12)";
    const panelShadow = isDark
        ? "0 2px 12px rgba(0,0,0,0.5)"
        : "0 2px 12px rgba(0,0,0,0.1)";

    const panelBase: CSSProperties = {
        background: panelBg,
        border: panelBorder,
        boxShadow: panelShadow,
        borderRadius: 6,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
    };

    const hintTextColor = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)";
    const dividerColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)";
    const thumbColor = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";
    const thumbHoverColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
    const zpBtnColor = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
    const zpBtnHoverColor = isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.85)";
    const trackLineColor = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)";
    const outlineNormal = isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)";
    const outlineHover = isDark ? "1.5px solid rgba(255,255,255,0.35)" : "1.5px solid rgba(0,0,0,0.3)";
    const selectorBorderColor = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.42)";
    const captionActive = isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.7)";
    const captionHovered = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";
    const captionBase = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)";

    const zpBtn: CSSProperties = {
        width: 34,
        height: "100%",
        background: "transparent",
        border: "none",
        color: zpBtnColor,
        fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
        fontSize: 18,
        fontWeight: 300,
        lineHeight: 1,
        cursor: "pointer",
        padding: 0,
        outline: "none",
        WebkitTapHighlightColor: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: "color .15s ease",
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div
            ref={rootRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onClick={onBgClick}
            style={{
                ...style,
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                background: "var(--color-bg)",
                cursor: "crosshair",
                touchAction: "none",
                userSelect: "none",
                opacity: ready ? 1 : 0,
                transform: ready ? "translateY(0)" : "translateY(10px)",
                transition: ready ? "opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)" : "none",
            }}
        >
            {/* ── Canvas ── */}
            <div
                ref={canvasRef}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: canvasW,
                    height: canvasH,
                    transformOrigin: "top left",
                    willChange: "transform",
                }}
            >
                {items.map((item, i) => {
                    const pos = positions[i];
                    if (!pos) return null;
                    const cs = clamp(item.colSpan ?? 1, 1, columns);
                    const rs = item.rowSpan ?? 1;
                    const iw = cW(cs);
                    const imgH = cImgH(rs);
                    const isActive = focusedIdx === i;
                    const isHovered = hoveredIdx === i && !isActive && !zoomed;
                    const dimmed = zoomed && !isActive;

                    return (
                        <div
                            key={i}
                            onClick={(e) => onCellClick(e, i)}
                            onMouseEnter={() => {
                                if (!gst.current.moved) setHoveredIdx(i);
                            }}
                            onMouseLeave={() => setHoveredIdx(null)}
                            role="button"
                            tabIndex={0}
                            aria-label={item.caption ?? item.alt ?? `Image ${i + 1}`}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ")
                                    onCellClick(e as unknown as React.MouseEvent, i);
                            }}
                            style={{
                                position: "absolute",
                                left: pos.left,
                                top: pos.top,
                                width: iw,
                                cursor: dimmed ? "default" : "crosshair",
                                opacity: dimmed ? 0.42 : 1,
                                transition: "opacity .65s cubic-bezier(.4,0,.2,1)",
                            }}
                        >
                            <div
                                style={{
                                    width: iw,
                                    height: imgH,
                                    overflow: "hidden",
                                    position: "relative",
                                    outline: isHovered ? outlineHover : outlineNormal,
                                    outlineOffset: 0,
                                    transition: "outline .2s ease",
                                }}
                            >
                                {item.src ? (
                                    <img
                                        loading="eager"
                                        src={item.src}
                                        alt={item.alt ?? ""}
                                        draggable={false}
                                        onLoad={markLoaded}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            display: "block",
                                            pointerEvents: "none",
                                        }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            background: isDark
                                                ? "rgba(255,255,255,0.04)"
                                                : "rgba(0,0,0,0.04)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: isDark
                                                ? "rgba(255,255,255,0.15)"
                                                : "rgba(0,0,0,0.15)",
                                            fontSize: 11,
                                            fontFamily:
                                                "Helvetica Neue, Helvetica, Arial, sans-serif",
                                            letterSpacing: "0.08em",
                                        }}
                                    >
                                        {i + 1}
                                    </div>
                                )}
                            </div>

                            {hasCaps && (
                                <div
                                    style={{
                                        paddingTop: 7,
                                        height: CAPTION_H,
                                        overflow: "hidden",
                                        fontFamily:
                                            "var(--font-sans, 'Helvetica Neue', Helvetica, Arial, sans-serif)",
                                        fontSize: 11,
                                        fontWeight: isActive ? 500 : 400,
                                        letterSpacing: "0.01em",
                                        color: isActive
                                            ? captionActive
                                            : isHovered
                                              ? captionHovered
                                              : captionBase,
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis",
                                        lineHeight: 1,
                                        pointerEvents: "none",
                                        transition: "color .3s ease, font-weight .3s ease",
                                    }}
                                >
                                    {item.caption ?? ""}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ── Crosshair ── */}
            <Crosshair show={!zoomed} isDark={isDark} />

            {/* ── Selector border ── */}
            <div
                ref={selectorRef}
                style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 0,
                    height: 0,
                    border: `1px solid ${selectorBorderColor}`,
                    pointerEvents: "none",
                    zIndex: 10,
                    opacity: 0,
                }}
            />

            {/* ── Hint pill — top center ── */}
            <div
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                style={{
                    position: "absolute",
                    top: 14,
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 60,
                    display: "flex",
                    alignItems: "center",
                    height: 28,
                    padding: "0 12px",
                    gap: 6,
                    opacity: !zoomed ? 1 : 0,
                    transition: "opacity 0.5s ease",
                    pointerEvents: "none",
                    ...panelBase,
                }}
            >
                <PanIcon isDark={isDark} />
                <span style={{
                    fontFamily: "var(--font-sans, system-ui, sans-serif)",
                    fontSize: 11,
                    letterSpacing: "0.01em",
                    color: hintTextColor,
                    whiteSpace: "nowrap",
                }}>drag · scroll</span>
                <div style={{
                    width: 1,
                    height: 10,
                    background: dividerColor,
                    flexShrink: 0,
                }} />
                <TapIcon isDark={isDark} />
                <span style={{
                    fontFamily: "var(--font-sans, system-ui, sans-serif)",
                    fontSize: 11,
                    letterSpacing: "0.01em",
                    color: hintTextColor,
                    whiteSpace: "nowrap",
                }}>tap to focus</span>
            </div>

            {/* ── Zoom slider — where hint pill used to be ── */}
            <div
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                style={{
                    position: "absolute",
                    bottom: 20,
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 60,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "stretch",
                    height: 36,
                    ...panelBase,
                }}
            >
                <button
                    title="Zoom out"
                    onClick={() => zoomBy(1 / 1.35)}
                    style={zpBtn}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.color = zpBtnHoverColor;
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.color = zpBtnColor;
                    }}
                >
                    −
                </button>

                <div style={{ width: 1, background: dividerColor, flexShrink: 0 }} />

                <div
                    onClick={onTrackClick}
                    style={{
                        position: "relative",
                        width: TRACK_W + TRACK_PADH * 2,
                        height: "100%",
                        cursor: "ew-resize",
                        flexShrink: 0,
                        overflow: "hidden",
                        outline: "none",
                        WebkitTapHighlightColor: "transparent",
                    } as CSSProperties}
                >
                    <div style={{
                        position: "absolute",
                        top: "50%",
                        transform: "translateY(-50%)",
                        left: TRACK_PADH,
                        right: TRACK_PADH,
                        height: 1.5,
                        background: trackLineColor,
                        pointerEvents: "none",
                    }} />
                    <div
                        ref={thumbRef}
                        onPointerDown={onThumbDown}
                        style={{
                            position: "absolute",
                            top: "50%",
                            transform: "translateY(-50%)",
                            left: TRACK_PADH - 4,
                            width: 8,
                            height: 20,
                            borderRadius: 4,
                            background: thumbColor,
                            cursor: "ew-resize",
                            transition: "background .15s ease",
                            outline: "none",
                            WebkitTapHighlightColor: "transparent",
                        } as CSSProperties}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = thumbHoverColor;
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = thumbColor;
                        }}
                    />
                </div>

                <div style={{ width: 1, background: dividerColor, flexShrink: 0 }} />

                <button
                    title="Zoom in"
                    onClick={() => zoomBy(1.35)}
                    style={zpBtn}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.color = zpBtnHoverColor;
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.color = zpBtnColor;
                    }}
                >
                    +
                </button>
            </div>
        </div>
    );
}
