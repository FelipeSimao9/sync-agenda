import { EVENT_DATE, EVENT_TZ, VENUE, type AgendaBlock } from "@/data/agenda";

function esc(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/** Dobra linhas a 75 octetos (RFC 5545). */
function fold(line: string): string {
  const bytes = Buffer.from(line, "utf-8");
  if (bytes.length <= 75) return line;
  const out: string[] = [];
  let start = 0;
  let first = true;
  while (start < bytes.length) {
    let take = Math.min(first ? 75 : 74, bytes.length - start);
    // não corta no meio de um caractere multibyte
    while (take > 1 && (bytes[start + take] & 0b1100_0000) === 0b1000_0000) {
      take--;
    }
    out.push((first ? "" : " ") + bytes.subarray(start, start + take).toString("utf-8"));
    start += take;
    first = false;
  }
  return out.join("\r\n");
}

function dt(hm: string): string {
  return `${EVENT_DATE.replaceAll("-", "")}T${hm.replace(":", "")}00`;
}

/**
 * Gera o VCALENDAR com VTIMEZONE de America/Sao_Paulo (sem DST desde 2019)
 * e DTSTART/DTEND com TZID.
 */
export function buildIcs(blocks: AgendaBlock[]): string {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SYNC 2026//Companion//PT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VTIMEZONE",
    `TZID:${EVENT_TZ}`,
    "BEGIN:STANDARD",
    "DTSTART:19700101T000000",
    "TZOFFSETFROM:-0300",
    "TZOFFSETTO:-0300",
    "TZNAME:-03",
    "END:STANDARD",
    "END:VTIMEZONE",
  ];
  for (const block of blocks) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:sync-2026-${block.id}@sync2026`,
      `DTSTAMP:${stamp}`,
      `DTSTART;TZID=${EVENT_TZ}:${dt(block.start)}`,
      `DTEND;TZID=${EVENT_TZ}:${dt(block.end)}`,
      `SUMMARY:${esc(`SYNC 2026 — ${block.title}`)}`,
      `LOCATION:${esc(`${block.room}, ${VENUE}`)}`,
    );
    if (block.description) {
      lines.push(`DESCRIPTION:${esc(block.description)}`);
    }
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
