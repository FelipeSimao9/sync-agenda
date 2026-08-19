import { EVENT_DATE, EVENT_TZ, VENUE, type AgendaBlock } from "@/data/agenda";

/** Link "Abrir no Google Calendar" para um bloco (fallback Android). */
export function googleCalendarUrl(block: AgendaBlock): string {
  const day = EVENT_DATE.replaceAll("-", "");
  const fmt = (hm: string) => `${day}T${hm.replace(":", "")}00`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `SYNC 2026 — ${block.title}`,
    dates: `${fmt(block.start)}/${fmt(block.end)}`,
    location: `${block.room}, ${VENUE}`,
    ctz: EVENT_TZ,
    details: block.description ?? "",
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
