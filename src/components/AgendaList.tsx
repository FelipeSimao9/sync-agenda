"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarPlus, ChevronDown } from "lucide-react";
import type { AgendaBlock } from "@/data/agenda";
import {
  effEnd,
  effId,
  effStart,
  hmToMs,
  type EffectiveBlock,
  type EventState,
} from "@/lib/time";
import { signOut } from "@/app/actions";
import Avatar from "./Avatar";
import { EASE } from "./ui";

function ExpandChip({
  label,
  open,
  onToggle,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="mt-1.5 flex items-center gap-1 rounded-full border border-white/12 bg-white/[0.05] px-3 py-1 text-[12px] text-mist"
    >
      {label}
      <motion.span animate={{ rotate: open ? 180 : 0 }}>
        <ChevronDown size={13} strokeWidth={1.75} />
      </motion.span>
    </button>
  );
}

type Props = {
  blocks: EffectiveBlock[];
  eventState: EventState;
  nowMs: number;
  onOpen: (block: AgendaBlock) => void;
};

export default function AgendaList({ blocks, eventState, nowMs, onOpen }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const currentRef = useRef<HTMLDivElement>(null);
  const live = eventState === "live";

  useEffect(() => {
    if (live) {
      currentRef.current?.scrollIntoView({ block: "center" });
    }
  }, [live]);

  return (
    <div className="mx-auto min-h-dvh max-w-[480px] pb-36">
      <header className="sticky top-0 z-30 bg-ink/80 px-6 pb-3 pt-[max(1.25rem,env(safe-area-inset-top))] backdrop-blur-xl">
        <p className="eyebrow">Sábado, 22 de agosto</p>
      </header>

      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.04 } } }}
        className="flex flex-col"
      >
        {blocks.map((b) => {
          const startMs = hmToMs(effStart(b));
          const endMs = hmToMs(effEnd(b));
          const isPast = live && nowMs >= endMs;
          const isCurrent = live && nowMs >= startMs && nowMs < endMs;
          const id = effId(b);
          const open = expanded === id;

          const row =
            b.kind === "block" ? (
              <button
                type="button"
                onClick={() => onOpen(b.block)}
                className="flex-1 text-left"
              >
                <p className="text-[16px] font-semibold leading-snug text-cream">
                  {b.block.title}
                </p>
                <p className="mt-0.5 text-[13px] text-mist">{b.block.room}</p>
                {b.block.menu && (
                  <ExpandChip
                    label="Ver cardápio"
                    open={open}
                    onToggle={() => setExpanded(open ? null : id)}
                  />
                )}
              </button>
            ) : (
              <div className="flex-1">
                <p className="text-[16px] font-semibold leading-snug text-cream">
                  Trilhas paralelas
                </p>
                <p className="mt-0.5 text-[13px] text-mist">
                  Você não está inscrito neste horário
                </p>
                <ExpandChip
                  label={`Ver as ${b.options.length} opções`}
                  open={open}
                  onToggle={() => setExpanded(open ? null : id)}
                />
              </div>
            );

          return (
            <motion.div
              key={id}
              ref={isCurrent ? currentRef : undefined}
              variants={{
                hidden: { opacity: 0, y: 14 },
                show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
              }}
              className={`px-6 py-4 transition-opacity ${isPast ? "opacity-40" : ""}`}
            >
              <div className="flex gap-4">
                <div className="w-[52px] shrink-0 pt-0.5">
                  <p className="tabular flex items-center gap-1.5 text-[13px] font-semibold text-mist">
                    {isCurrent && (
                      <span className="pulse-dot h-2 w-2 shrink-0 rounded-full bg-lime" />
                    )}
                    {effStart(b).replace(":", "h")}
                  </p>
                </div>
                {row}
                {b.kind === "block" && b.block.speakers.length > 0 && (
                  <div className="flex shrink-0 items-start">
                    <div className="flex">
                      {b.block.speakers.slice(0, 4).map((s, i) => (
                        <div key={s.name} style={{ marginLeft: i === 0 ? 0 : -8 }}>
                          <Avatar name={s.name} photo={s.photo} size={30} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <AnimatePresence initial={false}>
                {open && b.kind === "block" && b.block.menu && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <div className="ml-[68px] mt-3 rounded-[20px] border border-white/10 bg-white/[0.04] p-4">
                      {b.block.menu.map((section) => (
                        <div key={section.title}>
                          <p className="eyebrow">{section.title}</p>
                          {section.note && (
                            <p className="mt-0.5 text-[12px] text-mist">
                              {section.note}
                            </p>
                          )}
                          <ul className="mt-2 flex flex-col gap-1">
                            {section.items.map((item) => (
                              <li key={item} className="text-[13px] text-cream/85">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
                {open && b.kind === "slot-group" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <div className="ml-[68px] mt-3 flex flex-col gap-2">
                      {b.options.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => onOpen(t)}
                          className="rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3 text-left"
                        >
                          <p className="text-[14px] font-semibold text-cream">
                            {t.shortTitle}
                          </p>
                          <p className="text-[12px] text-mist">{t.room}</p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>

      <footer className="mt-6 flex flex-col items-center gap-3 px-6">
        <a
          href="/api/calendar?scope=all"
          className="flex items-center gap-2 text-[13px] text-mist underline-offset-4 hover:underline"
        >
          <CalendarPlus size={14} strokeWidth={1.75} />
          Adicionar o dia ao calendário
        </a>
        <button
          type="button"
          onClick={() => signOut()}
          className="text-[11px] text-mist/60 underline-offset-4 hover:underline"
        >
          Sair
        </button>
      </footer>
    </div>
  );
}
