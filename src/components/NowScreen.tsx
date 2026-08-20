"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";
import type { AgendaBlock } from "@/data/agenda";
import {
  blockProgress,
  effEnd,
  effId,
  effStart,
  getNowFocus,
  minutesUntil,
  type EffectiveBlock,
  type FocusKind,
} from "@/lib/time";
import Avatar from "./Avatar";
import { EASE, SyncLogo } from "./ui";

function eyebrowFor(kind: FocusKind, block: EffectiveBlock, nowMs: number) {
  if (kind === "current") return "Acontecendo agora";
  const mins = minutesUntil(effStart(block), nowMs);
  return `A seguir · começa em ${mins} min`;
}

export function MenuArea({ block }: { block: AgendaBlock }) {
  const section = block.menu?.[0];
  if (!section) return null;
  const isLunch = block.id === "almoco";
  if (isLunch) {
    return (
      <div>
        <p className="eyebrow mb-3">{section.note ?? section.title}</p>
        <div className="grid grid-cols-3 gap-2.5">
          {section.items.map((item) => {
            const [name, rest] = item.split(" (");
            const veg = name.includes("Cogumelos");
            const label = name.replace(" — vegetariano", "");
            return (
              <div
                key={item}
                className="rounded-[20px] border border-white/10 bg-white/[0.06] p-3.5 backdrop-blur-xl"
              >
                <p className="text-[15px] font-bold leading-tight text-cream">
                  {label}
                </p>
                {veg && (
                  <span className="mt-1.5 inline-flex max-w-full items-center gap-0.5 rounded-full border border-lime/50 px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wide text-lime">
                    vegetariano
                  </span>
                )}
                <p className="mt-1.5 text-[11px] leading-snug text-mist">
                  {rest ? rest.replace(")", "") : ""}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return (
    <div>
      <p className="eyebrow mb-2.5">{section.title}</p>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {section.items.map((item) => (
          <li key={item} className="text-[13px] leading-snug text-cream/90">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FocusContent({
  eff,
  kind,
  nowMs,
}: {
  eff: EffectiveBlock;
  kind: FocusKind;
  nowMs: number;
}) {
  const block = eff.kind === "block" ? eff.block : null;
  const title = block ? block.title : "Trilhas paralelas";

  return (
    <div className="flex h-full flex-col justify-center">
      {kind === "current" && (
        <div className="mb-5 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-lime"
            animate={{ width: `${blockProgress(eff, nowMs) * 100}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
      )}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE, delay: 0.05 }}
        className="eyebrow"
      >
        {eyebrowFor(kind, eff, nowMs)}
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
        className="mt-3 text-[36px] font-bold uppercase leading-[0.95] text-cream"
      >
        {title}
      </motion.h1>
      {block?.subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.18 }}
          className="mt-2 text-[15px] text-mist"
        >
          {block.subtitle}
        </motion.p>
      )}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE, delay: 0.16 }}
        className="tabular mt-3 text-[15px] text-mist"
      >
        {effStart(eff).replace(":", "h")}–{effEnd(eff).replace(":", "h")}
      </motion.p>

      {block ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE, delay: 0.22 }}
          className="mt-4 flex items-center gap-2 text-[22px] font-bold text-lime"
        >
          <MapPin size={24} strokeWidth={1.75} />
          {block.room}
        </motion.div>
      ) : (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.22 }}
          className="mt-4 text-[14px] text-mist"
        >
          Você não está inscrito neste horário
        </motion.p>
      )}

      <div className="mt-7">
        {block?.menu ? (
          <MenuArea block={block} />
        ) : block && block.speakers.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              show: { transition: { staggerChildren: 0.06, delayChildren: 0.25 } },
            }}
            className="no-scrollbar -mx-6 flex gap-2.5 overflow-x-auto px-6"
          >
            {block.speakers.map((s) => (
              <motion.div
                key={s.name}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
                }}
                className="flex min-w-0 flex-1 basis-0 flex-col items-center gap-2 text-center"
                style={{ maxWidth: 96 }}
              >
                <Avatar name={s.name} photo={s.photo} size={54} animateRing />
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
              </motion.div>
            ))}
          </motion.div>
        ) : eff.kind === "slot-group" ? (
          <div className="flex flex-col gap-2">
            {eff.options.map((t) => (
              <div
                key={t.id}
                className="rounded-[18px] border border-white/10 bg-white/[0.05] px-4 py-3 backdrop-blur-xl"
              >
                <p className="text-[14px] font-semibold text-cream">
                  {t.shortTitle}
                </p>
                <p className="text-[12px] text-mist">{t.room}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

type Props = {
  blocks: EffectiveBlock[];
  nowMs: number;
  onOpen: (block: AgendaBlock) => void;
  onDirections: () => void;
};

/** Tela "Agora" no estado live: regra dos 50%, foco + secundário. */
export default function NowScreen({ blocks, nowMs, onOpen, onDirections }: Props) {
  const focus = getNowFocus(blocks, nowMs);
  if (!focus) return null;
  const { focus: focusBlock, focusKind, secondary, secondaryKind } = focus;

  return (
    <div className="flex h-dvh flex-col px-6 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="relative flex shrink-0 items-center justify-center pb-3"
      >
        <button
          type="button"
          onClick={onDirections}
          aria-label="Como chegar"
          className="absolute left-0 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-lime backdrop-blur-xl active:scale-95"
        >
          <Navigation size={16} strokeWidth={1.75} />
        </button>
        <SyncLogo height={26} />
      </motion.div>
      <div className="min-h-0 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={effId(focusBlock) + focusKind}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="h-full"
          >
            <FocusContent eff={focusBlock} kind={focusKind} nowMs={nowMs} />
          </motion.div>
        </AnimatePresence>
      </div>

      {secondary && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.3 }}
          onClick={() => {
            if (secondary.kind === "block") onOpen(secondary.block);
          }}
          className="mb-24 w-full rounded-[24px] border border-white/10 bg-white/[0.06] px-5 py-4 text-left backdrop-blur-xl"
          style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.35)" }}
        >
          <p className="eyebrow">
            {secondaryKind === "current"
              ? "Acontecendo agora"
              : `A seguir · ${effStart(secondary).replace(":", "h")}`}
          </p>
          <p className="mt-1 truncate text-[16px] font-bold text-cream">
            {secondary.kind === "block" ? secondary.block.title : "Trilhas paralelas"}
          </p>
          <p className="tabular mt-0.5 text-[13px] text-mist">
            {effStart(secondary).replace(":", "h")}–
            {effEnd(secondary).replace(":", "h")}
            {secondary.kind === "block" && ` · ${secondary.block.room}`}
          </p>
        </motion.button>
      )}
    </div>
  );
}
