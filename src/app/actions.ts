"use server";

import { redirect } from "next/navigation";
import {
  clearParticipantCookie,
  isValidEmail,
  normalizeEmail,
  setParticipantCookie,
} from "@/lib/auth";
import { fetchSessionCounts, supabaseAdmin } from "@/lib/supabase";
import { tracksForSlot } from "@/data/agenda";

export type CheckEmailResult =
  | { status: "existing" }
  | { status: "new" }
  | { status: "invalid" }
  | { status: "error" };

export async function checkEmail(raw: string): Promise<CheckEmailResult> {
  const email = normalizeEmail(raw);
  if (!isValidEmail(email)) return { status: "invalid" };
  try {
    const { data, error } = await supabaseAdmin()
      .from("participants")
      .select("email")
      .eq("email", email)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (data) {
      await setParticipantCookie(email);
      return { status: "existing" };
    }
    return { status: "new" };
  } catch {
    // sem banco configurado (dev), segue como cadastro novo
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return { status: "new" };
    return { status: "error" };
  }
}

export type CountsMap = Record<
  string,
  { registered: number; remaining: number; capacity: number; room?: string }
>;

export async function getCounts(): Promise<CountsMap> {
  const map: CountsMap = {};
  try {
    for (const c of await fetchSessionCounts()) {
      map[c.session_id] = {
        registered: c.registered,
        remaining: c.remaining,
        capacity: c.capacity,
        room: c.room,
      };
    }
  } catch {
    // sem banco (dev), degrade para "tudo disponível" com capacidade fictícia
    const DEV_CAPACITY = 100;
    for (const slot of [1, 2] as const) {
      for (const t of tracksForSlot(slot)) {
        map[t.id] = { registered: 0, remaining: DEV_CAPACITY, capacity: DEV_CAPACITY };
      }
    }
  }
  return map;
}

export type ConfirmInput = {
  email: string;
  firstName: string;
  lastName: string;
  accessibility: string | null;
  sessionSlot1: string | null;
  sessionSlot2: string | null;
};

export type ConfirmResult =
  | { ok: true }
  | { ok: false; reason: "already_registered" }
  | { ok: false; reason: "full"; slot: 1 | 2 }
  | { ok: false; reason: "invalid_session"; slot?: 1 | 2 }
  | { ok: false; reason: "invalid_input" }
  | { ok: false; reason: "error" };

export async function confirmChoices(input: ConfirmInput): Promise<ConfirmResult> {
  const email = normalizeEmail(input.email);
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  if (!isValidEmail(email) || !firstName || !lastName) {
    return { ok: false, reason: "invalid_input" };
  }
  for (const [slot, id] of [
    [1, input.sessionSlot1],
    [2, input.sessionSlot2],
  ] as const) {
    if (id !== null && !tracksForSlot(slot).some((t) => t.id === id)) {
      return { ok: false, reason: "invalid_session", slot };
    }
  }
  try {
    const { data, error } = await supabaseAdmin().rpc("confirm_registration", {
      p_email: email,
      p_first_name: firstName,
      p_last_name: lastName,
      p_accessibility: input.accessibility ?? "",
      p_session_slot1: input.sessionSlot1,
      p_session_slot2: input.sessionSlot2,
    });
    if (error) throw new Error(error.message);
    const result = data as { ok: boolean; reason?: string; slot?: number };
    if (result.ok || result.reason === "already_registered") {
      await setParticipantCookie(email);
    }
    if (result.ok) return { ok: true };
    if (result.reason === "already_registered") {
      return { ok: false, reason: "already_registered" };
    }
    if (result.reason === "full") {
      return { ok: false, reason: "full", slot: result.slot as 1 | 2 };
    }
    return {
      ok: false,
      reason: "invalid_session",
      slot: result.slot as 1 | 2 | undefined,
    };
  } catch {
    return { ok: false, reason: "error" };
  }
}

export async function signOut() {
  await clearParticipantCookie();
  redirect("/");
}
