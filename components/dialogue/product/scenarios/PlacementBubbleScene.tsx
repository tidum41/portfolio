"use client";

import { useLayoutEffect, useRef, useState } from "react";
import StudyPageChrome from "@/components/dialogue/product/StudyPageChrome";
import PlacementChatPreview from "@/components/dialogue/product/scenarios/PlacementChatPreview";
import { dialogueProductTokens } from "@/components/dialogue/product/tokens";

const SCENE_W = parseInt(dialogueProductTokens.space.appShellWidth, 10);
const SCENE_H = parseInt(dialogueProductTokens.space.appShellHeight, 10);
const CHAT_W = parseInt(dialogueProductTokens.space.placementChatWidth, 10);
const INSET = parseInt(dialogueProductTokens.space.placementInset, 10);
const LAUNCHER = dialogueProductTokens.space.placementLauncherSize;
const LAUNCHER_GAP = dialogueProductTokens.space.placementLauncherGap;
const CROP_VIEWPORT_MAX = 599;
const MOBILE_SCENE_CROP_W = 420;
const CROP_PAD_TOP = 12;
const BODY_PX = 16;
const MIN_RENDER_BODY_PX = 9;

type CropWindow = { minX: number; minY: number; width: number; height: number };

function elementTopInScene(chatTop: number, el: HTMLElement | null) {
  if (!el) return chatTop;
  return chatTop + el.offsetTop;
}

/**
 * One real-size 1280×748 scene (study + floating chat + launcher), scaled as a unit.
 */
export default function PlacementBubbleScene() {
  const layerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [cropRight, setCropRight] = useState(false);
  const [cropWindow, setCropWindow] = useState<CropWindow>({
    minX: SCENE_W / 2,
    minY: 0,
    width: SCENE_W / 2,
    height: SCENE_H,
  });

  useLayoutEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const fit = () => {
      const w = layer.clientWidth;
      const h = layer.clientHeight;
      if (w < 1 || h < 1) return;

      const crop = window.matchMedia(`(max-width: ${CROP_VIEWPORT_MAX}px)`).matches;
      setCropRight(crop);

      if (!crop) {
        setCropWindow({ minX: 0, minY: 0, width: SCENE_W, height: SCENE_H });
        setScale(Math.min(w / SCENE_W, h / SCENE_H));
        return;
      }

      const chatPanel = sceneRef.current?.querySelector(".dp-study-chat") as HTMLElement | null;
      const chatBottomInset = INSET + LAUNCHER + LAUNCHER_GAP;
      const chatH = chatPanel?.offsetHeight ?? 0;
      const chatHGuess = SCENE_H - chatBottomInset - 48;
      const effectiveChatH = chatH > 80 ? chatH : chatHGuess;
      const chatTop = SCENE_H - chatBottomInset - effectiveChatH;

      const minX = SCENE_W - MOBILE_SCENE_CROP_W;
      const winW = MOBILE_SCENE_CROP_W;
      let scaleW = w / winW;

      const head = chatPanel?.querySelector(".dp-study-chat__head") as HTMLElement | null;
      const minY = Math.max(0, elementTopInScene(chatTop, head) - CROP_PAD_TOP);
      const maxY = SCENE_H;
      const winH = maxY - minY;

      const minScaleForType = MIN_RENDER_BODY_PX / BODY_PX;
      if (scaleW < minScaleForType) {
        scaleW = minScaleForType;
      }

      setCropWindow({ minX, minY, width: winW, height: winH });
      setScale(scaleW);
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(layer);
    const scene = sceneRef.current;
    if (scene) ro.observe(scene);
    window.addEventListener("resize", fit);
    const raf = requestAnimationFrame(() => {
      fit();
      requestAnimationFrame(fit);
    });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);

  const chatBottom = INSET + LAUNCHER + LAUNCHER_GAP;
  const { minX, minY, width: winW, height: winH } = cropWindow;
  const sceneLeft = cropRight ? -minX * scale : 0;
  const sceneTop = cropRight ? -minY * scale : 0;
  const layerStyle =
    cropRight && winH > 0
      ? ({ aspectRatio: `${winW} / ${winH}` } as const)
      : undefined;

  return (
    <div
      ref={layerRef}
      className="dialogue-product-root dp-placement-layer dp-placement-layer--bubble"
      data-placement-crop={cropRight ? "right" : "full"}
      data-placement-crop-width={cropRight ? MOBILE_SCENE_CROP_W : SCENE_W}
      style={layerStyle}
    >
      <div className="dp-placement-viewport">
        <div
          ref={sceneRef}
          className="dp-placement-scene"
          data-placement-scene="true"
          data-placement-crop={cropRight ? "right" : "full"}
          style={{
            width: SCENE_W,
            height: SCENE_H,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            left: sceneLeft,
            top: sceneTop,
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
            aria-hidden
            title="Collapsed launcher"
            style={{ width: LAUNCHER, height: LAUNCHER, right: INSET, bottom: INSET }}
          >
            ◐
          </div>
        </div>
      </div>
    </div>
  );
}
