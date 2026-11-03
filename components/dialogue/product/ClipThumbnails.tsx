import { PlayIcon } from "@/components/dialogue/product/icons";

const THUMBS = [
  { src: "/dev/dialogue-static/clip-photos/clip-01.jpg", time: "14:03", focal: false },
  { src: "/dev/dialogue-static/clip-photos/clip-02.jpg", time: "15:47", focal: true },
  { src: "/dev/dialogue-static/clip-photos/clip-05.jpg", time: "16:02", focal: false },
] as const;

type Props = {
  selectedTime?: string;
  /** Round N: a cherry play badge on each thumb (compare's chosen card). */
  playBadge?: boolean;
};

export default function ClipThumbnails({ selectedTime = "15:47", playBadge = false }: Props) {
  return (
    <div className="dp-clip-thumbs" aria-hidden data-annotate-part="clip-thumbs">
      {THUMBS.map((thumb) => {
        const selected = thumb.time === selectedTime;
        return (
        <div key={`${thumb.time}-${thumb.src}`} className="dp-clip-thumbs__item" data-annotate-part={`clip-thumb-${thumb.time.replace(":", "-")}`}>
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
            {playBadge ? (
              <span className="dp-clip-thumbs__play" aria-hidden>
                <PlayIcon className="dp-clip-thumbs__play-icon" />
              </span>
            ) : null}
          </div>
          <span className="dp-clip-thumbs__time">{thumb.time}</span>
        </div>
      );
      })}
    </div>
  );
}
