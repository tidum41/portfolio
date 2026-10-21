type Props = { searched: number; found: number; expanded?: boolean };

export default function QuerySearchStep({ searched, found }: Props) {
  return (
    <div className="dp-search-step">
      <span>
        Searched <strong>{searched}</strong> interviews, found <strong>{found}</strong> relevant moments
      </span>
      <span aria-hidden>▾</span>
    </div>
  );
}
