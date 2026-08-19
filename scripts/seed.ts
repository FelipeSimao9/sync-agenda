/**
 * Upsert idempotente das trilhas (blocos `track` de src/data/agenda.ts)
 * na tabela `sessions`. Rode com: npm run seed
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

  const rows = TRACKS.map((t, i) => ({
    id: t.id,
    slot: t.slot,
    title: t.title,
    room: t.room,
    capacity: t.capacity,
    sort_order: i,
  }));

  const { error } = await supabase.from("sessions").upsert(rows);
  if (error) {
    console.error("Seed falhou:", error.message);
    process.exit(1);
  }
  console.log(`Seed ok: ${rows.length} sessões upsertadas.`);
  for (const r of rows) {
    console.log(`  slot ${r.slot} · ${r.id} · ${r.room} · cap ${r.capacity}`);
  }
}

main();
