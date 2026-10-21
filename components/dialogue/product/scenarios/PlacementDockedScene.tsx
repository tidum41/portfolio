"use client";

import { useLayoutEffect, useRef, useState } from "react";
import StudyPageChrome from "@/components/dialogue/product/StudyPageChrome";
import PlacementChatPreview from "@/components/dialogue/product/scenarios/PlacementChatPreview";
import { dialogueProductTokens } from "@/components/dialogue/product/tokens";
import {
  placementChatAnchorX,
  placementFitChatWidth,
  placementScaleForWidth,
} from "@/components/dialogue/product/scenarios/placementPhoneFit";

const SCENE_W = parseInt(dialogueProductTokens.space.appShellWidth, 10);
const SCENE_H = parseInt(dialogueProductTokens.space.appShellHeight, 10);
const CHAT_W = parseInt(dialogueProductTokens.space.placementChatWidth, 10);

/**
 * Same 1280×748 study page as the floating option, with the chat docked as a
 * right-hand panel (not a squeezed floating card).
 */
export default function PlacementDockedScene() {
  const layerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useLayoutEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const fit = () => {
      const viewport = layer.querySelector(".dp-placement-viewport");
      const w = viewport?.clientWidth ?? layer.clientWidth;
      const h = viewport?.clientHeight ?? layer.clientHeight;
      if (w < 1 || h < 1) return;
      const phone = window.matchMedia("(max-width: 480px)").matches;
      const next = placementScaleForWidth(w, phone);
      placementFitChatWidth(layer, w, phone, next);
      const sceneW = SCENE_W * next;
      const funnel = layer.querySelector(".dp-funnel");
      let y = 0;
      if (funnel instanceof HTMLElement) {
        let top = 0;
        let node: HTMLElement | null = funnel;
        while (node && node !== layer) {
          top += node.offsetTop;
          node = node.offsetParent instanceof HTMLElement ? node.offsetParent : null;
        }
        const bottom = top + funnel.offsetHeight;
        y = Math.min(0, h - (bottom * next + 16));
      }
      setScale(next);
      const chatEl = layer.querySelector<HTMLElement>('[data-placement-chat="true"]');
      setOffset({ x: placementChatAnchorX(w, sceneW, phone, next, chatEl), y });
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(layer);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);

  return (
    <div
      ref={layerRef}
      className="dialogue-product-root dp-placement-layer dp-placement-layer--scene"
      data-placement-mode="docked"
    >
      <div className="dp-placement-viewport">
        <div
          className="dp-placement-scene"
          data-placement-scene="true"
          style={{
            width: SCENE_W,
            height: SCENE_H,
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <StudyPageChrome />
          <div
            className="dp-placement-scene__dock"
            data-placement-chat="true"
          >
            <PlacementChatPreview />
          </div>
        </div>
      </div>
    </div>
  );
}
