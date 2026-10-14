"use client";

import { forwardRef } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { JoolaB2B } from "@joola-remotion/JoolaB2B";
import type { FilmConfig } from "@joola-remotion/joola/film-config";

const ASSET_BASE = "/joola-b2b";

type Props = {
  filmConfig: FilmConfig;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
};

export const JoolaFilmPlayer = forwardRef<PlayerRef, Props>(function JoolaFilmPlayer(
  { filmConfig, durationInFrames, fps, width, height },
  ref,
) {
  return (
    <Player
      key={`player-${durationInFrames}`}
      ref={ref}
      component={JoolaB2B}
      inputProps={{ filmConfig, assetBase: ASSET_BASE }}
      durationInFrames={durationInFrames}
      compositionWidth={1920}
      compositionHeight={1440}
      fps={fps}
      style={{ width, height }}
      controls
      loop
      clickToPlay
      spaceKeyToPlayOrPause
      acknowledgeRemotionLicense
      overflowVisible={false}
    />
  );
});
