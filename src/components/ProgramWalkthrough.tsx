"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, MapPin, X } from "lucide-react";
import {
  effEnd,
  effId,
  effStart,
  type EffectiveBlock,
} from "@/lib/time";
import Avatar from "./Avatar";
import { MenuArea } from "./NowScreen";
import { EASE, PrimaryButton, SyncLogo } from "./ui";

type Props = {
  blocks: EffectiveBlock[];
  onClose: () => void;
};

function hm(v: string) {
  return v.replace(":", "h");
}

/**
 * "Ver programação": o cronograma do dia, uma tela cheia por bloco,
 * navegado com Próximo/Voltar — para o participante se programar.
 */
export default function ProgramWalkthrough({ blocks, onClose }: Props) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const eff = blocks[index];
  const last = index === blocks.length - 1;
  const block = eff.kind === "block" ? eff.block : null;

  function go(delta: number) {
    const next = index + delta;
    if (next < 0 || next >= blocks.length) return;
    setDir(delta);
    setIndex(next);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 mx-auto flex h-dvh w-full max-w-[480px] flex-col bg-ink px-6"
    >
      {/* progresso estilo stories */}
      <div className="flex gap-1 pt-[max(1.25rem,env(safe-area-inset-top))]">
        {blocks.map((b, i) => (
          <span
            key={effId(b)}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i <= index ? "bg-lime" : "bg-white/15"
            }`}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <SyncLogo height={22} />
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-cream"
        >
          <X size={16} strokeWidth={1.75} />
        </button>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={effId(eff)}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="flex h-full flex-col justify-center overflow-y-auto py-4"
          >
            <p className="eyebrow">
              {hm(effStart(eff))}–{hm(effEnd(eff))} ·{" "}
              {index + 1} de {blocks.length}
            </p>
            <h2 className="mt-3 text-[32px] font-bold uppercase leading-[0.98] text-cream">
              {block ? block.title : "Trilhas paralelas"}
            </h2>
            {block?.subtitle && (
              <p className="mt-2 text-[15px] text-mist">{block.subtitle}</p>
            )}

            {block ? (
              <div className="mt-3 flex items-center gap-2 text-[19px] font-bold text-lime">
                <MapPin size={20} strokeWidth={1.75} />
                {block.room}
              </div>
            ) : (
              <p className="mt-3 text-[14px] text-mist">
                Duas ou mais trilhas acontecem ao mesmo tempo — você escolhe a
                sua na primeira entrada.
              </p>
            )}

            {block?.description && (
              <p className="mt-4 text-[15px] leading-relaxed text-cream/90">
                {block.description}
              </p>
            )}

            {block?.menu && (
              <div className="mt-5">
                <MenuArea block={block} />
              </div>
            )}

            {block && block.speakers.length > 0 && (
              <div className="no-scrollbar -mx-6 mt-6 flex gap-5 overflow-x-auto px-6">
                {block.speakers.map((s) => (
                  <div
                    key={s.name}
                    className="flex w-[86px] shrink-0 flex-col items-center gap-2 text-center"
                  >
                    <Avatar name={s.name} photo={s.photo} size={56} />
                    <div>
                      <p className="text-[12px] font-semibold leading-tight text-cream">
                        {s.name}
                      </p>
                      {(s.role || s.company) && (
                        <p className="mt-0.5 text-[10.5px] leading-tight text-mist">
                          {[s.role, s.company].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {eff.kind === "slot-group" && (
              <div className="mt-5 flex flex-col gap-2">
                {eff.options.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-[18px] border border-white/10 bg-white/[0.05] px-4 py-3"
                  >
                    <p className="text-[14px] font-semibold text-cream">
                      {t.shortTitle}
                    </p>
                    <p className="text-[12px] text-mist">{t.room}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => go(-1)}
          disabled={index === 0}
          aria-label="Anterior"
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-cream disabled:opacity-30"
        >
          <ArrowLeft size={20} strokeWidth={1.75} />
        </motion.button>
        <PrimaryButton onClick={() => (last ? onClose() : go(1))}>
          {last ? "Fechar" : "Próximo"}
        </PrimaryButton>
      </div>
    </motion.div>
  );
}
