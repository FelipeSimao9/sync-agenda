"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, Clock, MapPin, Ticket, X } from "lucide-react";
import type { AgendaBlock } from "@/data/agenda";
import { EASE, SyncLogo } from "./ui";

type Props = {
  firstName: string;
  lastName: string;
  tickets: AgendaBlock[];
};

function hm(v: string) {
  return v.replace(":", "h");
}

/** Aba Ingressos: as trilhas escolhidas como ingressos para mostrar ao staff. */
export default function TicketsScreen({ firstName, lastName, tickets }: Props) {
  const [open, setOpen] = useState<AgendaBlock | null>(null);
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  return (
    <div className="flex min-h-dvh flex-col px-6 pb-36 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="flex justify-center pb-3"
      >
        <SyncLogo height={26} />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE, delay: 0.05 }}
        className="eyebrow"
      >
        Seus ingressos
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
        className="mt-1 text-[26px] font-bold leading-tight"
      >
        {tickets.length > 0
          ? "Mostre na entrada da sala."
          : "Sem trilhas neste ano."}
      </motion.h1>

      {tickets.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-3 text-[15px] leading-relaxed text-mist"
        >
          Você não se inscreveu em nenhuma trilha paralela. Os blocos da IA
          House são abertos a todos — não precisa de ingresso.
        </motion.p>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {tickets.map((t, i) => (
          <motion.button
            key={t.id}
            type="button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE, delay: 0.15 + i * 0.08 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setOpen(t)}
            className="relative overflow-hidden rounded-[26px] border border-lime/35 bg-white/[0.06] p-5 text-left backdrop-blur-xl"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.35)" }}
          >
            {/* recortes de ingresso */}
            <span className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-ink" />
            <span className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-ink" />

            <div className="flex items-center gap-2">
              <Ticket size={15} strokeWidth={1.75} className="text-lime" />
              <p className="eyebrow">
                Ingresso · {hm(t.start)}–{hm(t.end)}
              </p>
            </div>
            <p className="mt-2 text-[22px] font-bold uppercase leading-[0.98] text-cream">
              {t.shortTitle ?? t.title}
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-dashed border-white/20 pt-3">
              <span className="flex items-center gap-1.5 text-[14px] font-semibold text-lime">
                <MapPin size={15} strokeWidth={1.75} />
                {t.room}
              </span>
              <span className="text-[12px] text-mist">Toque para abrir</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* ingresso em tela cheia */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="ticket-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink-deep/95 px-6 backdrop-blur-xl"
            onClick={() => setOpen(null)}
          >
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setOpen(null)}
              aria-label="Fechar"
              className="absolute right-5 top-[max(1.25rem,env(safe-area-inset-top))] flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-cream"
            >
              <X size={18} strokeWidth={1.75} />
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.94 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[380px] overflow-hidden rounded-[30px] border border-lime/40 bg-ink"
              style={{ boxShadow: "0 30px 90px rgba(0,0,0,0.6)" }}
            >
              <div className="flex flex-col items-center px-7 pb-7 pt-8 text-center">
                <SyncLogo height={30} />
                <p className="eyebrow mt-5">Ingresso · Trilha paralela</p>
                <h2 className="mt-3 text-[30px] font-bold uppercase leading-[0.98] text-cream">
                  {open.title}
                </h2>
                <p className="tabular mt-3 flex items-center gap-1.5 text-[15px] text-mist">
                  <Clock size={15} strokeWidth={1.75} />
                  Sábado, 22 de agosto · {hm(open.start)}–{hm(open.end)}
                </p>
                <p className="mt-3 flex items-center gap-2 text-[22px] font-bold text-lime">
                  <MapPin size={22} strokeWidth={1.75} />
                  {open.room}
                </p>
              </div>

              {/* divisor perfurado */}
              <div className="relative flex items-center px-7">
                <span className="absolute -left-3 h-6 w-6 rounded-full bg-ink-deep" />
                <span className="h-0 w-full border-t border-dashed border-white/25" />
                <span className="absolute -right-3 h-6 w-6 rounded-full bg-ink-deep" />
              </div>

              <div className="flex flex-col items-center px-7 pb-8 pt-6 text-center">
                <p className="eyebrow">Participante</p>
                <p className="mt-1.5 text-[22px] font-bold text-cream">
                  {fullName || "Participante"}
                </p>
                <span className="mt-3 flex items-center gap-2 rounded-full bg-lime px-4 py-2 text-[14px] font-bold text-ink-deep">
                  <BadgeCheck size={17} strokeWidth={2} />
                  Presença confirmada
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
