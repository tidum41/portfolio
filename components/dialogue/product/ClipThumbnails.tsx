const THUMBS = [
  { src: "/dev/dialogue-static/clip-photos/still-thumb-3.jpg", time: "14:03", focal: true },
  { src: "/dev/dialogue-static/clip-photos/still-thumb-2.jpg", time: "15:47", focal: false },
  { src: "/dev/dialogue-static/clip-photos/still-thumb-2.jpg", time: "16:02", focal: false },
] as const;

export default function ClipThumbnails() {
  return (
    <div className="dp-clip-thumbs">
      {THUMBS.map((thumb) => (
        <div key={`${thumb.time}-${thumb.src}`} className="dp-clip-thumbs__item">
          <div
            className={`dp-clip-thumbs__frame${thumb.focal ? " dp-clip-thumbs__frame--focal" : ""}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumb.src}
              alt=""
              className="dp-clip-thumbs__img"
              loading="eager"
              decoding="sync"
            />
          </div>
          <span className="dp-clip-thumbs__time">{thumb.time}</span>
        </div>
      ))}
    </div>
  );
}
