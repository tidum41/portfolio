import { ChevronDownIcon } from "@/components/dialogue/product/icons";

type Props = { searched: number; found: number; expanded?: boolean; foundLabel?: string };

export default function QuerySearchStep({ searched, found, foundLabel = "relevant moments" }: Props) {
  return (
    <div className="dp-search-step-wrap" data-testid="query-search-step" data-annotate-part="search-step">
      {/* Decorative in product figures — not a real control. */}
      <div className="dp-search-step" role="text">
        <span className="dp-search-step__text">
          Searched {searched} interviews
          <span className="dp-search-step__found">, found {found} {foundLabel}</span>
        </span>
        <ChevronDownIcon className="dp-search-step__chevron" />
      </div>
    </div>
  );
}
