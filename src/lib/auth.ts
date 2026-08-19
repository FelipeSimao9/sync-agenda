import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const PARTICIPANT_COOKIE = "sync_email";
export const ADMIN_COOKIE = "sync_admin";
const WEEK = 60 * 60 * 24 * 7;

function hmac(value: string): string {
  const secret = process.env.ADMIN_PASSWORD ?? "";
  return createHmac("sha256", `sync-admin:${secret}`).update(value).digest("hex");
}

export async function setParticipantCookie(email: string) {
  const store = await cookies();
  store.set(PARTICIPANT_COOKIE, email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: WEEK,
    path: "/",
  });
}

export async function getParticipantEmail(): Promise<string | null> {
  const store = await cookies();
  return store.get(PARTICIPANT_COOKIE)?.value ?? null;
}

export async function clearParticipantCookie() {
  const store = await cookies();
  store.delete(PARTICIPANT_COOKIE);
}

/** Cookie de admin assinado (HMAC com ADMIN_PASSWORD como chave). */
export async function setAdminCookie() {
  const payload = "admin";
  const store = await cookies();
  store.set(ADMIN_COOKIE, `${payload}.${hmac(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: WEEK,
    path: "/",
  });
}

export async function isAdmin(): Promise<boolean> {
  if (!process.env.ADMIN_PASSWORD) return false;
  const store = await cookies();
  const raw = store.get(ADMIN_COOKIE)?.value;
  if (!raw) return false;
  const dot = raw.lastIndexOf(".");
  if (dot < 0) return false;
  const payload = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  const expected = hmac(payload);
  if (sig.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

export async function clearAdminCookie() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}
