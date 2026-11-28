/** Depth r4 compare beats. Plain module so the server page can read them (?beat=). */
export const BEATS = [
  { id: "ask", label: "Before asking" },
  { id: "reply", label: "The reply lands" },
  { id: "count", label: "Open the count" },
  { id: "source", label: "Play Ana’s clip" },
  { id: "asks", label: "Open the asks" },
] as const;
export type Beat = (typeof BEATS)[number]["id"];
