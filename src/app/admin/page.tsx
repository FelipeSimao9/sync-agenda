import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { fetchSessionCounts, supabaseAdmin, type SessionCount } from "@/lib/supabase";
import { tracksForSlot, SLOT_TIMES } from "@/data/agenda";
import AutoRefresh from "./AutoRefresh";
import SessionEditor from "./SessionEditor";
import { adminLogout } from "./actions";

export const dynamic = "force-dynamic";

type Participant = {
  email: string;
  first_name: string;
  last_name: string;
  accessibility_needs: string | null;
};
type Registration = {
  email: string;
  session_id: string;
  slot: number;
  created_at: string;
};

function Bar({ registered, capacity }: { registered: number; capacity: number }) {
  const pct = capacity > 0 ? Math.min(100, (registered / capacity) * 100) : 0;
  const color =
    registered >= capacity
      ? "bg-[#e07a5f]"
      : pct >= 80
        ? "bg-[#e9c46a]"
        : "bg-lime";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  let participants: Participant[] = [];
  let registrations: Registration[] = [];
  let sessionCounts: SessionCount[] = [];
  let dbError: string | null = null;
  try {
    const supabase = supabaseAdmin();
    const [p, r, counts] = await Promise.all([
      supabase
        .from("participants")
        .select("email, first_name, last_name, accessibility_needs"),
      supabase.from("registrations").select("email, session_id, slot, created_at"),
      fetchSessionCounts(),
    ]);
    if (p.error) throw new Error(p.error.message);
    if (r.error) throw new Error(r.error.message);
    participants = p.data ?? [];
    registrations = r.data ?? [];
    sessionCounts = counts;
  } catch (e) {
    dbError = e instanceof Error ? e.message : "erro desconhecido";
  }

  const sessionInfo = new Map(
    sessionCounts.map((c) => [c.session_id, { capacity: c.capacity, room: c.room }]),
  );
  const byEmail = new Map(participants.map((p) => [p.email, p]));
  const bySession = new Map<string, Registration[]>();
  for (const r of registrations) {
    const list = bySession.get(r.session_id) ?? [];
    list.push(r);
    bySession.set(r.session_id, list);
  }
  const slotCount = (slot: number) =>
    registrations.filter((r) => r.slot === slot).length;
  const withNeeds = participants.filter((p) => p.accessibility_needs);

  const fullName = (email: string) => {
    const p = byEmail.get(email);
    return p ? `${p.first_name} ${p.last_name}` : email;
  };

  const stats = [
    { label: "Confirmados", value: participants.length },
    { label: "Inscritos slot 1", value: slotCount(1) },
    { label: "Inscritos slot 2", value: slotCount(2) },
    { label: "Sem trilha slot 1", value: participants.length - slotCount(1) },
    { label: "Sem trilha slot 2", value: participants.length - slotCount(2) },
    { label: "Com acessibilidade", value: withNeeds.length },
  ];

  return (
    <main className="mx-auto min-h-dvh max-w-5xl bg-ink px-6 py-10">
      <AutoRefresh seconds={30} />
      <div className="flex items-center justify-between">
        <h1 className="text-[26px] font-bold">Admin · SYNC 2026</h1>
        <div className="flex items-center gap-3">
          <a
            href="/admin/export"
            className="rounded-full border border-white/15 px-4 py-2 text-[13px] font-semibold text-cream"
          >
            CSV geral
          </a>
          <form action={adminLogout}>
            <button className="rounded-full border border-white/15 px-4 py-2 text-[13px] text-mist">
              Sair
            </button>
          </form>
        </div>
      </div>

      {dbError && (
        <p className="mt-6 rounded-2xl border border-[#e07a5f]/40 bg-[#e07a5f]/10 px-4 py-3 text-[14px] text-[#f2a68a]">
          Banco indisponível: {dbError}
        </p>
      )}

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-[20px] border border-white/10 bg-white/[0.05] p-4"
          >
            <p className="tabular text-[30px] font-bold leading-none text-cream">
              {s.value}
            </p>
            <p className="mt-1.5 text-[12px] text-mist">{s.label}</p>
          </div>
        ))}
      </div>

      {([1, 2] as const).map((slot) => (
        <section key={slot} className="mt-10">
          <h2 className="eyebrow mb-4">
            Slot {slot} · {SLOT_TIMES[slot].start.replace(":", "h")}–
            {SLOT_TIMES[slot].end.replace(":", "h")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {tracksForSlot(slot).map((t) => {
              const regs = (bySession.get(t.id) ?? []).sort((a, b) =>
                fullName(a.email).localeCompare(fullName(b.email), "pt-BR"),
              );
              const info = sessionInfo.get(t.id);
              const capacity = info?.capacity;
              return (
                <div
                  key={t.id}
                  className="rounded-[22px] border border-white/10 bg-white/[0.05] p-5"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <div>
                      <p className="text-[17px] font-bold text-cream">
                        {t.shortTitle}
                      </p>
                      <p className="text-[13px] text-mist">{info?.room ?? t.room}</p>
                    </div>
                    <p className="tabular text-[15px] font-semibold text-cream">
                      {regs.length}/{capacity ?? "—"}
                    </p>
                  </div>
                  <div className="mt-3">
                    <Bar registered={regs.length} capacity={capacity ?? 0} />
                  </div>
                  {capacity !== undefined ? (
                    <SessionEditor
                      sessionId={t.id}
                      capacity={capacity}
                      room={info?.room ?? t.room}
                      registered={regs.length}
                    />
                  ) : (
                    <p className="mt-3 text-[12px] text-[#f2a68a]">
                      Sessão não encontrada no banco — rode o seed.
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-3">
                    <a
                      href={`/admin/export?session=${t.id}`}
                      className="text-[12px] text-mist underline-offset-4 hover:underline"
                    >
                      CSV
                    </a>
                  </div>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-[13px] font-semibold text-lime">
                      Ver inscritos ({regs.length})
                    </summary>
                    <ul className="mt-3 flex flex-col gap-2">
                      {regs.length === 0 && (
                        <li className="text-[13px] text-mist">Ninguém ainda.</li>
                      )}
                      {regs.map((r) => (
                        <li
                          key={r.email}
                          className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-white/5 pb-1.5 text-[13px]"
                        >
                          <span className="font-medium text-cream">
                            {fullName(r.email)}
                          </span>
                          <span className="text-mist">{r.email}</span>
                          <span className="tabular text-mist">
                            {new Date(r.created_at).toLocaleTimeString("pt-BR", {
                              timeZone: "America/Sao_Paulo",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <section className="mt-10">
        <h2 className="eyebrow mb-4">Acessibilidade</h2>
        <div className="rounded-[22px] border border-white/10 bg-white/[0.05] p-5">
          {withNeeds.length === 0 ? (
            <p className="text-[14px] text-mist">
              Ninguém respondeu Sim até agora.
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {withNeeds.map((p) => (
                <li key={p.email}>
                  <p className="text-[14px] font-semibold text-cream">
                    {p.first_name} {p.last_name}{" "}
                    <span className="font-normal text-mist">· {p.email}</span>
                  </p>
                  <p className="mt-1 text-[14px] leading-snug text-cream/85">
                    {p.accessibility_needs}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
