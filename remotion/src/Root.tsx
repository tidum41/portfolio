import { Composition } from "remotion";
import { JoolaB2B, JOOLA_DURATION, JOOLA_FPS } from "./JoolaB2B";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="JoolaB2B"
        component={JoolaB2B}
        durationInFrames={JOOLA_DURATION}
        fps={JOOLA_FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
