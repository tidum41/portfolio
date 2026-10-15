import { isCaseStudyHref } from "@/lib/caseStudyNav";

function isExternalHref(href: string): boolean {
  return /^(https?:|mailto:|tel:)/i.test(href);
}

/** Sentence-case pill copy for a homepage project card. */
export function projectHoverLabel(input: {
  href?: string;
  caseStudy?: boolean;
  popup?: boolean;
}): string {
  if (input.popup) return "Demo";
  const href = input.href ?? "";
  const external = isExternalHref(href);
  const caseStudy =
    typeof input.caseStudy === "boolean"
      ? input.caseStudy
      : !external && isCaseStudyHref(href);
  if (caseStudy && external) return "Case study · Demo";
  if (external) return "Demo";
  if (caseStudy) return "Case study";
  return "Demo";
}
