import SyncedTranscript from "@/components/dialogue/product/SyncedTranscript";

export default function ClipPlayerFigure() {
  return (
    <div className="dialogue-product-root dp-chat-panel-typography">
      <div className="dp-player" data-export-clip-player="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="dp-player__still"
          src="/dev/dialogue-static/clip-photos/still-player.jpg"
          alt=""
          decoding="async"
        />
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
