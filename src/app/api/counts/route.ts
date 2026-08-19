import { NextResponse } from "next/server";
import { getCounts } from "@/app/actions";

export const dynamic = "force-dynamic";

export async function GET() {
  const counts = await getCounts();
  return NextResponse.json(counts, {
    headers: { "cache-control": "no-store" },
  });
}
