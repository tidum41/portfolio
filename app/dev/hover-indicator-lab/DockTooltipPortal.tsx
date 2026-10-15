"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import DockTooltipLayer from "./DockTooltipLayer";
import { computeAnchoredDockPosition } from "./dockPosition";
import type { CardKind, DockPlacementMode } from "./types";
import { useDockFollowPointer } from "./useDockFollowPointer";

type Props = {
  kind: CardKind;
  visible: boolean;
  leaving: boolean;
  placement: DockPlacementMode;
  anchorEl: HTMLElement | null;
  pointer: { x: number; y: number };
};

export default function DockTooltipPortal({
  kind,
  visible,
  leaving,
  placement,
  anchorEl,
  pointer,
}: Props) {
  const dockRef = useRef<HTMLDivElement>(null);
  const [anchored, setAnchored] = useState({ x: 0, y: 0, caretShiftX: 0, flipped: false });
  const [follow, setFollow] = useState({ x: 0, y: 0 });

  const measureDock = useCallback(() => dockRef.current?.getBoundingClientRect() ?? null, []);

  const { setPointer, snapPointer, stop: stopFollow } = useDockFollowPointer({
    enabled: placement === "cursor-follow" && visible && !leaving,
    onPosition: (x, y) => setFollow({ x, y }),
    measure: measureDock,
  });

  const remeasureAnchored = useCallback(() => {
    if (!anchorEl || !dockRef.current) return;
    const anchor = anchorEl.getBoundingClientRect();
    const dock = dockRef.current.getBoundingClientRect();
    if (dock.width < 1) {
      requestAnimationFrame(() => {
        if (!anchorEl || !dockRef.current) return;
        const d = dockRef.current.getBoundingClientRect();
        if (d.width < 1) return;
        const a = anchorEl.getBoundingClientRect();
        setAnchored(computeAnchoredDockPosition(a, { width: d.width, height: d.height }));
      });
      return;
    }
    setAnchored(computeAnchoredDockPosition(anchor, { width: dock.width, height: dock.height }));
  }, [anchorEl]);

  useLayoutEffect(() => {
    if (placement !== "anchored" || !visible) return;
    remeasureAnchored();
  }, [placement, visible, kind, remeasureAnchored]);

  useLayoutEffect(() => {
    if (placement !== "anchored" || !visible || !anchorEl) return;
    const ro = new ResizeObserver(() => remeasureAnchored());
    ro.observe(anchorEl);
    if (dockRef.current) ro.observe(dockRef.current);
    const onScroll = () => remeasureAnchored();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [placement, visible, anchorEl, remeasureAnchored]);

  useLayoutEffect(() => {
    if (placement !== "cursor-follow") return;
    if (visible && !leaving) {
      snapPointer(pointer.x, pointer.y);
      setPointer(pointer.x, pointer.y);
    } else {
      stopFollow();
    }
  }, [placement, visible, leaving, pointer.x, pointer.y, snapPointer, setPointer, stopFollow]);

  useLayoutEffect(() => {
    if (placement === "cursor-follow" && visible && !leaving) {
      setPointer(pointer.x, pointer.y);
    }
  }, [placement, pointer.x, pointer.y, setPointer, visible, leaving]);

  if (typeof document === "undefined") return null;

  const showCaret = placement === "anchored";
  const isAnchored = placement === "anchored";
  const x = isAnchored ? anchored.x : follow.x;
  const y = isAnchored ? anchored.y : follow.y;

  const portalVisible = visible || leaving;

  return createPortal(
    <div
      className="hilab-dock-portal"
      data-placement={placement}
      data-visible={portalVisible ? "true" : "false"}
      data-leaving={leaving ? "true" : "false"}
      style={{
        transform: `translate3d(${x}px, ${y}px, 0)`,
        ...(showCaret ? { ["--hilab-caret-shift" as string]: `${anchored.caretShiftX}px` } : {}),
        ...(anchored.flipped ? { ["--hilab-dock-flipped" as string]: "1" } : {}),
      }}
    >
      <div ref={dockRef}>
        <DockTooltipLayer
          kind={kind}
          visible={visible && !leaving}
          showCaret={showCaret}
          placement={placement}
          flipped={isAnchored && anchored.flipped}
        />
      </div>
    </div>,
    document.body,
  );
}
