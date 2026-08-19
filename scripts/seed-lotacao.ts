/**
 * Seed de TESTE: lota trilhas com participantes fake para testar o estado
 * "Esgotado" no /escolher.
 *
 *   npm run seed:lotacao          # slot 1 inteiro lotado + Fintech (slot 2) lotada
 *   npm run seed:lotacao -- --undo  # remove todos os fakes (email lotacao+...)
 *
 * Os fakes usam e-mail `lotacao+<sessao>-<n>@teste.sync`; o --undo apaga por
 * esse prefixo (registrations caem em cascata). Não mexe em inscrições reais.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { createClient } from "@supabase/supabase-js";

const FULL_SESSIONS = [
  { id: "track-ecossistemas", slot: 1 },
  { id: "track-produtos-ia", slot: 1 },
  { id: "track-pitch-mvp", slot: 1 },
  { id: "track-pitch-seed", slot: 1 },
  { id: "track-fintech", slot: 2 },
];

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Faltam as variáveis do Supabase no .env.local");
    process.exit(1);
  }
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  if (process.argv.includes("--undo")) {
    const { error, count } = await supabase
      .from("participants")
      .delete({ count: "exact" })
      .like("email", "lotacao+%");
    if (error) throw new Error(error.message);
    console.log(`Undo ok: ${count} participantes fake removidos.`);
    return;
  }

  for (const target of FULL_SESSIONS) {
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("id, capacity")
      .eq("id", target.id)
      .single();
    if (sessionError || !session) {
      throw new Error(`Sessão ${target.id} não encontrada — rode npm run seed antes.`);
    }

    const { count: registered, error: countError } = await supabase
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("session_id", target.id);
    if (countError) throw new Error(countError.message);

    const missing = session.capacity - (registered ?? 0);
    if (missing <= 0) {
      console.log(`${target.id}: já lotada (${registered}/${session.capacity}).`);
      continue;
    }

    const participants = Array.from({ length: missing }, (_, i) => ({
      email: `lotacao+${target.id}-${i}@teste.sync`,
      first_name: "Teste",
      last_name: `Lotação ${i + 1}`,
      accessibility_needs: null,
    }));
    const { error: pError } = await supabase
      .from("participants")
      .upsert(participants);
    if (pError) throw new Error(pError.message);

    const registrations = participants.map((p) => ({
      email: p.email,
      session_id: target.id,
      slot: target.slot,
    }));
    const { error: rError } = await supabase
      .from("registrations")
      .upsert(registrations, { onConflict: "email,slot" });
    if (rError) throw new Error(rError.message);

    console.log(
      `${target.id}: +${missing} fakes → ${session.capacity}/${session.capacity} (lotada).`,
    );
  }
  console.log("\nPronto. Para reverter: npm run seed:lotacao -- --undo");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
