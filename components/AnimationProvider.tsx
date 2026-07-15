"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Module-level flag: true on the very first hard load, flipped to false after
// the component mounts. Resets to true on browser reload (JS module re-evaluates).
//
// On hard load: initial={false} → page content is visible immediately (no fade-in),
// so the hero text and PS3 pattern have their own moment before the gate lifts.
//
// On client-side navigation: _firstRender is already false → the motion.div's
// initial={{ opacity: 0, y: 8 }} fires normally for the enter/exit transition.
let _firstRender = true;

export default function AnimationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    _firstRender = false;
  }, []);

  return (
    <AnimatePresence mode="sync">
      <motion.div
        key={pathname}
        initial={_firstRender ? false : { opacity: 0, y: 8 }}
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
