"use client";

import { motion, MotionConfig } from "framer-motion";
import { EASE } from "@/components/ui";

/** Transição de entrada entre rotas: slide horizontal 24px + fade. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.32, ease: EASE }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
