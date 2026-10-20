"use client";

import { memo, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ArchivePageClient from "@/app/archive/ArchivePageClient";
import {
  peekArchiveGallery,
  rememberArchiveGallery,
  warmArchiveGallery,
} from "@/lib/archiveGalleryCache";
import { useResolvedPrimaryTab } from "@/lib/usePrimaryTab";
import { useTabArrival } from "@/lib/useTabArrival";
import { afterIntroIdle } from "@/lib/introReady";
import { allowIdlePrefetch } from "@/lib/networkHint";
import { subscribePrimaryShellPremount } from "@/lib/primaryShellWarm";
import type { PlaygroundGalleryItem } from "@/lib/sanity/queries";

/**
 * Archive keep-alive — same hide contract as PersistentWorkShell (`display: none`).
 *
 * The heavy gallery tree must not re-render on Work/About clicks. `visible`
 * is the only prop that matters; a memoized inner skips About ↔ Work.
 * Hover-intent / late-idle premount so the first Archive click is a display
 * flip without packing BentoGallery into every Work session early.
 */
export default function PersistentArchiveShell({
  items: serverItems = [],
}: {
  items?: PlaygroundGalleryItem[];
}) {
  const pathname = usePathname();
  const tab = useResolvedPrimaryTab(pathname);
  const visible = tab === "archive";

  if (serverItems.length) rememberArchiveGallery(serverItems);

  const [items, setItems] = useState<PlaygroundGalleryItem[]>(
    () => peekArchiveGallery() ?? serverItems,
  );
  const [hasShown, setHasShown] = useState(visible);
  if (visible && !hasShown) setHasShown(true);

  useEffect(() => subscribePrimaryShellPremount((shell) => {
    if (shell === "archive") setHasShown(true);
  }), []);

  // Warm gallery *data* early (cheap); mount the React tree on hover-intent
  // or late idle so Work stays light.
  useEffect(() => {
    if (pathname === "/archive") return;
    return afterIntroIdle(() => {
      if (!allowIdlePrefetch()) return;
      void warmArchiveGallery().then((data) => {
        if (data.length) setItems(data);
      });
    }, pathname === "/" ? 2500 : 900);
  }, [pathname]);

  useEffect(() => {
    if (hasShown) return;
    if (pathname === "/archive") return;
    return afterIntroIdle(() => {
      if (!allowIdlePrefetch()) return;
      void Promise.all([
        import("@/components/BentoGallery"),
        warmArchiveGallery(),
      ]).then(([, data]) => {
        if (data.length) setItems(data);
        setHasShown(true);
      });
    }, pathname === "/" ? 7000 : 4000);
  }, [hasShown, pathname]);

  useEffect(() => {
    if (!hasShown) return;
    if (items.length) return;
    let cancelled = false;
    void warmArchiveGallery().then((data) => {
      if (!cancelled && data.length) setItems(data);
    });
    return () => {
      cancelled = true;
    };
  }, [items.length, hasShown]);

  return (
    <div
      data-primary-shell="archive"
      style={{ display: visible ? "block" : "none" }}
      aria-hidden={!visible}
      inert={!visible}
      {...(!visible ? { "data-nosnippet": true } : {})}
    >
      {hasShown ? <ArchiveKeepAlive items={items} visible={visible} /> : null}
    </div>
  );
}

const ArchiveKeepAlive = memo(function ArchiveKeepAlive({
  items,
  visible,
}: {
  items: PlaygroundGalleryItem[];
  visible: boolean;
}) {
  const { snap, epoch } = useTabArrival(visible);
  return (
    <ArchivePageClient
      items={items}
      visible={visible}
      snap={snap}
      enterEpoch={epoch}
    />
  );
}, (prev, next) => {
  if (!prev.visible && !next.visible) return true;
  return prev.visible === next.visible && prev.items === next.items;
});
