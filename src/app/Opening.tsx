"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import LivingBackground from "@/components/LivingBackground";
import { EASE, PrimaryButton, SafeImg } from "@/components/ui";

export default function Opening({ autoAdvance }: { autoAdvance: boolean }) {
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/entrar");
    router.prefetch("/dia");
    if (autoAdvance) {
      const t = setTimeout(() => router.replace("/dia"), 1100);
      return () => clearTimeout(t);
    }
  }, [autoAdvance, router]);

  return (
    <main className="relative mx-auto flex h-dvh max-w-[480px] flex-col items-center justify-center px-8">
      <LivingBackground intensity="high" />

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <SafeImg
          src="/brand/icon-sync.svg"
          alt="Sync"
          className="w-[280px] max-w-[70vw] object-contain"
          fallback={
            <span className="text-[48px] font-bold lowercase tracking-tight text-lime">
              sync
            </span>
          }
        />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.25 }}
        className="mt-6 max-w-[260px] text-center text-[16px] leading-snug text-cream"
      >
        Conferência Universitária de Empreendedorismo
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.35 }}
        className="mt-2 text-[13px] text-mist"
      >
        22 de agosto · iFood HQ
      </motion.p>

      {!autoAdvance && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.5 }}
          className="absolute inset-x-8 bottom-[max(2.5rem,env(safe-area-inset-bottom))]"
        >
          <PrimaryButton onClick={() => router.push("/entrar")}>
            Entrar
          </PrimaryButton>
        </motion.div>
      )}
    </main>
  );
}
