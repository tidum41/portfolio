type Clip = {
  participant: string;
  segment: string;
  transcript: string;
};

export default function ClipCard({ clip }: { clip: Clip }) {
  return (
    <div className="dp-clip-card" data-annotate-part="clip-card">
      <p className="dp-clip-card__who">
        <span className="dp-clip-card__name">{clip.participant}</span>
        <span className="dp-clip-card__time">{clip.segment}</span>
      </p>
      <p className="dp-clip-card__text">{clip.transcript}</p>
    </div>
  );
}
