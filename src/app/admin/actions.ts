"use server";

import { timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { clearAdminCookie, setAdminCookie } from "@/lib/auth";

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
