interface MetaItem {
  label: string;
  value: string;
}

interface CaseStudyHeroProps {
  title: string;
  subtitle: string;
  label: string;
  meta?: MetaItem[];
  heroBg?: string;
  heroContent?: React.ReactNode;
}

export default function CaseStudyHero({
  title,
  subtitle,
  label,
  meta = [],
  heroBg = "var(--color-border)",
  heroContent,
}: CaseStudyHeroProps) {
  return (
    <header className="mb-12 md:mb-16">
      {/* Label */}
      <p className="label-caps mb-3">{label}</p>

      {/* Title */}
      <h1 className="text-5xl font-medium tracking-tight text-text mb-4 max-w-[18ch]">
        {title}
      </h1>

      {/* Subtitle */}
      <p className="text-base text-muted max-w-prose mb-8">{subtitle}</p>

      {/* Meta row */}
      {meta.length > 0 && (
        <dl className="flex flex-wrap gap-x-10 gap-y-3 mb-10">
          {meta.map(({ label: metaLabel, value }) => (
            <div key={metaLabel} className="flex flex-col gap-1">
              <dt className="label-caps">{metaLabel}</dt>
              <dd className="text-sm text-muted">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* Hero visual */}
      <div
        className="w-full rounded-lg overflow-hidden flex items-center justify-center"
        style={{ background: heroBg, minHeight: 360 }}
      >
        {heroContent}
      </div>
    </header>
  );
}
