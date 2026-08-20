"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { Speaker } from "@/data/agenda";
import Avatar from "./Avatar";
import { EASE, SafeImg } from "./ui";

type Props = {
  speaker: Speaker | null;
  onClose: () => void;
};

/** Cartão do palestrante: foto grande, nome, cargo · empresa e LinkedIn. */
export default function SpeakerModal({ speaker, onClose }: Props) {
  return (
    <AnimatePresence>
      {speaker && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-ink-deep/60 backdrop-blur-sm"
          />
          <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center px-8">
            <motion.div
              key="card"
              initial={{ opacity: 0, scale: 0.9, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="pointer-events-auto relative w-full max-w-[320px] rounded-[28px] border border-white/10 bg-ink px-6 pb-6 pt-8 text-center"
              style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.55)" }}
            >
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-mist active:scale-95"
              >
                <X size={16} strokeWidth={2} />
              </button>

              <div className="flex justify-center">
                <Avatar name={speaker.name} photo={speaker.photo} size={112} animateRing />
              </div>

              <p className="mt-4 text-[20px] font-bold leading-tight text-cream">
                {speaker.name}
              </p>
              {(speaker.role || speaker.company) && (
                <p className="mt-1.5 text-[14px] leading-snug text-mist">
                  {[speaker.role, speaker.company].filter(Boolean).join(" · ")}
                </p>
              )}
              {speaker.isModerator && (
                <span className="mt-2.5 inline-block rounded-full border border-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-mist">
                  Mediador(a)
                </span>
              )}

              {speaker.linkedin && (
                <a
                  href={speaker.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 flex h-[46px] w-full items-center justify-center gap-2 rounded-full bg-[#ffffff] text-[14px] font-bold text-white transition-transform active:scale-95"
                >
                  <SafeImg
                    src="/brand/linkedin-grande.png"
                    alt=""
                    className="h-[20px] w-auto object-contain"
                    fallback={
                      <span className="flex h-[18px] w-[18px] items-center justify-center rounded-[3px] bg-white text-[10px] font-bold lowercase text-[#007EBB]">
                        in
                      </span>
                    }
                  />

                </a>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
