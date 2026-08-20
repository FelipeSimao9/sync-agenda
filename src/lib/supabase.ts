import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Client admin (service role) — só existe no servidor. Nenhuma chave do
 * Supabase vai para o bundle do cliente.
 */
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type SessionCount = {
  session_id: string;
  slot: 1 | 2;
  capacity: number;
  registered: number;
  remaining: number;
  room?: string;
};

export async function fetchSessionCounts(): Promise<SessionCount[]> {
  const supabase = supabaseAdmin();
  const [counts, sessions] = await Promise.all([
    supabase.from("session_counts").select("*"),
    supabase.from("sessions").select("id, room"),
  ]);
  if (counts.error) throw new Error(counts.error.message);
  if (sessions.error) throw new Error(sessions.error.message);
  const rooms = new Map(
    (sessions.data ?? []).map((s) => [s.id as string, s.room as string]),
  );
  return ((counts.data ?? []) as SessionCount[]).map((c) => ({
    ...c,
    room: rooms.get(c.session_id),
  }));
}

/** Mapa session_id → sala, direto da tabela `sessions` (fonte da verdade). */
export async function fetchSessionRooms(): Promise<Record<string, string>> {
  const { data, error } = await supabaseAdmin().from("sessions").select("id, room");
  if (error) throw new Error(error.message);
  return Object.fromEntries((data ?? []).map((s) => [s.id, s.room]));
}
