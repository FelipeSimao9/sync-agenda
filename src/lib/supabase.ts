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
};

export async function fetchSessionCounts(): Promise<SessionCount[]> {
  const { data, error } = await supabaseAdmin()
    .from("session_counts")
    .select("*");
  if (error) throw new Error(error.message);
  return (data ?? []) as SessionCount[];
}
