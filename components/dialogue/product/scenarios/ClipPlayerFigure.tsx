export default function ClipPlayerFigure() {
  return (
    <div className="dialogue-product-root">
      <div className="dp-player">
        <span className="dp-player__time">01:38</span>
      </div>
      <div className="dp-transcript">
        <p style={{ margin: "0 0 6px" }} className="dp-text-meta">Synced transcript</p>
        <p style={{ margin: 0 }}>Earlier they mentioned delivery dates felt like hidden fees.</p>
        <p className="dp-transcript__row--active" style={{ margin: "6px 0 0" }}>
          <strong>Jordan M.</strong> The apartment field kept clearing when I picked autocomplete.
        </p>
        <p style={{ margin: "6px 0 0" }}>I almost closed the tab before payment.</p>
      </div>
    </div>
  );
}
