"use client";

import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";

function parseMemoryEntry(entry: string) {
  const url = new URL(entry, "http://embed.local");
  return { pathname: url.pathname, search: url.search };
}
import { Toaster } from "sonner";
import { StoreProvider } from "@/vendor/joola-b2b-live/src/state/Store";
import JoolaLiveStyles from "./JoolaLiveStyles";

export default function JoolaLiveRoot({
  initialEntry,
  children,
}: {
  initialEntry: string;
  children: ReactNode;
}) {
  return (
    <>
      <JoolaLiveStyles />
      <StoreProvider>
        <MemoryRouter initialEntries={[parseMemoryEntry(initialEntry)]}>
          <div className="joola-live-embed">
            <Toaster position="top-right" duration={4000} />
            {children}
          </div>
        </MemoryRouter>
      </StoreProvider>
    </>
  );
}
