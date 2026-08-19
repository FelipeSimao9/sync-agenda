"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarPlus, Clock, ExternalLink, MapPin } from "lucide-react";
import type { AgendaBlock } from "@/data/agenda";
import { googleCalendarUrl } from "@/lib/gcal";
import Avatar from "./Avatar";

type Props = {
  block: AgendaBlock | null;
  registered: boolean;
  onClose: () => void;
};

/** Detalhe do bloco em bottom sheet (arrasta para fechar). */
export default function BlockSheet({ block, registered, onClose }: Props) {
  return (
    <AnimatePresence>
      {block && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-ink-deep/60 backdrop-blur-sm"
          />
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 600) onClose();
            }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[86dvh] w-full max-w-[480px] overflow-hidden rounded-t-[28px] border-t border-white/10 bg-ink"
            style={{ boxShadow: "0 -20px 60px rgba(0,0,0,0.5)" }}
          >
            <div className="sticky top-0 flex justify-center bg-ink pb-1 pt-3">
              <div className="h-1 w-10 rounded-full bg-white/20" />
            </div>
            <div className="max-h-[calc(86dvh-24px)] overflow-y-auto px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-3">
              <p className="eyebrow">
                {block.start.replace(":", "h")}–{block.end.replace(":", "h")}
              </p>
              <h2 className="mt-2 text-[26px] font-bold uppercase leading-[1.02]">
                {block.title}
              </h2>
              {block.subtitle && (
                <p className="mt-2 text-[15px] text-mist">{block.subtitle}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <span className="flex items-center gap-1.5 text-[15px] font-semibold text-lime">
                  <MapPin size={16} strokeWidth={1.75} />
                  {block.room}
                </span>
                <span className="flex items-center gap-1.5 text-[14px] text-mist">
                  <Clock size={15} strokeWidth={1.75} />
                  {block.start.replace(":", "h")}–{block.end.replace(":", "h")}
                </span>
              </div>

              {block.description && (
                <p className="mt-4 text-[15px] leading-relaxed text-cream/90">
                  {block.description}
                </p>
              )}

              {registered && (
                <div className="mt-5 rounded-[22px] border border-lime/40 bg-lime/10 px-5 py-4">
                  <p className="text-[15px] font-bold text-lime">
                    Você está inscrito · {block.room}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={`/api/calendar?scope=block&id=${block.id}`}
                      className="flex items-center gap-2 rounded-full bg-lime px-4 py-2 text-[13px] font-bold text-ink-deep"
                    >
                      <CalendarPlus size={15} strokeWidth={2} />
                      Adicionar ao calendário
                    </a>
                    <a
                      href={googleCalendarUrl(block)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-[13px] font-semibold text-cream"
                    >
                      <ExternalLink size={14} strokeWidth={1.75} />
                      Abrir no Google Calendar
                    </a>
                  </div>
                </div>
              )}

              {block.speakers.length > 0 && (
                <div className="mt-6 flex flex-col gap-4">
                  {block.speakers.map((s) => (
                    <div key={s.name} className="flex items-center gap-3">
                      <Avatar name={s.name} photo={s.photo} size={48} />
                      <div>
                        <p className="text-[15px] font-semibold text-cream">
                          {s.name}
                          {s.isModerator && (
                            <span className="ml-2 rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-mist">
                              Mediador(a)
                            </span>
                          )}
                        </p>
                        {(s.role || s.company) && (
                          <p className="text-[13px] text-mist">
                            {[s.role, s.company].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {block.menu?.map((section) => (
                <div key={section.title} className="mt-6">
                  <p className="eyebrow">{section.title}</p>
                  {section.note && (
                    <p className="mt-1 text-[13px] text-mist">{section.note}</p>
                  )}
                  <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                    {section.items.map((item) => (
                      <li
                        key={item}
                        className="text-[14px] leading-snug text-cream/90"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
