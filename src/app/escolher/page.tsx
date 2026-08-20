"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, MapPin } from "lucide-react";
import LivingBackground from "@/components/LivingBackground";
import TrackCard from "@/components/TrackCard";
import { EASE, PrimaryButton } from "@/components/ui";
import { confirmChoices, type CountsMap } from "@/app/actions";
import { blockById, tracksForSlot, SLOT_TIMES } from "@/data/agenda";
import type { PendingSignup } from "@/app/entrar/page";

type Step = "intro" | "slot1" | "slot2" | "confirm" | "success";
const NONE = "__none__";

const slide = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.32, ease: EASE },
};

function SlotScreen({
  slot,
  selected,
  counts,
  onSelect,
  onContinue,
  onSkip,
}: {
  slot: 1 | 2;
  selected: string | undefined;
  counts: CountsMap;
  onSelect: (id: string) => void;
  onContinue: () => void;
  onSkip: () => void;
}) {
  const tracks = tracksForSlot(slot);
  const [page, setPage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const total = tracks.length;

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    setPage(Math.round(el.scrollLeft / (el.scrollWidth / total)));
  }

  return (
    <div className="flex h-dvh flex-col pt-[max(1.5rem,env(safe-area-inset-top))]">
      <div className="flex items-center justify-between px-6">
        <div>
          <p className="eyebrow">
            Slot {slot} de 2 · {SLOT_TIMES[slot].start.replace(":", "h")}–
            {SLOT_TIMES[slot].end.replace(":", "h")}
          </p>
          <h2 className="mt-1 text-[22px] font-bold leading-tight">
            Onde você quer estar?
          </h2>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="no-scrollbar mt-4 flex flex-1 snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden px-[7.5%] pb-2 pt-2"
      >
        {tracks.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.05 * i }}
            className="h-full w-[85%] shrink-0 snap-center"
          >
            <TrackCard
              block={t}
              registered={counts[t.id]?.registered ?? 0}
              capacity={counts[t.id]?.capacity}
              selected={selected === t.id}
              onSelect={() => onSelect(t.id)}
            />
          </motion.div>
        ))}
      </div>

      {/* dots */}
      <div className="mt-3 flex justify-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === page ? "w-5 bg-lime" : "w-1.5 bg-white/25"
            }`}
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-3 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
        <PrimaryButton
          disabled={!selected || selected === NONE}
          onClick={onContinue}
        >
          Continuar
        </PrimaryButton>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onSkip}
          className="py-1 text-[14px] font-medium text-mist underline-offset-4 hover:underline"
        >
          Não vou participar de nenhuma dessas
        </motion.button>
      </div>
    </div>
  );
}

export default function EscolherPage() {
  const router = useRouter();
  const [signup, setSignup] = useState<PendingSignup | null>(null);
  const [step, setStep] = useState<Step>("intro");
  const [choices, setChoices] = useState<{ 1?: string; 2?: string }>({});
  const [counts, setCounts] = useState<CountsMap>({});
  const [toast, setToast] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // dados do cadastro vindos de /entrar
  useEffect(() => {
    const raw = sessionStorage.getItem("sync_pending");
    if (!raw) {
      router.replace("/entrar");
      return;
    }
    try {
      setSignup(JSON.parse(raw) as PendingSignup);
    } catch {
      router.replace("/entrar");
    }
  }, [router]);

  // contagens de vagas, a cada 15s
  const refreshCounts = useCallback(async () => {
    try {
      const res = await fetch("/api/counts", { cache: "no-store" });
      if (res.ok) setCounts(await res.json());
    } catch {
      // mantém as últimas contagens
    }
  }, []);
  useEffect(() => {
    refreshCounts();
    const t = setInterval(refreshCounts, 15_000);
    return () => clearInterval(t);
  }, [refreshCounts]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  function confirm() {
    if (!signup) return;
    startTransition(async () => {
      const result = await confirmChoices({
        email: signup.email,
        firstName: signup.firstName,
        lastName: signup.lastName,
        accessibility: signup.accessibility,
        sessionSlot1: choices[1] === NONE ? null : (choices[1] ?? null),
        sessionSlot2: choices[2] === NONE ? null : (choices[2] ?? null),
      });
      if (result.ok) {
        sessionStorage.removeItem("sync_pending");
        setStep("success");
        setTimeout(() => router.replace("/dia"), 1900);
        return;
      }
      if (result.reason === "already_registered") {
        sessionStorage.removeItem("sync_pending");
        router.replace("/dia");
        return;
      }
      if (result.reason === "full") {
        const slot = result.slot;
        const track = choices[slot] ? blockById(choices[slot]!) : null;
        setChoices((c) => ({ ...c, [slot]: undefined }));
        await refreshCounts();
        setToast(
          `A trilha ${track?.shortTitle ?? ""} lotou enquanto você escolhia. Escolhe outra?`,
        );
        setStep(slot === 1 ? "slot1" : "slot2");
        return;
      }
      setToast("Não deu para confirmar agora. Tenta de novo.");
    });
  }

  const summary = ([1, 2] as const).map((slot) => {
    const id = choices[slot];
    const block = id && id !== NONE ? blockById(id) : null;
    return { slot, block };
  });

  if (!signup) return <LivingBackground intensity="low" />;

  return (
    <main className="relative mx-auto max-w-[480px]">
      <LivingBackground intensity={step === "success" ? "high" : "low"} />

      <AnimatePresence mode="wait">
        {step === "intro" && (
          <motion.div
            key="intro"
            {...slide}
            className="flex h-dvh flex-col items-center justify-center gap-8 px-8 text-center"
          >
            <div>
              <p className="eyebrow mb-4">Suas trilhas</p>
              <h1 className="text-[28px] font-bold leading-tight">
                Dois horários do dia têm trilhas simultâneas.
                <br />
                Escolha onde você quer estar.
              </h1>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { time: "11h00", n: "4 opções" },
                { time: "14h45", n: "2 opções" },
              ].map((s, i) => (
                <motion.div
                  key={s.time}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.08, duration: 0.4, ease: EASE }}
                  className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-6 py-3 backdrop-blur-xl"
                >
                  <Clock size={18} strokeWidth={1.75} className="text-lime" />
                  <span className="font-bold tabular">{s.time}</span>
                  <span className="text-mist">·</span>
                  <span className="text-mist">{s.n}</span>
                </motion.div>
              ))}
            </div>
            <div className="w-full max-w-[320px]">
              <PrimaryButton onClick={() => setStep("slot1")}>
                Começar
              </PrimaryButton>
            </div>
          </motion.div>
        )}

        {step === "slot1" && (
          <motion.div key="slot1" {...slide}>
            <SlotScreen
              slot={1}
              selected={choices[1]}
              counts={counts}
              onSelect={(id) => setChoices((c) => ({ ...c, 1: id }))}
              onContinue={() => setStep("slot2")}
              onSkip={() => {
                setChoices((c) => ({ ...c, 1: NONE }));
                setStep("slot2");
              }}
            />
          </motion.div>
        )}

        {step === "slot2" && (
          <motion.div key="slot2" {...slide}>
            <SlotScreen
              slot={2}
              selected={choices[2]}
              counts={counts}
              onSelect={(id) => setChoices((c) => ({ ...c, 2: id }))}
              onContinue={() => setStep("confirm")}
              onSkip={() => {
                setChoices((c) => ({ ...c, 2: NONE }));
                setStep("confirm");
              }}
            />
          </motion.div>
        )}

        {step === "confirm" && (
          <motion.div
            key="confirm"
            {...slide}
            className="flex min-h-dvh flex-col justify-center gap-5 px-6 py-12"
          >
            <div>
              <p className="eyebrow mb-2">Confirmação</p>
              <h1 className="text-[28px] font-bold leading-tight">
                Suas escolhas, {signup.firstName}.
              </h1>
            </div>

            {summary.map(({ slot, block }, i) => (
              <motion.div
                key={slot}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.4, ease: EASE }}
                className="rounded-[26px] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl"
                style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.35)" }}
              >
                <p className="eyebrow">
                  {SLOT_TIMES[slot].start.replace(":", "h")}
                </p>
                {block ? (
                  <>
                    <p className="mt-1.5 text-[20px] font-bold uppercase leading-tight">
                      {block.shortTitle}
                    </p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-[14px] font-semibold text-lime">
                      <MapPin size={15} strokeWidth={1.75} />
                      {block.room}
                    </p>
                  </>
                ) : (
                  <p className="mt-1.5 text-[17px] font-semibold text-mist">
                    Não vai participar
                  </p>
                )}
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24, duration: 0.4, ease: EASE }}
              className="rounded-[22px] border border-white/10 bg-white/[0.04] px-5 py-4"
            >
              <p className="eyebrow">Acessibilidade</p>
              <p className="mt-1 text-[14px] text-cream/85">
                {signup.accessibility ?? "Sem demandas"}
              </p>
            </motion.div>

            <p className="text-center text-[13px] text-mist">
              A escolha é definitiva e não pode ser alterada.
            </p>
            <PrimaryButton disabled={pending} onClick={confirm}>
              {pending ? "Confirmando…" : "Confirmar escolhas"}
            </PrimaryButton>
            <button
              type="button"
              className="text-[14px] text-mist underline-offset-4 hover:underline"
              onClick={() => setStep("slot1")}
            >
              Rever escolhas
            </button>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-dvh flex-col items-center justify-center gap-6"
          >
            <svg width="120" height="120" viewBox="0 0 120 120">
              <motion.circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#E5F27E"
                strokeWidth="4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, ease: EASE }}
              />
              <motion.path
                d="M38 62 L54 78 L84 46"
                fill="none"
                stroke="#E5F27E"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.45, ease: EASE, delay: 0.45 }}
              />
            </svg>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-[22px] font-bold"
            >
              Tudo certo, {signup.firstName}!
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed inset-x-6 top-[max(1rem,env(safe-area-inset-top))] z-50 mx-auto max-w-[430px] rounded-2xl border border-white/10 bg-ink-deep/95 px-5 py-3.5 text-[14px] text-cream backdrop-blur-xl"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
