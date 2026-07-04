"use client";

import { useLayoutEffect, useRef } from "react";
import dynamic from "next/dynamic";
import type { CSSProperties } from "react";

// Module-level set of active playground mounts (unique symbol per instance).
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
}

function _footerReset(el: HTMLElement) {
    el.style.removeProperty("position");
    el.style.removeProperty("bottom");
    el.style.removeProperty("left");
    el.style.removeProperty("right");
    el.style.removeProperty("z-index");
    el.style.removeProperty("background");
}

const BentoGallery = dynamic(() => import("@/components/BentoGallery"), {
    ssr: false,
});

const ITEMS = [
    {
        src: "/playground/jcole.webp",
        alt: "J. Cole",
        caption: "J. Cole",
        colSpan: 1 as const,
        rowSpan: 2 as const,
    },
    {
        src: "/playground/keyboard.webp",
        alt: "Keyboard",
        caption: "keyboard",
        colSpan: 1 as const,
        rowSpan: 1 as const,
    },
    {
        src: "/playground/gunna.webp",
        alt: "Gunna",
        caption: "Gunna",
        colSpan: 1 as const,
        rowSpan: 1 as const,
    },
    {
        src: "/playground/the-marias.webp",
        alt: "The Marías",
        caption: "The Marías",
        colSpan: 1 as const,
        rowSpan: 1 as const,
    },
    {
        src: "/playground/omar-apollo.webp",
        alt: "Omar Apollo",
        caption: "Omar Apollo",
        colSpan: 1 as const,
        rowSpan: 2 as const,
    },
    {
        src: "/playground/2hollis.webp",
        alt: "2 Hollis",
        caption: "2 Hollis",
        colSpan: 1 as const,
        rowSpan: 1 as const,
    },
    {
        src: "/playground/concert.webp",
        alt: "Concert",
        caption: "concert",
        colSpan: 1 as const,
        rowSpan: 1 as const,
    },
];

// Footer: paddingTop(24) + lineHeight(21) + paddingBottom(24) = 69px
const FOOTER_H = 69;

// Solid-then-eased gradient: solid bg-color for [solidPct]% of the height,
// then a very gradual dissolve to transparent.
const solidEdgeGradient = (dir: "bottom" | "top", solidPct: number) => {
    const t = solidPct;
    return [
        `linear-gradient(to ${dir},`,
        `  var(--color-bg) 0%,`,
        `  var(--color-bg) ${t}%,`,
        `  color-mix(in srgb, var(--color-bg) 60%, transparent) ${t + (100 - t) * 0.30}%,`,
        `  color-mix(in srgb, var(--color-bg) 32%, transparent) ${t + (100 - t) * 0.58}%,`,
        `  color-mix(in srgb, var(--color-bg) 12%, transparent) ${t + (100 - t) * 0.80}%,`,
        `  color-mix(in srgb, var(--color-bg) 3%, transparent) ${t + (100 - t) * 0.94}%,`,
        `  transparent 100%`,
        `)`,
    ].join("");
};

export default function PlaygroundPage() {
    const instanceKey = useRef<symbol | null>(null);

    useLayoutEffect(() => {
        const footer = document.querySelector("footer") as HTMLElement | null;
        if (!footer) return;

        const key = Symbol();
        instanceKey.current = key;
        _pg.add(key);
        _footerFix(footer);

        return () => {
            _pg.delete(key);
            if (_pg.size === 0) _footerReset(footer);
        };
    }, []);

    const fadeBase: CSSProperties = {
        position: "absolute",
        left: 0,
        right: 0,
        pointerEvents: "none",
        zIndex: 20,
    };

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: FOOTER_H,
        } as CSSProperties}>
            <BentoGallery
                items={ITEMS}
                columns={4}
                gap={24}
                cellAspect={1.25}
                overviewMode="width"
                maxZoom={1.5}
                minZoomFactor={0.667}
            />

            {/* Top: solid for nav height (72px = 45% of 160px), then long soft dissolve */}
            <div style={{ ...fadeBase, top: 0, height: 160 }}>
                <div style={{
                    position: "absolute", inset: 0,
                    backdropFilter: "blur(5px)",
                    WebkitBackdropFilter: "blur(5px)",
                    maskImage: "linear-gradient(to bottom, black 0%, black 45%, rgba(0,0,0,0.2) 72%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 45%, rgba(0,0,0,0.2) 72%, transparent 100%)",
                }} />
                <div style={{ position: "absolute", inset: 0, background: solidEdgeGradient("bottom", 45) }} />
            </div>

            {/* Bottom: tiny solid seam, very long soft dissolve upward */}
            <div style={{ ...fadeBase, bottom: 0, height: 160 }}>
                <div style={{
                    position: "absolute", inset: 0,
                    backdropFilter: "blur(5px)",
                    WebkitBackdropFilter: "blur(5px)",
                    maskImage: "linear-gradient(to top, black 0%, black 8%, rgba(0,0,0,0.15) 45%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to top, black 0%, black 8%, rgba(0,0,0,0.15) 45%, transparent 100%)",
                }} />
                <div style={{ position: "absolute", inset: 0, background: solidEdgeGradient("top", 5) }} />
            </div>
        </div>
    );
}
