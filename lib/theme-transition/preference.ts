export type ThemeTransitionMode = "default" | "dither" | "halftone";

const STORAGE_KEY = "theme-transition-mode";
const PARAM_KEY = "transition";

export function parseTransitionMode(value: string | null | undefined): ThemeTransitionMode | null {
  if (value === "dither" || value === "halftone" || value === "default") return value;
  if (value === "off" || value === "") return "default";
  return null;
}

/** Active mode. Dither is the site default; `?transition=` or the lab can override for the tab. */
export function getThemeTransitionMode(): ThemeTransitionMode {
  if (typeof window === "undefined") return "dither";
  try {
    const params = new URLSearchParams(window.location.search);
    const fromParam = parseTransitionMode(params.get(PARAM_KEY));
    if (fromParam) {
      setThemeTransitionMode(fromParam);
      return fromParam;
    }
  } catch {
    /* ignore */
  }
  try {
    const stored = parseTransitionMode(sessionStorage.getItem(STORAGE_KEY));
    if (stored) return stored;
  } catch {
    /* ignore */
  }
  return "dither";
}

export function setThemeTransitionMode(mode: ThemeTransitionMode): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}
