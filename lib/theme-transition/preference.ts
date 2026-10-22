export type ThemeTransitionMode = "default" | "dither" | "halftone";

const STORAGE_KEY = "theme-transition-mode";
const PARAM_KEY = "transition";

export function parseTransitionMode(value: string | null | undefined): ThemeTransitionMode | null {
  if (value === "dither" || value === "halftone") return value;
  if (value === "default" || value === "off" || value === "") return "default";
  return null;
}

/** Active prototype mode; `default` keeps production ThemeToggle behavior. */
export function getThemeTransitionMode(): ThemeTransitionMode {
  if (typeof window === "undefined") return "default";
  try {
    const params = new URLSearchParams(window.location.search);
    const fromParam = parseTransitionMode(params.get(PARAM_KEY));
    if (fromParam) {
      if (fromParam !== "default") {
        sessionStorage.setItem(STORAGE_KEY, fromParam);
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
      return fromParam;
    }
  } catch {
    /* ignore */
  }
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    const parsed = parseTransitionMode(stored);
    if (parsed && parsed !== "default") return parsed;
  } catch {
    /* ignore */
  }
  return "default";
}

export function setThemeTransitionMode(mode: ThemeTransitionMode): void {
  if (typeof window === "undefined") return;
  try {
    if (mode === "default") sessionStorage.removeItem(STORAGE_KEY);
    else sessionStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}
