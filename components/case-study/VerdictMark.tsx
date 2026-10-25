import { Check, Minus, X } from "@phosphor-icons/react/dist/ssr";

export type VerdictKind = "pro" | "con" | "right" | "wrong" | "neutral";

/**
 * Shared list/verdict mark for case studies (BruinLease, Dialogue).
 * Phosphor at 16px bold; color via CSS tokens through currentColor.
 */
export default function VerdictMark({ kind }: { kind: VerdictKind }) {
  const Icon = kind === "wrong" ? X : kind === "pro" || kind === "right" ? Check : Minus;
  return (
    <span className="cs-verdict-mark" data-kind={kind} aria-hidden>
      <Icon size={16} weight="bold" />
    </span>
  );
}
