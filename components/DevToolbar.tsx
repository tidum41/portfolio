"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Agentation } from "agentation";
import { DialRoot, useDialKit } from "dialkit";
import LayoutDials from "./LayoutDials";
import IntroDials from "./IntroDials";
import CaseStudyAlignDials from "./CaseStudyAlignDials";
import { RulerModeOverlay } from "./ruler-mode";

function RulerDials() {
  const dk = useDialKit("Dev Tools", {
    rulerMode: true,
  });
  if (!dk.rulerMode) return null;
  return <RulerModeOverlay appearance="dark" />;
}

function DialKitDragInjector() {
  useEffect(() => {
    let isDragging = false;
    let startX = 0, startY = 0;
    let currentX = 0, currentY = 0;
    let panel: HTMLElement | null = null;

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      panel = target.closest(".dialkit-panel-inner") as HTMLElement;
      if (!panel) return;
      
      // Ignore if clicking interactive controls inside the panel
      if (target.closest("input, button, select, [role='slider'], .dialkit-slider")) return;

      isDragging = true;
      // Get the existing transform if any
      const transform = panel.style.transform;
      if (transform && transform.includes("translate")) {
        const match = transform.match(/translate\(([^px]+)px,\s*([^px]+)px\)/);
        if (match) {
          currentX = parseFloat(match[1]);
          currentY = parseFloat(match[2]);
        }
      }
      
      startX = e.clientX - currentX;
      startY = e.clientY - currentY;
      document.body.style.userSelect = "none";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !panel) return;
      currentX = e.clientX - startX;
      currentY = e.clientY - startY;
      panel.style.transform = `translate(${currentX}px, ${currentY}px)`;
    };

    const onMouseUp = () => {
      isDragging = false;
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  return null;
}


export default function DevToolbar() {
  const [show, setShow] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Hide if: embedded in iframe, or on the /dev route
    if (window.self !== window.top) return;
    if (pathname.startsWith("/dev")) return;
    setShow(true);
  }, [pathname]);

  if (!show) return null;
  return (
    <>
      <RulerDials />
      <Agentation />
      <LayoutDials />
      <IntroDials />
      <CaseStudyAlignDials />
      <DialRoot defaultOpen={false} />
      <DialKitDragInjector />
    </>
  );
}
