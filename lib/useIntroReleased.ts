"use client";

import { useEffect, useState } from "react";
import { onIntroDone } from "@/lib/introReady";

/** False during the first-load intro gate; true afterwards (and on non-home). */
export function useIntroReleased(): boolean {
  const [released, setReleased] = useState(false);
  useEffect(() => onIntroDone(() => setReleased(true)), []);
  return released;
}
