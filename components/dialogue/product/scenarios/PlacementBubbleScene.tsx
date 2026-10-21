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

/**
 * One real-size 1280×748 scene (study + floating chat + launcher), scaled as a unit.
 * Narrow viewports crop to the right half (popup + page edge), no separate chat layout.
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

      const cropRight = w < 600;
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
    return () => ro.disconnect();
  }, []);

  const { scale, cropRight, frameW, frameH } = layout;
  const chatBottom = INSET + LAUNCHER + LAUNCHER_GAP;

  return (
    <div
      ref={layerRef}
      className="dialogue-product-root dp-placement-layer dp-placement-layer--bubble"
    >
      <div
        className={[
          "dp-placement-viewport",
          cropRight ? "dp-placement-viewport--crop-right" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div
          className="dp-placement-viewport__frame"
          style={{ width: frameW, height: frameH }}
        >
          <div
            className="dp-placement-scene"
            data-placement-scene="true"
            style={{
              width: SCENE_W,
              height: SCENE_H,
              zoom: scale,
              marginLeft: cropRight ? -(SCENE_W / 2) : 0,
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
    </div>
  );
}
