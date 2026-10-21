import { ChevronDownIcon } from "@/components/dialogue/product/icons";
import { dialogueCopy } from "@/components/dialogue/product/tokens";

type Props = { searched: number; found: number; expanded?: boolean };

export default function QuerySearchStep({ searched, found }: Props) {
  return (
    <div className="dp-search-step-wrap" data-testid="query-search-step">
      <button type="button" className="dp-search-step">
        <span className="dp-search-step__text">
          {dialogueCopy.searchStep(searched, found)}
        </span>
        <ChevronDownIcon className="dp-search-step__chevron" />
      </button>
    </div>
  );
}
