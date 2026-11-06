import type { LayoutId } from "./data";

export const LAYOUT_SELECT = {
  type: "select" as const,
  options: [
    { value: "contact", label: "Contact sheet" },
    { value: "setlist", label: "Setlist" },
    { value: "turntable", label: "Turntable" },
  ],
};

export function isLayoutId(v: string): v is LayoutId {
  return v === "contact" || v === "setlist" || v === "turntable";
}
