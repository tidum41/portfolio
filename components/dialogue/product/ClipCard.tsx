import { ArrowUpRightIcon, WaveformIcon } from "@/components/dialogue/product/icons";

type Clip = {
  participant: string;
  segment: string;
  transcript: string;
};

/** A quote card: the waveform icon and timecode up top, the excerpt, and a
    view session action into the full interview (direction A rebuild). */
export default function ClipCard({ clip }: { clip: Clip }) {
  return (
    <div className="dp-clip-card" data-annotate-part="clip-card">
      <p className="dp-clip-card__who">
        <WaveformIcon className="dp-clip-card__wave" />
        <span className="dp-clip-card__name">{clip.participant}</span>
        <span className="dp-clip-card__time">{clip.segment}</span>
      </p>
      <p className="dp-clip-card__text">{clip.transcript}</p>
      <p className="dp-clip-card__actions">
        <span className="dp-clip-card__session">
          View session
          <ArrowUpRightIcon className="dp-clip-card__session-icon" />
        </span>
      </p>
    </div>
  );
}
