import { NextRequest, NextResponse } from "next/server";
import { blockById } from "@/data/agenda";
import { isAdmin } from "@/lib/auth";
import { fetchSessionRooms, supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function csvField(value: string | null | undefined): string {
  const v = value ?? "";
  return /[",\n;]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }
  const sessionId = req.nextUrl.searchParams.get("session");

  const supabase = supabaseAdmin();
  let query = supabase
    .from("registrations")
    .select("email, session_id, slot, created_at, participants(first_name, last_name, accessibility_needs)");
  if (sessionId) query = query.eq("session_id", sessionId);
  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let rooms: Record<string, string> = {};
  try {
    rooms = await fetchSessionRooms();
  } catch {
    // sem banco: mantém as salas da agenda
  }

  const header =
    "first_name,last_name,email,accessibility_needs,slot,session_title,room,created_at";
  const rows = (data ?? []).map((r) => {
    const p = r.participants as unknown as {
      first_name: string;
      last_name: string;
      accessibility_needs: string | null;
    } | null;
    const block = blockById(r.session_id);
    return [
      csvField(p?.first_name),
      csvField(p?.last_name),
      csvField(r.email),
      csvField(p?.accessibility_needs),
      String(r.slot),
      csvField(block?.title ?? r.session_id),
      csvField(rooms[r.session_id] ?? block?.room),
      csvField(r.created_at),
    ].join(",");
  });

  const csv = "\uFEFF" + [header, ...rows].join("\r\n") + "\r\n";
  const name = sessionId ? `sync-2026-${sessionId}.csv` : "sync-2026-inscritos.csv";
  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${name}"`,
      "cache-control": "no-store",
    },
  });
}
