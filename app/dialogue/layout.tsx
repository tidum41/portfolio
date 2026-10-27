import type { ReactNode } from "react";

/** Case-study chrome uses the site fonts. DM Sans and Zilla Slab live only
    on .dialogue-product-root, applied by the product figures themselves. */
export default function DialogueLayout({ children }: { children: ReactNode }) {
  return <div className="dialogue-case-study-root">{children}</div>;
}
