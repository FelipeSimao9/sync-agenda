"use server";

import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminCookie, isAdmin, setAdminCookie } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function adminLogin(password: string): Promise<{ ok: boolean }> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return { ok: false };
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false };
  await setAdminCookie();
  return { ok: true };
}

export async function adminLogout() {
  await clearAdminCookie();
  redirect("/admin/login");
}

export type UpdateSessionResult = { ok: true } | { ok: false; error: string };

export async function updateSession(
  sessionId: string,
  changes: { capacity?: number; room?: string },
): Promise<UpdateSessionResult> {
  if (!(await isAdmin())) return { ok: false, error: "Não autorizado." };

  const patch: { capacity?: number; room?: string } = {};
  if (changes.capacity !== undefined) {
    const value = Math.floor(changes.capacity);
    if (!Number.isFinite(value) || value < 1) {
      return { ok: false, error: "Capacidade precisa ser um número maior que zero." };
    }
    patch.capacity = value;
  }
  if (changes.room !== undefined) {
    const room = changes.room.trim();
    if (!room) return { ok: false, error: "O nome da sala não pode ficar vazio." };
    patch.room = room;
  }
  if (Object.keys(patch).length === 0) {
    return { ok: false, error: "Nada para salvar." };
  }

  try {
    const { data, error } = await supabaseAdmin()
      .from("sessions")
      .update(patch)
      .eq("id", sessionId)
      .select("id");
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) {
      return { ok: false, error: "Sessão não encontrada no banco." };
    }
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erro desconhecido." };
  }
}
