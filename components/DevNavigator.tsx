"use client";

import { useEffect } from "react";

/** Listens for dev:navigate messages from the /dev editor and scrolls to sections. */
export default function DevNavigator() {
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.type !== "dev:navigate") return;
      const el = document.getElementById(e.data.sectionId as string);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);
  return null;
}
