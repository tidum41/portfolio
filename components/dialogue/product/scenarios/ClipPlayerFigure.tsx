import SyncedTranscript from "@/components/dialogue/product/SyncedTranscript";

const STILL_SRC = "/dev/dialogue-static/clip-photos/call-frame-player.jpg";

export default function ClipPlayerFigure() {
  return (
    <div className="dialogue-product-root dp-chat-panel-typography">
      <div className="dp-player dp-player--casestudy" data-export-clip-player="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="dp-player__still" src={STILL_SRC} alt="" decoding="async" />
        <div className="dp-player__webcam-tile" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="dp-player__webcam-tile-img" src={STILL_SRC} alt="" decoding="async" />
        </div>
        <div className="dp-player__play" aria-hidden>
          <span className="dp-player__play-icon" />
        </div>
        <span className="dp-player__time">01:38</span>
        <div className="dp-player__chrome" aria-hidden>
          <span />
          <span className="dp-player__viewer" aria-hidden>
            <span className="dp-player__viewer-icon" />
          </span>
        </div>
      </div>
      <SyncedTranscript />
    </div>
  );
}
