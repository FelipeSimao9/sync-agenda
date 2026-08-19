import { getParticipantEmail } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import Opening from "./Opening";

export const dynamic = "force-dynamic";

export default async function Page() {
  const email = await getParticipantEmail();
  let confirmed = false;
  if (email) {
    try {
      const { data } = await supabaseAdmin()
        .from("participants")
        .select("email")
        .eq("email", email)
        .maybeSingle();
      confirmed = Boolean(data);
    } catch {
      // sem banco: considera o cookie suficiente
      confirmed = true;
    }
  }
  return <Opening autoAdvance={confirmed} />;
}
