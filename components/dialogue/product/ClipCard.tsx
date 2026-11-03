import { WaveformIcon } from "@/components/dialogue/product/icons";
import PlayButton from "@/components/dialogue/product/PlayButton";

type Clip = {
  participant: string;
  segment: string;
  transcript: string;
};

/** A response row: waveform icon, name and timecode on one baseline, the
    excerpt, and a play affordance that plays the clip inline (round N).
    There is no "View session" link anymore. */
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
        <PlayButton label={`Play ${clip.participant}'s clip`} />
      </p>
    </div>
  );
}
