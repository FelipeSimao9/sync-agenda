"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, ListOrdered, MapPin } from "lucide-react";
import { blockById, type AgendaBlock, AGENDA } from "@/data/agenda";
import {
  buildEffectiveAgenda,
  daysUntilEvent,
  getEventState,
  minutesUntil,
  parseNowOverride,
} from "@/lib/time";
import { useServerNow } from "@/lib/useServerNow";
import LivingBackground from "./LivingBackground";
import AgendaList from "./AgendaList";
import BlockSheet from "./BlockSheet";
import NowScreen from "./NowScreen";
import TabBar, { TAB_ORDER, type Tab } from "./TabBar";
import TicketsScreen from "./TicketsScreen";
import ProgramWalkthrough from "./ProgramWalkthrough";
import { AnimNumber, EASE, PrimaryButton, SafeImg, SyncLogo } from "./ui";

function EventPhoto() {
  return (
    <div className="absolute inset-0 -z-[5] overflow-hidden">
      <SafeImg
        src="/brand/event-photo.png"
        className="h-full w-full object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/40 to-ink" />
    </div>
  );
}

function FirstBlockCard({
  withMenu,
  onOpen,
}: {
  withMenu: boolean;
  onOpen: (b: AgendaBlock) => void;
}) {
  const first = AGENDA[0];
  return (
    <motion.button
      type="button"
      onClick={() => onOpen(first)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE, delay: 0.35 }}
      whileTap={{ scale: 0.98 }}
      className="w-full rounded-[26px] border border-white/10 bg-white/[0.06] p-5 text-left backdrop-blur-xl"
      style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.35)" }}
    >
      <p className="eyebrow">Primeiro bloco · {first.start.replace(":", "h")}</p>
      <p className="mt-1.5 text-[19px] font-bold leading-tight text-cream">
        {first.title}
      </p>
      <p className="mt-1.5 flex items-center gap-1.5 text-[14px] font-semibold text-lime">
        <MapPin size={15} strokeWidth={1.75} />
        {first.room}
      </p>
      {withMenu && first.menu && (
        <div className="mt-4 border-t border-white/10 pt-3.5">
          <p className="eyebrow">{first.menu[0].title}</p>
          <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
            {first.menu[0].items.map((item) => (
              <li key={item} className="text-[12.5px] leading-snug text-cream/85">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.button>
  );
}

type Props = {
  firstName: string;
  lastName: string;
  choice1: string | null;
  choice2: string | null;
  allowTimeOverride: boolean;
};

function DiaAppInner({ firstName, lastName, choice1, choice2, allowTimeOverride }: Props) {
  const params = useSearchParams();
  const override = allowTimeOverride
    ? parseNowOverride(params.get("now"))
    : null;
  const realNow = useServerNow(1000);
  const now = override ?? realNow;

  const [tab, setTab] = useState<Tab>("agora");
  const [sheetBlock, setSheetBlock] = useState<AgendaBlock | null>(null);
  const [showProgram, setShowProgram] = useState(false);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const state = getEventState(now);
  const effective = useMemo(
    () =>
      buildEffectiveAgenda({
        1: choice1 ? (blockById(choice1) ?? null) : null,
        2: choice2 ? (blockById(choice2) ?? null) : null,
      }),
    [choice1, choice2],
  );
  const registeredIds = useMemo(
    () => new Set([choice1, choice2].filter(Boolean) as string[]),
    [choice1, choice2],
  );
  const tickets = useMemo(
    () =>
      [choice1, choice2]
        .map((id) => (id ? blockById(id) : null))
        .filter(Boolean) as AgendaBlock[],
    [choice1, choice2],
  );

  const bgIntensity =
    tab === "agora" && state !== "live" ? ("high" as const) : ("low" as const);

  function onTouchStart(e: React.TouchEvent) {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (!touch.current || sheetBlock) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > 64 && Math.abs(dx) > Math.abs(dy) * 1.6) {
      const idx = TAB_ORDER.indexOf(tab);
      const next = TAB_ORDER[idx + (dx < 0 ? 1 : -1)];
      if (next) setTab(next);
    }
  }

  const agora = (() => {
    if (state === "live") {
      return <NowScreen blocks={effective} nowMs={now} onOpen={setSheetBlock} />;
    }
    if (state === "pre-event") {
      const days = daysUntilEvent(now);
      return (
        <div className="flex h-dvh flex-col items-center justify-center gap-8 px-8 text-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="flex justify-center"
            >
              <SyncLogo height={32} />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
              className="tabular mt-3 text-[76px] font-bold leading-none text-cream"
            >
              {days <= 0 ? "É hoje" : days === 1 ? "Amanhã" : (
                <>
                  Faltam
                  <br />
                  <span className="text-lime">
                    <AnimNumber value={days} /> dias
                  </span>
                </>
              )}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mt-4 text-[15px] text-mist"
            >
              Sábado, 22 de agosto · 08h00–18h30
              <br />
              iFood HQ, São Paulo
            </motion.p>
          </div>
          <FirstBlockCard withMenu={false} onOpen={setSheetBlock} />
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE, delay: 0.45 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowProgram(true)}
            className="-mt-2 flex h-[48px] items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-7 text-[15px] font-semibold text-cream backdrop-blur-xl"
          >
            <ListOrdered size={17} strokeWidth={1.75} className="text-lime" />
            Ver programação
          </motion.button>
        </div>
      );
    }
    if (state === "starting-soon") {
      const mins = minutesUntil("08:00", now);
      const label =
        mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}min` : `${mins} min`;
      return (
        <div className="relative flex h-dvh flex-col items-center justify-center gap-8 px-6 text-center">
          <EventPhoto />
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="eyebrow"
            >
              Começa em breve
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
              className="tabular mt-3 text-[64px] font-bold leading-none text-lime"
            >
              {label}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mt-3 text-[15px] text-mist"
            >
              O credenciamento abre às 08h00
            </motion.p>
          </div>
          <FirstBlockCard withMenu onOpen={setSheetBlock} />
        </div>
      );
    }
    // ended
    return (
      <div className="relative flex h-dvh flex-col items-center justify-center gap-6 px-8 text-center">
        <EventPhoto />
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="text-[52px] font-bold uppercase leading-[0.95] text-cream"
        >
          Até a<br />
          <span className="text-lime">próxima</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-[300px] text-[15px] leading-relaxed text-mist"
        >
          {firstName ? `${firstName}, obrigado` : "Obrigado"} por fazer parte do
          SYNC 2026. Nos vemos na próxima edição.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="w-full max-w-[280px]"
        >
          <PrimaryButton onClick={() => setTab("agenda")}>
            <CalendarDays size={18} strokeWidth={2} className="mr-2" />
            Ver agenda
          </PrimaryButton>
        </motion.div>
      </div>
    );
  })();

  return (
    <main
      className="relative mx-auto max-w-[480px]"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <LivingBackground intensity={bgIntensity} />

      {override !== null && (
        <div className="fixed right-4 top-[max(0.75rem,env(safe-area-inset-top))] z-40 rounded-full border border-white/15 bg-ink-deep/80 px-3 py-1 text-[11px] font-semibold text-mist backdrop-blur-xl">
          Horário simulado
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: tab === "ingressos" ? -40 : 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: tab === "ingressos" ? -40 : 40 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          {tab === "ingressos" ? (
            <TicketsScreen
              firstName={firstName}
              lastName={lastName}
              tickets={tickets}
            />
          ) : tab === "agora" ? (
            agora
          ) : (
            <AgendaList
              blocks={effective}
              eventState={state}
              nowMs={now}
              onOpen={setSheetBlock}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <TabBar tab={tab} onChange={setTab} />

      <AnimatePresence>
        {showProgram && (
          <ProgramWalkthrough
            blocks={effective}
            onClose={() => setShowProgram(false)}
          />
        )}
      </AnimatePresence>

      <BlockSheet
        block={sheetBlock}
        registered={sheetBlock ? registeredIds.has(sheetBlock.id) : false}
        onClose={() => setSheetBlock(null)}
      />
    </main>
  );
}

export default function DiaApp(props: Props) {
  return (
    <Suspense fallback={<LivingBackground intensity="low" />}>
      <DiaAppInner {...props} />
    </Suspense>
  );
}
