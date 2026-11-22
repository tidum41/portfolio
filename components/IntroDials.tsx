"use client";
import { useEffect } from "react";
import { useDialKitController } from "dialkit";
import { introTimings } from "@/lib/introTimings";

export default function IntroDials() {
  const { values } = useDialKitController("Intro", {
    patternDuration: [introTimings.patternDuration, 0.3, 5.0] as [number, number, number],
    heroDelay:       [introTimings.heroDelay,       0.0, 2.0] as [number, number, number],
    heroDuration:    [introTimings.heroDuration,    0.1, 2.0] as [number, number, number],
    subDelay:        [introTimings.subDelay,        0.0, 3.0] as [number, number, number],
    gateDuration:    [introTimings.gateDuration,    0.3, 5.0] as [number, number, number],
    replayIntro:     { type: "action" as const, label: "Replay intro" },
  }, {
    onAction(action) {
      if (action !== "replayIntro") return;
      document.documentElement.setAttribute("data-intro", "playing");
      window.dispatchEvent(new CustomEvent("intro-replay", { detail: { ...introTimings } }));
    },
  });

  // Sync dial values → shared config so replay reads the current settings
  useEffect(() => {
    introTimings.patternDuration = values.patternDuration as number;
    introTimings.heroDelay       = values.heroDelay       as number;
    introTimings.heroDuration    = values.heroDuration    as number;
    introTimings.subDelay        = values.subDelay        as number;
    introTimings.gateDuration    = values.gateDuration    as number;
  }, [values.patternDuration, values.heroDelay, values.heroDuration, values.subDelay, values.gateDuration]);

  return null;
}
