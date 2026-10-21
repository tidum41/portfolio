import SyncedTranscript from "@/components/dialogue/product/SyncedTranscript";

const STILL_SRC = "/dev/dialogue-static/clip-photos/still-player.jpg";

export default function ClipPlayerFigure() {
  return (
    <div className="dialogue-product-root dp-chat-panel-typography">
      <div className="dp-player" data-export-clip-player="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="dp-player__still"
          src={STILL_SRC}
          alt=""
          decoding="async"
        />
        {/*
          Face-only privacy: clipped heavy blur of the same still.
          Room stays sharp; person is not identifiable. Do not ship an unblurred face crop.
        */}
        <span className="dp-player__face-privacy" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="dp-player__face-privacy-img" src={STILL_SRC} alt="" decoding="async" />
        </span>
        <div className="dp-player__scrim" aria-hidden />
        <div className="dp-player__play" aria-hidden>
          <span className="dp-player__play-icon" />
        </div>
        <span className="dp-player__time">01:38</span>
      </div>
      <SyncedTranscript />
    </div>
  );
}
