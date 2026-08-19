"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import LivingBackground from "@/components/LivingBackground";
import { EASE, PrimaryButton } from "@/components/ui";
import { checkEmail } from "@/app/actions";

export type PendingSignup = {
  email: string;
  firstName: string;
  lastName: string;
  accessibility: string | null;
};

const field =
  "w-full rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 text-cream placeholder:text-mist/50 outline-none backdrop-blur-xl focus:border-lime/60";

export default function EntrarPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<"email" | "details">("email");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [hasNeeds, setHasNeeds] = useState<boolean | null>(null);
  const [needs, setNeeds] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submitEmail() {
    setError(null);
    startTransition(async () => {
      const result = await checkEmail(email);
      if (result.status === "invalid") {
        setError("Confere o e-mail? Ele não parece válido.");
      } else if (result.status === "error") {
        setError("Não deu para verificar agora. Tenta de novo.");
      } else if (result.status === "existing") {
        router.push("/dia");
      } else {
        setStep("details");
      }
    });
  }

  function submitDetails() {
    setError(null);
    if (!firstName.trim()) return setError("Falta o nome.");
    if (!lastName.trim()) return setError("Falta o sobrenome.");
    if (hasNeeds === null)
      return setError("Responde sobre acessibilidade, por favor.");
    if (hasNeeds && !needs.trim())
      return setError("Conta como podemos ajudar.");
    const data: PendingSignup = {
      email: email.trim().toLowerCase(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      accessibility: hasNeeds ? needs.trim() : null,
    };
    sessionStorage.setItem("sync_pending", JSON.stringify(data));
    router.push("/escolher");
  }

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-[480px] flex-col justify-center px-6 py-12">
      <LivingBackground intensity="low" />

      <motion.div layout transition={{ duration: 0.4, ease: EASE }}>
        <motion.h1
          layout
          className={
            step === "email"
              ? "mb-8 text-[28px] font-bold leading-tight"
              : "mb-6 text-[22px] font-bold leading-tight"
          }
        >
          {step === "email" ? "Quem é você?" : "Quase lá."}
        </motion.h1>

        <motion.div layout>
          <label className="eyebrow mb-2 block">E-mail</label>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus
            placeholder="seu@email.com"
            value={email}
            disabled={step === "details"}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && step === "email" && submitEmail()}
            className={`${field} ${step === "details" ? "py-3 text-[14px] opacity-60" : ""}`}
          />
        </motion.div>

        <AnimatePresence>
          {step === "details" && (
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
              }}
              className="mt-5 flex flex-col gap-5"
            >
              {[
                {
                  label: "Nome",
                  value: firstName,
                  set: setFirstName,
                  auto: "given-name",
                },
                {
                  label: "Sobrenome",
                  value: lastName,
                  set: setLastName,
                  auto: "family-name",
                },
              ].map((f) => (
                <motion.div
                  key={f.label}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
                  }}
                >
                  <label className="eyebrow mb-2 block">{f.label}</label>
                  <input
                    type="text"
                    autoComplete={f.auto}
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    className={field}
                  />
                </motion.div>
              ))}

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
                }}
              >
                <label className="eyebrow mb-3 block">Acessibilidade</label>
                <p className="mb-3 text-[15px] text-cream">
                  Você possui alguma demanda de acessibilidade?
                </p>
                <div className="flex gap-3">
                  {[
                    { label: "Sim", value: true },
                    { label: "Não", value: false },
                  ].map((opt) => (
                    <motion.button
                      key={opt.label}
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setHasNeeds(opt.value)}
                      className={`rounded-full border px-6 py-2.5 text-[15px] font-semibold transition-colors ${
                        hasNeeds === opt.value
                          ? "border-lime bg-lime text-ink-deep"
                          : "border-white/15 bg-white/[0.06] text-cream"
                      }`}
                    >
                      {opt.label}
                    </motion.button>
                  ))}
                </div>
                <AnimatePresence>
                  {hasNeeds && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <textarea
                        placeholder="Conte como podemos ajudar"
                        value={needs}
                        onChange={(e) => setNeeds(e.target.value)}
                        rows={3}
                        className={`${field} mt-3 resize-none`}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 text-[14px] text-[#f2a68a]"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.div layout className="mt-8">
          <PrimaryButton
            disabled={pending || (step === "email" && !email.trim())}
            onClick={step === "email" ? submitEmail : submitDetails}
          >
            {pending ? "Verificando…" : "Continuar"}
          </PrimaryButton>
        </motion.div>
      </motion.div>
    </main>
  );
}
