import type { CSSProperties, ReactNode } from "react";

/** Case study body copy: ~640px measure, full-column headings/images sit outside. */
export default function CaseStudyBody({
  children,
  style,
  as: Tag = "p",
}: {
  children: ReactNode;
  style?: CSSProperties;
  as?: "p" | "div";
}) {
  return (
    <Tag className="cs-prose" style={style}>
      {children}
    </Tag>
  );
}
