"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSessionCapacity } from "./actions";

type Props = {
  sessionId: string;
  capacity: number;
  registered: number;
};

export default function CapacityEditor({ sessionId, capacity, registered }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(String(capacity));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  // sincroniza quando o valor do banco muda (auto-refresh) e não há edição em curso
  useEffect(() => {
    setValue((v) => (v === String(capacity) || saved ? String(capacity) : v));
  }, [capacity, saved]);

  const parsed = Number(value);
  const dirty = value.trim() !== "" && parsed !== capacity;

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await updateSessionCapacity(sessionId, parsed);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div className="mt-3">
      <div className="flex items-center gap-2">
        <label className="text-[12px] text-mist" htmlFor={`cap-${sessionId}`}>
          Capacidade
        </label>
        <input
          id={`cap-${sessionId}`}
          type="number"
          min={1}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSaved(false);
          }}
          className="tabular w-20 rounded-lg border border-white/15 bg-white/[0.06] px-2.5 py-1.5 text-[13px] text-cream outline-none focus:border-lime"
        />
        <button
          type="button"
          disabled={!dirty || pending || !Number.isFinite(parsed) || parsed < 1}
          onClick={save}
          className="rounded-full border border-white/15 px-3.5 py-1.5 text-[12px] font-semibold text-cream transition-opacity disabled:opacity-40"
        >
          {pending ? "Salvando…" : "Salvar"}
        </button>
        {saved && !dirty && <span className="text-[12px] text-lime">Salvo ✓</span>}
      </div>
      {dirty && Number.isFinite(parsed) && parsed < registered && (
        <p className="mt-1.5 text-[12px] text-[#e9c46a]">
          Atenção: já existem {registered} inscritos — a trilha ficará acima da lotação.
        </p>
      )}
      {error && <p className="mt-1.5 text-[12px] text-[#f2a68a]">{error}</p>}
    </div>
  );
}
