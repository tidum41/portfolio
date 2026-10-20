(()=>{"use strict";(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/chat/answer-summary.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AnswerSummary",
    ()=>AnswerSummary
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
function AnswerSummary({ text, emphasis, className = "", emphasisMedium = false }) {
    const idx = text.indexOf(emphasis);
    if (idx < 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: `text-body font-normal text-stone-ink ${className}`,
            children: text
        }, void 0, false, {
            fileName: "[project]/src/components/chat/answer-summary.tsx",
            lineNumber: 19,
            columnNumber: 7
        }, this);
    }
    const before = text.slice(0, idx);
    const after = text.slice(idx + emphasis.length);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        className: `text-body font-normal text-stone-ink ${className}`,
        children: [
            before,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: emphasisMedium ? "font-medium" : "font-semibold",
                children: emphasis
            }, void 0, false, {
                fileName: "[project]/src/components/chat/answer-summary.tsx",
                lineNumber: 29,
                columnNumber: 7
            }, this),
            after
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/chat/answer-summary.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
_c = AnswerSummary;
var _c;
__turbopack_context__.k.register(_c, "AnswerSummary");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/chat/chat-input.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChatInput",
    ()=>ChatInput
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-up.mjs [app-client] (ecmascript) <export default as ArrowUp>");
;
;
function ChatInput({ accentBorder = true, sendDisabled = true }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `flex shrink-0 flex-col gap-2 rounded-[14px] border bg-stone-surface p-3 ${accentBorder ? "border-brand-soft" : "border-[#E5E7EB]"}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "min-h-[60px] text-sm leading-5 text-stone-muted",
                children: "Ask about your study..."
            }, void 0, false, {
                fileName: "[project]/src/components/chat/chat-input.tsx",
                lineNumber: 18,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-end justify-between gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "min-w-0 flex-1"
                    }, void 0, false, {
                        fileName: "[project]/src/components/chat/chat-input.tsx",
                        lineNumber: 22,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        className: `flex size-9 shrink-0 items-center justify-center rounded-lg bg-stone-ink ${sendDisabled ? "opacity-50" : "opacity-100"}`,
                        "aria-label": "Send message",
                        disabled: sendDisabled,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUp$3e$__["ArrowUp"], {
                            className: "size-4 text-stone-sidebar",
                            strokeWidth: 2
                        }, void 0, false, {
                            fileName: "[project]/src/components/chat/chat-input.tsx",
                            lineNumber: 31,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/chat/chat-input.tsx",
                        lineNumber: 23,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/chat/chat-input.tsx",
                lineNumber: 21,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/chat/chat-input.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
_c = ChatInput;
var _c;
__turbopack_context__.k.register(_c, "ChatInput");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/chat/chat-thread-interactive.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChatThreadInteractive",
    ()=>ChatThreadInteractive
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$evidence$2d$clips$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/evidence-clips.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$source$2d$label$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/source-label.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$query$2d$search$2d$step$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/chat/query-search-step.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$thinking$2d$steps$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/chat/thinking-steps.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$thinking$2d$pill$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/chat/thinking-pill.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$interview$2d$clip$2d$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/chat/interview-clip-card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$warm$2d$clip$2d$thumb$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/chat/warm-clip-thumb.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$answer$2d$summary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/chat/answer-summary.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$follow$2d$up$2d$chips$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/chat/follow-up-chips.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$viz$2f$checkout$2d$dropoff$2d$viz$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/chat/viz/checkout-dropoff-viz.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$viz$2f$inline$2d$charts$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/chat/viz/inline-charts.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
function ChatThreadInteractive({ thread, initialBarLabel, initialHeatmapCell, queryExpanded = false, hideFollowUps = false, hideEvidenceClips = false, hideFollowUpText = false, showChartTooltip = false, showClipsLink = true, showExportCursors = false, hideFollowUpExportCursor = false, hideAssistantLead = false, showHeadlineCitations = false, clipsExpanded = false, clipsDrawerCompact = false, hideClipsDrawer = false, hideDeviceBlock = false, showThinkingSteps = false, showThinkingPill = false, hideQueryStep = false, hideUserBubble = false, funnelTooltipAbove = false, queryPreserveFullSummary = false, evidenceClipsCompact = false, anatomyRegions = false, funnelRowLimit, hideClipsLinkExportCursor = false, exportFloatingCompact = false, tightQueryStep = false, exportSummaryEmphasisMedium = false }) {
    _s();
    const [barLabel, setBarLabel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialBarLabel ?? null);
    const [heatmapCell, setHeatmapCell] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialHeatmapCell ?? null);
    const sourceLabel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$source$2d$label$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["interviewSourceLabel"])(thread.searchedCount);
    const clipIds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ChatThreadInteractive.useMemo[clipIds]": ()=>{
            if (thread.clipsOnly) return thread.clipsOnly.clipIds;
            if (thread.viz?.kind === "bar" && barLabel) {
                const item = thread.viz.items.find({
                    "ChatThreadInteractive.useMemo[clipIds].item": (i)=>i.label === barLabel
                }["ChatThreadInteractive.useMemo[clipIds].item"]);
                return item?.clipIds ?? [];
            }
            if (thread.viz?.kind === "heatmap" && heatmapCell) {
                return thread.viz.cellClips[heatmapCell.row]?.[heatmapCell.col] ?? [];
            }
            if (thread.viz?.kind === "checkout-dropoff") {
                return [
                    "ship-1",
                    "ship-2",
                    "mobile-intl"
                ];
            }
            return [];
        }
    }["ChatThreadInteractive.useMemo[clipIds]"], [
        thread,
        barLabel,
        heatmapCell
    ]);
    const clips = clipIds.map((id)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$evidence$2d$clips$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["interviewClips"][id]).filter(Boolean);
    const regionWrap = (id, node)=>anatomyRegions ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            "data-anatomy-region": id,
            children: node
        }, void 0, false, {
            fileName: "[project]/src/components/chat/chat-thread-interactive.tsx",
            lineNumber: 119,
            columnNumber: 7
        }, this) : node;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            !hideUserBubble && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "ml-auto max-w-[91.6667%] rounded-2xl bg-stone-warm px-4 py-2",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-body font-normal text-stone-ink",
                    children: thread.userMessage
                }, void 0, false, {
                    fileName: "[project]/src/components/chat/chat-thread-interactive.tsx",
                    lineNumber: 128,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/chat/chat-thread-interactive.tsx",
                lineNumber: 127,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    !hideAssistantLead && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "py-2 text-body text-stone-ink",
                        children: thread.assistantLead
                    }, void 0, false, {
                        fileName: "[project]/src/components/chat/chat-thread-interactive.tsx",
                        lineNumber: 135,
                        columnNumber: 11
                    }, this),
                    showThinkingSteps && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$thinking$2d$steps$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ThinkingSteps"], {}, void 0, false, {
                        fileName: "[project]/src/components/chat/chat-thread-interactive.tsx",
                        lineNumber: 137,
                        columnNumber: 31
                    }, this),
                    showThinkingPill && !showThinkingSteps && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$thinking$2d$pill$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ThinkingPill"], {}, void 0, false, {
                        fileName: "[project]/src/components/chat/chat-thread-interactive.tsx",
                        lineNumber: 138,
                        columnNumber: 52
                    }, this),
                    !hideQueryStep && !showThinkingSteps && !showThinkingPill && regionWrap("1", /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$query$2d$search$2d$step$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QuerySearchStep"], {
                        searchedCount: thread.searchedCount,
                        foundCount: thread.foundCount,
                        sources: thread.sources,
                        defaultExpanded: queryExpanded,
                        preserveFullSummary: queryPreserveFullSummary,
                        tight: tightQueryStep || exportFloatingCompact
                    }, void 0, false, {
                        fileName: "[project]/src/components/chat/chat-thread-interactive.tsx",
                        lineNumber: 144,
                        columnNumber: 13
                    }, this)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-2 py-2",
                        children: [
                            thread.clipsOnly ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    thread.clipsOnly.summaryEmphasis ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$answer$2d$summary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnswerSummary"], {
                                        text: thread.clipsOnly.summary,
                                        emphasis: thread.clipsOnly.summaryEmphasis
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/chat/chat-thread-interactive.tsx",
                                        lineNumber: 157,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-body font-medium text-stone-ink",
                                        children: thread.clipsOnly.summary
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/chat/chat-thread-interactive.tsx",
                                        lineNumber: 162,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col gap-2",
                                        children: thread.clipsOnly.clipIds.map((id)=>{
                                            const clip = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$evidence$2d$clips$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["interviewClips"][id];
                                            if (!clip) return null;
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$interview$2d$clip$2d$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["InterviewClipCard"], {
                                                clip: clip
                                            }, id, false, {
                                                fileName: "[project]/src/components/chat/chat-thread-interactive.tsx",
                                                lineNumber: 170,
                                                columnNumber: 26
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/chat/chat-thread-interactive.tsx",
                                        lineNumber: 166,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/chat/chat-thread-interactive.tsx",
                                lineNumber: 155,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    thread.viz?.kind === "checkout-dropoff" && !showThinkingSteps && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$viz$2f$checkout$2d$dropoff$2d$viz$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CheckoutDropoffVizPanel"], {
                                        viz: thread.viz,
                                        sourceLabel: sourceLabel,
                                        showTooltip: showChartTooltip,
                                        showClipsLink: showClipsLink,
                                        showExportCursors: showExportCursors,
                                        showHeadlineCitations: showHeadlineCitations,
                                        clipsExpanded: clipsExpanded,
                                        clipsDrawerCompact: clipsDrawerCompact,
                                        hideClipsDrawer: hideClipsDrawer,
                                        evidenceClips: clips,
                                        hideDeviceBlock: hideDeviceBlock,
                                        funnelTooltipAbove: funnelTooltipAbove,
                                        anatomyRegions: anatomyRegions,
                                        funnelRowLimit: funnelRowLimit,
                                        hideClipsLinkExportCursor: hideClipsLinkExportCursor,
                                        floatingCompact: exportFloatingCompact,
                                        summaryEmphasisMedium: exportSummaryEmphasisMedium
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/chat/chat-thread-interactive.tsx",
                                        lineNumber: 177,
                                        columnNumber: 17
                                    }, this),
                                    thread.viz?.kind === "bar" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$viz$2f$inline$2d$charts$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["InlineBarChart"], {
                                        viz: thread.viz,
                                        sourceLabel: sourceLabel,
                                        selectedLabel: barLabel,
                                        onSelectLabel: setBarLabel,
                                        focalLabel: "Shipping address"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/chat/chat-thread-interactive.tsx",
                                        lineNumber: 198,
                                        columnNumber: 17
                                    }, this),
                                    thread.viz?.kind === "line" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$viz$2f$inline$2d$charts$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["InlineLineChart"], {
                                        viz: thread.viz,
                                        sourceLabel: sourceLabel
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/chat/chat-thread-interactive.tsx",
                                        lineNumber: 207,
                                        columnNumber: 17
                                    }, this),
                                    thread.viz?.kind === "heatmap" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$viz$2f$inline$2d$charts$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["InlineHeatmap"], {
                                        viz: thread.viz,
                                        sourceLabel: sourceLabel,
                                        selectedCell: heatmapCell,
                                        onSelectCell: (row, col)=>setHeatmapCell({
                                                row,
                                                col
                                            })
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/chat/chat-thread-interactive.tsx",
                                        lineNumber: 210,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/chat/chat-thread-interactive.tsx",
                                lineNumber: 175,
                                columnNumber: 13
                            }, this),
                            !hideEvidenceClips && clips.length > 0 && evidenceClipsCompact && regionWrap("4", /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-2",
                                children: clips.slice(0, 3).map((clip, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$warm$2d$clip$2d$thumb$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WarmClipThumb"], {
                                        widthClass: "w-[72px]",
                                        selected: i === 0,
                                        showTimestamp: clip.timestamp,
                                        participant: clip.participant
                                    }, clip.id, false, {
                                        fileName: "[project]/src/components/chat/chat-thread-interactive.tsx",
                                        lineNumber: 224,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/chat/chat-thread-interactive.tsx",
                                lineNumber: 222,
                                columnNumber: 15
                            }, this)),
                            !hideEvidenceClips && clips.length > 0 && !evidenceClipsCompact && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-2",
                                children: clips.map((clip)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$interview$2d$clip$2d$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["InterviewClipCard"], {
                                        clip: clip
                                    }, clip.id, false, {
                                        fileName: "[project]/src/components/chat/chat-thread-interactive.tsx",
                                        lineNumber: 238,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/chat/chat-thread-interactive.tsx",
                                lineNumber: 236,
                                columnNumber: 13
                            }, this),
                            !hideFollowUpText && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-body text-stone-ink",
                                children: thread.followUp
                            }, void 0, false, {
                                fileName: "[project]/src/components/chat/chat-thread-interactive.tsx",
                                lineNumber: 243,
                                columnNumber: 13
                            }, this),
                            !hideFollowUps && regionWrap("5", /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$follow$2d$up$2d$chips$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FollowUpChips"], {
                                chips: thread.followUpChips,
                                exportHighlightIndex: showExportCursors && !hideFollowUpExportCursor ? 0 : undefined
                            }, void 0, false, {
                                fileName: "[project]/src/components/chat/chat-thread-interactive.tsx",
                                lineNumber: 248,
                                columnNumber: 15
                            }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/chat/chat-thread-interactive.tsx",
                        lineNumber: 153,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/chat/chat-thread-interactive.tsx",
                lineNumber: 133,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/chat/chat-thread-interactive.tsx",
        lineNumber: 125,
        columnNumber: 5
    }, this);
}
_s(ChatThreadInteractive, "I9rXMSbAVkH9D4y02dVIECWcVks=");
_c = ChatThreadInteractive;
var _c;
__turbopack_context__.k.register(_c, "ChatThreadInteractive");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/chat/dialogue-clip-player-card.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DialogueClipPlayerCard",
    ()=>DialogueClipPlayerCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$image$2d$component$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__Image__as__default$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/image-component.js [app-client] (ecmascript) <export Image as default>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$clip$2d$thumb$2d$photos$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/clip-thumb-photos.ts [app-client] (ecmascript)");
;
;
;
function ControlIcon({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "flex size-8 items-center justify-center text-white/95",
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/chat/dialogue-clip-player-card.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
_c = ControlIcon;
function TranscriptAvatar({ participant, isDialogue }) {
    const src = isDialogue ? undefined : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$clip$2d$thumb$2d$photos$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clipPhotoForParticipant"])(participant);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative size-12 shrink-0 overflow-hidden rounded-full bg-[#E7E5E4]",
        "aria-hidden": true,
        children: src ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$image$2d$component$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__Image__as__default$3e$__["default"], {
            src: src,
            alt: "",
            fill: true,
            className: "object-cover scale-110",
            style: {
                filter: "blur(4px)"
            },
            sizes: "48px"
        }, void 0, false, {
            fileName: "[project]/src/components/chat/dialogue-clip-player-card.tsx",
            lineNumber: 43,
            columnNumber: 9
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex size-full items-center justify-center text-[13px] font-medium text-[#57534D]",
            children: "D"
        }, void 0, false, {
            fileName: "[project]/src/components/chat/dialogue-clip-player-card.tsx",
            lineNumber: 52,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/chat/dialogue-clip-player-card.tsx",
        lineNumber: 38,
        columnNumber: 5
    }, this);
}
_c1 = TranscriptAvatar;
function TranscriptLine({ row }) {
    const idx = row.highlight ? row.text.indexOf(row.highlight) : -1;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex gap-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TranscriptAvatar, {
                participant: row.speaker,
                isDialogue: row.isDialogue
            }, void 0, false, {
                fileName: "[project]/src/components/chat/dialogue-clip-player-card.tsx",
                lineNumber: 64,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "min-w-0 flex-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap items-baseline gap-x-2 gap-y-0.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[14px] font-medium leading-5 text-[#1C1917]",
                                children: row.speaker
                            }, void 0, false, {
                                fileName: "[project]/src/components/chat/dialogue-clip-player-card.tsx",
                                lineNumber: 70,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[14px] font-normal leading-5 text-[#57534D]",
                                children: row.timestamp
                            }, void 0, false, {
                                fileName: "[project]/src/components/chat/dialogue-clip-player-card.tsx",
                                lineNumber: 73,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/chat/dialogue-clip-player-card.tsx",
                        lineNumber: 69,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1 text-[14px] font-normal leading-5 text-[#1C1917]",
                        children: idx < 0 || !row.highlight ? row.text : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                row.text.slice(0, idx),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "rounded-sm bg-brand/20 px-0.5 font-medium",
                                    children: row.highlight
                                }, void 0, false, {
                                    fileName: "[project]/src/components/chat/dialogue-clip-player-card.tsx",
                                    lineNumber: 83,
                                    columnNumber: 15
                                }, this),
                                row.text.slice(idx + row.highlight.length)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/chat/dialogue-clip-player-card.tsx",
                            lineNumber: 81,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/chat/dialogue-clip-player-card.tsx",
                        lineNumber: 77,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/chat/dialogue-clip-player-card.tsx",
                lineNumber: 68,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/chat/dialogue-clip-player-card.tsx",
        lineNumber: 63,
        columnNumber: 5
    }, this);
}
_c2 = TranscriptLine;
function DialogueClipPlayerCard({ clip, rows, currentTime = "01:39", duration = "11:45", progress = 0.22 }) {
    const stillSrc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$clip$2d$thumb$2d$photos$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clipPhotoForParticipant"])(clip.participant);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
        "data-testid": "export-clip-card",
        className: "flex w-full flex-col gap-4 rounded-[10px] border border-[#E7E5E4] bg-[#F8F6F3] p-6 shadow-[0_10px_15px_-3px_#0000001A,0_4px_6px_-4px_#0000001A]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative aspect-video overflow-hidden rounded-[8px] bg-black leading-[0]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$image$2d$component$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__Image__as__default$3e$__["default"], {
                        src: stillSrc,
                        alt: "",
                        fill: true,
                        className: "object-cover scale-110",
                        style: {
                            filter: "blur(10px)"
                        },
                        sizes: "400px",
                        priority: true
                    }, void 0, false, {
                        fileName: "[project]/src/components/chat/dialogue-clip-player-card.tsx",
                        lineNumber: 110,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-x-3 bottom-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1 rounded-full px-2 py-1.5 shadow-[inset_0_0_0_1px_#FFFFFF26]",
                                style: {
                                    background: "#FFFFFF1A",
                                    backdropFilter: "blur(16px) saturate(150%)",
                                    WebkitBackdropFilter: "blur(16px) saturate(150%)"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ControlIcon, {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[11px] font-medium leading-none",
                                            children: "⟲10"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/chat/dialogue-clip-player-card.tsx",
                                            lineNumber: 129,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/chat/dialogue-clip-player-card.tsx",
                                        lineNumber: 128,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ControlIcon, {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            viewBox: "0 0 24 24",
                                            className: "size-5 fill-white",
                                            "aria-hidden": true,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                d: "M8 5v14l11-7z"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/chat/dialogue-clip-player-card.tsx",
                                                lineNumber: 133,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/chat/dialogue-clip-player-card.tsx",
                                            lineNumber: 132,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/chat/dialogue-clip-player-card.tsx",
                                        lineNumber: 131,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ControlIcon, {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[11px] font-medium leading-none",
                                            children: "10⟳"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/chat/dialogue-clip-player-card.tsx",
                                            lineNumber: 137,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/chat/dialogue-clip-player-card.tsx",
                                        lineNumber: 136,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "min-w-0 flex-1 whitespace-nowrap px-1 text-center text-[13px] font-normal leading-none text-white",
                                        style: {
                                            fontFamily: "Inter, system-ui, sans-serif"
                                        },
                                        children: [
                                            currentTime,
                                            " / ",
                                            duration
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/chat/dialogue-clip-player-card.tsx",
                                        lineNumber: 139,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "rounded-md px-2 py-1 text-[13px] font-normal leading-none text-white",
                                        style: {
                                            fontFamily: "Inter, system-ui, sans-serif",
                                            background: "#FFFFFF33"
                                        },
                                        children: "1×"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/chat/dialogue-clip-player-card.tsx",
                                        lineNumber: 145,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/chat/dialogue-clip-player-card.tsx",
                                lineNumber: 120,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-2 h-1 overflow-hidden rounded-[2px] bg-white/25",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-full rounded-[2px] bg-white",
                                    style: {
                                        width: `${Math.round(progress * 100)}%`
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/components/chat/dialogue-clip-player-card.tsx",
                                    lineNumber: 156,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/chat/dialogue-clip-player-card.tsx",
                                lineNumber: 155,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/chat/dialogue-clip-player-card.tsx",
                        lineNumber: 119,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/chat/dialogue-clip-player-card.tsx",
                lineNumber: 109,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-[16px] font-medium leading-6 text-[#1C1917]",
                        children: "Transcript"
                    }, void 0, false, {
                        fileName: "[project]/src/components/chat/dialogue-clip-player-card.tsx",
                        lineNumber: 165,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-6",
                        children: rows.map((row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TranscriptLine, {
                                row: row
                            }, `${row.speaker}-${row.timestamp}`, false, {
                                fileName: "[project]/src/components/chat/dialogue-clip-player-card.tsx",
                                lineNumber: 170,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/chat/dialogue-clip-player-card.tsx",
                        lineNumber: 168,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/chat/dialogue-clip-player-card.tsx",
                lineNumber: 164,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/chat/dialogue-clip-player-card.tsx",
        lineNumber: 105,
        columnNumber: 5
    }, this);
}
_c3 = DialogueClipPlayerCard;
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "ControlIcon");
__turbopack_context__.k.register(_c1, "TranscriptAvatar");
__turbopack_context__.k.register(_c2, "TranscriptLine");
__turbopack_context__.k.register(_c3, "DialogueClipPlayerCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/chat/follow-up-chips.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FollowUpChips",
    ()=>FollowUpChips
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$cursor$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/export/export-cursor.tsx [app-client] (ecmascript)");
;
;
;
function FollowUpChips({ chips, exportHighlightIndex }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-wrap gap-2 pt-1",
        children: chips.map((chip, i)=>{
            const highlighted = exportHighlightIndex === i;
            const className = `relative inline-flex h-9 items-center rounded-lg border px-3 text-meta font-medium ${highlighted ? "border-brand bg-brand-soft/40 text-stone-ink" : "border-stone-border text-stone-muted"}`;
            return chip.href ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                href: chip.href,
                className: className,
                children: [
                    chip.label,
                    highlighted && exportHighlightIndex !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$cursor$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExportCursor"], {
                        variant: "hand",
                        className: "left-[calc(100%-6px)] top-[calc(100%-4px)]"
                    }, void 0, false, {
                        fileName: "[project]/src/components/chat/follow-up-chips.tsx",
                        lineNumber: 26,
                        columnNumber: 15
                    }, this)
                ]
            }, chip.label, true, {
                fileName: "[project]/src/components/chat/follow-up-chips.tsx",
                lineNumber: 23,
                columnNumber: 11
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: className,
                children: [
                    chip.label,
                    highlighted && exportHighlightIndex !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$cursor$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExportCursor"], {
                        variant: "hand",
                        className: "left-[calc(100%-6px)] top-[calc(100%-4px)]"
                    }, void 0, false, {
                        fileName: "[project]/src/components/chat/follow-up-chips.tsx",
                        lineNumber: 33,
                        columnNumber: 15
                    }, this)
                ]
            }, chip.label, true, {
                fileName: "[project]/src/components/chat/follow-up-chips.tsx",
                lineNumber: 30,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/src/components/chat/follow-up-chips.tsx",
        lineNumber: 14,
        columnNumber: 5
    }, this);
}
_c = FollowUpChips;
var _c;
__turbopack_context__.k.register(_c, "FollowUpChips");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/chat/interview-clip-card.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InterviewClipCard",
    ()=>InterviewClipCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$dialogue$2d$clip$2d$player$2d$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/chat/dialogue-clip-player-card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$warm$2d$clip$2d$thumb$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/chat/warm-clip-thumb.tsx [app-client] (ecmascript)");
;
;
;
function InterviewClipCard({ clip, fullTranscript = false, exportFrame = false, largeThumb = false, exportTranscriptRows }) {
    if (exportFrame && largeThumb && exportTranscriptRows) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$dialogue$2d$clip$2d$player$2d$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogueClipPlayerCard"], {
            clip: clip,
            rows: exportTranscriptRows
        }, void 0, false, {
            fileName: "[project]/src/components/chat/interview-clip-card.tsx",
            lineNumber: 23,
            columnNumber: 7
        }, this);
    }
    const parts = clip.transcript.split(clip.highlight);
    const before = parts[0] ?? "";
    const after = parts.slice(1).join(clip.highlight);
    const nameLine = clip.segment ? `${clip.participant}, ${clip.segment}` : clip.participant;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
        "data-testid": exportFrame ? "export-clip-card" : undefined,
        className: `overflow-hidden rounded-[14px] border border-stone-border bg-stone-surface ${exportFrame ? "w-full shadow-[0_10px_28px_-12px_rgba(28,25,23,0.12)]" : "shadow-[0_16px_40px_rgba(28,25,23,0.1)]"}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `relative w-full ${largeThumb ? "px-3 pt-3" : ""}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$warm$2d$clip$2d$thumb$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WarmClipThumb"], {
                    widthClass: "w-full",
                    selected: true,
                    showTimestamp: clip.timestamp,
                    participant: clip.participant
                }, void 0, false, {
                    fileName: "[project]/src/components/chat/interview-clip-card.tsx",
                    lineNumber: 44,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/chat/interview-clip-card.tsx",
                lineNumber: 43,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-body font-medium text-stone-ink",
                        children: nameLine
                    }, void 0, false, {
                        fileName: "[project]/src/components/chat/interview-clip-card.tsx",
                        lineNumber: 52,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: `mt-2 text-body font-normal leading-[22px] text-stone-ink ${fullTranscript ? "" : "line-clamp-3"}`,
                        children: [
                            before,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "rounded-sm bg-brand/20 px-0.5 font-medium text-stone-ink",
                                children: clip.highlight
                            }, void 0, false, {
                                fileName: "[project]/src/components/chat/interview-clip-card.tsx",
                                lineNumber: 57,
                                columnNumber: 11
                            }, this),
                            after
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/chat/interview-clip-card.tsx",
                        lineNumber: 53,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/chat/interview-clip-card.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/chat/interview-clip-card.tsx",
        lineNumber: 35,
        columnNumber: 5
    }, this);
}
_c = InterviewClipCard;
var _c;
__turbopack_context__.k.register(_c, "InterviewClipCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/chat/moment-citations.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MomentCitations",
    ()=>MomentCitations
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$clip$2d$time$2d$ranges$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/clip-time-ranges.ts [app-client] (ecmascript)");
;
;
function MomentCitations({ lead, moreCount }) {
    const range = lead.participant === "Jordan M." ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$clip$2d$time$2d$ranges$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JORDAN_SHIPPING_RANGE"] : lead.timestamp;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        className: "mt-2 text-pretty text-meta font-normal leading-snug text-stone-muted",
        children: [
            "From ",
            moreCount + 1,
            " checkout moments, including",
            " ",
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "font-normal text-brand",
                children: [
                    lead.participant,
                    " at ",
                    range
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/chat/moment-citations.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/chat/moment-citations.tsx",
        lineNumber: 22,
        columnNumber: 5
    }, this);
}
_c = MomentCitations;
var _c;
__turbopack_context__.k.register(_c, "MomentCitations");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/chat/query-search-step.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "QuerySearchStep",
    ()=>QuerySearchStep
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.mjs [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/badge.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function QuerySearchStep({ searchedCount, foundCount, sources, defaultExpanded = false, showExpandedMeta = false, tight = false }) {
    _s();
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(defaultExpanded);
    const summary = `Searched ${searchedCount} interviews, found ${foundCount} relevant moments`;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: tight ? "my-0.5" : "my-2",
        "data-testid": "query-search-step",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>setOpen((v)=>!v),
                className: `flex w-full min-w-0 items-start gap-2 rounded-[14px] border border-stone-border bg-stone-surface px-3 text-left ${tight ? "py-1.5" : "py-2"}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "min-w-0 flex-1 text-meta text-stone-muted",
                        children: summary
                    }, void 0, false, {
                        fileName: "[project]/src/components/chat/query-search-step.tsx",
                        lineNumber: 43,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                        "data-testid": "query-search-chevron",
                        className: `mt-0.5 size-4 shrink-0 text-stone-muted transition-transform ${open ? "rotate-180" : ""}`,
                        strokeWidth: 2
                    }, void 0, false, {
                        fileName: "[project]/src/components/chat/query-search-step.tsx",
                        lineNumber: 46,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/chat/query-search-step.tsx",
                lineNumber: 38,
                columnNumber: 7
            }, this),
            open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-6 rounded-[14px] border border-stone-border bg-stone-surface px-3 py-2",
                children: [
                    showExpandedMeta && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-2 text-meta text-stone-muted",
                        children: [
                            foundCount,
                            " matched moments across checkout steps"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/chat/query-search-step.tsx",
                        lineNumber: 57,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                        className: "space-y-2",
                        children: sources.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                className: "flex flex-wrap items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-meta whitespace-nowrap text-stone-muted",
                                        children: [
                                            s.participant,
                                            ", ",
                                            s.time
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/chat/query-search-step.tsx",
                                        lineNumber: 67,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                        className: "capitalize",
                                        children: s.topic
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/chat/query-search-step.tsx",
                                        lineNumber: 70,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, `${s.participant}-${s.time}`, true, {
                                fileName: "[project]/src/components/chat/query-search-step.tsx",
                                lineNumber: 63,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/chat/query-search-step.tsx",
                        lineNumber: 61,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/chat/query-search-step.tsx",
                lineNumber: 53,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/chat/query-search-step.tsx",
        lineNumber: 37,
        columnNumber: 5
    }, this);
}
_s(QuerySearchStep, "CdfnZiJ+T42IbddhiFTNrQQyd2Q=");
_c = QuerySearchStep;
var _c;
__turbopack_context__.k.register(_c, "QuerySearchStep");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/chat/study-chat-shell.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StudyChatShell",
    ()=>StudyChatShell
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Minus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/minus.mjs [app-client] (ecmascript) <export default as Minus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$chat$2d$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/chat/chat-input.tsx [app-client] (ecmascript)");
"use client";
;
;
;
;
;
function StudyChatShell({ children, variant = "thread", closeHref = "/closed", className = "", embedded = false, showMinimize = true, embeddedWidth = 366, embeddedHeight = 720, contentOffsetY = 0, expandContent = false, hideHeader = false, hideInput = false, exportFrame = false, exportHeroPair = false, heroTypography = false, compactChrome = false, exportDocked = false, exportPopup = false }) {
    const title = exportFrame && variant === "empty" ? "Research assistant" : variant === "empty" ? "New chat" : "Study chat";
    const subtitle = exportFrame && variant === "empty" ? "Checkout usability, 24 interviews" : "Answering questions about this study";
    const embeddedHeightStyle = embedded && !expandContent ? {
        height: embeddedHeight
    } : undefined;
    const shellHeight = embedded ? expandContent ? "h-auto" : "" : variant === "thread" ? "h-[min(720px,calc(100vh-3rem))] min-h-[640px] max-h-[720px]" : "max-h-[min(560px,calc(100vh-3rem))]";
    const positionClass = embedded ? "relative" : "pointer-events-none fixed bottom-6 right-6 z-50 w-[366px] max-w-[366px] max-md:inset-x-0 max-md:bottom-0 max-md:w-full max-md:max-w-none";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `${positionClass} ${className}`,
        style: embedded ? {
            width: embeddedWidth
        } : undefined,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: exportDocked ? "h-full overflow-hidden" : exportPopup ? "overflow-visible rounded-xl shadow-[0_1px_2px_rgba(28,25,23,0.05),0_8px_24px_rgba(28,25,23,0.05)]" : `overflow-visible rounded-3xl ${exportFrame && !exportHeroPair ? "shadow-[0_8px_24px_-12px_rgba(28,25,23,0.08)]" : exportHeroPair ? "" : ""}`,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                "data-export-chat-panel": true,
                className: `flex flex-col overflow-hidden bg-stone-surface ${exportDocked ? "h-full rounded-none border-0" : exportPopup ? "rounded-xl border border-stone-border" : `rounded-3xl border border-stone-border ${exportFrame ? "" : "shadow-[var(--shadow-chat)]"}`} ${shellHeight} ${expandContent && !exportFrame ? "overflow-visible" : "overflow-hidden"} ${embedded ? "pointer-events-auto" : "pointer-events-auto max-md:max-h-[85vh] max-md:rounded-b-none max-md:rounded-t-3xl"}`,
                style: embeddedHeightStyle,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `flex min-h-0 flex-1 flex-col bg-stone-surface ${compactChrome ? exportPopup ? "gap-3 p-3 pt-3 pb-4" : "gap-3 p-3 pt-3 pb-2" : hideHeader && hideInput ? "gap-0 p-7 pt-7 pb-7" : "gap-4 p-7"}`,
                    children: [
                        !hideHeader && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex shrink-0 flex-col gap-0.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: heroTypography ? "text-body font-medium text-stone-ink" : "text-[14px] font-medium leading-[142.857%] text-stone-ink",
                                                    children: title
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/chat/study-chat-shell.tsx",
                                                    lineNumber: 136,
                                                    columnNumber: 19
                                                }, this),
                                                !exportFrame ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                    children: "Beta"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/chat/study-chat-shell.tsx",
                                                    lineNumber: 145,
                                                    columnNumber: 35
                                                }, this) : null
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/chat/study-chat-shell.tsx",
                                            lineNumber: 135,
                                            columnNumber: 17
                                        }, this),
                                        showMinimize && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: closeHref,
                                            className: "flex size-9 items-center justify-center rounded-lg text-stone-ink",
                                            "aria-label": "Minimize chat",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Minus$3e$__["Minus"], {
                                                className: "size-4",
                                                strokeWidth: 2
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/chat/study-chat-shell.tsx",
                                                lineNumber: 153,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/chat/study-chat-shell.tsx",
                                            lineNumber: 148,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/chat/study-chat-shell.tsx",
                                    lineNumber: 134,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: heroTypography ? "text-meta text-stone-muted" : "text-[12px] leading-[133.333%] text-stone-muted",
                                    children: subtitle
                                }, void 0, false, {
                                    fileName: "[project]/src/components/chat/study-chat-shell.tsx",
                                    lineNumber: 157,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/chat/study-chat-shell.tsx",
                            lineNumber: 133,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `-mx-7 flex min-h-0 flex-col ${expandContent ? "overflow-visible" : "flex-1 overflow-hidden"}`,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `min-h-0 overscroll-contain ${expandContent ? "overflow-visible" : "flex-1 overflow-y-auto"}`,
                                "data-chat-scroll": true,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col gap-3 px-7",
                                    style: contentOffsetY ? {
                                        marginTop: contentOffsetY
                                    } : undefined,
                                    children: children
                                }, void 0, false, {
                                    fileName: "[project]/src/components/chat/study-chat-shell.tsx",
                                    lineNumber: 176,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/chat/study-chat-shell.tsx",
                                lineNumber: 172,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/chat/study-chat-shell.tsx",
                            lineNumber: 169,
                            columnNumber: 11
                        }, this),
                        !hideInput && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$chat$2d$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ChatInput"], {
                            accentBorder: true,
                            sendDisabled: true
                        }, void 0, false, {
                            fileName: "[project]/src/components/chat/study-chat-shell.tsx",
                            lineNumber: 185,
                            columnNumber: 26
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/chat/study-chat-shell.tsx",
                    lineNumber: 121,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/chat/study-chat-shell.tsx",
                lineNumber: 104,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/chat/study-chat-shell.tsx",
            lineNumber: 89,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/chat/study-chat-shell.tsx",
        lineNumber: 85,
        columnNumber: 5
    }, this);
}
_c = StudyChatShell;
var _c;
__turbopack_context__.k.register(_c, "StudyChatShell");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/chat/thinking-pill.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Compact “thinking” status for export hero (Paper-style). */ __turbopack_context__.s([
    "ThinkingPill",
    ()=>ThinkingPill
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
function ThinkingPill() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "my-2 inline-flex max-w-full items-center gap-2 rounded-full border border-stone-border bg-stone-warm px-3 py-1.5",
        "data-testid": "thinking-pill",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "size-2 shrink-0 rounded-full bg-brand/80",
                "aria-hidden": true
            }, void 0, false, {
                fileName: "[project]/src/components/chat/thinking-pill.tsx",
                lineNumber: 8,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-meta font-medium text-stone-ink",
                children: "Thinking"
            }, void 0, false, {
                fileName: "[project]/src/components/chat/thinking-pill.tsx",
                lineNumber: 12,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-meta text-stone-muted",
                children: "Planning interview search"
            }, void 0, false, {
                fileName: "[project]/src/components/chat/thinking-pill.tsx",
                lineNumber: 13,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/chat/thinking-pill.tsx",
        lineNumber: 4,
        columnNumber: 5
    }, this);
}
_c = ThinkingPill;
var _c;
__turbopack_context__.k.register(_c, "ThinkingPill");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/chat/thinking-steps.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThinkingSteps",
    ()=>ThinkingSteps
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
const checkoutThinkingSteps = [
    {
        title: "Thinking",
        body: "Planning interview search"
    },
    {
        title: "Thought",
        body: "Switching to interview search"
    },
    {
        title: "Read data schema",
        body: "Checkout steps, device tags, and session transcripts",
        muted: true
    },
    {
        body: "Searched 24 interviews, found 9 relevant moments",
        mono: true
    },
    {
        body: "Matched 9 moments about checkout",
        mono: true,
        muted: true
    }
];
function ThinkingSteps({ steps = checkoutThinkingSteps }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-3 py-2",
        "data-testid": "thinking-steps",
        children: steps.map((step, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    step.title && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-meta font-semibold text-stone-ink",
                        children: step.title
                    }, void 0, false, {
                        fileName: "[project]/src/components/chat/thinking-steps.tsx",
                        lineNumber: 33,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: `${step.title ? "mt-1" : ""} ${step.mono ? "text-mono-ui" : "text-meta"} ${step.muted ? "text-stone-muted" : "text-stone-muted"}`,
                        children: step.body
                    }, void 0, false, {
                        fileName: "[project]/src/components/chat/thinking-steps.tsx",
                        lineNumber: 35,
                        columnNumber: 11
                    }, this)
                ]
            }, i, true, {
                fileName: "[project]/src/components/chat/thinking-steps.tsx",
                lineNumber: 31,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/src/components/chat/thinking-steps.tsx",
        lineNumber: 29,
        columnNumber: 5
    }, this);
}
_c = ThinkingSteps;
var _c;
__turbopack_context__.k.register(_c, "ThinkingSteps");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/chat/viz/checkout-dropoff-viz.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CheckoutDropoffVizPanel",
    ()=>CheckoutDropoffVizPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$chart$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/chart-colors.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$cursor$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/export/export-cursor.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$moment$2d$citations$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/chat/moment-citations.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$viz$2f$clips$2d$drawer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/chat/viz/clips-drawer.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$viz$2f$viz$2d$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/chat/viz/viz-card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$viz$2f$viz$2d$summary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/chat/viz/viz-summary.tsx [app-client] (ecmascript)");
"use client";
;
;
;
;
;
;
;
const stoneRamp = [
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$chart$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["chartColors"].stone300,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$chart$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["chartColors"].stone400,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$chart$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["chartColors"].stone600,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$chart$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["chartColors"].stone400,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$chart$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["chartColors"].stone300
];
function CheckoutDropoffVizPanel({ viz, sourceLabel, showTooltip = false, showClipsLink = true, showExportCursors = false, showHeadlineCitations = false, clipsExpanded = false, clipsDrawerCompact = false, hideClipsDrawer = false, evidenceClips = [], hideDeviceBlock = false, funnelTooltipAbove = false, anatomyRegions = false, funnelRowLimit, hideClipsLinkExportCursor = false, floatingCompact = false, summaryEmphasisMedium = false }) {
    const funnelSteps = funnelRowLimit != null ? viz.funnel.slice(0, funnelRowLimit) : viz.funnel;
    const focal = funnelSteps.find((s)=>s.focal) ?? funnelSteps[1];
    const showDropLabel = showTooltip && !funnelTooltipAbove;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `rounded-[10px] border border-stone-border bg-stone-surface ${showExportCursors || clipsExpanded ? "overflow-visible" : "overflow-hidden"}`,
        "data-testid": "viz-card",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `flex flex-col ${floatingCompact ? "gap-1.5 p-2" : "gap-3 p-3"} ${showExportCursors || clipsExpanded ? "overflow-visible" : ""}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            anatomyRegions ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                "data-anatomy-region": "2",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$viz$2f$viz$2d$summary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VizSummary"], {
                                    summary: viz.summary,
                                    summaryEmphasis: viz.summaryEmphasis,
                                    summaryEmphasisMedium: summaryEmphasisMedium
                                }, void 0, false, {
                                    fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                                    lineNumber: 82,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                                lineNumber: 81,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$viz$2f$viz$2d$summary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VizSummary"], {
                                summary: viz.summary,
                                summaryEmphasis: viz.summaryEmphasis,
                                summaryEmphasisMedium: summaryEmphasisMedium
                            }, void 0, false, {
                                fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                                lineNumber: 89,
                                columnNumber: 13
                            }, this),
                            showHeadlineCitations && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$moment$2d$citations$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MomentCitations"], {
                                lead: {
                                    participant: "Jordan M.",
                                    timestamp: "14:03"
                                },
                                moreCount: 8,
                                topicLabel: "checkout"
                            }, void 0, false, {
                                fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                                lineNumber: 96,
                                columnNumber: 13
                            }, this),
                            !floatingCompact && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-2 text-meta font-normal text-stone-muted",
                                children: "Checkout funnel, % of participants still in flow"
                            }, void 0, false, {
                                fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                                lineNumber: 103,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `relative space-y-2 ${floatingCompact ? "mt-1.5" : "mt-2"}`,
                                "data-anatomy-region": anatomyRegions ? "3" : undefined,
                                children: funnelSteps.map((step, i)=>{
                                    const isFocal = step.focal;
                                    const fill = isFocal ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$chart$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["chartColors"].pink : stoneRamp[i % stoneRamp.length];
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "w-[72px] shrink-0 text-right text-meta whitespace-nowrap text-stone-muted",
                                                children: step.shortLabel
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                                                lineNumber: 119,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `relative h-2 min-w-0 rounded-sm bg-stone-warm ${funnelTooltipAbove ? "mr-3 flex-1" : "min-w-0 flex-1"}`,
                                                style: funnelTooltipAbove ? {
                                                    maxWidth: "calc(100% - 12px)"
                                                } : undefined,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "h-2 rounded-sm",
                                                        style: {
                                                            width: `${step.pctRemaining}%`,
                                                            backgroundColor: fill
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                                                        lineNumber: 134,
                                                        columnNumber: 19
                                                    }, this),
                                                    isFocal && showTooltip && funnelTooltipAbove && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "absolute bottom-full z-30 mb-3 min-w-max -translate-x-1/2 rounded-md border border-stone-border bg-stone-surface px-1.5 py-0.5 shadow-sm",
                                                        style: {
                                                            left: `${step.pctRemaining}%`
                                                        },
                                                        "data-export-chart-tooltip": true,
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-meta leading-tight whitespace-nowrap text-stone-ink",
                                                            children: [
                                                                "−",
                                                                step.dropPct,
                                                                "% drop"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                                                            lineNumber: 147,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                                                        lineNumber: 142,
                                                        columnNumber: 21
                                                    }, this),
                                                    isFocal && showExportCursors && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$cursor$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExportCursor"], {
                                                        variant: "pointer",
                                                        className: "z-20 -translate-y-1/2",
                                                        style: {
                                                            left: `calc(${step.pctRemaining}% + 12px)`,
                                                            top: "50%"
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                                                        lineNumber: 153,
                                                        columnNumber: 21
                                                    }, this),
                                                    isFocal && showDropLabel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "absolute top-1/2 z-30 min-w-max -translate-y-1/2 rounded-md border border-stone-border bg-stone-surface px-1.5 py-0.5 shadow-sm",
                                                        style: {
                                                            left: "calc(62% + 12px)"
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-meta leading-tight whitespace-nowrap text-stone-ink",
                                                            children: [
                                                                "−",
                                                                step.dropPct,
                                                                "% drop"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                                                            lineNumber: 167,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                                                        lineNumber: 163,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                                                lineNumber: 124,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `w-10 shrink-0 text-right text-meta tabular-nums ${isFocal ? "font-medium text-brand" : "text-stone-muted"}`,
                                                children: [
                                                    step.pctRemaining,
                                                    "%"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                                                lineNumber: 173,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, step.shortLabel, true, {
                                        fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                                        lineNumber: 115,
                                        columnNumber: 15
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                                lineNumber: 107,
                                columnNumber: 11
                            }, this),
                            focal?.dropPct && !floatingCompact && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-2 text-meta text-stone-muted",
                                children: [
                                    "Largest drop:",
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-medium text-stone-ink",
                                        children: [
                                            focal.label,
                                            " (−",
                                            focal.dropPct,
                                            "%)"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                                        lineNumber: 187,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                                lineNumber: 185,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                        lineNumber: 79,
                        columnNumber: 9
                    }, this),
                    !hideDeviceBlock && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "border-t border-stone-border pt-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-body text-stone-ink",
                                children: viz.deviceBlock.title
                            }, void 0, false, {
                                fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                                lineNumber: 196,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1 text-meta text-stone-muted",
                                children: viz.deviceBlock.subtitle
                            }, void 0, false, {
                                fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                                lineNumber: 197,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-2 grid grid-cols-2 gap-2",
                                children: viz.deviceBlock.devices.map((device)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-lg border border-stone-border bg-stone-surface p-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-meta font-medium text-stone-ink",
                                                children: device.name
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                                                lineNumber: 204,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-2 space-y-1.5",
                                                children: device.reasons.map((r, ri)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "w-[96px] shrink-0 text-right text-meta whitespace-nowrap text-stone-muted",
                                                                children: r.label
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                                                                lineNumber: 208,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "h-1.5 min-w-0 flex-1 rounded-sm bg-stone-warm",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "h-1.5 rounded-sm",
                                                                    style: {
                                                                        width: `${r.pct}%`,
                                                                        backgroundColor: stoneRamp[ri % stoneRamp.length]
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                                                                    lineNumber: 214,
                                                                    columnNumber: 25
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                                                                lineNumber: 213,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "w-8 shrink-0 text-right text-meta tabular-nums text-stone-muted",
                                                                children: [
                                                                    r.pct,
                                                                    "%"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                                                                lineNumber: 222,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, r.label, true, {
                                                        fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                                                        lineNumber: 207,
                                                        columnNumber: 21
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                                                lineNumber: 205,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, device.name, true, {
                                        fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                                        lineNumber: 200,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                                lineNumber: 198,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-2 text-meta text-stone-muted",
                                children: viz.coverageNote
                            }, void 0, false, {
                                fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                                lineNumber: 231,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                        lineNumber: 195,
                        columnNumber: 9
                    }, this),
                    showClipsLink && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "clips-link-wrap relative z-40 pb-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: `text-left text-body font-medium text-brand underline decoration-brand underline-offset-2 ${clipsExpanded ? "decoration-2" : ""}`,
                                "aria-expanded": clipsExpanded,
                                children: [
                                    "View ",
                                    viz.clipCount,
                                    " clip",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "relative inline",
                                        children: [
                                            "s",
                                            showExportCursors && !hideClipsLinkExportCursor && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$cursor$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExportCursor"], {
                                                variant: "hand",
                                                className: "z-50",
                                                style: {
                                                    left: 5,
                                                    top: 12
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                                                lineNumber: 248,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                                        lineNumber: 245,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                                lineNumber: 237,
                                columnNumber: 13
                            }, this),
                            !hideClipsDrawer && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$viz$2f$clips$2d$drawer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ClipsDrawer"], {
                                clips: evidenceClips,
                                expanded: clipsExpanded,
                                compactLead: clipsDrawerCompact || clipsExpanded
                            }, void 0, false, {
                                fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                                lineNumber: 257,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                        lineNumber: 236,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                lineNumber: 74,
                columnNumber: 7
            }, this),
            !anatomyRegions && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$viz$2f$viz$2d$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VizSourceFooter"], {
                sourceLabel: sourceLabel
            }, void 0, false, {
                fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
                lineNumber: 266,
                columnNumber: 27
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/chat/viz/checkout-dropoff-viz.tsx",
        lineNumber: 68,
        columnNumber: 5
    }, this);
}
_c = CheckoutDropoffVizPanel;
var _c;
__turbopack_context__.k.register(_c, "CheckoutDropoffVizPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/chat/viz/clips-drawer.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ClipsDrawer",
    ()=>ClipsDrawer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$warm$2d$clip$2d$thumb$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/chat/warm-clip-thumb.tsx [app-client] (ecmascript)");
;
;
function TranscriptWithHighlight({ clip }) {
    const idx = clip.transcript.indexOf(clip.highlight);
    if (idx < 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mt-2 text-[13px] leading-[18px] text-stone-ink",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "font-medium text-stone-ink",
                    children: [
                        clip.participant,
                        clip.segment ? `, ${clip.segment}` : ""
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/chat/viz/clips-drawer.tsx",
                    lineNumber: 10,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "mt-1",
                    children: clip.transcript
                }, void 0, false, {
                    fileName: "[project]/src/components/chat/viz/clips-drawer.tsx",
                    lineNumber: 14,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/chat/viz/clips-drawer.tsx",
            lineNumber: 9,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mt-2 text-[13px] leading-[18px] text-stone-ink",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "font-medium text-stone-ink",
                children: [
                    clip.participant,
                    clip.segment ? `, ${clip.segment}` : ""
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/chat/viz/clips-drawer.tsx",
                lineNumber: 21,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-1",
                children: [
                    clip.transcript.slice(0, idx),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "rounded-sm bg-brand/20 px-0.5 text-stone-ink",
                        children: clip.highlight
                    }, void 0, false, {
                        fileName: "[project]/src/components/chat/viz/clips-drawer.tsx",
                        lineNumber: 27,
                        columnNumber: 9
                    }, this),
                    clip.transcript.slice(idx + clip.highlight.length)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/chat/viz/clips-drawer.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/chat/viz/clips-drawer.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
_c = TranscriptWithHighlight;
function ClipsDrawer({ clips, expanded, compactLead }) {
    if (!expanded || clips.length === 0) return null;
    const lead = clips[0];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative mt-2 border-l-2 border-brand pl-3",
        "data-testid": "clips-drawer",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute -left-[9px] -top-3 h-[calc(100%+12px)] w-px bg-brand/30",
                "aria-hidden": true
            }, void 0, false, {
                fileName: "[project]/src/components/chat/viz/clips-drawer.tsx",
                lineNumber: 54,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute -left-[9px] top-0 size-2 rounded-full bg-brand",
                "aria-hidden": true
            }, void 0, false, {
                fileName: "[project]/src/components/chat/viz/clips-drawer.tsx",
                lineNumber: 58,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mb-2 text-meta font-medium text-brand",
                children: "Clips from this answer"
            }, void 0, false, {
                fileName: "[project]/src/components/chat/viz/clips-drawer.tsx",
                lineNumber: 62,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-2",
                children: clips.slice(0, 3).map((c, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$warm$2d$clip$2d$thumb$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WarmClipThumb"], {
                        widthClass: "w-[120px]",
                        selected: i === 0,
                        showTimestamp: c.timestamp,
                        participant: c.participant
                    }, c.id, false, {
                        fileName: "[project]/src/components/chat/viz/clips-drawer.tsx",
                        lineNumber: 65,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/chat/viz/clips-drawer.tsx",
                lineNumber: 63,
                columnNumber: 7
            }, this),
            compactLead && lead ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TranscriptWithHighlight, {
                clip: lead
            }, void 0, false, {
                fileName: "[project]/src/components/chat/viz/clips-drawer.tsx",
                lineNumber: 74,
                columnNumber: 30
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/chat/viz/clips-drawer.tsx",
        lineNumber: 50,
        columnNumber: 5
    }, this);
}
_c1 = ClipsDrawer;
var _c, _c1;
__turbopack_context__.k.register(_c, "TranscriptWithHighlight");
__turbopack_context__.k.register(_c1, "ClipsDrawer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/chat/viz/inline-charts.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InlineBarChart",
    ()=>InlineBarChart,
    "InlineHeatmap",
    ()=>InlineHeatmap,
    "InlineLineChart",
    ()=>InlineLineChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Bar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/Bar.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$BarChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/chart/BarChart.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/CartesianGrid.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Cell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Cell.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$LabelList$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/LabelList.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/ResponsiveContainer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/XAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/YAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$viz$2f$inline$2d$line$2d$chart$2d$svg$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/chat/viz/inline-line-chart-svg.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$chart$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/chart-colors.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$cursor$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/export/export-cursor.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$viz$2f$viz$2d$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/chat/viz/viz-card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$viz$2f$viz$2d$summary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/chat/viz/viz-summary.tsx [app-client] (ecmascript)");
"use client";
;
;
;
;
;
;
;
const axisTick = {
    fontSize: 12,
    lineHeight: 16,
    fill: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$chart$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["chartColors"].stone600,
    fontFamily: "DM Sans, sans-serif"
};
const shortStepLabel = {
    "Cart review": "Cart",
    "Shipping address": "Address",
    "Delivery options": "Delivery",
    Payment: "Payment",
    Confirmation: "Confirm"
};
function InlineBarChart({ viz, sourceLabel, selectedLabel, onSelectLabel, focalLabel = "Shipping address", showExportPointerOnFocal = false, exportFocalValueMedium = false }) {
    const data = viz.items.map((item)=>({
            name: item.label,
            short: shortStepLabel[item.label] ?? item.label,
            value: item.value
        }));
    const chartH = 148;
    const focalIdx = Math.max(0, data.findIndex((d)=>d.name === focalLabel));
    const band = chartH / data.length;
    const focalCenterY = chartH - (focalIdx + 0.5) * band;
    const focalValue = data[focalIdx]?.value ?? 0;
    const barEndLeft = `calc(4rem + (100% - 4rem - 2.5rem) * ${focalValue / 40})`;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$viz$2f$viz$2d$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VizCard"], {
        sourceLabel: sourceLabel,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$viz$2f$viz$2d$summary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VizSummary"], {
                summary: viz.summary,
                summaryEmphasis: viz.summaryEmphasis,
                summaryEmphasisMedium: exportFocalValueMedium
            }, void 0, false, {
                fileName: "[project]/src/components/chat/viz/inline-charts.tsx",
                lineNumber: 73,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-2 text-meta font-normal text-stone-muted",
                children: [
                    viz.title,
                    ", % of participants"
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/chat/viz/inline-charts.tsx",
                lineNumber: 78,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative mt-2 h-[148px] w-full",
                children: [
                    showExportPointerOnFocal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$cursor$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExportCursor"], {
                        variant: "pointer",
                        className: "-translate-x-1/2 -translate-y-1/2",
                        style: {
                            top: focalCenterY,
                            left: barEndLeft
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/components/chat/viz/inline-charts.tsx",
                        lineNumber: 83,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                        width: "100%",
                        height: "100%",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$BarChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BarChart"], {
                            data: data,
                            layout: "vertical",
                            margin: {
                                top: 0,
                                right: 44,
                                left: 0,
                                bottom: 0
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CartesianGrid"], {
                                    stroke: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$chart$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["chartColors"].stone200,
                                    horizontal: false,
                                    strokeDasharray: "3 3"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/chat/viz/inline-charts.tsx",
                                    lineNumber: 95,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["XAxis"], {
                                    type: "number",
                                    tick: axisTick,
                                    axisLine: false,
                                    tickLine: false,
                                    domain: [
                                        0,
                                        40
                                    ]
                                }, void 0, false, {
                                    fileName: "[project]/src/components/chat/viz/inline-charts.tsx",
                                    lineNumber: 100,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["YAxis"], {
                                    type: "category",
                                    dataKey: "short",
                                    width: 64,
                                    tick: axisTick,
                                    axisLine: false,
                                    tickLine: false
                                }, void 0, false, {
                                    fileName: "[project]/src/components/chat/viz/inline-charts.tsx",
                                    lineNumber: 107,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Bar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Bar"], {
                                    dataKey: "value",
                                    radius: [
                                        0,
                                        4,
                                        4,
                                        0
                                    ],
                                    barSize: 12,
                                    cursor: "pointer",
                                    onClick: (d)=>onSelectLabel?.(String(d.name)),
                                    children: [
                                        data.map((row, i)=>{
                                            const isFocal = row.name === focalLabel;
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Cell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Cell"], {
                                                fill: isFocal ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$chart$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["chartColors"].pink : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$chart$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["stoneBarFill"])(i, false),
                                                stroke: isFocal ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$chart$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["chartColors"].pink : "none",
                                                strokeWidth: isFocal ? 1 : 0
                                            }, row.name, false, {
                                                fileName: "[project]/src/components/chat/viz/inline-charts.tsx",
                                                lineNumber: 125,
                                                columnNumber: 19
                                            }, this);
                                        }),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$LabelList$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LabelList"], {
                                            dataKey: "value",
                                            position: "right",
                                            offset: 8,
                                            content: ({ x, y, width, height, value, index })=>{
                                                const row = data[index ?? 0];
                                                const isFocal = exportFocalValueMedium && row?.name === focalLabel;
                                                const vx = (x ?? 0) + (width ?? 0) + 8;
                                                const vy = (y ?? 0) + (height ?? 0) / 2;
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                                                    x: vx,
                                                    y: vy,
                                                    dy: 4,
                                                    textAnchor: "start",
                                                    fill: isFocal ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$chart$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["chartColors"].pink : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$chart$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["chartColors"].stone600,
                                                    fontSize: 12,
                                                    fontFamily: "DM Sans, sans-serif",
                                                    fontWeight: isFocal ? 500 : 400,
                                                    children: [
                                                        value,
                                                        "%"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/chat/viz/inline-charts.tsx",
                                                    lineNumber: 144,
                                                    columnNumber: 21
                                                }, this);
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/chat/viz/inline-charts.tsx",
                                            lineNumber: 133,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/chat/viz/inline-charts.tsx",
                                    lineNumber: 115,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/chat/viz/inline-charts.tsx",
                            lineNumber: 90,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/chat/viz/inline-charts.tsx",
                        lineNumber: 89,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/chat/viz/inline-charts.tsx",
                lineNumber: 81,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/chat/viz/inline-charts.tsx",
        lineNumber: 72,
        columnNumber: 5
    }, this);
}
_c = InlineBarChart;
function InlineLineChart({ viz, sourceLabel }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$viz$2f$viz$2d$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VizCard"], {
        sourceLabel: sourceLabel,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$viz$2f$viz$2d$summary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VizSummary"], {
                summary: viz.summary,
                summaryEmphasis: viz.summaryEmphasis
            }, void 0, false, {
                fileName: "[project]/src/components/chat/viz/inline-charts.tsx",
                lineNumber: 176,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-2 text-meta font-normal text-stone-muted",
                children: viz.title
            }, void 0, false, {
                fileName: "[project]/src/components/chat/viz/inline-charts.tsx",
                lineNumber: 177,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-2 h-[156px] w-full",
                "data-testid": "inline-line-chart",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$viz$2f$inline$2d$line$2d$chart$2d$svg$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["InlineLineChartSvg"], {
                    points: viz.points
                }, void 0, false, {
                    fileName: "[project]/src/components/chat/viz/inline-charts.tsx",
                    lineNumber: 179,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/chat/viz/inline-charts.tsx",
                lineNumber: 178,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/chat/viz/inline-charts.tsx",
        lineNumber: 175,
        columnNumber: 5
    }, this);
}
_c1 = InlineLineChart;
function InlineHeatmap({ viz, sourceLabel, selectedCell, onSelectCell }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$viz$2f$viz$2d$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VizCard"], {
        sourceLabel: sourceLabel,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$viz$2f$viz$2d$summary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VizSummary"], {
                summary: viz.summary,
                summaryEmphasis: viz.summaryEmphasis
            }, void 0, false, {
                fileName: "[project]/src/components/chat/viz/inline-charts.tsx",
                lineNumber: 200,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-2 text-meta font-normal text-stone-muted",
                children: viz.title
            }, void 0, false, {
                fileName: "[project]/src/components/chat/viz/inline-charts.tsx",
                lineNumber: 201,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-2 overflow-x-auto",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    className: "w-full min-w-[240px] border-collapse",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-1 text-left text-meta font-medium text-stone-muted"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/chat/viz/inline-charts.tsx",
                                        lineNumber: 206,
                                        columnNumber: 15
                                    }, this),
                                    viz.cols.map((col)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "p-1 text-center text-meta font-medium text-stone-muted",
                                            children: col
                                        }, col, false, {
                                            fileName: "[project]/src/components/chat/viz/inline-charts.tsx",
                                            lineNumber: 208,
                                            columnNumber: 17
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/chat/viz/inline-charts.tsx",
                                lineNumber: 205,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/chat/viz/inline-charts.tsx",
                            lineNumber: 204,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            children: viz.rows.map((row, ri)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-1 text-meta font-medium text-stone-ink",
                                            children: row
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/chat/viz/inline-charts.tsx",
                                            lineNumber: 220,
                                            columnNumber: 17
                                        }, this),
                                        viz.cols.map((col, ci)=>{
                                            const v = viz.values[ri]?.[ci] ?? 0;
                                            const selected = selectedCell?.row === ri && selectedCell?.col === ci;
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "p-1",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>onSelectCell?.(ri, ci),
                                                    className: `flex h-8 w-full items-center justify-center rounded-md border text-mono-ui text-stone-ink ${selected ? "border-brand bg-brand-soft" : "border-stone-border"}`,
                                                    style: {
                                                        backgroundColor: selected ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$chart$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["chartColors"].pinkSoft : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$chart$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["heatCellColor"])(v, false)
                                                    },
                                                    children: [
                                                        Math.round(v * 100),
                                                        "%"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/chat/viz/inline-charts.tsx",
                                                    lineNumber: 227,
                                                    columnNumber: 23
                                                }, this)
                                            }, col, false, {
                                                fileName: "[project]/src/components/chat/viz/inline-charts.tsx",
                                                lineNumber: 226,
                                                columnNumber: 21
                                            }, this);
                                        })
                                    ]
                                }, row, true, {
                                    fileName: "[project]/src/components/chat/viz/inline-charts.tsx",
                                    lineNumber: 219,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/components/chat/viz/inline-charts.tsx",
                            lineNumber: 217,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/chat/viz/inline-charts.tsx",
                    lineNumber: 203,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/chat/viz/inline-charts.tsx",
                lineNumber: 202,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/chat/viz/inline-charts.tsx",
        lineNumber: 199,
        columnNumber: 5
    }, this);
}
_c2 = InlineHeatmap;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "InlineBarChart");
__turbopack_context__.k.register(_c1, "InlineLineChart");
__turbopack_context__.k.register(_c2, "InlineHeatmap");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/chat/viz/inline-line-chart-svg.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InlineLineChartSvg",
    ()=>InlineLineChartSvg
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$scale$2f$src$2f$linear$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__scaleLinear$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-scale/src/linear.js [app-client] (ecmascript) <export default as scaleLinear>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$scale$2f$src$2f$band$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__point__as__scalePoint$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-scale/src/band.js [app-client] (ecmascript) <export point as scalePoint>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$chart$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/chart-colors.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const axisTick = {
    fontSize: 12,
    lineHeight: 16,
    fill: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$chart$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["chartColors"].stone600,
    fontFamily: "DM Sans, sans-serif"
};
const W = 320;
const H = 140;
const TICK_X = 36;
const M = {
    top: 18,
    right: 16,
    bottom: 48,
    left: 88
};
function InlineLineChartSvg({ points }) {
    _s();
    const plot = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "InlineLineChartSvg.useMemo[plot]": ()=>{
            const plotW = W - M.left - M.right;
            const plotH = H - M.top - M.bottom;
            const x = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$scale$2f$src$2f$band$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__point__as__scalePoint$3e$__["scalePoint"])().domain(points.map({
                "InlineLineChartSvg.useMemo[plot].x": (p)=>p.label
            }["InlineLineChartSvg.useMemo[plot].x"])).range([
                0,
                plotW
            ]);
            const y = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$scale$2f$src$2f$linear$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__scaleLinear$3e$__["scaleLinear"])().domain([
                2,
                4
            ]).range([
                plotH,
                0
            ]);
            const coords = points.map({
                "InlineLineChartSvg.useMemo[plot].coords": (p)=>({
                        label: p.label,
                        value: p.value,
                        cx: M.left + (x(p.label) ?? 0),
                        cy: M.top + y(p.value),
                        tx: M.left + (x(p.label) ?? 0)
                    })
            }["InlineLineChartSvg.useMemo[plot].coords"]);
            const lineD = coords.map({
                "InlineLineChartSvg.useMemo[plot].lineD": (c, i)=>`${i === 0 ? "M" : "L"} ${c.cx} ${c.cy}`
            }["InlineLineChartSvg.useMemo[plot].lineD"]).join(" ");
            const yTicks = [
                2,
                3,
                4
            ];
            return {
                coords,
                lineD,
                yTicks,
                y,
                plotH
            };
        }
    }["InlineLineChartSvg.useMemo[plot]"], [
        points
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "100%",
        height: H,
        viewBox: `0 0 ${W} ${H}`,
        className: "block",
        "data-testid": "inline-line-chart-svg",
        "aria-hidden": true,
        children: [
            plot.yTicks.map((t)=>{
                const yPos = M.top + plot.y(t);
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                            x1: M.left,
                            y1: yPos,
                            x2: W - M.right,
                            y2: yPos,
                            stroke: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$chart$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["chartColors"].stone200,
                            strokeDasharray: "3 3"
                        }, void 0, false, {
                            fileName: "[project]/src/components/chat/viz/inline-line-chart-svg.tsx",
                            lineNumber: 62,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                            x: TICK_X,
                            y: yPos,
                            dominantBaseline: "middle",
                            textAnchor: "end",
                            fontSize: axisTick.fontSize,
                            fill: axisTick.fill,
                            fontFamily: axisTick.fontFamily,
                            "data-testid": `line-chart-y-tick-${t}`,
                            children: t.toFixed(1)
                        }, void 0, false, {
                            fileName: "[project]/src/components/chat/viz/inline-line-chart-svg.tsx",
                            lineNumber: 70,
                            columnNumber: 13
                        }, this)
                    ]
                }, t, true, {
                    fileName: "[project]/src/components/chat/viz/inline-line-chart-svg.tsx",
                    lineNumber: 61,
                    columnNumber: 11
                }, this);
            }),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: M.left,
                y1: H - M.bottom,
                x2: W - M.right,
                y2: H - M.bottom,
                stroke: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$chart$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["chartColors"].stone200
            }, void 0, false, {
                fileName: "[project]/src/components/chat/viz/inline-line-chart-svg.tsx",
                lineNumber: 85,
                columnNumber: 7
            }, this),
            plot.coords.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                    x: c.tx,
                    y: H - 8,
                    textAnchor: "middle",
                    fontSize: axisTick.fontSize,
                    fill: axisTick.fill,
                    fontFamily: axisTick.fontFamily,
                    "data-testid": `line-chart-x-label-${c.label}`,
                    children: c.label
                }, c.label, false, {
                    fileName: "[project]/src/components/chat/viz/inline-line-chart-svg.tsx",
                    lineNumber: 93,
                    columnNumber: 9
                }, this)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: plot.lineD,
                fill: "none",
                stroke: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$chart$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["chartColors"].stone600,
                strokeWidth: 2
            }, void 0, false, {
                fileName: "[project]/src/components/chat/viz/inline-line-chart-svg.tsx",
                lineNumber: 106,
                columnNumber: 7
            }, this),
            plot.coords.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                            cx: c.cx,
                            cy: c.cy,
                            r: 4,
                            fill: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$chart$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["chartColors"].pink,
                            "data-testid": `line-chart-dot-${c.label}`
                        }, void 0, false, {
                            fileName: "[project]/src/components/chat/viz/inline-line-chart-svg.tsx",
                            lineNumber: 114,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                            x: c.cx + 10,
                            y: c.cy - 12,
                            textAnchor: "start",
                            fontSize: 12,
                            fill: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$chart$2d$colors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["chartColors"].stone600,
                            fontFamily: axisTick.fontFamily,
                            "data-testid": `line-chart-value-${c.label}`,
                            children: c.value.toFixed(1)
                        }, void 0, false, {
                            fileName: "[project]/src/components/chat/viz/inline-line-chart-svg.tsx",
                            lineNumber: 121,
                            columnNumber: 11
                        }, this)
                    ]
                }, `dot-${c.label}`, true, {
                    fileName: "[project]/src/components/chat/viz/inline-line-chart-svg.tsx",
                    lineNumber: 113,
                    columnNumber: 9
                }, this))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/chat/viz/inline-line-chart-svg.tsx",
        lineNumber: 50,
        columnNumber: 5
    }, this);
}
_s(InlineLineChartSvg, "Xfh5KxNWlU2sQnG4BD+j3ESbP/s=");
_c = InlineLineChartSvg;
var _c;
__turbopack_context__.k.register(_c, "InlineLineChartSvg");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/chat/viz/viz-card.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VizCard",
    ()=>VizCard,
    "VizSourceFooter",
    ()=>VizSourceFooter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/maximize-2.mjs [app-client] (ecmascript) <export default as Maximize2>");
;
;
function VizSourceFooter({ sourceLabel }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center justify-between gap-2 border-t border-stone-border px-3 py-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "min-w-0 break-words text-meta leading-snug text-stone-muted",
                children: sourceLabel
            }, void 0, false, {
                fileName: "[project]/src/components/chat/viz/viz-card.tsx",
                lineNumber: 15,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                className: "flex size-7 shrink-0 items-center justify-center rounded-md text-stone-muted",
                "aria-label": "Expand chart",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__["Maximize2"], {
                    className: "size-3.5",
                    strokeWidth: 2
                }, void 0, false, {
                    fileName: "[project]/src/components/chat/viz/viz-card.tsx",
                    lineNumber: 23,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/chat/viz/viz-card.tsx",
                lineNumber: 18,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/chat/viz/viz-card.tsx",
        lineNumber: 12,
        columnNumber: 5
    }, this);
}
_c = VizSourceFooter;
function VizCard({ sourceLabel = "", children, hideFooter = false, className = "" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `overflow-hidden rounded-[10px] border border-stone-border bg-stone-surface ${className}`,
        "data-testid": "viz-card",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-3",
                children: children
            }, void 0, false, {
                fileName: "[project]/src/components/chat/viz/viz-card.tsx",
                lineNumber: 40,
                columnNumber: 7
            }, this),
            !hideFooter && sourceLabel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(VizSourceFooter, {
                sourceLabel: sourceLabel
            }, void 0, false, {
                fileName: "[project]/src/components/chat/viz/viz-card.tsx",
                lineNumber: 41,
                columnNumber: 38
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/chat/viz/viz-card.tsx",
        lineNumber: 36,
        columnNumber: 5
    }, this);
}
_c1 = VizCard;
var _c, _c1;
__turbopack_context__.k.register(_c, "VizSourceFooter");
__turbopack_context__.k.register(_c1, "VizCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/chat/viz/viz-summary.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VizSummary",
    ()=>VizSummary
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$answer$2d$summary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/chat/answer-summary.tsx [app-client] (ecmascript)");
;
;
function VizSummary({ summary, summaryEmphasis, summaryEmphasisMedium = false }) {
    if (summaryEmphasis) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$answer$2d$summary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnswerSummary"], {
            text: summary,
            emphasis: summaryEmphasis,
            emphasisMedium: summaryEmphasisMedium
        }, void 0, false, {
            fileName: "[project]/src/components/chat/viz/viz-summary.tsx",
            lineNumber: 16,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        className: "text-body font-normal text-stone-ink",
        children: summary
    }, void 0, false, {
        fileName: "[project]/src/components/chat/viz/viz-summary.tsx",
        lineNumber: 23,
        columnNumber: 10
    }, this);
}
_c = VizSummary;
var _c;
__turbopack_context__.k.register(_c, "VizSummary");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/chat/warm-clip-thumb.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WarmClipThumb",
    ()=>WarmClipThumb
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$image$2d$component$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__Image__as__default$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/image-component.js [app-client] (ecmascript) <export Image as default>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$clip$2d$thumb$2d$photos$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/clip-thumb-photos.ts [app-client] (ecmascript)");
;
;
;
function WarmClipThumb({ widthClass = "w-[96px]", selected = false, showTimestamp, participant }) {
    const src = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$clip$2d$thumb$2d$photos$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clipPhotoForParticipant"])(participant);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `${widthClass} shrink-0`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `relative aspect-video overflow-hidden rounded-[8px] bg-black leading-[0] ${selected ? "shadow-[inset_0_0_0_2px_#B43F7F66]" : ""}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$image$2d$component$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__Image__as__default$3e$__["default"], {
                    src: src,
                    alt: "",
                    fill: true,
                    className: "!absolute inset-0 object-cover object-center",
                    sizes: "96px"
                }, void 0, false, {
                    fileName: "[project]/src/components/chat/warm-clip-thumb.tsx",
                    lineNumber: 26,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/chat/warm-clip-thumb.tsx",
                lineNumber: 21,
                columnNumber: 7
            }, this),
            showTimestamp ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "mt-1 block text-[11px] leading-none text-stone-muted",
                children: showTimestamp
            }, void 0, false, {
                fileName: "[project]/src/components/chat/warm-clip-thumb.tsx",
                lineNumber: 35,
                columnNumber: 9
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/chat/warm-clip-thumb.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
_c = WarmClipThumb;
var _c;
__turbopack_context__.k.register(_c, "WarmClipThumb");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/export/export-anatomy.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ExportAnatomy",
    ()=>ExportAnatomy
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$chat$2d$thread$2d$interactive$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/chat/chat-thread-interactive.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$chat$2d$threads$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/chat-threads.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$canvas$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/export/export-canvas.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$section$2d$chat$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/export/export-section-chat.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$section$2d$scale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/export/export-section-scale.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
const LABELS = [
    {
        n: "1",
        title: "Sources"
    },
    {
        n: "2",
        title: "Summary"
    },
    {
        n: "3",
        title: "Query chart"
    },
    {
        n: "4",
        title: "Timestamped clips"
    },
    {
        n: "5",
        title: "Follow-ups"
    }
];
const HAIR = "#C9C6C2";
const S = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$section$2d$scale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EXPORT_UI_GROUP_SCALE"];
/** 40px in export PNG → 20 CSS screen px → design coords before group scale. */ const CIRCLE_D = 20 / S;
const GAP_MARKER_LABEL = 24 / S;
const GAP_LABEL_LEADER = 24 / S;
const LABEL_CARD_GAP = 24 / S;
const DOT_R = 5 / S;
const HAIR_W = 1;
const MIN_LABEL_ROW = 24 / S;
const MARKER_COL_X = 52 / S + CIRCLE_D / 2;
const CAPTION = {
    fontFamily: '"ABC Areal", "Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$section$2d$scale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EXPORT_ANNOTATION_FONT_PX"],
    fontWeight: 500,
    lineHeight: 1.2,
    color: "#727272",
    letterSpacing: 0,
    whiteSpace: "nowrap"
};
function spreadLabelYs(targetYs) {
    const ys = [
        ...targetYs
    ];
    for(let i = 1; i < ys.length; i++){
        if (ys[i] - ys[i - 1] < MIN_LABEL_ROW) {
            ys[i] = ys[i - 1] + MIN_LABEL_ROW;
        }
    }
    for(let i = ys.length - 2; i >= 0; i--){
        if (ys[i + 1] - ys[i] < MIN_LABEL_ROW) {
            ys[i] = ys[i + 1] - MIN_LABEL_ROW;
        }
    }
    return ys;
}
function ExportAnatomy({ markerVariant }) {
    _s();
    const rootRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const panelRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const labelRefs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])([]);
    const [rows, setRows] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(LABELS.map({
        "ExportAnatomy.useState": (_, i)=>({
                targetY: 130 + i * 88,
                labelY: 130 + i * 88,
                dotX: 400,
                labelWidth: 120
            })
    }["ExportAnatomy.useState"]));
    const [cardLeft, setCardLeft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(280 / S);
    const [groupW, setGroupW] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(700 / S);
    const [centerShift, setCenterShift] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const labelLeft = MARKER_COL_X + CIRCLE_D / 2 + GAP_MARKER_LABEL;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"])({
        "ExportAnatomy.useLayoutEffect": ()=>{
            const root = rootRef.current;
            const panel = panelRef.current;
            if (!root || !panel) return;
            const measure = {
                "ExportAnatomy.useLayoutEffect.measure": ()=>{
                    const rootRect = root.getBoundingClientRect();
                    const layoutScale = root.offsetHeight > 0 ? rootRect.height / root.offsetHeight : 1;
                    const targetYs = [];
                    const dotXs = [];
                    for(let i = 0; i < LABELS.length; i++){
                        const l = LABELS[i];
                        const region = panel.querySelector(`[data-anatomy-region="${l.n}"]`);
                        if (!region) {
                            targetYs.push(130 + i * 88);
                            dotXs.push(400);
                            continue;
                        }
                        const rect = region.getBoundingClientRect();
                        targetYs.push((rect.top + rect.height / 2 - rootRect.top) / layoutScale);
                        dotXs.push((rect.left + 10 - rootRect.left) / layoutScale);
                    }
                    const labelYs = spreadLabelYs(targetYs);
                    const widths = LABELS.map({
                        "ExportAnatomy.useLayoutEffect.measure.widths": (_, i)=>{
                            const el = labelRefs.current[i];
                            return el ? el.getBoundingClientRect().width / layoutScale : 120;
                        }
                    }["ExportAnatomy.useLayoutEffect.measure.widths"]);
                    const maxLabelW = Math.max(...widths, 140 / S);
                    const nextCardLeft = labelLeft + maxLabelW + LABEL_CARD_GAP;
                    const nextGroupW = nextCardLeft + __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$section$2d$chat$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EXPORT_SECTION_CHAT_W"];
                    const next = LABELS.map({
                        "ExportAnatomy.useLayoutEffect.measure.next": (_, i)=>({
                                targetY: targetYs[i],
                                labelY: labelYs[i],
                                dotX: dotXs[i],
                                labelWidth: widths[i]
                            })
                    }["ExportAnatomy.useLayoutEffect.measure.next"]);
                    const leftEdge = MARKER_COL_X - CIRCLE_D / 2;
                    const rightEdge = nextCardLeft + __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$section$2d$chat$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EXPORT_SECTION_CHAT_W"];
                    let shift = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$section$2d$scale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EXPORT_DESIGN_W"] / 2 - (leftEdge + rightEdge) / 2;
                    if (markerVariant === "plain") {
                        shift -= 6 / (2 * S);
                    }
                    setCardLeft(nextCardLeft);
                    setGroupW(nextGroupW);
                    setCenterShift(shift);
                    setRows(next);
                }
            }["ExportAnatomy.useLayoutEffect.measure"];
            const scheduleMeasure = {
                "ExportAnatomy.useLayoutEffect.scheduleMeasure": ()=>{
                    requestAnimationFrame({
                        "ExportAnatomy.useLayoutEffect.scheduleMeasure": ()=>{
                            requestAnimationFrame(measure);
                        }
                    }["ExportAnatomy.useLayoutEffect.scheduleMeasure"]);
                }
            }["ExportAnatomy.useLayoutEffect.scheduleMeasure"];
            scheduleMeasure();
            const ro = new ResizeObserver(scheduleMeasure);
            ro.observe(root);
            ro.observe(panel);
            return ({
                "ExportAnatomy.useLayoutEffect": ()=>ro.disconnect()
            })["ExportAnatomy.useLayoutEffect"];
        }
    }["ExportAnatomy.useLayoutEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex h-full w-full overflow-visible",
        style: {
            background: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$canvas$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EXPORT_BG"],
            width: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$section$2d$scale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EXPORT_DESIGN_W"]
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            ref: rootRef,
            className: "relative overflow-visible",
            "data-export-anatomy": true,
            "data-anatomy-variant": markerVariant,
            style: {
                width: groupW,
                height: "100%",
                transform: `translateX(${centerShift}px)`
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    className: "pointer-events-none absolute inset-0 h-full w-full overflow-visible",
                    "aria-hidden": true,
                    children: LABELS.map((l, i)=>{
                        const { targetY, labelY, dotX, labelWidth } = rows[i];
                        const leaderStart = labelLeft + labelWidth + GAP_LABEL_LEADER;
                        const endX = dotX - DOT_R;
                        const elbowX = Math.min(leaderStart + 28 / S, endX - 12 / S);
                        const path = Math.abs(labelY - targetY) < 0.5 ? `M ${leaderStart} ${targetY} H ${endX}` : `M ${leaderStart} ${labelY} H ${elbowX} V ${targetY} H ${endX}`;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    "data-anatomy-line": l.n,
                                    d: path,
                                    fill: "none",
                                    stroke: HAIR,
                                    strokeWidth: HAIR_W
                                }, void 0, false, {
                                    fileName: "[project]/src/components/export/export-anatomy.tsx",
                                    lineNumber: 201,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                    "data-anatomy-dot": l.n,
                                    cx: dotX,
                                    cy: targetY,
                                    r: DOT_R,
                                    fill: HAIR
                                }, void 0, false, {
                                    fileName: "[project]/src/components/export/export-anatomy.tsx",
                                    lineNumber: 208,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, l.n, true, {
                            fileName: "[project]/src/components/export/export-anatomy.tsx",
                            lineNumber: 200,
                            columnNumber: 15
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/src/components/export/export-anatomy.tsx",
                    lineNumber: 183,
                    columnNumber: 9
                }, this),
                LABELS.map((l, i)=>{
                    const { targetY, labelY } = rows[i];
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            markerVariant === "circled" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                "data-testid": `anatomy-marker-${l.n}`,
                                className: "absolute flex items-center justify-center rounded-full border border-[#C9C6C2] bg-transparent",
                                style: {
                                    width: CIRCLE_D,
                                    height: CIRCLE_D,
                                    left: MARKER_COL_X - CIRCLE_D / 2,
                                    top: targetY,
                                    transform: "translateY(-50%)",
                                    fontFamily: CAPTION.fontFamily,
                                    fontSize: 11 / S,
                                    fontWeight: 500,
                                    lineHeight: 1,
                                    color: "#727272",
                                    zIndex: 20 + i
                                },
                                children: l.n
                            }, void 0, false, {
                                fileName: "[project]/src/components/export/export-anatomy.tsx",
                                lineNumber: 225,
                                columnNumber: 17
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                "data-testid": `anatomy-marker-${l.n}`,
                                className: "absolute text-right",
                                style: {
                                    width: CIRCLE_D,
                                    left: MARKER_COL_X - CIRCLE_D / 2,
                                    top: targetY,
                                    transform: "translateY(-50%)",
                                    fontFamily: CAPTION.fontFamily,
                                    fontSize: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$section$2d$scale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EXPORT_ANNOTATION_FONT_PX"],
                                    fontWeight: 500,
                                    lineHeight: 1,
                                    color: "#727272",
                                    zIndex: 20 + i
                                },
                                children: l.n
                            }, void 0, false, {
                                fileName: "[project]/src/components/export/export-anatomy.tsx",
                                lineNumber: 245,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                "data-testid": `anatomy-legend-${l.n}`,
                                className: "absolute flex -translate-y-1/2 items-center",
                                style: {
                                    left: labelLeft,
                                    top: labelY,
                                    zIndex: 30 + i
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    ref: (el)=>{
                                        labelRefs.current[i] = el;
                                    },
                                    style: CAPTION,
                                    children: l.title
                                }, void 0, false, {
                                    fileName: "[project]/src/components/export/export-anatomy.tsx",
                                    lineNumber: 273,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/export/export-anatomy.tsx",
                                lineNumber: 264,
                                columnNumber: 15
                            }, this)
                        ]
                    }, `marker-${l.n}`, true, {
                        fileName: "[project]/src/components/export/export-anatomy.tsx",
                        lineNumber: 223,
                        columnNumber: 13
                    }, this);
                }),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "absolute overflow-visible",
                    style: {
                        left: cardLeft,
                        top: "50%",
                        transform: "translateY(-50%)"
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: panelRef,
                        className: "relative",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$section$2d$chat$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExportSectionChat"], {
                            width: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$section$2d$chat$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EXPORT_SECTION_CHAT_W"],
                            expandContent: true,
                            bottomFade: false,
                            hideInput: true,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$chat$2d$thread$2d$interactive$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ChatThreadInteractive"], {
                                thread: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$chat$2d$threads$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["chatThreads"]["1"],
                                showClipsLink: false,
                                showExportCursors: false,
                                hideDeviceBlock: true,
                                hideAssistantLead: true,
                                hideFollowUpText: true,
                                funnelTooltipAbove: true,
                                queryPreserveFullSummary: true,
                                evidenceClipsCompact: true,
                                anatomyRegions: true
                            }, void 0, false, {
                                fileName: "[project]/src/components/export/export-anatomy.tsx",
                                lineNumber: 301,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/export/export-anatomy.tsx",
                            lineNumber: 295,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/export/export-anatomy.tsx",
                        lineNumber: 294,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/export/export-anatomy.tsx",
                    lineNumber: 286,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/export/export-anatomy.tsx",
            lineNumber: 172,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/export/export-anatomy.tsx",
        lineNumber: 168,
        columnNumber: 5
    }, this);
}
_s(ExportAnatomy, "WiMzxxbU2jNzxAd3kU+I/NY90jg=");
_c = ExportAnatomy;
var _c;
__turbopack_context__.k.register(_c, "ExportAnatomy");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
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
"[project]/src/components/export/export-cursor.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EXPORT_CURSOR_H",
    ()=>EXPORT_CURSOR_H,
    "EXPORT_CURSOR_W",
    ()=>EXPORT_CURSOR_W,
    "ExportCursor",
    ()=>ExportCursor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$mac$2d$hand$2d$pointing$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/export/mac-hand-pointing.tsx [app-client] (ecmascript)");
;
;
const EXPORT_CURSOR_W = 28;
const EXPORT_CURSOR_H = 34;
function ExportCursor({ variant = "pointer", className = "", style }) {
    if (variant === "hand") {
        const hotspotX = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$mac$2d$hand$2d$pointing$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MAC_HAND_HOTSPOT"].x * (EXPORT_CURSOR_W / 32);
        const hotspotY = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$mac$2d$hand$2d$pointing$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MAC_HAND_HOTSPOT"].y * (EXPORT_CURSOR_H / 32);
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `pointer-events-none absolute z-[60] ${className}`,
            style: {
                width: EXPORT_CURSOR_W,
                height: EXPORT_CURSOR_H,
                transform: `translate(-${hotspotX}px, -${hotspotY}px)`,
                ...style
            },
            "aria-hidden": true,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$mac$2d$hand$2d$pointing$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MacHandPointing"], {
                height: EXPORT_CURSOR_H,
                width: EXPORT_CURSOR_W
            }, void 0, false, {
                fileName: "[project]/src/components/export/export-cursor.tsx",
                lineNumber: 36,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/export/export-cursor.tsx",
            lineNumber: 26,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `pointer-events-none absolute z-[60] ${className}`,
        style: style,
        "aria-hidden": true,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            width: EXPORT_CURSOR_W,
            height: EXPORT_CURSOR_H,
            viewBox: "0 0 28 34",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg",
            style: {
                filter: "drop-shadow(0 1px 1.5px rgba(0,0,0,0.4))"
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M4 2.5L4 28.5L10.2 22.8L14.5 31.5L18.2 29.8L13.9 21.2L22 21.2L4 2.5Z",
                fill: "#FFFFFF",
                stroke: "#1C1917",
                strokeWidth: "1.25",
                strokeLinejoin: "round"
            }, void 0, false, {
                fileName: "[project]/src/components/export/export-cursor.tsx",
                lineNumber: 58,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/export/export-cursor.tsx",
            lineNumber: 50,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/export/export-cursor.tsx",
        lineNumber: 45,
        columnNumber: 5
    }, this);
}
_c = ExportCursor;
var _c;
__turbopack_context__.k.register(_c, "ExportCursor");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/export/export-hero-shared.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HERO_TYPE_VARS",
    ()=>HERO_TYPE_VARS
]);
const HERO_TYPE_VARS = {
    ["--text-body-size"]: "16px",
    ["--text-body-leading"]: "24px",
    ["--text-meta-size"]: "14px",
    ["--text-meta-leading"]: "20px",
    ["--text-mono-size"]: "15px",
    ["--text-mono-leading"]: "22px"
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/export/export-section-chat.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EXPORT_SECTION_CHAT_W",
    ()=>EXPORT_SECTION_CHAT_W,
    "ExportSectionChat",
    ()=>ExportSectionChat
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$study$2d$chat$2d$shell$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/chat/study-chat-shell.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$canvas$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/export/export-canvas.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$hero$2d$shared$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/export/export-hero-shared.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$section$2d$scale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/export/export-section-scale.ts [app-client] (ecmascript)");
;
;
;
;
;
const EXPORT_SECTION_CHAT_W = 400;
function ExportSectionChat({ children, width = EXPORT_SECTION_CHAT_W, height = 680, hideInput = true, bottomFade = true, expandContent = false, compactChrome = false, contentOffsetY = 0, flatScale = false, exportDocked = false, exportPopup = false }) {
    const panelScale = flatScale ? 1 : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$section$2d$scale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EXPORT_PANEL_SCALE"];
    const fadeBottom = hideInput ? 0 : 56;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$hero$2d$shared$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HERO_TYPE_VARS"],
        className: `relative ${exportDocked ? "h-full w-full" : "overflow-visible"}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$canvas$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExportScale"], {
                scale: panelScale,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$chat$2f$study$2d$chat$2d$shell$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StudyChatShell"], {
                    embedded: true,
                    embeddedWidth: width,
                    embeddedHeight: expandContent ? undefined : height,
                    expandContent: expandContent,
                    variant: "empty",
                    exportFrame: true,
                    exportDocked: exportDocked,
                    exportPopup: exportPopup,
                    heroTypography: true,
                    showMinimize: false,
                    hideInput: hideInput,
                    compactChrome: compactChrome,
                    contentOffsetY: contentOffsetY,
                    className: exportDocked ? "h-full w-full" : "",
                    children: children
                }, void 0, false, {
                    fileName: "[project]/src/components/export/export-section-chat.tsx",
                    lineNumber: 46,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/export/export-section-chat.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, this),
            bottomFade && !expandContent ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "pointer-events-none absolute rounded-b-3xl bg-gradient-to-t from-stone-surface via-stone-surface/95 to-transparent",
                style: {
                    bottom: fadeBottom,
                    left: 0,
                    width: width * panelScale,
                    height: 48 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$export$2f$export$2d$section$2d$scale$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EXPORT_PANEL_SCALE"]
                },
                "aria-hidden": true
            }, void 0, false, {
                fileName: "[project]/src/components/export/export-section-chat.tsx",
                lineNumber: 66,
                columnNumber: 9
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/export/export-section-chat.tsx",
        lineNumber: 41,
        columnNumber: 5
    }, this);
}
_c = ExportSectionChat;
var _c;
__turbopack_context__.k.register(_c, "ExportSectionChat");
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
"[project]/src/components/export/mac-hand-pointing.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** macOS handpointing cursor paths (from daviddarnes/mac-cursors), scaled for export. */ __turbopack_context__.s([
    "MAC_HAND_HOTSPOT",
    ()=>MAC_HAND_HOTSPOT,
    "MacHandPointing",
    ()=>MacHandPointing
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
function MacHandPointing({ height = 22, width, className, style }) {
    const w = width ?? height;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: w,
        height: height,
        viewBox: "0 0 32 32",
        preserveAspectRatio: "xMidYMid meet",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
        className: className,
        shapeRendering: "geometricPrecision",
        style: {
            filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.28))",
            ...style
        },
        "aria-hidden": true,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
            fillRule: "evenodd",
            transform: "translate(5 4) scale(1.12)",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: "m3.8852309 13.5522788c.15029277.1354048.25406355.2326609.57471053.5372549.31406586.2983172.46594413.439273.60482646.5572091.05791893.0487853.10729946.1792495.12686364.3731628.01609788.1595565.01049553.3375341-.0090192.5090254-.00674888.0593077-.01325791.1020883-.01698742.1224696-.04186639.2287942.13249226.4401222.36507344.4424801.20929712.0021219.37056581.00472.79741331.0123273.10679864.0019014.10679864.0019014.21395196.0037648 1.16029156.0199598 1.75290683.01448 2.1782236-.039003.45462139-.05716.92282087-.6061887 1.32754658-1.2951218.3429437.6096032.818651 1.2048784 1.2990136 1.282277.1525992.0243739.3372104.0319365.5511764.0270146.1595258-.0036697.328349-.0141847.4987188-.0294071.1284742-.0114791.2308379-.0230173.2919821-.0309462.2259121-.0292954.3737346-.2515956.31337-.4712558-.0130388-.0474468-.0339905-.1345046-.0551176-.2441066-.0244927-.1270617-.0421932-.2511642-.0502379-.3642189-.0051002-.0716765-.0061057-.1365707-.0028638-.1926702.0056365-.097781.007395-.1525378.0101327-.2790463.0010457-.0470941.0010457-.0470941.0024433-.0883088.0052898-.134881.0234093-.2629524.0820463-.5422232.0251901-.1212103.1472903-.3531692.3395862-.6402332.0572734-.0854992.1198813-.1747825.1869659-.2669588.127207-.1747861.2641214-.3514011.4010853-.5204043.0820457-.1012383.1454717-.1769623.1807968-.2180763.2962199-.424403.6120842-1.1191696.7281396-1.5253635.111416-.3904017.2005405-1.10937558.2553074-1.81604479.0300143-.40088807.0411211-.72405394.0411211-1.23097561.0000507-.08891816.0000507-.08891816.0002032-.16234685.0002858-.12025251.0003032-.16573976-.0000887-.22195195-.0010706-.15358041-.0055478-.30580145-.0203882-.6940256-.0319191-.81365149-.4778003-1.3396911-1.1348711-1.44115781-.5589865-.08632026-1.2393839.37795756-1.2393839.37795756s-.1514404-.5228127-.2537197-.6842075c-.1661957-.25934741-.5941748-.58982828-.9213451-.65421118-.3365014-.0653413-.7354024-.05811592-1.1017193.00667481-.3207944.05740454-.64034865.34382687-.82518751.65277182-.13223727.22039488-.00786932-.01169164-.14013104-.2396787-.1830552-.31402315-.60932935-.59522407-1.01524567-.67822294-.34396352-.07112559-.73801897-.04403625-1.09795562.06293793-.46304125.13836397-.53675291.49073282-.55516748.38984626-.06158674-.3382385-.06727482-.3160095-.105656-.55729603-.14258072-.89527436-.30213161-1.51473549-.54406219-2.05528331.01391678.0310773-.08860981-.20214701-.12592279-.28256779-.06461002-.13925416-.12910532-.2652956-.19999629-.38652204-.21850342-.37364978-.46891278-.65340904-.7830908-.81233894-.54561037-.27629378-1.3634177-.14183064-1.75105565.31064856-.38495968.44966797-.4491432 1.20149287-.3521966 2.13184003.03702376.36121263.16678627 1.02066144.28444961 1.50812387.04160602.1691894.07805979.32348903.14491578.60851331.01149723.04848415.01149723.04848415.02309483.09698036.05172236.21571896.09707607.39320067.15122332.5879629-.00568154-.02030261.09701461.344086.11888835.42472961.00727686.02691587.00727686.02691587.01448296.05395339.04082856.15377935.08074083.31959314.14309954.5963099.03412572.1521447.06742545.31468601.09999775.48699018.08883553.46993091.089274.37207374.00375852.27186198-.05907319-.06922522-.11463055-.13209255-.16830659-.19003644-.09976937-.10770214-.19148509-.19677225-.2785569-.2678141-.6343975-.51905295-1.02312991-.74839425-1.55681885-.79878106-.87541567-.08410158-1.70619803.53426712-1.83111632 1.36882761-.07682697.51169638-.05207639.74723271.18463583 1.19942735.13026223.24432805.35060714.53942202.76172732 1.04735429.02515953.031068.02515953.031068.05030428.06206416.50464537.62186746.55962098.69095396.67961467.86473786.32435479.4706845 1.1139501 1.8221455 1.25748612 2.0035872z",
                    fill: "#1C1917"
                }, void 0, false, {
                    fileName: "[project]/src/components/export/mac-hand-pointing.tsx",
                    lineNumber: 31,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: "m1.68266944 9.2716401c-.02488625-.03067752-.02488625-.03067752-.04970567-.06132555-.37729166-.46613768-.58418002-.74321015-.68156241-.9258495-.15281729-.29195235-.1611316-.37107459-.10605794-.73788601.06473349-.43247455.53181583-.78013371 1.01829549-.73339767.33660502.03178017.63068475.20527903 1.15339692.63295262.0565942.04617564.12482853.1124417.20288232.19670163.04616569.04983637.09513192.10524534.14800114.16720042.0794093.0930562.34702847.42052231.30761424.37286894.05814283.06991619.09971852.12407704.14721655.19045018.0941062.13434104.14705111.20894642.21874992.30454484-.0336171-.04487143.21473082.29843305.26732159.34863333.27859812.26593456.68203289.04195871.65675979-.31244785-.00421914-.05916537-.01812774-.12308431-.04717934-.23466885-.11487425-.81923739-.15505751-1.08218312-.24678252-1.56739907-.03407352-.18024544-.06905328-.35098727-.10521102-.5121905-.06435409-.28557213-.10635725-.46007245-.14994794-.62425526-.00774801-.02907063-.00774801-.02907063-.01552357-.05783095-.02300644-.08481964-.12725123-.45470311-.12030828-.42989063-.05134381-.18468043-.0945453-.35373996-.14431997-.56133562-.01130896-.04728909-.01130896-.04728909-.02259904-.09489949-.06649254-.28350912-.10387999-.44176072-.14606063-.6132721-.10998732-.45567652-.23425389-1.08719519-.2671036-1.40768017-.07546665-.72422018-.02339381-1.33418457.17582284-1.56688778.15554834-.1815673.59641015-.25405339.84271752-.12932486.16107512.0814814.32204278.26131571.47435101.521769.05764302.09857191.11172763.20426801.16708381.32357735.0335256.07225783.13292567.29837003.12172905.27336705.21032209.46992469.354801 1.03086841.48791736 1.86671535.03939531.24766201.08813662.52823537.15063928.87150416.01857903.10178746.01857903.10178746.03722922.20314381.30139226 1.63533599.27933797 1.51139381.28367122 1.64182468.01580667.47578071.71810567.4869267.74900255.01188722.00979855-.15065269.00630989-.2851661-.01107827-.67146517-.00245496-.05465243-.00245496-.05465243-.00481877-.10910149-.01521525-.35590459-.01433687-.56066672.00670546-.67705709.03834708-.21223125.22887-.4499778.40434754-.50241339.24641865-.07323589.51640341-.09179599.73269877-.04707051.20703808.0423346.44864736.20171736.51796318.32062499.08353628.14399789.15516008.36337367.21006107.63530456.04431149.21947986.07480439.45493493.0962536.70624261.00667352.0781897.01103024.13859819.01772256.23854675.00285005.04183594.00285005.04183594.00568968.07635213.00160285.01731471.00160285.01731471.00551199.04467336.00303535.01917374.00303535.01917374.01734216.06773608.00727602.13782339.00727602.13782339.56081544.18893151.16530264-.19982737.16530264-.19982737.16077268-.23486454.02708074-.1183491.04365279-.250265.06727822-.49813693.01508098-.16112409.02268576-.24033521.03157416-.32249887.036794-.34012028.0835164-.55621578.140511-.65120691.0707148-.11819408.3197845-.28280909.4314962-.30279961.2805348-.04961763.5886064-.0551978.8264635-.00901194.1077347.021202.3705429.22413969.4327499.32121002.1277282.20156171.2519621.8513817.3219188 1.49611734-.0110122.04228902-.0110122.04228902.1607163.28760404.5903408-.06730286.5903408-.06730286.5737568-.17389206.0155734-.03799147.0279666-.08191522.0455068-.15013809.0421947-.1597068.0701719-.25243998.1118273-.35635899.0288165-.07188915.0591935-.13335501.0903398-.18227881.120675-.18992919.4330876-.31896311.7070596-.2766556.2942545.0454396.4817569.26665023.4998934.72896761.0145423.38042999.0188438.52667972.0198445.67022961.0003693.0529684.0003531.09548963.0000723.21509672-.0001536.07391241-.0001536.07391241-.000205.16397385 0 .48892448-.010469.79353263-.0389535 1.17400348-.0506294.653266-.1361064 1.34281542-.228649 1.66708482-.094456.330596-.3764591.9508823-.5997469 1.2734975-.0158389.0153017-.0838055.0964468-.1706932.2036597-.1445918.1784155-.2892331.364998-.4248114.5512865-.0725632.099704-.140705.1968792-.2036767.2908847-.2436695.3637558-.4000227.6607868-.4506249.9042828-.0664376.3164194-.0901813.4842425-.0973169.666189-.0017426.0515155-.0017426.0515155-.0028439.1014735-.0025547.1180556-.0040857.165727-.0090621.2520573-.0052398.0906702-.0037444.1871795.0035093.2891187.0103883.145992.0000001.3454812.0000001.3454812s-.1266332-.0118299-.2678551-.0085813c-.1725177.0039685-.3159859-.0019087-.4151297-.0177442-.143046-.0230487-.5293508-.5064503-.7271506-.8830611-.3022704-.5764228-1.03604858-.5484427-1.33684295-.0394061-.27130191.4618137-.65965243.9172085-.77493336.9317029-.37460536.047106-.95471158.0524702-2.07175566.0332544-.10679478-.0018572-.10679478-.0018572-.21348729-.0037567-.42889761-.0076439-.41241496.0647655-.40363307-.0124079.02506967-.2203068.02222332-.1790312.00000011-.3992999-.03726222-.36933-.15125405-.6704984-.38877094-.8705429-.12286946-.1043424-.26983033-.2407345-.56500741-.5211097-.33722428-.3203411-.44283686-.4193233-.57299128-.5337266l-.80130455-.8907189c-.08795856-.1124788-.86002339-1.4339349-1.21248613-1.9454077-.13710846-.19857111-.18839645-.26302343-.71461353-.9114734zm9.50873056.0037599v3.459c0 .5.75.5.75 0v-3.459c0-.5-.75-.5-.75 0zm-2.03159602-.00057241.016 3.47300001c.00230346.4999947.7522955.4965395.74999204-.0034552l-.016-3.47299999c-.00230346-.4999947-.7522955-.49653951-.74999204.00345518zm-1.20911102 3.45357381-.021-3.42599996c-.00306475-.4999906-.75305066-.49539349-.74998592.00459712l.021 3.42600004c.00306475.4999906.75305066.4953935.74998592-.0045972z",
                    fill: "#FFFFFF"
                }, void 0, false, {
                    fileName: "[project]/src/components/export/mac-hand-pointing.tsx",
                    lineNumber: 35,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/export/mac-hand-pointing.tsx",
            lineNumber: 30,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/export/mac-hand-pointing.tsx",
        lineNumber: 15,
        columnNumber: 5
    }, this);
}
_c = MacHandPointing;
const MAC_HAND_HOTSPOT = {
    x: 9,
    y: 8
};
var _c;
__turbopack_context__.k.register(_c, "MacHandPointing");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/badge.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Badge",
    ()=>Badge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
const sentimentStyles = {
    neutral: "bg-stone-warm",
    positive: "bg-status-positive",
    negative: "bg-status-negative"
};
function Badge({ children, variant = "default", className = "" }) {
    const bg = variant === "status" ? "bg-status-positive" : variant === "default" ? "bg-stone-warm" : sentimentStyles[variant];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `inline-flex items-center justify-center rounded-lg px-2 py-1 text-[12px] leading-[133%] font-medium text-stone-ink ${bg} ${className}`,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/ui/badge.tsx",
        lineNumber: 28,
        columnNumber: 5
    }, this);
}
_c = Badge;
var _c;
__turbopack_context__.k.register(_c, "Badge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/chart-colors.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Dialogue palette for charts — stone ramp + pink highlight only */ __turbopack_context__.s([
    "chartColors",
    ()=>chartColors,
    "heatCellColor",
    ()=>heatCellColor,
    "stoneBarFill",
    ()=>stoneBarFill
]);
const chartColors = {
    stone100: "#F1EEEA",
    stone200: "#E7E5E4",
    stone300: "#D6D3D1",
    stone400: "#A8A29E",
    stone600: "#57534D",
    stone900: "#1C1917",
    pink: "#B43F7F",
    pinkSoft: "#FFD8EE"
};
function stoneBarFill(index, focal) {
    if (focal) return chartColors.pink;
    const ramp = [
        chartColors.stone300,
        chartColors.stone400,
        chartColors.stone600,
        chartColors.stone400,
        chartColors.stone300
    ];
    return ramp[index % ramp.length];
}
function heatCellColor(value, _selected) {
    const t = 1 - value;
    if (t > 0.45) return chartColors.stone400;
    if (t > 0.25) return chartColors.stone200;
    return chartColors.stone100;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/chat-threads.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "chatThreads",
    ()=>chatThreads,
    "emptyStateSuggestions",
    ()=>emptyStateSuggestions
]);
const chatThreads = {
    "1": {
        id: "1",
        userMessage: "Where did people drop off in checkout?",
        assistantLead: "I pulled completion rates for each step across all moderated sessions.",
        followUp: "Address clips explain the autocomplete and international-format pain behind the funnel drop.",
        searchedCount: 24,
        foundCount: 9,
        sources: [
            {
                participant: "Jordan M.",
                topic: "checkout",
                time: "14:03"
            },
            {
                participant: "Marcus W.",
                topic: "payment",
                time: "21:08"
            },
            {
                participant: "Priya K.",
                topic: "address",
                time: "15:47"
            },
            {
                participant: "Hannah L.",
                topic: "payment",
                time: "22:41"
            }
        ],
        followUpChips: [
            {
                label: "Show mobile only"
            },
            {
                label: "Compare to round 1",
                href: "/chat/2"
            }
        ],
        viz: {
            kind: "checkout-dropoff",
            summary: "Shipping address loses 38% of participants, the largest single-step drop in checkout.",
            summaryEmphasis: "loses 38% of participants",
            funnel: [
                {
                    shortLabel: "Cart",
                    label: "Cart review",
                    pctRemaining: 100
                },
                {
                    shortLabel: "Address",
                    label: "Shipping address",
                    pctRemaining: 62,
                    dropPct: 38,
                    focal: true
                },
                {
                    shortLabel: "Delivery",
                    label: "Delivery options",
                    pctRemaining: 54,
                    dropPct: 8
                },
                {
                    shortLabel: "Payment",
                    label: "Payment",
                    pctRemaining: 42,
                    dropPct: 12
                },
                {
                    shortLabel: "Confirm",
                    label: "Confirmation",
                    pctRemaining: 36,
                    dropPct: 6
                }
            ],
            deviceBlock: {
                title: "Why address failed, by device",
                subtitle: "Drop-off reasons at the address step, % of mentions",
                devices: [
                    {
                        name: "Mobile",
                        reasons: [
                            {
                                label: "Autofill",
                                pct: 44
                            },
                            {
                                label: "Intl format",
                                pct: 31
                            },
                            {
                                label: "Reset",
                                pct: 25
                            }
                        ]
                    },
                    {
                        name: "Desktop",
                        reasons: [
                            {
                                label: "Intl format",
                                pct: 38
                            },
                            {
                                label: "Validation",
                                pct: 34
                            },
                            {
                                label: "PO box",
                                pct: 28
                            }
                        ]
                    }
                ]
            },
            clipCount: 9,
            coverageNote: "18 of 24 participants mentioned address friction"
        }
    },
    "2": {
        id: "2",
        userMessage: "How did sentiment shift across the 3 prototype rounds?",
        assistantLead: "I coded post-task sentiment after each round and tracked the weekly average.",
        chartSummary: "Sentiment climbs after autocomplete ships in round two.",
        followUp: "Round three still trails on trust in saved payment details.",
        searchedCount: 24,
        foundCount: 6,
        sources: [
            {
                participant: "Elena R.",
                topic: "debrief",
                time: "26:10"
            },
            {
                participant: "Sam T.",
                topic: "debrief",
                time: "27:44"
            }
        ],
        followUpChips: [
            {
                label: "Show mobile only"
            },
            {
                label: "Overlay payment step",
                href: "/chat/1"
            }
        ],
        viz: {
            kind: "line",
            title: "Average sentiment score by prototype round",
            summary: "Sentiment climbs after autocomplete ships in round two.",
            summaryEmphasis: "autocomplete ships in round two",
            points: [
                {
                    label: "Round 1",
                    value: 2.4
                },
                {
                    label: "Round 2",
                    value: 3.1
                },
                {
                    label: "Round 3",
                    value: 3.6
                }
            ]
        }
    },
    "3": {
        id: "3",
        userMessage: "Which segments struggled most with address entry?",
        assistantLead: "I segmented task success on the address step by device and shopper type.",
        chartSummary: "Mobile and international formats show the lowest success.",
        followUp: "Tap a cell to hear how participants described address friction.",
        searchedCount: 24,
        foundCount: 8,
        sources: [
            {
                participant: "Jordan M.",
                topic: "address",
                time: "14:55"
            },
            {
                participant: "Priya K.",
                topic: "address",
                time: "16:02"
            }
        ],
        followUpChips: [
            {
                label: "Show mobile only",
                href: "/chat/3"
            },
            {
                label: "Open payment clips",
                href: "/chat/4"
            }
        ],
        viz: {
            kind: "heatmap",
            title: "Address step success rate by segment",
            summary: "Mobile and international formats show the lowest success.",
            summaryEmphasis: "lowest success",
            rows: [
                "Mobile",
                "Desktop",
                "Tablet"
            ],
            cols: [
                "Domestic",
                "International",
                "PO box"
            ],
            values: [
                [
                    0.58,
                    0.31,
                    0.44
                ],
                [
                    0.82,
                    0.67,
                    0.71
                ],
                [
                    0.64,
                    0.42,
                    0.5
                ]
            ],
            cellClips: [
                [
                    [
                        "mobile-dom"
                    ],
                    [
                        "mobile-intl"
                    ],
                    [
                        "ship-2"
                    ]
                ],
                [
                    [
                        "ship-1"
                    ],
                    [
                        "ship-2"
                    ],
                    [
                        "ship-1"
                    ]
                ],
                [
                    [
                        "mobile-dom"
                    ],
                    [
                        "mobile-intl"
                    ],
                    [
                        "ship-2"
                    ]
                ]
            ]
        }
    },
    "4": {
        id: "4",
        userMessage: "Why did people hesitate at payment?",
        assistantLead: "I pulled moments where participants paused, re-read errors, or abandoned after a decline.",
        followUp: "Hesitation clusters around unclear errors and missing wallet shortcuts on mobile.",
        searchedCount: 24,
        foundCount: 5,
        sources: [
            {
                participant: "Marcus W.",
                topic: "payment",
                time: "21:08"
            },
            {
                participant: "Hannah L.",
                topic: "payment",
                time: "22:41"
            },
            {
                participant: "Noah P.",
                topic: "payment",
                time: "23:15"
            }
        ],
        followUpChips: [
            {
                label: "Show bar breakdown",
                href: "/chat/1"
            },
            {
                label: "Compare round 1",
                href: "/chat/2"
            }
        ],
        clipsOnly: {
            kind: "clips",
            title: "Payment hesitation moments",
            summary: "Participants paused when errors did not explain what to fix.",
            summaryEmphasis: "did not explain what to fix",
            clipIds: [
                "pay-1",
                "pay-2",
                "pay-3"
            ]
        }
    }
};
const emptyStateSuggestions = [
    {
        label: "Where did people drop off in checkout?",
        href: "/chat/1"
    },
    {
        label: "Sentiment across prototype rounds",
        href: "/chat/2"
    },
    {
        label: "Segments struggling with address entry",
        href: "/chat/3"
    },
    {
        label: "Why hesitate at payment?",
        href: "/chat/4"
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/clip-thumb-photos.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** §5 player still (committed asset; do not regenerate in export tests). */ __turbopack_context__.s([
    "CLIP_PHOTO_PATHS",
    ()=>CLIP_PHOTO_PATHS,
    "PLAYER_STILL_PATH",
    ()=>PLAYER_STILL_PATH,
    "clipPhotoForParticipant",
    ()=>clipPhotoForParticipant
]);
const PLAYER_STILL_PATH = "/clip-photos/call-frame-player.jpg?r=18";
const CLIP_PHOTO_PATHS = [
    "/clip-photos/still-thumb-1.jpg",
    "/clip-photos/still-thumb-2.jpg",
    "/clip-photos/still-thumb-3.jpg"
];
function clipPhotoForParticipant(participant) {
    if (!participant?.trim()) return CLIP_PHOTO_PATHS[0];
    let hash = 0;
    for(let i = 0; i < participant.length; i++){
        hash = (hash + participant.charCodeAt(i) * (i + 1)) % 9973;
    }
    return CLIP_PHOTO_PATHS[hash % CLIP_PHOTO_PATHS.length];
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/clip-time-ranges.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Canonical on-screen time ranges for export copy (en dash). */ __turbopack_context__.s([
    "HANNAH_PAY_RANGE",
    ()=>HANNAH_PAY_RANGE,
    "JORDAN_SHIPPING_RANGE",
    ()=>JORDAN_SHIPPING_RANGE,
    "MARCUS_PAYMENT_RANGE",
    ()=>MARCUS_PAYMENT_RANGE,
    "PRIYA_INTL_RANGE",
    ()=>PRIYA_INTL_RANGE,
    "PRIYA_MOBILE_RANGE",
    ()=>PRIYA_MOBILE_RANGE,
    "clipHeaderLine",
    ()=>clipHeaderLine
]);
const MARCUS_PAYMENT_RANGE = "01:38–01:52";
const JORDAN_SHIPPING_RANGE = "14:03–14:19";
const PRIYA_INTL_RANGE = "15:47–16:04";
const HANNAH_PAY_RANGE = "16:02–16:18";
const PRIYA_MOBILE_RANGE = "16:02–16:18";
function clipHeaderLine(participant, range) {
    return `${participant}, ${range}`;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/evidence-clips.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "interviewClips",
    ()=>interviewClips
]);
const interviewClips = {
    "cart-1": {
        id: "cart-1",
        participant: "Elena R.",
        timestamp: "08:12",
        transcript: "I wasn't sure the discount applied, so I backed out to check the cart again before continuing.",
        highlight: "backed out to check the cart"
    },
    "ship-1": {
        id: "ship-1",
        participant: "Jordan M.",
        segment: "14:03–14:19",
        timestamp: "14:03",
        transcript: "The apartment field kept clearing when I picked autocomplete, and I almost closed the tab.",
        highlight: "almost closed the tab"
    },
    "ship-2": {
        id: "ship-2",
        participant: "Priya K.",
        segment: "15:47–16:04",
        timestamp: "15:47",
        transcript: "International format wasn't obvious; I typed the whole address twice before it stuck.",
        highlight: "typed the whole address twice"
    },
    "delivery-1": {
        id: "delivery-1",
        participant: "Sam T.",
        timestamp: "18:22",
        transcript: "Delivery dates looked like costs at first glance, so I paused to read the fine print.",
        highlight: "paused to read the fine print"
    },
    "pay-1": {
        id: "pay-1",
        participant: "Marcus W.",
        segment: "01:38–01:52",
        timestamp: "01:38",
        transcript: "When the card failed, I didn't know if it was my bank or the site, so I hesitated before retrying.",
        highlight: "hesitated before retrying"
    },
    "pay-2": {
        id: "pay-2",
        participant: "Hannah L.",
        segment: "16:02–16:18",
        timestamp: "16:02",
        transcript: "Saved payment wasn't obvious on mobile; I stopped to find where wallets were hiding.",
        highlight: "stopped to find where wallets"
    },
    "pay-3": {
        id: "pay-3",
        participant: "Noah P.",
        timestamp: "23:15",
        transcript: "The error just said payment failed. I needed a second before I trusted entering the card again.",
        highlight: "needed a second before I trusted"
    },
    "confirm-1": {
        id: "confirm-1",
        participant: "Avery C.",
        timestamp: "25:02",
        transcript: "I wanted one more look at the total before I hit place order; the button felt sudden.",
        highlight: "one more look at the total"
    },
    "mobile-intl": {
        id: "mobile-intl",
        participant: "Priya K.",
        segment: "16:02–16:18",
        timestamp: "16:02",
        transcript: "On my phone the country switch reset everything, so I had to start the address over.",
        highlight: "start the address over"
    },
    "mobile-dom": {
        id: "mobile-dom",
        participant: "Jordan M.",
        timestamp: "14:55",
        transcript: "Unit number was below the fold on mobile, so I missed it until validation yelled at me.",
        highlight: "missed it until validation"
    },
    "address-unit-1": {
        id: "address-unit-1",
        participant: "Sam R.",
        segment: "11:22–11:36",
        timestamp: "11:22",
        transcript: "Unit number was below the fold on mobile, so I missed it until validation yelled at me.",
        highlight: "missed it until validation"
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/source-label.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "interviewSourceLabel",
    ()=>interviewSourceLabel
]);
function interviewSourceLabel(interviewCount, studyCount = interviewCount) {
    return `Based on ${interviewCount} of ${studyCount} interviews`;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);})()

//# sourceMappingURL=src_1g1d0nw35ukdd._.js.map