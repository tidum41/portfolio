type Props = {
  headline: string;
  detail?: string;
};

export default function CoverageCallout({ headline, detail }: Props) {
  return (
    <div className="dp-coverage-callout">
      <p className="dp-coverage-callout__headline">{headline}</p>
      {detail ? <p className="dp-coverage-callout__detail">{detail}</p> : null}
    </div>
  );
}
