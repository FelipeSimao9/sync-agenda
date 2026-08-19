"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "../actions";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(false);
    startTransition(async () => {
      const { ok } = await adminLogin(password);
      if (ok) router.replace("/admin");
      else setError(true);
    });
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-ink px-6">
      <div className="w-full max-w-[360px] rounded-[26px] border border-white/10 bg-white/[0.05] p-8">
        <h1 className="text-[22px] font-bold">Admin · SYNC 2026</h1>
        <label className="eyebrow mb-2 mt-6 block">Senha</label>
        <input
          type="password"
          value={password}
          autoFocus
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-cream outline-none focus:border-lime/60"
        />
        {error && (
          <p className="mt-3 text-[14px] text-[#f2a68a]">Senha incorreta.</p>
        )}
        <button
          type="button"
          disabled={pending || !password}
          onClick={submit}
          className="mt-6 h-[48px] w-full rounded-full bg-lime font-bold text-ink-deep disabled:opacity-40"
        >
          {pending ? "Entrando…" : "Entrar"}
        </button>
      </div>
    </main>
  );
}
