/**
 * Homepage project-card type labels → case-study pager kickers.
 * Source of truth is the same `label` getProjects() attaches to each card
 * (PROJECT_CARD_COPY / JOOLA_B2B_PROJECT / Sanity).
 */

/** Primary type phrase from a card label, or null if missing/ambiguous. */
export function cardTypeFromLabel(label?: string | null): string | null {
  if (!label) return null;
  const trimmed = label.trim();
  if (!trimmed) return null;

  // Card labels sometimes append secondary meta after a comma
  // ("Case study, Internship 2026") — keep the type phrase only.
  const primary = trimmed.split(/[,|·–—]/)[0]?.trim() ?? "";
  if (!primary) return null;

  // Ambiguous: too many words for a type chip, or looks like a sentence.
  const words = primary.split(/\s+/).filter(Boolean);
  if (words.length === 0 || words.length > 3) return null;

  return primary;
}

/** "Previous case study" / "Next community" / fallback "… project". */
export function pagerKicker(
  direction: "Previous" | "Next",
  cardLabel?: string | null,
): { kicker: string; usedFallback: boolean; cardType: string | null } {
  const cardType = cardTypeFromLabel(cardLabel);
  if (!cardType) {
    return {
      kicker: `${direction} project`,
      usedFallback: true,
      cardType: null,
    };
  }
  return {
    kicker: `${direction} ${cardType.toLowerCase()}`,
    usedFallback: false,
    cardType,
  };
}
