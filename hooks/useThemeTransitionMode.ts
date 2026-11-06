"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getThemeTransitionMode,
  setThemeTransitionMode,
  type ThemeTransitionMode,
} from "@/lib/theme-transition/preference";

export function useThemeTransitionMode(): [
  ThemeTransitionMode,
  (mode: ThemeTransitionMode) => void,
] {
  const [mode, setMode] = useState<ThemeTransitionMode>("default");

  useEffect(() => {
    setMode(getThemeTransitionMode());
    const onPop = () => setMode(getThemeTransitionMode());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const set = useCallback((next: ThemeTransitionMode) => {
    setThemeTransitionMode(next);
    setMode(next);
  }, []);

  return [mode, set];
}
