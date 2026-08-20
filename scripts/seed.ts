/**
 * Upsert idempotente das trilhas (blocos `track` de src/data/agenda.ts)
 * na tabela `sessions`. Rode com: npm run seed
 *
 * Capacidade e sala são geridas no banco (editáveis no painel /admin):
 * sessões novas entram com DEFAULT_CAPACITY e a sala da agenda; sessões
 * existentes NUNCA têm capacidade nem sala sobrescritas pelo seed.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { createClient } from "@supabase/supabase-js";
import { TRACKS } from "../src/data/agenda";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "Faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no .env.local",
    );
    process.exit(1);
  }
  const supabase = createClient(url, key, {
    auth: { persistSession: false },
  });

  const DEFAULT_CAPACITY = 50;

  const rows = TRACKS.map((t, i) => ({
    id: t.id,
    slot: t.slot,
    title: t.title,
    room: t.room,
    sort_order: i,
  }));

  const { data: existing, error: fetchError } = await supabase
    .from("sessions")
    .select("id, capacity");
  if (fetchError) {
    console.error("Seed falhou:", fetchError.message);
    process.exit(1);
  }
  const existingIds = new Set((existing ?? []).map((s) => s.id));

  const toInsert = rows
    .filter((r) => !existingIds.has(r.id))
    .map((r) => ({ ...r, capacity: DEFAULT_CAPACITY }));
  const toUpdate = rows.filter((r) => existingIds.has(r.id));

  if (toInsert.length > 0) {
    const { error } = await supabase.from("sessions").insert(toInsert);
    if (error) {
      console.error("Seed falhou:", error.message);
      process.exit(1);
    }
  }
  for (const r of toUpdate) {
    const { error } = await supabase
      .from("sessions")
      .update({ slot: r.slot, title: r.title, sort_order: r.sort_order })
      .eq("id", r.id);
    if (error) {
      console.error("Seed falhou:", error.message);
      process.exit(1);
    }
  }

  console.log(
    `Seed ok: ${toInsert.length} sessões criadas (cap ${DEFAULT_CAPACITY}), ${toUpdate.length} atualizadas (capacidade e sala preservadas — ajuste no /admin).`,
  );
  for (const r of rows) {
    console.log(`  slot ${r.slot} · ${r.id} · ${r.room}`);
  }
}

main();
