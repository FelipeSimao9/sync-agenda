import { NextRequest, NextResponse } from "next/server";
import { AGENDA, blockById, type AgendaBlock } from "@/data/agenda";
import { getParticipantEmail } from "@/lib/auth";
import { buildIcs } from "@/lib/ics";
import { fetchSessionRooms, supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function chosenTrackIds(email: string): Promise<Set<string>> {
  try {
    const { data } = await supabaseAdmin()
      .from("registrations")
      .select("session_id")
      .eq("email", email);
    return new Set((data ?? []).map((r) => r.session_id as string));
  } catch {
    return new Set();
  }
}

export async function GET(req: NextRequest) {
  const email = await getParticipantEmail();
  if (!email) {
    return NextResponse.json({ error: "não identificado" }, { status: 401 });
  }
  const scope = req.nextUrl.searchParams.get("scope") ?? "all";

  let blocks: AgendaBlock[];
  if (scope === "block") {
    const block = blockById(req.nextUrl.searchParams.get("id") ?? "");
    if (!block) {
      return NextResponse.json({ error: "bloco não encontrado" }, { status: 404 });
    }
    blocks = [block];
  } else {
    const chosen = await chosenTrackIds(email);
    if (scope === "mine") {
      blocks = AGENDA.filter((b) => chosen.has(b.id));
    } else {
      // all: dia inteiro; nos slots, só a trilha escolhida
      blocks = AGENDA.filter((b) => b.type !== "track" || chosen.has(b.id));
    }
  }

  // sala do banco tem prioridade sobre a da agenda estática
  let rooms: Record<string, string> = {};
  try {
    rooms = await fetchSessionRooms();
  } catch {
    // sem banco: mantém as salas da agenda
  }
  blocks = blocks.map((b) => (rooms[b.id] ? { ...b, room: rooms[b.id] } : b));

  return new NextResponse(buildIcs(blocks), {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": 'attachment; filename="sync-2026.ics"',
      "cache-control": "no-store",
    },
  });
}
