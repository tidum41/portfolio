import type { FilmConfig, EasingPreset } from "@joola-remotion/joola/film-config";
import type { ReactNode } from "react";

const FPS = 30;
const framesToSec = (f: number) => +(f / FPS).toFixed(2);

export type ControlField =
  | {
      kind: "frames";
      id: string;
      label: string;
      get: (c: FilmConfig) => number;
      set: (c: FilmConfig, v: number) => FilmConfig;
      min?: number;
      max?: number;
    }
  | {
      kind: "seconds";
      id: string;
      label: string;
      get: (c: FilmConfig) => number;
      set: (c: FilmConfig, sec: number) => FilmConfig;
      min?: number;
      max?: number;
      step?: number;
    }
  | {
      kind: "morph";
      id: string;
      labelStart: string;
      labelEnd: string;
    }
  | {
      kind: "easing";
      id: string;
      label: string;
      get: (c: FilmConfig) => EasingPreset;
      set: (c: FilmConfig, v: EasingPreset) => FilmConfig;
      options: "cursor" | "camera";
    }
  | {
      kind: "shot";
      id: string;
      title: string;
      shotKey: keyof FilmConfig["camera"];
    };

export type ControlGroup = {
  title: string;
  hint: string;
  fields: ControlField[];
};

export const CONTROL_GROUPS: ControlGroup[] = [
  {
    title: "1. Logo intro",
    hint: "How the loop opens: centred logo glides into the sidebar slot.",
    fields: [{ kind: "morph", id: "param-morph", labelStart: "Morph start (frame)", labelEnd: "Morph end (frame)" }],
  },
  {
    title: "2. Cursor",
    hint: "Ramp-style pointer: travel easing and how long it hovers before each click.",
    fields: [
      {
        kind: "frames",
        id: "param-clickLead",
        label: "Hover before click (frames)",
        get: (c) => c.clickLead,
        set: (c, v) => ({ ...c, clickLead: v }),
        min: 0,
        max: 12,
      },
      {
        kind: "easing",
        id: "param-cursorMovePreset",
        label: "Cursor travel easing",
        get: (c) => c.cursorMovePreset,
        set: (c, v) => ({ ...c, cursorMovePreset: v }),
        options: "cursor",
      },
    ],
  },
  {
    title: "3. Click timing",
    hint: "Frame when each press happens (30 fps). Story order top to bottom.",
    fields: [
      { kind: "frames", id: "param-clicks-search", label: "Click search field", get: (c) => c.clicks.search, set: (c, v) => ({ ...c, clicks: { ...c.clicks, search: v } }) },
      { kind: "frames", id: "param-clicks-result", label: "Select Perseus result", get: (c) => c.clicks.result, set: (c, v) => ({ ...c, clicks: { ...c.clicks, result: v } }) },
      { kind: "frames", id: "param-clicks-qty", label: "Qty preset 120", get: (c) => c.clicks.qty, set: (c, v) => ({ ...c, clicks: { ...c.clicks, qty: v } }) },
      { kind: "frames", id: "param-clicks-tpl", label: "Open Match template", get: (c) => c.clicks.tpl, set: (c, v) => ({ ...c, clicks: { ...c.clicks, tpl: v } }) },
      { kind: "frames", id: "param-clicks-tplAdd", label: "Apply template rows", get: (c) => c.clicks.tplAdd, set: (c, v) => ({ ...c, clicks: { ...c.clicks, tplAdd: v } }) },
      { kind: "frames", id: "param-clicks-add", label: "Add to cart", get: (c) => c.clicks.add, set: (c, v) => ({ ...c, clicks: { ...c.clicks, add: v } }) },
      { kind: "frames", id: "param-clicks-pill", label: "Open cart pill", get: (c) => c.clicks.pill, set: (c, v) => ({ ...c, clicks: { ...c.clicks, pill: v } }) },
      { kind: "frames", id: "param-clicks-place", label: "Place order", get: (c) => c.clicks.place, set: (c, v) => ({ ...c, clicks: { ...c.clicks, place: v } }) },
    ],
  },
  {
    title: "4. Search & row beats",
    hint: "Typing, dropdown, and row insert — keep reads long enough at 676px.",
    fields: [
      { kind: "seconds", id: "param-beats-typeSearchDuration", label: 'Type "Perseus" (s)', get: (c) => c.beats.typeSearchDuration, set: (c, s) => ({ ...c, beats: { ...c.beats, typeSearchDuration: Math.round(s * FPS) } }), min: 0.1, max: 2, step: 0.03 },
      { kind: "frames", id: "param-beats-dropdownOpenAt", label: "Show results (frame)", get: (c) => c.beats.dropdownOpenAt, set: (c, v) => ({ ...c, beats: { ...c.beats, dropdownOpenAt: v } }) },
      { kind: "frames", id: "param-beats-resultHoverLead", label: "Hover result lead (frames)", get: (c) => c.beats.resultHoverLead, set: (c, v) => ({ ...c, beats: { ...c.beats, resultHoverLead: v } }) },
      { kind: "seconds", id: "param-beats-rowInsertDuration", label: "Row fade-in (s)", get: (c) => c.beats.rowInsertDuration, set: (c, s) => ({ ...c, beats: { ...c.beats, rowInsertDuration: Math.round(s * FPS) } }), min: 0.1, max: 1, step: 0.03 },
      { kind: "seconds", id: "param-beats-typeQtyDuration", label: "Qty step animation (s)", get: (c) => c.beats.typeQtyDuration, set: (c, s) => ({ ...c, beats: { ...c.beats, typeQtyDuration: Math.round(s * FPS) } }), min: 0.05, max: 1, step: 0.03 },
    ],
  },
  {
    title: "5. Camera moves",
    hint: "Three story pans plus order morph — duration in seconds; start frames anchor each move.",
    fields: [
      { kind: "seconds", id: "param-beats-panAbDuration", label: "Pan to reorder rail (s)", get: (c) => c.beats.panAbDuration, set: (c, s) => ({ ...c, beats: { ...c.beats, panAbDuration: Math.round(s * FPS) } }), min: 0.2, max: 2, step: 0.03 },
      { kind: "frames", id: "param-beats-panAbStart", label: "Pan 1 start (frame)", get: (c) => c.beats.panAbStart, set: (c, v) => ({ ...c, beats: { ...c.beats, panAbStart: v } }) },
      { kind: "seconds", id: "param-beats-panBcDuration", label: "Pan to footer + pill (s)", get: (c) => c.beats.panBcDuration, set: (c, s) => ({ ...c, beats: { ...c.beats, panBcDuration: Math.round(s * FPS) } }), min: 0.2, max: 2, step: 0.03 },
      { kind: "frames", id: "param-beats-panBcStart", label: "Pan 2 start (frame)", get: (c) => c.beats.panBcStart, set: (c, v) => ({ ...c, beats: { ...c.beats, panBcStart: v } }) },
      { kind: "seconds", id: "param-beats-panCartDuration", label: "Pan to cart summary (s)", get: (c) => c.beats.panCartDuration, set: (c, s) => ({ ...c, beats: { ...c.beats, panCartDuration: Math.round(s * FPS) } }), min: 0.2, max: 2, step: 0.03 },
      { kind: "frames", id: "param-beats-panCartStart", label: "Pan 3 start (frame)", get: (c) => c.beats.panCartStart, set: (c, v) => ({ ...c, beats: { ...c.beats, panCartStart: v } }) },
      { kind: "seconds", id: "param-beats-orderMorphDuration", label: "Order placed morph (s)", get: (c) => c.beats.orderMorphDuration, set: (c, s) => ({ ...c, beats: { ...c.beats, orderMorphDuration: Math.round(s * FPS) } }), min: 0.2, max: 2, step: 0.03 },
      {
        kind: "easing",
        id: "param-camera-moveEasing",
        label: "Story pan easing",
        get: (c) => c.camera.moveEasing,
        set: (c, v) => ({ ...c, camera: { ...c.camera, moveEasing: v } }),
        options: "camera",
      },
    ],
  },
  {
    title: "6. Cart & template UI",
    hint: "Popover, template rows, and pill fill after Add — instant values, eased geometry.",
    fields: [
      { kind: "seconds", id: "param-beats-popoverInDuration", label: "Template popover in (s)", get: (c) => c.beats.popoverInDuration, set: (c, s) => ({ ...c, beats: { ...c.beats, popoverInDuration: Math.round(s * FPS) } }), min: 0.05, max: 1, step: 0.03 },
      { kind: "seconds", id: "param-beats-templateRowsDuration", label: "Template rows stagger (s)", get: (c) => c.beats.templateRowsDuration, set: (c, s) => ({ ...c, beats: { ...c.beats, templateRowsDuration: Math.round(s * FPS) } }), min: 0.1, max: 2, step: 0.03 },
      { kind: "seconds", id: "param-beats-pillFillDuration", label: "Cart pill fill (s)", get: (c) => c.beats.pillFillDuration, set: (c, s) => ({ ...c, beats: { ...c.beats, pillFillDuration: Math.round(s * FPS) } }), min: 0.1, max: 1.5, step: 0.03 },
    ],
  },
  {
    title: "7. Holds & outro",
    hint: "Reading time on confirmation and loop logo — spec targets ~1.2s on Order placed.",
    fields: [
      { kind: "seconds", id: "param-beats-orderPlacedHold", label: "Hold on Order placed (s)", get: (c) => c.beats.orderPlacedHold, set: (c, s) => ({ ...c, beats: { ...c.beats, orderPlacedHold: Math.round(s * FPS) } }), min: 0.3, max: 3, step: 0.03 },
      { kind: "seconds", id: "param-beats-logoOutDuration", label: "Logo outro fade (s)", get: (c) => c.beats.logoOutDuration, set: (c, s) => ({ ...c, beats: { ...c.beats, logoOutDuration: Math.round(s * FPS) } }), min: 0.3, max: 3, step: 0.03 },
      { kind: "seconds", id: "param-beats-logoOutTail", label: "End hold before loop (s)", get: (c) => c.beats.logoOutTail, set: (c, s) => ({ ...c, beats: { ...c.beats, logoOutTail: Math.round(s * FPS) } }), min: 0, max: 1, step: 0.03 },
    ],
  },
  {
    title: "8. Camera framing",
    hint: "Zoom (s) and centre in stage pixels — text must read at 676px card width.",
    fields: [
      { kind: "shot", id: "param-camera-shotA", title: "Wide — search & Perseus row", shotKey: "shotA" },
      { kind: "shot", id: "param-camera-shotB", title: "Reorder rail & template", shotKey: "shotB" },
      { kind: "shot", id: "param-camera-shotB2", title: "Footer Add & header pill", shotKey: "shotB2" },
      { kind: "shot", id: "param-camera-shotSummary", title: "Cart summary & credit", shotKey: "shotSummary" },
      { kind: "shot", id: "param-camera-shotOrderPlaced", title: "Order placed panel", shotKey: "shotOrderPlaced" },
    ],
  },
];

/** Display seconds for frame-based beat fields shown as sliders */
export function fieldDisplayValue(field: ControlField, config: FilmConfig): number {
  if (field.kind === "seconds") return framesToSec(field.get(config));
  if (field.kind === "frames") return field.get(config);
  return 0;
}

export function fieldHintSuffix(field: ControlField, config: FilmConfig): string | null {
  if (field.kind === "frames") return `${framesToSec(field.get(config))}s`;
  if (field.kind === "seconds") return `${field.get(config)}f`;
  return null;
}
