const THUMBS = [
  { src: "/dev/dialogue-static/clip-photos/still-thumb-3.jpg", time: "14:03", focal: false },
  { src: "/dev/dialogue-static/clip-photos/still-thumb-2.jpg", time: "15:47", focal: true },
  { src: "/dev/dialogue-static/clip-photos/still-thumb-2.jpg", time: "16:02", focal: false },
] as const;

type Props = {
  selectedTime?: string;
};

export default function ClipThumbnails({ selectedTime = "15:47" }: Props) {
  return (
    <div className="dp-clip-thumbs" aria-hidden>
      {THUMBS.map((thumb) => {
        const selected = thumb.time === selectedTime;
        return (
        <div key={`${thumb.time}-${thumb.src}`} className="dp-clip-thumbs__item">
          <div
            className={[
              "dp-clip-thumbs__frame",
              selected ? "dp-clip-thumbs__frame--focal" : "",
            ].join(" ")}
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
      );
      })}
    </div>
  );
}
