"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

// Provides page enter/exit animations keyed by route.
// Lives in layout.tsx (persistent) so AnimatePresence survives navigations.
// template.tsx is kept as a passthrough for Next.js scroll-reset behaviour.
export default function AnimationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="sync" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, transition: { duration: 0.12, ease: [0.4, 0, 1, 1] } }}
        transition={{
          opacity: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
          y:       { duration: 0.36, ease: [0.22, 1, 0.36, 1] },
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
