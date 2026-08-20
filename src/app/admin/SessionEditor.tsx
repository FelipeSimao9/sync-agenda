"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSession } from "./actions";

type Props = {
  sessionId: string;
  capacity: number;
  room: string;
  registered: number;
};

export default function SessionEditor({ sessionId, capacity, room, registered }: Props) {
  const router = useRouter();
  const [capValue, setCapValue] = useState(String(capacity));
  const [roomValue, setRoomValue] = useState(room);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  // sincroniza com o banco (auto-refresh) sem atropelar uma edição em curso
  const lastDb = useRef({ capacity, room });
  useEffect(() => {
    setCapValue((v) => (v === String(lastDb.current.capacity) ? String(capacity) : v));
    setRoomValue((v) => (v === lastDb.current.room ? room : v));
    lastDb.current = { capacity, room };
  }, [capacity, room]);

  const parsedCap = Number(capValue);
  const capDirty = capValue.trim() !== "" && parsedCap !== capacity;
  const roomDirty = roomValue.trim() !== "" && roomValue.trim() !== room;
  const dirty = capDirty || roomDirty;
  const capInvalid = capDirty && (!Number.isFinite(parsedCap) || parsedCap < 1);

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await updateSession(sessionId, {
        ...(capDirty ? { capacity: parsedCap } : {}),
        ...(roomDirty ? { room: roomValue } : {}),
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-[12px] text-mist" htmlFor={`room-${sessionId}`}>
          Sala
        </label>
        <input
          id={`room-${sessionId}`}
          type="text"
          value={roomValue}
          onChange={(e) => {
            setRoomValue(e.target.value);
            setSaved(false);
          }}
          className="min-w-0 flex-1 rounded-lg border border-white/15 bg-white/[0.06] px-2.5 py-1.5 text-[13px] text-cream outline-none focus:border-lime"
        />
        <label className="text-[12px] text-mist" htmlFor={`cap-${sessionId}`}>
          Capacidade
        </label>
        <input
          id={`cap-${sessionId}`}
          type="number"
          min={1}
          value={capValue}
          onChange={(e) => {
            setCapValue(e.target.value);
            setSaved(false);
          }}
          className="tabular w-20 rounded-lg border border-white/15 bg-white/[0.06] px-2.5 py-1.5 text-[13px] text-cream outline-none focus:border-lime"
        />
        <button
          type="button"
          disabled={!dirty || pending || capInvalid}
          onClick={save}
          className="rounded-full border border-white/15 px-3.5 py-1.5 text-[12px] font-semibold text-cream transition-opacity disabled:opacity-40"
        >
          {pending ? "Salvando…" : "Salvar"}
        </button>
        {saved && !dirty && <span className="text-[12px] text-lime">Salvo ✓</span>}
      </div>
      {capDirty && !capInvalid && parsedCap < registered && (
        <p className="text-[12px] text-[#e9c46a]">
          Atenção: já existem {registered} inscritos — a trilha ficará acima da lotação.
        </p>
      )}
      {error && <p className="text-[12px] text-[#f2a68a]">{error}</p>}
    </div>
  );
}
