export default function PlaceholderMedia({
  aspect,
  mediaIndex,
  radius,
  className,
}: {
  aspect: string;
  mediaIndex: number;
  radius?: number;
  className?: string;
}) {
  return (
    <div
      className={`card-lab__media card-lab__media--${mediaIndex}${className ? ` ${className}` : ""}`}
      data-cl-media
      data-cl-aspect={aspect}
      style={{
        aspectRatio: aspect,
        borderRadius: radius !== undefined ? `${radius}px` : undefined,
      }}
    >
      <span className="card-lab__media-mark" aria-hidden="true" />
    </div>
  );
}
