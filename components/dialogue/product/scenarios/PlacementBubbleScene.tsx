"use client";

import { useLayoutEffect, useRef, useState } from "react";
import StudyPageChrome from "@/components/dialogue/product/StudyPageChrome";
import DialogueLauncherButton from "@/components/dialogue/product/DialogueLauncherButton";
import PlacementChatPreview from "@/components/dialogue/product/scenarios/PlacementChatPreview";
import { dialogueProductTokens } from "@/components/dialogue/product/tokens";
import {
  placementChatAnchorX,
  placementFitChatWidth,
  placementScaleForWidth,
  placementYOffsetFromFollowups,
} from "@/components/dialogue/product/scenarios/placementPhoneFit";

const SCENE_W = parseInt(dialogueProductTokens.space.appShellWidth, 10);
const SCENE_H = parseInt(dialogueProductTokens.space.appShellHeight, 10);
const CHAT_W = parseInt(dialogueProductTokens.space.placementChatWidth, 10);
const INSET = parseInt(dialogueProductTokens.space.placementInset, 10);
const LAUNCHER = dialogueProductTokens.space.placementLauncherSize;
const LAUNCHER_GAP = dialogueProductTokens.space.placementLauncherGap;

/**
 * One real-size 1280×748 scene (study + floating chat + launcher), scaled as a unit.
 * Same frame size as the docked placement scene.
 */
export default function PlacementBubbleScene() {
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
      setScale(next);
      const chatEl = layer.querySelector<HTMLElement>('[data-placement-chat="true"]');
      let x = placementChatAnchorX(w, sceneW, phone, next, chatEl);
      let y = Math.min(0, h - SCENE_H * next);
      if (phone) {
        const fromFollowups = placementYOffsetFromFollowups(layer, h, next, 16);
        if (fromFollowups !== null) y = fromFollowups;
      }
      setOffset({ x, y });
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

  const chatBottom = INSET + LAUNCHER + LAUNCHER_GAP;

  return (
    <div
      ref={layerRef}
      className="dialogue-product-root dp-placement-layer dp-placement-layer--scene"
      data-placement-mode="bubble"
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
            className="dp-placement-scene__chat"
            data-placement-chat="true"
            style={{ right: INSET, bottom: chatBottom }}
          >
            <PlacementChatPreview />
          </div>
          <div
            className="dp-placement-scene__launcher dp-bubble-launcher-inset"
            style={{ right: INSET, bottom: INSET }}
          >
            <DialogueLauncherButton size={LAUNCHER} />
          </div>
        </div>
      </div>
      <div
        className="dp-placement-scene__launcher dp-placement-frame-launcher"
        aria-hidden
      >
        <DialogueLauncherButton size={LAUNCHER} />
      </div>
    </div>
  );
}
