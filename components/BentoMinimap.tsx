"use client";

import { useMemo, useRef, type CSSProperties } from "react";

export interface MinimapItem {
    colSpan?: 1 | 2;
    rowSpan?: 1 | 2;
    aspectRatio?: number;
}

export interface MinimapPos {
    left: number;
    top: number;
}

export interface BentoMinimapProps {
    items: MinimapItem[];
    positions: MinimapPos[];
    columns: number;
    colUnit: number;
    imgUnitH: number;
    gap: number;
    canvasW: number;
    canvasH: number;
    mapW: number;
    mapH: number;
    k: number;
    vw: number;
    vh: number;
    currentTx: { x: number; y: number; s: number };
    focusedIdx: number | null;
    panelBase: CSSProperties;
    viewportRef: React.RefObject<SVGRectElement | null>;
    onCenter: (cx: number, cy: number) => void;
}

function clamp(v: number, lo: number, hi: number): number {
    return Math.max(lo, Math.min(hi, v));
}

function itemImageHeight(
    item: MinimapItem,
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

export default function BentoMinimap({
    items,
    positions,
    columns,
    colUnit,
    imgUnitH,
    gap,
    canvasW,
    canvasH,
    mapW,
    mapH,
    k,
    vw,
    vh,
    currentTx,
    focusedIdx,
    panelBase,
    viewportRef,
    onCenter,
}: BentoMinimapProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    const initialViewport = useMemo(() => {
        const { x, y, s } = currentTx;
        if (s <= 0 || mapW <= 0 || mapH <= 0 || k <= 0) {
            return { x: 0, y: 0, width: 0, height: 0 };
        }
        const rawVx = (-x / s) * k;
        const rawVy = (-y / s) * k;
        const rawVw = (vw / s) * k;
        const rawVh = (vh / s) * k;

        const x1 = clamp(rawVx, 0, mapW);
        const y1 = clamp(rawVy, 0, mapH);
        const x2 = clamp(rawVx + rawVw, 0, mapW);
        const y2 = clamp(rawVy + rawVh, 0, mapH);

        return {
            x: x1,
            y: y1,
            width: Math.max(0, x2 - x1),
            height: Math.max(0, y2 - y1),
        };
    }, [currentTx, mapW, mapH, k, vw, vh]);

    if (
        items.length === 0 ||
        positions.length === 0 ||
        canvasW <= 0 ||
        canvasH <= 0 ||
        mapW <= 0 ||
        mapH <= 0 ||
        k <= 0
    ) {
        return null;
    }

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (e.button !== 0) return;
        const svg = svgRef.current;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;
        const fracX = clamp((e.clientX - rect.left) / rect.width, 0, 1);
        const fracY = clamp((e.clientY - rect.top) / rect.height, 0, 1);
        onCenter(fracX * canvasW, fracY * canvasH);
    };

    return (
        <div
            className="bento-minimap"
            aria-hidden="true"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={handlePointerDown}
            onPointerUp={(e) => e.stopPropagation()}
            style={{
                position: "absolute",
                right: "var(--page-px, 24px)",
                bottom: 40,
                zIndex: 60,
                padding: 6,
                boxSizing: "border-box",
                cursor: "pointer",
                userSelect: "none",
                touchAction: "none",
                opacity: focusedIdx !== null ? 0.4 : 1,
                transition: "opacity 0.4s ease, border-color 0.2s ease, box-shadow 0.2s ease",
                ...panelBase,
                background: "var(--minimap-bg)",
                border: "1px solid var(--minimap-border)",
                boxShadow: "var(--minimap-shadow)",
                borderRadius: "var(--radius-mosaic, 6px)",
            }}
        >
            <svg
                ref={svgRef}
                width={mapW}
                height={mapH}
                viewBox={`0 0 ${mapW} ${mapH}`}
                style={{
                    display: "block",
                    overflow: "hidden",
                }}
            >
                {/* Tiles */}
                {items.map((item, i) => {
                    const pos = positions[i];
                    if (!pos) return null;
                    const cs = clamp(item.colSpan ?? 1, 1, columns);
                    const iw = cs * colUnit + (cs - 1) * gap;
                    const ih = itemImageHeight(item, columns, colUnit, imgUnitH, gap);
                    const tileX = pos.left * k;
                    const tileY = pos.top * k;
                    const tileW = iw * k;
                    const tileH = ih * k;
                    const isFocused = focusedIdx === i;

                    return (
                        <rect
                            key={i}
                            x={tileX}
                            y={tileY}
                            width={tileW}
                            height={tileH}
                            rx={1}
                            fill={
                                isFocused
                                    ? "var(--color-accent)"
                                    : "var(--color-text-primary)"
                            }
                            fillOpacity={isFocused ? 0.85 : 0.2}
                        />
                    );
                })}

                {/* Viewport indicator */}
                <rect
                    ref={viewportRef}
                    x={initialViewport.x}
                    y={initialViewport.y}
                    width={initialViewport.width}
                    height={initialViewport.height}
                    rx={1}
                    fill="var(--color-accent-subtle)"
                    stroke="var(--color-text-primary)"
                    strokeWidth={1.5}
                    vectorEffect="non-scaling-stroke"
                    style={{
                        pointerEvents: "none",
                    }}
                />
            </svg>
        </div>
    );
}
