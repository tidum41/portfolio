"use client";

import { useEffect, type ReactNode } from "react";

const HIDE_SITE_CHROME = `
  html[data-remotion-playground] nav,
  html[data-remotion-playground] footer,
  html[data-remotion-playground] .skip-link,
  html[data-remotion-playground] .dialkit-panel,
  html[data-remotion-playground] .dialkit-root,
  html[data-remotion-playground] .dialkit-fab,
  html[data-remotion-playground] #agentation-root {
    display: none !important;
  }
  html[data-remotion-playground] main > *:not([data-remotion-playground-root]) {
    display: none !important;
  }
  html[data-remotion-playground] body {
    overflow: hidden;
  }
`;

export default function PlaygroundChrome({ children }: { children: ReactNode }) {
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.remotionPlayground = "1";
    html.dataset.intro = "done";
    return () => {
      delete html.dataset.remotionPlayground;
    };
  }, []);

  return (
    <>
      <style>{HIDE_SITE_CHROME}</style>
      <div
        data-remotion-playground-root
        className="fixed inset-0 z-[200] flex flex-col overflow-hidden bg-[#f5f4f1] text-neutral-900"
      >
        {children}
      </div>
    </>
  );
}
