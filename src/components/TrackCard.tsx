"use client";

import { motion } from "framer-motion";
import { Check, MapPin } from "lucide-react";
import type { AgendaBlock, Speaker } from "@/data/agenda";
import { AnimNumber, EASE, SafeImg } from "./ui";

function PhotoTile({ speaker }: { speaker: Speaker }) {
  const initials = speaker.name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .filter((_, i, a) => i === 0 || i === a.length - 1)
    .join("")
    .toUpperCase();
  return (
    <div className="h-full min-w-0 flex-1">
      <SafeImg
        src={speaker.photo}
        alt={speaker.name}
        className="h-full w-full object-cover"
        fallback={
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(229,242,126,0.35), rgba(143,160,184,0.3)), #0C1015",
            }}
          >
            <span className="text-2xl font-bold text-lime/80">{initials}</span>
          </div>
        }
      />
    </div>
  );
}

function SymbolHeader() {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, rgba(229,242,126,0.4), rgba(143,160,184,0.28)), #0C1015",
      }}
    >
      <SafeImg
        src="/brand/icon-sync.svg"
        alt="Sync"
        className="h-12 w-[70%] object-contain opacity-90"
        fallback={
          <span className="text-3xl font-bold lowercase text-lime">sync</span>
        }
      />
    </div>
  );
}

type Props = {
  block: AgendaBlock;
  registered: number;
  selected: boolean;
  onSelect: () => void;
};

export default function TrackCard({ block, registered, selected, onSelect }: Props) {
  const capacity = block.capacity ?? 0;
  const remaining = Math.max(0, capacity - registered);
  const full = remaining <= 0;

  return (
    <motion.button
      type="button"
      disabled={full}
      onClick={onSelect}
      whileTap={full ? undefined : { scale: 0.98 }}
      animate={{ y: selected ? -4 : 0 }}
      transition={{ duration: 0.25, ease: EASE }}
      className={`relative flex h-full w-full flex-col overflow-hidden rounded-[28px] border text-left backdrop-blur-xl transition-colors ${
        selected ? "border-lime bg-white/[0.09]" : "border-white/10 bg-white/[0.06]"
      } ${full ? "saturate-0" : ""}`}
      style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.35)" }}
    >
      {/* fotos dos speakers */}
      <div className="relative flex h-36 w-full shrink-0 overflow-hidden">
        {block.speakers.length > 0 ? (
          block.speakers.map((s) => <PhotoTile key={s.name} speaker={s} />)
        ) : (
          <SymbolHeader />
        )}
        {full && (
          <span className="absolute left-4 top-4 rounded-full bg-ink-deep/90 px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-wider text-cream">
            Esgotado
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <h3 className="text-[24px] font-bold uppercase leading-[0.98]">
          {block.shortTitle ?? block.title}
        </h3>
        <p className="text-[13px] leading-snug text-mist">{block.title}</p>
        {block.description && (
          <p className="line-clamp-5 text-[14px] leading-snug text-cream/85">
            {block.description}
          </p>
        )}

        <div className="mt-auto pt-2">
          <div className="flex items-center gap-1.5 text-[15px] font-semibold text-lime">
            <MapPin size={16} strokeWidth={1.75} />
            {block.room}
          </div>
          <div className="mt-2 flex items-center justify-between text-[12px] text-mist">
            <span>
              {full ? (
                "Sem vagas"
              ) : (
                <>
                  <AnimNumber value={remaining} /> de {capacity} vagas
                </>
              )}
            </span>
          </div>
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-lime"
              animate={{ width: `${Math.min(100, (registered / capacity) * 100)}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      </div>

      {/* check de seleção */}
      <motion.div
        initial={false}
        animate={
          selected ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }
        }
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
        className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-lime text-ink-deep"
      >
        <Check size={18} strokeWidth={3} />
      </motion.div>
    </motion.button>
  );
}
