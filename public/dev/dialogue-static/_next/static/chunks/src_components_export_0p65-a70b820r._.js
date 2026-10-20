(()=>{"use strict";(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/export/export-canvas.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EXPORT_BG",
    ()=>EXPORT_BG,
    "EXPORT_SHADOW_INSET",
    ()=>EXPORT_SHADOW_INSET,
    "ExportCanvas",
    ()=>ExportCanvas,
    "ExportScale",
    ()=>ExportScale
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
const EXPORT_BG = "#F8F6F3";
const EXPORT_SHADOW_INSET = 72;
function ExportCanvas({ width, height, children, padding = EXPORT_SHADOW_INSET, className = "" }) {
    const style = {
        width,
        height,
        boxSizing: "border-box",
        padding,
        backgroundColor: EXPORT_BG,
        overflow: "visible",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: className,
        style: style,
        "data-export-canvas": true,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex size-full items-center justify-center overflow-visible",
            children: children
        }, void 0, false, {
            fileName: "[project]/src/components/export/export-canvas.tsx",
            lineNumber: 38,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/export/export-canvas.tsx",
        lineNumber: 37,
        columnNumber: 5
    }, this);
}
_c = ExportCanvas;
function ExportScale({ scale, children, style }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            transform: `scale(${scale})`,
            transformOrigin: "center center",
            overflow: "visible",
            ...style
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/export/export-canvas.tsx",
        lineNumber: 58,
        columnNumber: 5
    }, this);
}
_c1 = ExportScale;
var _c, _c1;
__turbopack_context__.k.register(_c, "ExportCanvas");
__turbopack_context__.k.register(_c1, "ExportScale");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/export/export-section-canvas.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ExportSectionCanvas",
    ()=>ExportSectionCanvas
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$canvas$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/export/export-canvas.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$section$2d$scale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/export/export-section-scale.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const SHELL_ROOT_SELECTORS = [
    "[data-export-app-shell]",
    "[data-export-hero-bounds]"
];
const CONTENT_SELECTORS = [
    "[data-export-chat-panel]",
    "[data-dialogue-paper-video-player]",
    "[data-export-hero-clips-panel]",
    "[data-export-mini-card]",
    "[data-export-anatomy]"
].join(",");
function unionRects(elements) {
    const nodes = elements.filter((el)=>{
        const r = el.getBoundingClientRect();
        return r.width >= 2 && r.height >= 2;
    });
    if (nodes.length === 0) return null;
    let minL = Infinity;
    let minT = Infinity;
    let maxR = -Infinity;
    let maxB = -Infinity;
    for (const el of nodes){
        const r = el.getBoundingClientRect();
        minL = Math.min(minL, r.left);
        minT = Math.min(minT, r.top);
        maxR = Math.max(maxR, r.right);
        maxB = Math.max(maxB, r.bottom);
    }
    return new DOMRect(minL, minT, maxR - minL, maxB - minT);
}
function unionContentRect(root) {
    for (const sel of SHELL_ROOT_SELECTORS){
        const shells = Array.from(root.querySelectorAll(sel));
        if (shells.length > 0) {
            const shellUnion = unionRects(shells);
            if (shellUnion) return shellUnion;
        }
    }
    const nodes = Array.from(root.querySelectorAll(CONTENT_SELECTORS)).filter((el)=>{
        const r = el.getBoundingClientRect();
        return r.width >= 2 && r.height >= 2;
    });
    if (nodes.length === 0) {
        const r = root.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) return null;
        return r;
    }
    let minL = Infinity;
    let minT = Infinity;
    let maxR = -Infinity;
    let maxB = -Infinity;
    for (const el of nodes){
        const r = el.getBoundingClientRect();
        minL = Math.min(minL, r.left);
        minT = Math.min(minT, r.top);
        maxR = Math.max(maxR, r.right);
        maxB = Math.max(maxB, r.bottom);
    }
    return new DOMRect(minL, minT, maxR - minL, maxB - minT);
}
function ExportSectionCanvas({ children, groupScale }) {
    _s();
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const groupRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [layout, setLayout] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"])({
        "ExportSectionCanvas.useLayoutEffect": ()=>{
            const measure = {
                "ExportSectionCanvas.useLayoutEffect.measure": ()=>{
                    const group = groupRef.current;
                    const canvas = canvasRef.current;
                    if (!group || !canvas) return;
                    const union = unionContentRect(group);
                    if (!union) return;
                    const groupRect = group.getBoundingClientRect();
                    let padRatio = Math.min(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$section$2d$scale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EXPORT_FRAME_PAD_RATIO"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$section$2d$scale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["exportFramePadRatioCap"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$section$2d$scale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EXPORT_FRAME_MIN_UI_AREA_FRACTION"]));
                    let padX = 0;
                    let padY = 0;
                    let canvasW = 1;
                    let canvasH = 1;
                    let uiAreaFraction = 0;
                    const uiArea = union.width * union.height;
                    for(let i = 0; i < 24; i++){
                        padX = union.width * padRatio;
                        padY = union.height * padRatio;
                        canvasW = Math.max(1, Math.round(union.width + padX * 2));
                        canvasH = Math.max(1, Math.round(union.height + padY * 2));
                        uiAreaFraction = uiArea / (canvasW * canvasH);
                        if (uiAreaFraction >= __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$section$2d$scale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EXPORT_FRAME_MIN_UI_AREA_FRACTION"]) break;
                        padRatio *= 0.985;
                    }
                    const relL = union.left - groupRect.left;
                    const relT = union.top - groupRect.top;
                    const offsetLeft = padX - relL;
                    const offsetTop = padY - relT;
                    const metrics = {
                        canvasWidth: canvasW,
                        canvasHeight: canvasH,
                        uiWidth: union.width,
                        uiHeight: union.height,
                        aspectRatio: canvasW / canvasH,
                        uiAreaFraction
                    };
                    setLayout({
                        canvasW,
                        canvasH,
                        offsetLeft,
                        offsetTop,
                        metrics
                    });
                    canvas.dataset.exportFrameReady = "true";
                    window.__exportFrameMetrics = metrics;
                }
            }["ExportSectionCanvas.useLayoutEffect.measure"];
            measure();
            const id = requestAnimationFrame(measure);
            void document.fonts.ready.then(measure);
            const group = groupRef.current;
            const ro = group && typeof ResizeObserver !== "undefined" ? new ResizeObserver({
                "ExportSectionCanvas.useLayoutEffect": ()=>measure()
            }["ExportSectionCanvas.useLayoutEffect"]) : null;
            if (group && ro) {
                ro.observe(group);
                for (const el of group.querySelectorAll("[data-export-hero-bounds],[data-export-app-shell],[data-dialogue-paper-video-player]")){
                    ro.observe(el);
                }
            }
            const heroPoll = window.setInterval({
                "ExportSectionCanvas.useLayoutEffect.heroPoll": ()=>{
                    if (group?.querySelector('[data-hero-ready="true"]')) measure();
                }
            }["ExportSectionCanvas.useLayoutEffect.heroPoll"], 50);
            const heroStop = window.setTimeout({
                "ExportSectionCanvas.useLayoutEffect.heroStop": ()=>clearInterval(heroPoll)
            }["ExportSectionCanvas.useLayoutEffect.heroStop"], 3000);
            return ({
                "ExportSectionCanvas.useLayoutEffect": ()=>{
                    cancelAnimationFrame(id);
                    ro?.disconnect();
                    clearInterval(heroPoll);
                    clearTimeout(heroStop);
                }
            })["ExportSectionCanvas.useLayoutEffect"];
        }
    }["ExportSectionCanvas.useLayoutEffect"], [
        groupScale
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: canvasRef,
        "data-export-section-canvas": true,
        "data-export-frame-ready": layout ? "true" : undefined,
        className: "export-section-canvas-weight-cap mx-auto overflow-hidden antialiased",
        style: {
            width: layout?.canvasW ?? 1,
            height: layout?.canvasH ?? 1,
            boxSizing: "border-box",
            background: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$canvas$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EXPORT_BG"],
            position: "relative",
            WebkitFontSmoothing: "antialiased",
            fontWeight: 400
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            ref: groupRef,
            "data-export-ui-group": true,
            className: "absolute overflow-visible",
            style: {
                left: layout?.offsetLeft ?? 0,
                top: layout?.offsetTop ?? 0,
                transform: `scale(${groupScale})`,
                transformOrigin: "top left"
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                "data-export-design-frame": true,
                className: "flex items-center justify-center overflow-visible",
                style: {
                    width: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$section$2d$scale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EXPORT_DESIGN_W"],
                    height: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$section$2d$scale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EXPORT_DESIGN_H"]
                },
                children: children
            }, void 0, false, {
                fileName: "[project]/src/components/export/export-section-canvas.tsx",
                lineNumber: 222,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/export/export-section-canvas.tsx",
            lineNumber: 211,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/export/export-section-canvas.tsx",
        lineNumber: 196,
        columnNumber: 5
    }, this);
}
_s(ExportSectionCanvas, "9XQEC0/+gtVFY1YDDxZpNx9hRuA=");
_c = ExportSectionCanvas;
var _c;
__turbopack_context__.k.register(_c, "ExportSectionCanvas");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/export/export-section-scale.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Section exports: layout reference 800×500 for group scale; capture crops to UI bbox + pad.
 */ __turbopack_context__.s([
    "EXPORT_ANNOTATION_FONT_PX",
    ()=>EXPORT_ANNOTATION_FONT_PX,
    "EXPORT_DESIGN_H",
    ()=>EXPORT_DESIGN_H,
    "EXPORT_DESIGN_W",
    ()=>EXPORT_DESIGN_W,
    "EXPORT_FRAME_MIN_UI_AREA_FRACTION",
    ()=>EXPORT_FRAME_MIN_UI_AREA_FRACTION,
    "EXPORT_FRAME_PAD_RATIO",
    ()=>EXPORT_FRAME_PAD_RATIO,
    "EXPORT_PANEL_SCALE",
    ()=>EXPORT_PANEL_SCALE,
    "EXPORT_SAFE_INSET_CSS",
    ()=>EXPORT_SAFE_INSET_CSS,
    "EXPORT_SECTION5_GROUP_SCALE",
    ()=>EXPORT_SECTION5_GROUP_SCALE,
    "EXPORT_SECTION_CANVAS_H",
    ()=>EXPORT_SECTION_CANVAS_H,
    "EXPORT_SECTION_CANVAS_W",
    ()=>EXPORT_SECTION_CANVAS_W,
    "EXPORT_SECTION_PAD",
    ()=>EXPORT_SECTION_PAD,
    "EXPORT_UI_GROUP_SCALE",
    ()=>EXPORT_UI_GROUP_SCALE,
    "EXPORT_UI_HEIGHT_RATIO",
    ()=>EXPORT_UI_HEIGHT_RATIO,
    "exportFramePadRatioCap",
    ()=>exportFramePadRatioCap
]);
const EXPORT_SECTION_CANVAS_W = 800;
const EXPORT_SECTION_CANVAS_H = 500;
const EXPORT_SECTION_PAD = 32;
const EXPORT_FRAME_PAD_RATIO = 0.06;
const EXPORT_FRAME_MIN_UI_AREA_FRACTION = 0.8;
function exportFramePadRatioCap(minUiAreaFraction) {
    return (1 / Math.sqrt(minUiAreaFraction) - 1) / 2;
}
const EXPORT_DESIGN_W = 1152;
const EXPORT_DESIGN_H = 720;
const EXPORT_PANEL_SCALE = 1.05;
const INNER_W = EXPORT_SECTION_CANVAS_W - EXPORT_SECTION_PAD * 2;
const INNER_H = EXPORT_SECTION_CANVAS_H - EXPORT_SECTION_PAD * 2;
const EXPORT_UI_HEIGHT_RATIO = 0.88;
const EXPORT_UI_GROUP_SCALE = Math.min(INNER_W / EXPORT_DESIGN_W, EXPORT_SECTION_CANVAS_H * EXPORT_UI_HEIGHT_RATIO / EXPORT_DESIGN_H);
const EXPORT_ANNOTATION_FONT_PX = 12 / EXPORT_UI_GROUP_SCALE;
const EXPORT_SECTION5_GROUP_SCALE = Math.min(INNER_W / 672, INNER_H * 0.92 / 700);
const EXPORT_SAFE_INSET_CSS = 24 + 20;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);})()

//# sourceMappingURL=src_components_export_0p65-a70b820r._.js.map