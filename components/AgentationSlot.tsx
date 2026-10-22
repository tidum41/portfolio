"use client";

import { useEffect, useState, type ComponentType } from "react";
import { usePathname } from "next/navigation";

const IDENTIFYING_ATTRIBUTES = [
  "data-annotate",
  "data-testid",
  "data-component",
  "data-dialogue-asset-id",
] as const;

/**
 * Annotation toolbar for preview and development. The import() sits inside a
 * build-time guard (NEXT_PUBLIC_VERCEL_ENV is inlined by next.config.mjs), so
 * a production build contains no agentation chunk.
 */
export default function AgentationSlot() {
  const pathname = usePathname();
  const [Toolbar, setToolbar] = useState<ComponentType<{
    identifyingAttributes?: readonly string[];
  }> | null>(null);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_VERCEL_ENV !== "production") {
      if (window.self !== window.top) return;
      void import("agentation").then((m) => setToolbar(() => m.Agentation));
    }
  }, []);

  if (!Toolbar || pathname.startsWith("/studio")) return null;
  return <Toolbar identifyingAttributes={IDENTIFYING_ATTRIBUTES} />;
}
