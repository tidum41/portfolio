import Image from "next/image";

/**
 * One screen in a gray well, with numbered markers in a gutter on its left and a legend
 * below. Marker positions are measured from the capture (percent of the image height).
 * An optional phone capture replaces the wide one under 768px, with its own positions,
 * so the screen stays readable instead of shrinking to a strip.
 */

export type Annotation = { n: number; at: number; text: string };

type Shot = { src: string; width: number; height: number };

type Props = Shot & {
  alt: string;
  notes: readonly Annotation[];
  /** Phone capture and its marker positions (by note number). */
  phone?: Shot & { at: Readonly<Record<number, number>> };
  caption?: string;
  className?: string;
};

function ShotWithMarkers({ shot, alt, marks, className, sizes }: { shot: Shot; alt: string; marks: readonly { n: number; at: number }[]; className: string; sizes: string }) {
  return (
    <div className={`jo-annot__shot ${className}`}>
      <Image src={shot.src} alt={alt} width={shot.width} height={shot.height} sizes={sizes} style={{ width: "100%", height: "auto", display: "block" }} />
      {marks.map((a) => (
        <span key={a.n} className="jo-marker jo-annot__marker" style={{ top: `${a.at}%` }} aria-hidden="true">{a.n}</span>
      ))}
    </div>
  );
}

export default function AnnotatedFigure({ src, width, height, alt, notes, phone, caption, className }: Props) {
  return (
    <figure className={`cs-figure jo-annot${phone ? " jo-annot--phone" : ""}${className ? ` ${className}` : ""}`}>
      <div className="jo-annot__well">
        <ShotWithMarkers shot={{ src, width, height }} alt={alt} marks={notes} className="jo-annot__shot--wide" sizes="(max-width: 767px) 100vw, 648px" />
        {phone ? (
          <ShotWithMarkers
            shot={phone}
            alt={alt}
            marks={notes.map((a) => ({ n: a.n, at: phone.at[a.n] ?? a.at }))}
            className="jo-annot__shot--phone"
            sizes="100vw"
          />
        ) : null}
      </div>
      <ol className="jo-annot__legend jo-callouts--sm">
        {notes.map((a) => (
          <li key={a.n}><span className="jo-marker jo-marker--inline" aria-hidden="true">{a.n}</span><span>{a.text}</span></li>
        ))}
      </ol>
      {caption ? <figcaption className="cs-figcaption">{caption}</figcaption> : null}
    </figure>
  );
}
