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

/**
 * One real-size 1280×748 scene (study + floating chat + launcher), scaled as a unit.
 * Wide viewport: full scene. Narrow viewport (&lt;600): crop to right half of scene.
 */
export default function PlacementBubbleScene() {
  const layerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState({
    scale: 0.35,
    cropRight: false,
    frameW: SCENE_W * 0.35,
    frameH: SCENE_H * 0.35,
  });

  useLayoutEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const fit = () => {
      const w = layer.clientWidth;
      const h = layer.clientHeight;
      if (w < 1 || h < 1) return;

      const cropRight = window.innerWidth <= CROP_VIEWPORT_MAX;
      const visibleSceneW = cropRight ? SCENE_W / 2 : SCENE_W;
      const scale = Math.min(w / visibleSceneW, h / SCENE_H);
      setLayout({
        scale,
        cropRight,
        frameW: visibleSceneW * scale,
        frameH: SCENE_H * scale,
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

  const { scale, cropRight, frameW, frameH } = layout;
  const chatBottom = INSET + LAUNCHER + LAUNCHER_GAP;

  return (
    <div
      ref={layerRef}
      className="dialogue-product-root dp-placement-layer dp-placement-layer--bubble"
    >
      <div className="dp-placement-viewport">
        <div
          className="dp-placement-viewport__frame"
          style={{ width: frameW, height: frameH }}
        >
          <div
            className="dp-placement-scene"
            data-placement-scene="true"
            data-placement-crop={cropRight ? "right" : "full"}
            style={{
              width: SCENE_W,
              height: SCENE_H,
              transform: `scale(${scale})`,
              transformOrigin: cropRight ? "top right" : "top left",
              right: cropRight ? 0 : undefined,
              left: cropRight ? undefined : 0,
            }}
          >
            <div className="dp-placement-scene__study">
              <StudyPageChrome />
            </div>
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
    </div>
  );
}
