import { redirect } from "next/navigation";
import { getParticipantEmail } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import DiaApp from "@/components/DiaApp";

export const dynamic = "force-dynamic";

export default async function DiaPage() {
  const email = await getParticipantEmail();
  if (!email) redirect("/");

  let firstName = "";
  let lastName = "";
  let choice1: string | null = null;
  let choice2: string | null = null;
  try {
    const supabase = supabaseAdmin();
    const [{ data: participant }, { data: regs }] = await Promise.all([
      supabase
        .from("participants")
        .select("first_name, last_name")
        .eq("email", email)
        .maybeSingle(),
      supabase
        .from("registrations")
        .select("session_id, slot")
        .eq("email", email),
    ]);
    firstName = participant?.first_name ?? "";
    lastName = participant?.last_name ?? "";
    for (const r of regs ?? []) {
      if (r.slot === 1) choice1 = r.session_id;
      if (r.slot === 2) choice2 = r.session_id;
    }
  } catch {
    // sem banco: renderiza com slots como "Trilhas paralelas"
  }

  return (
    <DiaApp
      firstName={firstName}
      lastName={lastName}
      choice1={choice1}
      choice2={choice2}
      allowTimeOverride={process.env.ALLOW_TIME_OVERRIDE === "true"}
    />
  );
}
