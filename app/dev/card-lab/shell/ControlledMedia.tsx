/**
 * Single controlled placeholder for every card-lab media slot.
 * Source: Bruinlease Mux poster (playback gEJdc76…), saved locally so no
 * video loads. Aspect matches the live homepage work-grid card (1.2 / 1).
 */
export const CONTROLLED_MEDIA_SRC = "/dev/card-lab/placeholder.jpg";
/** Live homepage `.project-img-wrap` aspect for Bruinlease. */
export const CONTROLLED_ASPECT = "1.2 / 1";
export const CONTROLLED_MEDIA_SOURCE =
  "Mux thumbnail · Bruinlease · image.mux.com/gEJdc76IbGz8NzGfdRM7v00biDmwgACII24guyZ01tbVU/thumbnail.jpg?time=1&width=1280";

export default function ControlledMedia({
  aspect = CONTROLLED_ASPECT,
  radius,
  className,
  dimmed = false,
  play = false,
  fill = false,
  topClear = 0,
}: {
  aspect?: string;
  radius?: number;
  className?: string;
  dimmed?: boolean;
  play?: boolean;
  fill?: boolean;
  topClear?: number;
  /** Ignored — kept so call sites can stay stable after the wireframe swap. */
  kind?: string;
  colored?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={`cl-media${className ? ` ${className}` : ""}${dimmed ? " cl-media--dimmed" : ""}${play ? " cl-media--play" : ""}${fill ? " cl-media--fill" : ""}${topClear > 0 ? " cl-media--top-clear" : ""}`}
      data-cl-media
      data-cl-controlled="1"
      data-cl-aspect={fill ? "fill" : aspect}
      style={{
        aspectRatio: fill ? undefined : aspect,
        borderRadius: radius !== undefined ? `${radius}px` : undefined,
        ["--cl-media-top-clear" as string]:
          topClear > 0 ? `${topClear}px` : undefined,
      }}
    >
      {topClear > 0 ? (
        <div className="cl-media__clear" data-cl-media-clear aria-hidden="true" />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="cl-media__img"
        src={CONTROLLED_MEDIA_SRC}
        alt=""
        data-cl-controlled-img
        decoding="async"
        draggable={false}
      />
      {dimmed ? <span className="cl-media__veil" aria-hidden="true" /> : null}
      {play ? <span className="cl-media__shimmer" aria-hidden="true" /> : null}
    </div>
  );
}
