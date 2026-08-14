"use client";

import { useLayoutEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { useDialKit } from "dialkit";
import type { PlaygroundGalleryItem } from "@/lib/sanity/queries";
import BentoGallery from "@/components/BentoGallery";
import { peekArchiveGallery, rememberArchiveGallery } from "@/lib/archiveGalleryCache";

// Module-level set of active archive mounts (unique symbol per instance).
// The footer is only restored once ALL instances have unmounted — this handles
// React StrictMode double-invokes AND the concurrent-renderer race where a new
// mount commits before the previous cleanup fires.
const _pg = new Set<symbol>();

function _footerFix(el: HTMLElement) {
    el.style.setProperty("position", "fixed");
    el.style.setProperty("bottom", "0");
    el.style.setProperty("left", "0");
    el.style.setProperty("right", "0");
    el.style.setProperty("z-index", "30");
    el.style.setProperty("background", "var(--color-bg)");

    const inner = el.querySelector(".footer-inner") as HTMLElement | null;
    inner?.style.setProperty("padding", "12px var(--page-px)");
}

function _footerReset(el: HTMLElement) {
    el.style.removeProperty("position");
    el.style.removeProperty("bottom");
    el.style.removeProperty("left");
    el.style.removeProperty("right");
    el.style.removeProperty("z-index");
    el.style.removeProperty("background");

    const inner = el.querySelector(".footer-inner") as HTMLElement | null;
    inner?.style.removeProperty("padding");
}

// Footer (shrunk for this page only, see _footerFix): paddingTop(12) + lineHeight(21) + paddingBottom(12) = 45px
const FOOTER_H = 45;

// Solid-then-eased gradient: solid bg-color for [solidPct]% of the height,
// then a dissolve to transparent whose pacing is shaped by `falloff`
// (1 = default curve, <1 = dissolves earlier/softer, >1 = holds longer then drops late).
const solidEdgeGradient = (dir: "bottom" | "top", solidPct: number, falloff: number) => {
    const t = solidPct;
    const remain = 100 - t;
    const at = (f: number) => t + remain * Math.pow(f, 1 / falloff);
    return [
        `linear-gradient(to ${dir},`,
        `  var(--color-bg) 0%,`,
        `  var(--color-bg) ${t}%,`,
        `  color-mix(in srgb, var(--color-bg) 60%, transparent) ${at(0.30)}%,`,
        `  color-mix(in srgb, var(--color-bg) 32%, transparent) ${at(0.58)}%,`,
        `  color-mix(in srgb, var(--color-bg) 12%, transparent) ${at(0.80)}%,`,
        `  color-mix(in srgb, var(--color-bg) 3%, transparent) ${at(0.94)}%,`,
        `  transparent 100%`,
        `)`,
    ].join("");
};

// Matching mask for the backdrop-blur layer: `startAlpha` blur from 0 to
// `solidPct`, then eases toward `midAlpha` at `midPct`, then to no blur at 100%.
const edgeMask = (dir: "bottom" | "top", startAlpha: number, solidPct: number, midPct: number, midAlpha: number) =>
    `linear-gradient(to ${dir}, rgba(0,0,0,${startAlpha}) 0%, rgba(0,0,0,${startAlpha}) ${solidPct}%, rgba(0,0,0,${midAlpha}) ${midPct}%, transparent 100%)`;

function ArchivePosterSkeleton() {
    return (
        <div className="archive-skeleton" aria-busy="true" aria-label="Loading archive">
            {Array.from({ length: 8 }, (_, i) => (
                <div
                    key={i}
                    className="archive-skeleton-tile"
                    style={{ animationDelay: `${i * 70}ms` }}
                />
            ))}
        </div>
    );
}

function ArchivePosterGrid({ items }: { items: PlaygroundGalleryItem[] }) {
    if (!items.length) return <ArchivePosterSkeleton />;
    return (
        <div className="archive-poster-grid" aria-hidden>
            {items.slice(0, 12).map((item) => (
                <div key={item.key} className="archive-poster-tile">
                    {item.blurDataURL || item.src ? (
                        <img
                            src={item.blurDataURL || item.src}
                            alt=""
                            draggable={false}
                        />
                    ) : null}
                </div>
            ))}
        </div>
    );
}

export default function PlaygroundPageClient({
  items,
  visible = true,
  snap = false,
  enterEpoch = 0,
}: {
  items: PlaygroundGalleryItem[];
  visible?: boolean;
  snap?: boolean;
  enterEpoch?: number;
}) {
    const instanceKey = useRef<symbol | null>(null);
    if (items.length) rememberArchiveGallery(items);
    const resolved = items.length ? items : (peekArchiveGallery() ?? []);

    const dk = useDialKit("Archive Edge Fade", {
        topHeight:      [160,  40, 320, 1],
        topBlur:        [5,    0,  20,  0.5],
        topStartPct:    [45,   0,  100, 1],
        topFalloff:     [1,    0.3, 3,  0.05],
        topMaskAlpha:   [1,    0,  1,   0.01],
        topMaskMidPct:  [72,   0,  100, 1],
        topMaskMidAlpha:[0.2,  0,  1,   0.01],

        bottomHeight:      [90,   8,  320, 1],
        bottomBlur:        [13.5, 0,  20,  0.5],
        bottomStartPct:    [25,   0,  100, 1],
        bottomFalloff:     [1.25, 0.3, 3,  0.05],
        bottomMaskAlpha:   [0.31, 0,  1,   0.01],
        bottomMaskMidPct:  [70,   0,  100, 1],
        bottomMaskMidAlpha:[0.42, 0,  1,   0.01],
    });

    useLayoutEffect(() => {
        if (!visible) return;
        const footer = document.querySelector("footer") as HTMLElement | null;
        if (!footer) return;

        const key = Symbol();
        instanceKey.current = key;
        _pg.add(key);
        _footerFix(footer);

        return () => {
            _pg.delete(key);
            if (instanceKey.current === key) instanceKey.current = null;
            if (_pg.size === 0) _footerReset(footer);
        };
    }, [visible]);

    const fadeBase: CSSProperties = {
        position: "absolute",
        left: 0,
        right: 0,
        pointerEvents: "none",
        zIndex: 20,
    };

    return (
        <div
            style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: FOOTER_H,
        } as CSSProperties}
            data-ui-sound-scope="archive"
        >
            <h1 className="sr-only">archive</h1>
            {visible && <ArchivePosterGrid items={resolved} />}
            {resolved.length > 0 && (
              <BentoGallery
                  items={resolved}
                  columns={4}
                  gap={12}
                  cellAspect={1.25}
                  overviewMode="width"
                  maxZoom={1.5}
                  minZoomFactor={0.667}
                  visible={visible}
                  snap={snap}
                  enterEpoch={enterEpoch}
              />
            )}

            {visible && (
              <>
            {/* Top: solid for nav height, then long soft dissolve — fully dialkit-tunable */}
            <div style={{ ...fadeBase, top: 0, height: dk.topHeight }}>
                <div style={{
                    position: "absolute", inset: 0,
                    backdropFilter: `blur(${dk.topBlur}px)`,
                    WebkitBackdropFilter: `blur(${dk.topBlur}px)`,
                    maskImage: edgeMask("bottom", dk.topMaskAlpha, dk.topStartPct, dk.topMaskMidPct, dk.topMaskMidAlpha),
                    WebkitMaskImage: edgeMask("bottom", dk.topMaskAlpha, dk.topStartPct, dk.topMaskMidPct, dk.topMaskMidAlpha),
                }} />
                <div style={{ position: "absolute", inset: 0, background: solidEdgeGradient("bottom", dk.topStartPct, dk.topFalloff) }} />
            </div>

            {/* Bottom: smooth dissolve right above footer — reversed mirror of the top fade */}
            <div style={{ ...fadeBase, bottom: 0, height: dk.bottomHeight }}>
                <div style={{
                    position: "absolute", inset: 0,
                    backdropFilter: `blur(${dk.bottomBlur}px)`,
                    WebkitBackdropFilter: `blur(${dk.bottomBlur}px)`,
                    maskImage: edgeMask("top", dk.bottomMaskAlpha, dk.bottomStartPct, dk.bottomMaskMidPct, dk.bottomMaskMidAlpha),
                    WebkitMaskImage: edgeMask("top", dk.bottomMaskAlpha, dk.bottomStartPct, dk.bottomMaskMidPct, dk.bottomMaskMidAlpha),
                }} />
                <div style={{ position: "absolute", inset: 0, background: solidEdgeGradient("top", dk.bottomStartPct, dk.bottomFalloff) }} />
            </div>
              </>
            )}
        </div>
    );
}
