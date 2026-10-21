type Clip = {
  participant: string;
  segment: string;
  transcript: string;
};

export default function ClipCard({ clip }: { clip: Clip }) {
  return (
    <div className="dp-clip-card">
      <p className="dp-clip-card__who">{clip.participant}, {clip.segment}</p>
      <p className="dp-clip-card__text">{clip.transcript}</p>
    </div>
  );
}
