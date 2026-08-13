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
import { useDialKit } from "dialkit";
import { afterPaint } from "@/lib/afterPaint";
import { ENTRANCE_DEFAULTS, EASE_Y } from "@/lib/motion";

const ENTRANCE_EASE_CSS = `cubic-bezier(${EASE_Y.join(",")})`;

/** Full image crossfades over an instant LQIP/blur poster (archive tiles). */
function BlurUpImage({
    src,
    blurDataURL,
    alt,
    priority,
    onLoad,
}: {
    src: string;
    blurDataURL?: string;
    alt: string;
    priority?: boolean;
    onLoad?: () => void;
}) {
    const [loaded, setLoaded] = useState(false);

    return (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
            {blurDataURL && (
                <img
                    src={blurDataURL}
                    alt=""
                    aria-hidden
                    draggable={false}
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        // LQIP is tiny — scale + blur hides pixelation and soft edge.
                        transform: "scale(1.1)",
                        filter: blurDataURL.startsWith("data:") ? "blur(16px)" : "blur(8px)",
                        opacity: loaded ? 0 : 1,
                        transition: "opacity 420ms ease",
                        pointerEvents: "none",
                    }}
                />
            )}
            <img
                loading={priority ? "eager" : "lazy"}
                decoding="async"
                {...(priority ? { fetchPriority: "high" as const } : {})}
                src={src}
                alt={alt}
                draggable={false}
                onLoad={() => {
                    setLoaded(true);
                    onLoad?.();
                }}
                style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    pointerEvents: "none",
                    opacity: loaded ? 1 : 0,
                    transition: "opacity 420ms ease",
                }}
            />
        </div>
    );
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface GalleryItem {
    src: string;
    /** Tiny LQIP / blurred poster — paints instantly under the full image. */
    blurDataURL?: string;
    alt?: string;
    caption?: string;
    link?: string;
    colSpan?: 1 | 2;
    rowSpan?: 1 | 2;
    /** Natural width/height. When set, tile height follows the image instead of rowSpan × cellAspect. */
    aspectRatio?: number;
    /** Eager-load + high fetch priority (first-viewport tiles). */
    priority?: boolean;
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
    /** Soft-nav arrival: snap tiles in (no entrance stagger). */
    instant?: boolean;
    /** When the persistent archive shell is shown, replay the entrance. */
    active?: boolean;
}

// ── Pure utilities ─────────────────────────────────────────────────────────────
const clamp = (v: number, lo: number, hi: number) =>
    Math.max(lo, Math.min(hi, v));
const elastic = (v: number, lo: number, hi: number, k = 0.22) =>
    v < lo ? lo + (v - lo) * k : v > hi ? hi + (v - hi) * k : v;

// ── Slider geometry (horizontal) ──────────────────────────────────────────────
// Desktop base geometry. Mobile scales every dimension by MOBILE_SCALE — the
// same factor the thumb was already bumped by in globals.css (28px / 20px
// height) — so the track and flanking buttons grow together with the thumb
// instead of the thumb standing out against an unchanged-size track.
const TRACK_W = 110;
const TRACK_PADH = 12;
const ZOOM_BTN_W = 34;
const MOBILE_SCALE = 1.4;

const scaleToThumbX = (s: number, zMin: number, zMax: number, trackW: number) => {
    const lMin = Math.log(zMin),
        lMax = Math.log(zMax);
    return ((Math.log(clamp(s, zMin, zMax)) - lMin) / (lMax - lMin)) * trackW;
};
const thumbXToScale = (px: number, zMin: number, zMax: number, trackW: number) => {
    const lMin = Math.log(zMin),
        lMax = Math.log(zMax);
    return Math.exp(lMin + (clamp(px, 0, trackW) / trackW) * (lMax - lMin));
};

// ── Per-tile image height ──────────────────────────────────────────────────────
// Prefer natural aspectRatio (width/height) so uploaded composition is preserved.
// Falls back to the discrete rowSpan × cellAspect grid when metadata is missing.
function itemImageHeight(
    item: GalleryItem,
    cols: number,
    colUnit: number,
    imgUnitH: number,
    gap: number
): number {
    const cs = clamp(item.colSpan ?? 1, 1, cols);
    const iw = cs * colUnit + (cs - 1) * gap;
    if (item.aspectRatio && item.aspectRatio > 0) {
        return iw / item.aspectRatio;
    }
    const rs = item.rowSpan ?? 1;
    return rs * imgUnitH + (rs - 1) * gap;
}

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

    return items.map((item) => {
        const cs = clamp(item.colSpan ?? 1, 1, cols);
        const fullH =
            itemImageHeight(item, cols, colUnit, imgUnitH, gap) +
            (hasCaps ? captionH : 0);
        if (cs === 1) {
            let best = 0;
            for (let c = 1; c < cols; c++) if (colH[c] < colH[best]) best = c;
            const top = colH[best];
            colH[best] += fullH + gap;
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
                colH[bestStart + i] = top + fullH + gap;
            return { left: bestStart * (colUnit + gap), top };
        }
    });
}

// ── Constants ─────────────────────────────────────────────────────────────────
// Room for 11px type + descenders (g/y/p) — extra bottom pad prevents clipping.
const CAPTION_H = 34;
const CLICK_PX = 8;
const EDGE_PAD = 240;  // large pad = canvas can scroll freely past edges
const ZOOM_MIN = 0.06;
const ZOOM_ABS = 8;
/** Matches `app/globals.css` `--page-px` — overview must respect this gutter. */
const PAGE_PX_FALLBACK = 24;

function readPagePx(): number {
    if (typeof window === "undefined") return PAGE_PX_FALLBACK;
    const raw = getComputedStyle(document.documentElement)
        .getPropertyValue("--page-px")
        .trim();
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : PAGE_PX_FALLBACK;
}

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

function PanIcon() {
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
                stroke="var(--color-text-secondary)"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function TapIcon() {
    const c = "var(--color-text-secondary)";
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            width="13"
            height="13"
            style={{ display: "block", flexShrink: 0 }}
        >
            <path d="M64,76a52,52,0,0,1,104,0" fill="none" stroke={c} strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M72,224,42.68,174a20,20,0,0,1,34.64-20L96,184V76a20,20,0,0,1,40,0v56a20,20,0,0,1,40,0v16a20,20,0,0,1,40,0v36c0,24-8,40-8,40" fill="none" stroke={c} strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// Small external-link glyph for captions with an attached `link` — sits
// beside the caption text, independently clickable (stopPropagation keeps
// it from also triggering the cell's focus/zoom onClick).
function LinkIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            width="10"
            height="10"
            style={{ display: "block", flexShrink: 0 }}
        >
            <path
                d="M8.333 4.167H4.167a1.667 1.667 0 0 0-1.667 1.666v10a1.667 1.667 0 0 0 1.667 1.667h10a1.667 1.667 0 0 0 1.666-1.667v-4.166M12.5 2.5h5v5M8.333 11.667 17.5 2.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
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
    instant = false,
    active = true,
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
    // Cancels in-flight focal zoom rAF when a new zoom gesture starts.
    const zoomAnimRef = useRef<number | null>(null);

    const [vw, setVw] = useState(1280);
    const [vh, setVh] = useState(720);
    const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    // One-time breakpoint check, matching the pattern used elsewhere in this
    // codebase (e.g. VolumeControl.tsx) — not a resize listener, since the
    // zoom panel doesn't need to re-scale live as the window resizes.
    const [isMobile] = useState(
        () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches
    );
    const trackW = isMobile ? TRACK_W * MOBILE_SCALE : TRACK_W;
    const trackPadH = isMobile ? TRACK_PADH * MOBILE_SCALE : TRACK_PADH;
    const zoomBtnW = isMobile ? ZOOM_BTN_W * MOBILE_SCALE : ZOOM_BTN_W;

    // Reveal as soon as layout is ready — LQIP posters already paint the
    // tiles, so waiting on full-res downloads just left empty holes.
    // Soft-nav snaps ready immediately (no one-frame blank).
    const [ready, setReady] = useState(instant);
    const readyRef = useRef(ready);
    readyRef.current = ready;
    useLayoutEffect(() => {
        if (instant) {
            setReady(true);
            return;
        }
        if (!active) {
            setReady(false);
            return;
        }
        // Don't blank tiles that are already in — fast back-and-forth used to
        // setReady(false) on every active=true, then cancel the rAF that was
        // supposed to restore them.
        if (readyRef.current) return;
        return afterPaint(() => setReady(true));
    }, [instant, active]);

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
        const thumbX = scaleToThumbX(tx.current.s, zMinRef.current, zMaxRef.current, trackW);
        th.style.left = trackPadH + thumbX + "px";
        th.style.transform = "translate(-50%, -50%)";
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Grid geometry ─────────────────────────────────────────────────────────
    // Lay out for the site's horizontal content band (`--page-px` gutters), not
    // the raw viewport — overview then sits at scale ≈ 1 with real page padding.
    const pagePx = readPagePx();
    const layoutW = Math.max(1, vw - 2 * pagePx);
    const colUnit = Math.max(80, (layoutW - (columns - 1) * gap) / columns);
    const imgUnitH = colUnit * cellAspect;
    const hasCaps = items.some((it) => it.caption);

    const cW = (cs: number) =>
        clamp(cs, 1, columns) * colUnit + (clamp(cs, 1, columns) - 1) * gap;
    const cImgH = (item: GalleryItem) =>
        itemImageHeight(item, columns, colUnit, imgUnitH, gap);

    // Kept in sync every render (not just on focus/layout changes) so the
    // selector-resize call inside applyTransform always reads fresh geometry
    // without needing to be in that callback's own dependency array.
    const itemsRef = useRef(items);
    itemsRef.current = items;
    const columnsRef = useRef(columns);
    columnsRef.current = columns;
    const colUnitRef = useRef(colUnit);
    colUnitRef.current = colUnit;
    const gapRef = useRef(gap);
    gapRef.current = gap;
    const imgUnitHRef = useRef(imgUnitH);
    imgUnitHRef.current = imgUnitH;

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
    const positionsRef = useRef(positions);
    positionsRef.current = positions;

    // Entrance stagger — reads the same "Entrance" dialkit panel as
    // EntranceStagger/EntranceItem (components/ScrollReveal.tsx) so one
    // panel tunes both, even though this component stays framer-motion-free
    // (plain CSS transitions, matching its existing hand-rolled style).
    // Rank is by visual position (top, then left) rather than array index,
    // since packMasonry's layout doesn't preserve item order.
    const dk = useDialKit("Entrance", {
        y:         [ENTRANCE_DEFAULTS.y,         0,   80],
        duration:  [ENTRANCE_DEFAULTS.duration,  0.1, 2],
        stagger:   [ENTRANCE_DEFAULTS.stagger,   0,   0.4],
        maxSpread: [ENTRANCE_DEFAULTS.maxSpread, 0,   2],
    });
    const reducedMotionRef = useRef(false);
    useEffect(() => {
        reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }, []);

    const staggerRank = useMemo(() => {
        const order = positions
            .map((pos, i) => (pos ? { i, pos } : null))
            .filter((x): x is { i: number; pos: PixPos } => x !== null)
            .sort((a, b) => a.pos.top - b.pos.top || a.pos.left - b.pos.left);
        const rank: Record<number, number> = {};
        order.forEach(({ i }, r) => { rank[i] = r; });
        return rank;
    }, [positions]);

    const revealedCount = staggerRank ? Object.keys(staggerRank).length : 0;
    const perItemStagger = revealedCount > 1
        ? Math.min(dk.stagger, dk.maxSpread / (revealedCount - 1))
        : dk.stagger;

    const canvasW = columns * colUnit + (columns - 1) * gap;
    const canvasH = useMemo(() => {
        let max = 1;
        positions.forEach((pos, i) => {
            const item = items[i];
            if (!item) return;
            const b =
                pos.top + cImgH(item) + (hasCaps ? CAPTION_H : 0);
            if (b > max) max = b;
        });
        return max;
    }, [positions, items, imgUnitH, hasCaps, gap, colUnit, columns]);

    // ── Bounds ────────────────────────────────────────────────────────────────
    // When content is larger than the viewport: classic pan limits + EDGE_PAD.
    // When content fits: allow ±slack around the centered position instead of
    // locking min==max to dead-center. Forced centering after every zoom step
    // was crushing focal-point math on zoom-out (canvas jumps toward top-left
    // as soon as it fits). Slack still keeps content roughly on-screen; gesture
    // end uses snapToBounds for a soft settle.
    const getBounds = useCallback(
        (s: number): BBox => {
            const cws = canvasW * s,
                chs = canvasH * s;
            const axis = (content: number, view: number): [number, number] => {
                if (content > view) {
                    return [-(content - view) - EDGE_PAD, EDGE_PAD];
                }
                const center = (view - content) / 2;
                const slack = Math.min(EDGE_PAD, Math.max(0, (view - content) / 2));
                return [center - slack, center + slack];
            };
            const [minX, maxX] = axis(cws, vw);
            const [minY, maxY] = axis(chs, vh);
            return { minX, maxX, minY, maxY };
        },
        [canvasW, canvasH, vw, vh]
    );

    // Pointer/client coords → root-local space (matches translate/scale units).
    const clientToLocal = useCallback((clientX: number, clientY: number) => {
        const root = rootRef.current;
        if (!root) return { x: clientX, y: clientY };
        const r = root.getBoundingClientRect();
        return { x: clientX - r.left, y: clientY - r.top };
    }, []);

    // Keeps the focused-tile selector border locked to the actual on-screen
    // box of its tile through every zoom-changing gesture — not just the
    // moment it was first focused. Earlier this only resized the selector
    // (assuming the focused tile always stays centered in the viewport,
    // true for the zoom slider/zoomToCenter), but ctrl/cmd+wheel and pinch
    // zoom around the cursor/touch midpoint instead — the focused tile
    // drifts off-center, and a CSS-centered selector drifted with it. Fixed
    // by computing the selector's real screen position directly from the
    // tile's canvas-space position (`positionsRef`) and the just-applied
    // transform, rather than assuming center alignment. Reads only refs so
    // it can be called from applyTransform without joining that callback's
    // deps, and takes an explicit idx (rather than always reading
    // focusedRef) since focusCell needs to sync the box for the tile it's
    // *about* to focus, before the async setFocusedIdx/focusedRef commit.
    const syncSelectorBox = (idx: number) => {
        const sel = selectorRef.current;
        const item = itemsRef.current[idx];
        const pos = positionsRef.current[idx];
        if (!sel || !item || !pos) return;
        const { x, y, s } = tx.current;
        const cs = clamp(item.colSpan ?? 1, 1, columnsRef.current);
        const iw = cs * colUnitRef.current + (cs - 1) * gapRef.current;
        const ih = itemImageHeight(
            item,
            columnsRef.current,
            colUnitRef.current,
            imgUnitHRef.current,
            gapRef.current
        );
        sel.style.left = x + pos.left * s + "px";
        sel.style.top = y + pos.top * s + "px";
        sel.style.width = iw * s + "px";
        sel.style.height = ih * s + "px";
    };

    // ── Apply transform ───────────────────────────────────────────────────────
    const applyTransform = useCallback(
        (
            x: number,
            y: number,
            s: number,
            easing: "none" | "focus" | "snap" | "spring" | "flow" = "none"
        ) => {
            tx.current = { x, y, s };
            const fi = focusedRef.current;
            if (fi !== null) syncSelectorBox(fi);
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

            if (easing !== "none") {
                el.style.willChange = "transform";
                el.addEventListener("transitionend", function onEnd() {
                    el.style.willChange = "auto";
                    el.removeEventListener("transitionend", onEnd);
                }, { once: true });
            }

            const th = thumbRef.current;
            if (th) {
                const thumbX = scaleToThumbX(s, zMinRef.current, zMaxRef.current, trackW);
                th.style.left = trackPadH + thumbX + "px";
                th.style.transform = "translate(-50%, -50%)";
            }
        },
        [vw, vh, trackW, trackPadH]
    );

    // A focus/flow transition can still be mid-flight when the user grabs the
    // canvas. Read the composited matrix before disabling CSS transition so the
    // gesture starts exactly where the eye sees it, not from the stored target.
    const takeOverFromRenderedTransform = useCallback(() => {
        const el = canvasRef.current;
        if (!el) return;
        const transform = getComputedStyle(el).transform;
        if (!transform || transform === "none") {
            el.style.transition = "none";
            return;
        }

        try {
            const matrix = new DOMMatrixReadOnly(transform);
            const scale = matrix.a || tx.current.s;
            const next = { x: matrix.m41, y: matrix.m42, s: scale };
            tx.current = next;
            const focused = focusedRef.current;
            if (focused !== null) syncSelectorBox(focused);
            el.style.transition = "none";
            const thumb = thumbRef.current;
            if (thumb) {
                const thumbX = scaleToThumbX(scale, zMinRef.current, zMaxRef.current, trackW);
                thumb.style.left = trackPadH + thumbX + "px";
                thumb.style.transform = "translate(-50%, -50%)";
            }
        } catch {
            el.style.transition = "none";
        }
    }, [trackW, trackPadH]);

    const snapToBounds = useCallback(
        (easing: "none" | "spring" | "flow" = "spring") => {
            const { x, y, s } = tx.current;
            const b = getBounds(s);
            const nx = clamp(x, b.minX, b.maxX);
            const ny = clamp(y, b.minY, b.maxY);
            if (Math.abs(nx - x) > 0.5 || Math.abs(ny - y) > 0.5)
                applyTransform(nx, ny, s, easing);
        },
        [getBounds, applyTransform]
    );

    const cancelZoomAnim = useCallback(() => {
        if (zoomAnimRef.current !== null) {
            cancelAnimationFrame(zoomAnimRef.current);
            zoomAnimRef.current = null;
        }
    }, []);

    // ── Overview + Focus ──────────────────────────────────────────────────────
    const getOverviewT = useCallback((): Tx => {
        const pad = readPagePx();
        if (overviewMode === "fit") {
            const contentW = Math.max(1, vw - 2 * pad);
            const s =
                Math.min(
                    contentW / Math.max(1, canvasW),
                    vh / Math.max(1, canvasH)
                ) * 0.88;
            return { x: (vw - canvasW * s) / 2, y: (vh - canvasH * s) / 2, s };
        }
        // Canvas is already laid out for `--page-px` content width — fill that
        // band (scale 1 when layoutW matches), keep L/R gutters, pin to top.
        const contentW = Math.max(1, vw - 2 * pad);
        const s = contentW / Math.max(1, canvasW);
        const scaledH = canvasH * s;
        const x = (vw - canvasW * s) / 2;
        const y = scaledH <= vh ? (vh - scaledH) / 2 : 0;
        return { x, y, s };
    }, [vw, vh, canvasW, canvasH, overviewMode]);

    /** Overview transform centered on a tile (used when leaving focus). */
    const getOverviewAroundT = useCallback(
        (idx: number): Tx => {
            const ov = getOverviewT();
            const pos = positions[idx];
            const item = items[idx];
            if (!pos || !item) return ov;
            const cs = item.colSpan ?? 1;
            const iw = cW(cs);
            const ih = cImgH(item);
            const b = getBounds(ov.s);
            return {
                x: clamp(vw / 2 - (pos.left + iw / 2) * ov.s, b.minX, b.maxX),
                y: clamp(vh / 2 - (pos.top + ih / 2) * ov.s, b.minY, b.maxY),
                s: ov.s,
            };
        },
        [getOverviewT, getBounds, positions, items, vw, vh, colUnit, imgUnitH, gap, columns]
    );

    const getFocusT = useCallback(
        (idx: number): Tx => {
            const pos = positions[idx];
            const item = items[idx];
            if (!pos || !item) return getOverviewT();
            const cs = item.colSpan ?? 1;
            const iw = cW(cs),
                ih = cImgH(item);
            const s_ov = getOverviewT().s;
            // Respect whatever zoom the user already dialed in (via the
            // slider or a pinch/scroll gesture) rather than always jumping
            // to a fixed focus scale — clicking a tile while already zoomed
            // in keeps that same scale, only clamped to stay within a
            // sensible focus range and never made to overflow the tile's
            // reserved on-screen area.
            const fitCap = Math.min(
                (vw * 0.38) / Math.max(1, iw),
                (vh * 0.5) / Math.max(1, ih)
            );
            const s = clamp(tx.current.s, s_ov * 1.25, Math.min(s_ov * 3.5, fitCap));
            // Clamp against the same bounds zoomToCenter/onThumbDown enforce —
            // for tiles near the canvas edges, centering the tile alone can
            // push x/y outside those bounds. Left unclamped, tx.current
            // starts focus already out-of-bounds, and the first zoom-out step
            // (which computes from tx.current, then clamps its result) snaps
            // it back into bounds as a visible jump.
            const b = getBounds(s);
            return {
                x: clamp((vw - iw * s) / 2 - pos.left * s, b.minX, b.maxX),
                y: clamp((vh - ih * s) / 2 - pos.top * s, b.minY, b.maxY),
                s,
            };
        },
        [positions, items, getOverviewT, getBounds, vw, vh, colUnit, imgUnitH, gap, columns]
    );

    // ── Selector border ───────────────────────────────────────────────────────
    const FOCUS_E = "cubic-bezier(0.16,1,0.3,1)";

    const showSelector = useCallback(
        (idx: number, animate: boolean) => {
            const sel = selectorRef.current;
            if (!sel) return;
            // Position/size come from syncSelectorBox, which reads tx.current —
            // by the time showSelector is called (always right after
            // applyTransform with the matching focus transform), that's
            // already the correct just-applied transform.
            syncSelectorBox(idx);
            sel.style.transition = "none";
            if (animate) {
                sel.style.transform = "scale(0.96, 0.96)";
                sel.style.opacity = "0";
                requestAnimationFrame(() => {
                    sel.style.transition = `transform 0.45s ${FOCUS_E}, opacity 0.22s ${FOCUS_E}`;
                    sel.style.transform = "scale(1, 1)";
                    sel.style.opacity = "1";
                });
            } else {
                sel.style.transform = "scale(1, 1)";
                sel.style.opacity = "1";
            }
        },
        []
    );

    const hideSelector = useCallback((animate = true) => {
        const sel = selectorRef.current;
        if (!sel) return;
        sel.style.transition = animate ? "opacity 0.45s ease" : "none";
        sel.style.opacity = "0";
    }, []);

    const goOverview = useCallback(() => {
        cancelZoomAnim();
        // Re-center overview on the tile we just left — not a jump back to
        // the initial top-left cover framing.
        const leaving = focusedRef.current;
        startTransition(() => setFocusedIdx(null));
        const t =
            leaving !== null ? getOverviewAroundT(leaving) : getOverviewT();
        applyTransform(t.x, t.y, t.s, "flow");
        hideSelector();
        if (rootRef.current) rootRef.current.style.cursor = "crosshair";
    }, [getOverviewT, getOverviewAroundT, applyTransform, hideSelector, cancelZoomAnim]);

    const focusCell = useCallback(
        (idx: number) => {
            cancelZoomAnim();
            startTransition(() => setFocusedIdx(idx));
            const t = getFocusT(idx);
            applyTransform(t.x, t.y, t.s, "focus");
            showSelector(idx, true);
            if (rootRef.current) rootRef.current.style.cursor = "crosshair";
        },
        [getFocusT, applyTransform, showSelector, cancelZoomAnim]
    );

    // ── Zoom helpers ──────────────────────────────────────────────────────────
    // Focal-point zoom for `translate(x,y) scale(s)` with transform-origin
    // top-left: keep the canvas point under (fx, fy) fixed as scale changes.
    // CSS transitions on translate+scale interpolate each component independently
    // and drift toward the origin mid-flight — so eased zooms are rAF'd with
    // the same focal formula every frame (frozen start → target scale).
    const zoomAround = useCallback(
        (
            fx: number,
            fy: number,
            ns: number,
            easing: "none" | "snap" | "focus" | "spring" | "flow" = "snap",
            // When set (e.g. slider drag), all frames/steps are computed from this
            // frozen start so mid-gesture clamps can't accumulate drift.
            base?: Tx
        ) => {
            const zm = zMaxRef.current;
            ns = clamp(ns, zMinRef.current, zm);
            cancelZoomAnim();

            const { x: x0, y: y0, s: s0 } = base ?? tx.current;
            if (s0 <= 0) return;

            const applyAtScale = (s: number) => {
                const ratio = s / s0;
                const nx = fx - (fx - x0) * ratio;
                const ny = fy - (fy - y0) * ratio;
                const b = getBounds(s);
                applyTransform(
                    clamp(nx, b.minX, b.maxX),
                    clamp(ny, b.minY, b.maxY),
                    s,
                    "none"
                );
            };

            if (easing === "none") {
                applyAtScale(ns);
                return;
            }

            if (Math.abs(ns - s0) < 1e-6) return;

            // Approximate the former CSS snap/spring curves with a smooth ease-out
            // so +/- and track clicks still feel animated — without the top-left drift
            // that CSS translate+scale interpolation causes.
            const DUR_MS =
                easing === "focus" ? 1500 : easing === "flow" ? 600 : easing === "spring" ? 500 : 450;
            const ease =
                easing === "spring"
                    ? (t: number) => {
                          const p = 1 - Math.pow(1 - t, 3);
                          return p + Math.sin(p * Math.PI) * 0.04 * (1 - p);
                      }
                    : (t: number) => 1 - Math.pow(1 - t, 3);

            const t0 = performance.now();
            const step = (now: number) => {
                const t = clamp((now - t0) / DUR_MS, 0, 1);
                applyAtScale(s0 + (ns - s0) * ease(t));
                if (t < 1) {
                    zoomAnimRef.current = requestAnimationFrame(step);
                } else {
                    zoomAnimRef.current = null;
                    applyAtScale(ns);
                }
            };
            zoomAnimRef.current = requestAnimationFrame(step);
        },
        [getBounds, applyTransform, cancelZoomAnim]
    );

    const zoomToCenter = useCallback(
        (
            ns: number,
            easing: "none" | "snap" | "focus" | "spring" | "flow" = "snap"
        ) => {
            // Keep the focused tile (or viewport center) stable — infinite-canvas zoom.
            const fi = focusedRef.current;
            let fx = vw / 2;
            let fy = vh / 2;
            if (fi !== null) {
                const pos = positionsRef.current[fi];
                const item = itemsRef.current[fi];
                if (pos && item) {
                    const { x, y, s } = tx.current;
                    const cs = clamp(item.colSpan ?? 1, 1, columnsRef.current);
                    const iw =
                        cs * colUnitRef.current + (cs - 1) * gapRef.current;
                    const ih = itemImageHeight(
                        item,
                        columnsRef.current,
                        colUnitRef.current,
                        imgUnitHRef.current,
                        gapRef.current
                    );
                    fx = x + (pos.left + iw / 2) * s;
                    fy = y + (pos.top + ih / 2) * s;
                }
            }
            zoomAround(fx, fy, ns, easing);
        },
        [vw, vh, zoomAround]
    );

    const zoomBy = useCallback(
        (factor: number) => {
            zoomToCenter(tx.current.s * factor, "snap");
        },
        [zoomToCenter]
    );

    // ── Slider drag ───────────────────────────────────────────────────────────
    const onThumbDown = useCallback(
        (e: React.PointerEvent) => {
            e.stopPropagation();
            e.preventDefault();
            cancelZoomAnim();
            const startX = e.clientX;
            const zm = zMaxRef.current;
            const startPx = scaleToThumbX(tx.current.s, zMinRef.current, zm, trackW);
            // Freeze focal at gesture start (focused tile center when selected).
            const fi = focusedRef.current;
            let cx = vw / 2;
            let cy = vh / 2;
            if (fi !== null) {
                const pos = positionsRef.current[fi];
                const item = itemsRef.current[fi];
                if (pos && item) {
                    const { x, y, s } = tx.current;
                    const cs = clamp(item.colSpan ?? 1, 1, columnsRef.current);
                    const iw =
                        cs * colUnitRef.current + (cs - 1) * gapRef.current;
                    const ih = itemImageHeight(
                        item,
                        columnsRef.current,
                        colUnitRef.current,
                        imgUnitHRef.current,
                        gapRef.current
                    );
                    cx = x + (pos.left + iw / 2) * s;
                    cy = y + (pos.top + ih / 2) * s;
                }
            }
            const base = { ...tx.current };

            const onMove = (ev: PointerEvent) => {
                const newPx = clamp(startPx + (ev.clientX - startX), 0, trackW);
                const ns = thumbXToScale(newPx, zMinRef.current, zm, trackW);
                zoomAround(cx, cy, ns, "none", base);
            };
            const onUp = () => {
                window.removeEventListener("pointermove", onMove);
                window.removeEventListener("pointerup", onUp);
                snapToBounds("spring");
            };
            window.addEventListener("pointermove", onMove);
            window.addEventListener("pointerup", onUp);
        },
        [vw, vh, trackW, zoomAround, cancelZoomAnim, snapToBounds]
    );

    const onTrackClick = useCallback(
        (e: React.MouseEvent) => {
            if ((e.target as HTMLElement) === thumbRef.current) return;
            const rect = (
                e.currentTarget as HTMLElement
            ).getBoundingClientRect();
            const px = clamp(e.clientX - rect.left - trackPadH, 0, trackW);
            zoomToCenter(thumbXToScale(px, zMinRef.current, zMaxRef.current, trackW), "snap");
        },
        [zoomToCenter, trackW, trackPadH]
    );

    const onTrackPointerDown = useCallback(
        (e: React.PointerEvent) => {
            if (e.pointerType === "mouse" && e.button !== 0) return;
            if ((e.target as HTMLElement) === thumbRef.current) return;
            e.stopPropagation();
            e.preventDefault();
            cancelZoomAnim();
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const px = clamp(e.clientX - rect.left - trackPadH, 0, trackW);
            const zm = zMaxRef.current;
            const ns = thumbXToScale(px, zMinRef.current, zm, trackW);
            const fi = focusedRef.current;
            let cx = vw / 2;
            let cy = vh / 2;
            if (fi !== null) {
                const pos = positionsRef.current[fi];
                const item = itemsRef.current[fi];
                if (pos && item) {
                    const { x, y, s } = tx.current;
                    const cs = clamp(item.colSpan ?? 1, 1, columnsRef.current);
                    const iw =
                        cs * colUnitRef.current + (cs - 1) * gapRef.current;
                    const ih = itemImageHeight(
                        item,
                        columnsRef.current,
                        colUnitRef.current,
                        imgUnitHRef.current,
                        gapRef.current
                    );
                    cx = x + (pos.left + iw / 2) * s;
                    cy = y + (pos.top + ih / 2) * s;
                }
            }
            const base = { ...tx.current };
            zoomAround(cx, cy, ns, "none", base);

            const startX = e.clientX;
            const startPx = px;

            const onMove = (ev: PointerEvent) => {
                const newPx = clamp(startPx + (ev.clientX - startX), 0, trackW);
                const nextScale = thumbXToScale(newPx, zMinRef.current, zm, trackW);
                zoomAround(cx, cy, nextScale, "none", base);
            };
            const onUp = () => {
                window.removeEventListener("pointermove", onMove);
                window.removeEventListener("pointerup", onUp);
                snapToBounds("spring");
            };
            window.addEventListener("pointermove", onMove);
            window.addEventListener("pointerup", onUp);
        },
        [vw, vh, trackW, trackPadH, zoomAround, cancelZoomAnim, snapToBounds]
    );

    // ── Init / resize — always "none" to avoid jarring scale-in ──────────────
    // canvasH/getFocusT also change on every focus/defocus click now (the
    // caption-push reflow keys packMasonry off focusedIdx/expandedExtraH),
    // but that transition is already handled by focusCell/goOverview's own
    // animated applyTransform call — this effect firing too, with "none"
    // easing, was clobbering it moments later. Gate the actual resnap on
    // vw/vh/canvasW (genuine viewport/layout changes) instead of letting
    // focus-driven churn trigger it.
    const prevResizeSigRef = useRef<{ vw: number; vh: number; canvasW: number } | null>(null);
    useEffect(() => {
        // Recompute dynamic min zoom whenever layout changes
        cancelZoomAnim();
        if (minZoomFactor > 0) {
            zMinRef.current = Math.max(ZOOM_MIN, getOverviewT().s * minZoomFactor);
        }

        const prevSig = prevResizeSigRef.current;
        const isGenuineResize =
            !prevSig || prevSig.vw !== vw || prevSig.vh !== vh || prevSig.canvasW !== canvasW;
        prevResizeSigRef.current = { vw, vh, canvasW };
        if (!isGenuineResize) return;

        const fi = focusedRef.current;
        if (fi !== null) {
            const t = getFocusT(fi);
            applyTransform(t.x, t.y, t.s, "none");
            showSelector(fi, false);
        } else {
            const t = getOverviewT();
            applyTransform(t.x, t.y, t.s, "none");
        }
        snapToBounds("none");
    }, [vw, vh, canvasW, canvasH, getOverviewT, getFocusT, applyTransform, showSelector, snapToBounds, cancelZoomAnim]);

    // Cancel in-flight zoom rAF on unmount
    useEffect(() => () => cancelZoomAnim(), [cancelZoomAnim]);


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
            const cy = curPos.top + (item ? cImgH(item) : imgUnitH) / 2;
            let best = fi,
                bScore = Infinity;
            positions.forEach((p, i) => {
                if (i === fi) return;
                const it = items[i];
                const ex = p.left + cW(it?.colSpan ?? 1) / 2;
                const ey = p.top + (it ? cImgH(it) : imgUnitH) / 2;
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
                const local = clientToLocal(e.clientX, e.clientY);
                zoomAround(local.x, local.y, ns, "none");
            } else {
                // Free scroll — elastic resistance past edges, settle on stop
                cancelZoomAnim();
                const b = getBounds(s);
                applyTransform(
                    elastic(x - e.deltaX, b.minX, b.maxX),
                    elastic(y - e.deltaY, b.minY, b.maxY),
                    s,
                    "none"
                );
                clearTimeout(wheelTimer.current);
                wheelTimer.current = setTimeout(() => snapToBounds("spring"), 150);
            }
        };
        el.addEventListener("wheel", onWheel, { passive: false });
        return () => {
            el.removeEventListener("wheel", onWheel);
            clearTimeout(wheelTimer.current);
        };
    }, [applyTransform, getBounds, snapToBounds, clientToLocal, zoomAround, cancelZoomAnim]);

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
            takeOverFromRenderedTransform();
            if (canvasRef.current) canvasRef.current.style.willChange = "transform";
            cancelZoomAnim();
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
                // Store pinch midpoint in root-local space (same units as tx).
                const mid = clientToLocal(
                    (pts[0].x + pts[1].x) / 2,
                    (pts[0].y + pts[1].y) / 2
                );
                g.p2mx = mid.x;
                g.p2my = mid.y;
                g.p2px = tx.current.x;
                g.p2py = tx.current.y;
            }
        },
        [cancelZoomAnim, clientToLocal, takeOverFromRenderedTransform]
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
                const mid = clientToLocal(
                    (pts[0].x + pts[1].x) / 2,
                    (pts[0].y + pts[1].y) / 2
                );
                const ns = clamp(
                    (g.p2scale * dist) / Math.max(1, g.p2dist),
                    zMinRef.current,
                    zm
                );
                const sr = ns / g.p2scale;
                // Keep the canvas point that was under the initial midpoint fixed
                // under the current midpoint (pinch + pan).
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
        [applyTransform, getBounds, clientToLocal]
    );

    const onPointerUp = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            ptrs.current.delete(e.pointerId);
            if (ptrs.current.size < 2) gst.current.p2 = false;
            if (ptrs.current.size === 0) {
                // The drag/pinch itself rests wherever it lands (no auto-focus,
                // no re-centering) — but `elastic()` deliberately lets x/y/s
                // overshoot past true bounds during the gesture for a rubber-
                // band feel, and that overshoot was never corrected afterward.
                // A subsequent zoom (which computes its new position from this
                // already-out-of-bounds tx.current, then clamps the RESULT)
                // would suddenly snap back into bounds — reading as a jump.
                // Settling back within bounds now, right as the gesture ends,
                // keeps that correction where the user expects it.
                snapToBounds("spring");
                if (rootRef.current) rootRef.current.style.cursor = "crosshair";
                setTimeout(() => { gst.current.moved = false; }, 0);
                // Demote after snap/spring animations settle (~800ms)
                setTimeout(() => { if (canvasRef.current) canvasRef.current.style.willChange = "auto"; }, 800);
            }
        },
        [snapToBounds]
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

    const hintTextColor = "var(--color-text-secondary)";
    const dividerColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)";
    const thumbBase = isDark ? "#ffffff" : "#000000";
    const thumbNormalOpacity = isDark ? 0.62 : 0.55;
    const thumbHoverOpacityVal = isDark ? 0.85 : 0.8;
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
        width: zoomBtnW,
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
            data-ui-sound-scope="archive"
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
                // Hold interaction off for one frame so layout settles, then
                // each tile entrance-staggers over already-visible LQIP posters.
                // Full-res images blur-up independently inside each cell.
                pointerEvents: ready ? "auto" : "none",
                transform: "none",
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
                }}
            >
                {items.map((item, i) => {
                    const pos = positions[i];
                    if (!pos) return null;
                    const cs = clamp(item.colSpan ?? 1, 1, columns);
                    const iw = cW(cs);
                    const imgH = cImgH(item);
                    const isActive = focusedIdx === i;
                    const isHovered = hoveredIdx === i && !isActive && !zoomed;
                    const dimmed = zoomed && !isActive;

                    // Entrance (fade-up + slide-up, staggered by
                    // visual position) lives on this outer wrapper — a
                    // separate concern from the inner div's zoom-dim opacity,
                    // so replaying one never fights the other.
                    const entranceDelay = (staggerRank[i] ?? 0) * perItemStagger;
                    const entranceInstant = reducedMotionRef.current || instant;

                    return (
                        <div
                            key={i}
                            style={{
                                position: "absolute",
                                left: pos.left,
                                top: pos.top,
                                width: iw,
                                opacity: ready ? 1 : 0,
                                transform: ready ? "translateY(0px)" : `translateY(${dk.y}px)`,
                                pointerEvents: ready ? undefined : "none",
                                // Delay folded into the shorthand itself (not a separate
                                // transitionDelay longhand) — mixing the two in one style
                                // object is ambiguous across re-renders and React warns on it.
                                transition: entranceInstant
                                    ? "none"
                                    : `opacity ${dk.duration}s ${ENTRANCE_EASE_CSS} ${entranceDelay}s, transform ${dk.duration}s ${ENTRANCE_EASE_CSS} ${entranceDelay}s`,
                            }}
                        >
                        <div
                            onClick={(e) => onCellClick(e, i)}
                            onMouseEnter={() => {
                                if (!gst.current.moved && window.matchMedia("(hover: hover)").matches) setHoveredIdx(i);
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
                                cursor: dimmed ? "default" : "crosshair",
                                opacity: dimmed ? 0.42 : 1,
                                transition: "opacity .65s cubic-bezier(.4,0,.2,1)",
                                position: "relative",
                            }}
                        >
                            <div
                                style={{
                                    width: iw,
                                    height: imgH,
                                    overflow: "hidden",
                                    position: "relative",
                                    background: "var(--color-placeholder)",
                                    outline: isHovered ? outlineHover : outlineNormal,
                                    outlineOffset: 0,
                                    transition: "outline .2s ease",
                                }}
                            >
                                {item.src ? (
                                    <BlurUpImage
                                        src={item.src}
                                        blurDataURL={item.blurDataURL}
                                        alt={item.alt ?? ""}
                                        priority={item.priority}
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
                                        // Shared first-line metrics with the focus overlay
                                        // so entering focus only changes wrap/overflow.
                                        paddingTop: 8,
                                        paddingBottom: 6,
                                        height: CAPTION_H,
                                        boxSizing: "border-box",
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: 6,
                                        fontFamily:
                                            "var(--font-sans, 'Helvetica Neue', Helvetica, Arial, sans-serif)",
                                        fontSize: 11,
                                        fontWeight: 400,
                                        letterSpacing: "0.02em",
                                        textTransform: "lowercase",
                                        lineHeight: 1.3,
                                        // Hide truncated preview while focused overlay is up
                                        visibility: isActive ? "hidden" : "visible",
                                        // Linked tiles: blue on focus (and a
                                        // softer blue on hover) so the caption
                                        // reads as the outbound affordance.
                                        // Unlinked tiles keep neutral gray.
                                        color: item.link
                                          ? (isActive
                                              ? "var(--color-link-blue)"
                                              : isHovered
                                                ? "color-mix(in srgb, var(--color-link-blue) 72%, transparent)"
                                                : captionBase)
                                          : isHovered
                                            ? captionHovered
                                            : captionBase,
                                        transition: "color .3s ease",
                                    }}
                                    aria-hidden={isActive}
                                >
                                    <span
                                        style={{
                                            flex: 1,
                                            minWidth: 0,
                                            // Keep the same wrap/overflow keys as the
                                            // focus span so React never removes one
                                            // longhand while another conflicting one
                                            // stays set (textWrap vs whiteSpace).
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            overflowWrap: "normal",
                                            pointerEvents: "none",
                                        }}
                                    >
                                        {item.caption ?? ""}
                                    </span>
                                    {item.link && !isActive && (
                                        <a
                                            href={item.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={`Watch: ${item.caption ?? "video"}`}
                                            onClick={(e) => e.stopPropagation()}
                                            onPointerDown={(e) => e.stopPropagation()}
                                            style={{
                                                flexShrink: 0,
                                                display: "inline-flex",
                                                alignItems: "center",
                                                color: "inherit",
                                                pointerEvents: "auto",
                                                position: "relative",
                                                // Optical align with 11px / 1.3 caption line
                                                marginTop: 1,
                                            }}
                                        >
                                            <span style={{ position: "absolute", inset: -10 }} />
                                            <LinkIcon />
                                        </a>
                                    )}
                                </div>
                            )}

                            {/* Focused caption — absolute overlay so wrapping never
                                pushes masonry / overlaps neighboring tiles.
                                Anchored at the same top/padding/type as the preview
                                so the first line does not jump on focus. */}
                            {hasCaps && isActive && item.caption && (
                                <div
                                    style={{
                                        position: "absolute",
                                        left: 0,
                                        right: 0,
                                        top: imgH,
                                        zIndex: 6,
                                        paddingTop: 8,
                                        paddingBottom: 10,
                                        paddingLeft: 0,
                                        paddingRight: 0,
                                        boxSizing: "border-box",
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: 6,
                                        fontFamily:
                                            "var(--font-sans, 'Helvetica Neue', Helvetica, Arial, sans-serif)",
                                        fontSize: 11,
                                        fontWeight: 400,
                                        letterSpacing: "0.02em",
                                        textTransform: "lowercase",
                                        lineHeight: 1.3,
                                        color: item.link
                                          ? "var(--color-link-blue)"
                                          : captionActive,
                                        // No filled scrim — readability from caption
                                        // contrast alone so captions don't look boxed.
                                        background: "transparent",
                                        pointerEvents: "none",
                                    }}
                                >
                                    <span
                                        style={{
                                            flex: 1,
                                            minWidth: 0,
                                            // Same property set as preview (no textWrap).
                                            whiteSpace: "normal",
                                            overflow: "visible",
                                            textOverflow: "clip",
                                            overflowWrap: "anywhere",
                                        }}
                                    >
                                        {item.caption}
                                    </span>
                                    {item.link && (
                                        <a
                                            href={item.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={`Watch: ${item.caption}`}
                                            onClick={(e) => e.stopPropagation()}
                                            onPointerDown={(e) => e.stopPropagation()}
                                            style={{
                                                flexShrink: 0,
                                                display: "inline-flex",
                                                alignItems: "center",
                                                color: "inherit",
                                                pointerEvents: "auto",
                                                position: "relative",
                                                marginTop: 1,
                                            }}
                                        >
                                            <span style={{ position: "absolute", inset: -10 }} />
                                            <LinkIcon />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                        </div>
                    );
                })}
            </div>

            {/* ── Crosshair ── */}
            <Crosshair show={!zoomed} isDark={isDark} />

            {/* ── Selector border — left/top/width/height are set imperatively
                 by syncSelectorBox to the focused tile's real on-screen box
                 (not assumed-centered), so it tracks the tile correctly even
                 through off-center zoom gestures like ctrl+wheel/pinch. ── */}
            <div
                ref={selectorRef}
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    transformOrigin: "center center",
                    transform: "scale(0.96, 0.96)",
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
                className="bento-hint-pill"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                style={{
                    position: "absolute",
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
                <PanIcon />
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
                <TapIcon />
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
                className="bento-zoom-panel"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                style={{
                    position: "absolute",
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 60,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "stretch",
                    ...panelBase,
                }}
            >
                <button
                    title="Zoom out"
                    onClick={() => zoomBy(1 / 1.35)}
                    style={zpBtn}
                    onMouseEnter={(e) => {
                        if (window.matchMedia("(hover: hover)").matches)
                            (e.currentTarget as HTMLElement).style.color = zpBtnHoverColor;
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.color = zpBtnColor;
                    }}
                >
                    <span style={{ display: "inline-block", transform: "translateY(-2px) translateX(-0.5px)", pointerEvents: "none" }}>−</span>
                </button>

                <div style={{ width: 1, background: dividerColor, flexShrink: 0 }} />

                <div
                    className="bento-zoom-track"
                    onClick={onTrackClick}
                    onPointerDown={onTrackPointerDown}
                    style={{
                        position: "relative",
                        width: trackW + trackPadH * 2,
                        height: "100%",
                        cursor: "ew-resize",
                        flexShrink: 0,
                        overflow: "visible",
                        outline: "none",
                        WebkitTapHighlightColor: "transparent",
                    } as CSSProperties}
                >
                    <div style={{
                        position: "absolute",
                        top: "50%",
                        transform: "translateY(-50%)",
                        left: trackPadH,
                        right: trackPadH,
                        height: 1.5,
                        background: trackLineColor,
                        pointerEvents: "none",
                    }} />
                    <div
                        ref={thumbRef}
                        className="bento-zoom-thumb"
                        onPointerDown={onThumbDown}
                        style={{
                            position: "absolute",
                            top: "50%",
                            transform: "translate(-50%, -50%)",
                            left: trackPadH,
                            width: 8,
                            height: 20,
                            borderRadius: 4,
                            background: thumbBase,
                            opacity: thumbNormalOpacity,
                            cursor: "ew-resize",
                            transition: "opacity .15s ease",
                            outline: "none",
                            WebkitTapHighlightColor: "transparent",
                        } as CSSProperties}
                        onMouseEnter={(e) => {
                            if (window.matchMedia("(hover: hover)").matches)
                                (e.currentTarget as HTMLElement).style.opacity = String(thumbHoverOpacityVal);
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.opacity = String(thumbNormalOpacity);
                        }}
                    />
                </div>

                <div style={{ width: 1, background: dividerColor, flexShrink: 0 }} />

                <button
                    title="Zoom in"
                    onClick={() => zoomBy(1.35)}
                    style={zpBtn}
                    onMouseEnter={(e) => {
                        if (window.matchMedia("(hover: hover)").matches)
                            (e.currentTarget as HTMLElement).style.color = zpBtnHoverColor;
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.color = zpBtnColor;
                    }}
                >
                    <span style={{ display: "inline-block", transform: "translateY(-2px) translateX(-0.5px)", pointerEvents: "none" }}>+</span>
                </button>
            </div>
        </div>
    );
}
