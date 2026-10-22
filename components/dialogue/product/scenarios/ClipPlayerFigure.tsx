import SyncedTranscript from "@/components/dialogue/product/SyncedTranscript";

/** Raw interview still; light frame blur with a heavier mask on the face. */
const STILL_SRC = "/dev/dialogue-static/clip-photos/still-player-room.jpg";

export default function ClipPlayerFigure() {
  return (
    <div className="dialogue-product-root dp-chat-panel-typography">
      <div className="dp-player dp-player--casestudy" data-export-clip-player="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="dp-player__still" src={STILL_SRC} alt="" decoding="async" />
        <div className="dp-player__face-mask" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="dp-player__face-mask-img" src={STILL_SRC} alt="" decoding="async" />
        </div>
        <div className="dp-player__scrim" aria-hidden />
        <div className="dp-player__play" aria-hidden>
          <span className="dp-player__play-icon" />
        </div>
      </div>
      <SyncedTranscript />
    </div>
  );
}
