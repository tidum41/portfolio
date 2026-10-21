"use client";

import { useLayoutEffect, useRef, useState } from "react";
import StudyPageChrome from "@/components/dialogue/product/StudyPageChrome";
import DialogueLauncherButton from "@/components/dialogue/product/DialogueLauncherButton";
import PlacementChatPreview from "@/components/dialogue/product/scenarios/PlacementChatPreview";
import { dialogueProductTokens } from "@/components/dialogue/product/tokens";

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
      const w = layer.clientWidth;
      const h = layer.clientHeight;
      if (w < 1 || h < 1) return;
      const phone = window.innerWidth < 480;
      const floor = phone ? Math.max(0.85, 11 / 12) : 0.94;
      const next = Math.min(1, Math.max(floor, w / CHAT_W));
      setScale(next);
      setOffset({
        x: Math.min(0, w - SCENE_W * next),
        y: Math.min(0, h - SCENE_H * next),
      });
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
            style={{ width: CHAT_W, right: INSET, bottom: chatBottom }}
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
    </div>
  );
}
