import { fromZonedTime, formatInTimeZone } from "date-fns-tz";
import {
  AGENDA,
  EVENT_DATE,
  EVENT_END,
  EVENT_START,
  EVENT_TZ,
  SLOT_TIMES,
  tracksForSlot,
  type AgendaBlock,
} from "@/data/agenda";

export type EventState = "pre-event" | "starting-soon" | "live" | "ended";

/** 'HH:mm' do dia do evento → epoch ms (America/Sao_Paulo). */
export function hmToMs(hm: string): number {
  return fromZonedTime(`${EVENT_DATE}T${hm}:00`, EVENT_TZ).getTime();
}

export function getEventState(nowMs: number): EventState {
  const dayStart = fromZonedTime(`${EVENT_DATE}T00:00:00`, EVENT_TZ).getTime();
  if (nowMs < dayStart) return "pre-event";
  if (nowMs < hmToMs(EVENT_START)) return "starting-soon";
  if (nowMs < hmToMs(EVENT_END)) return "live";
  return "ended";
}

/** Dias inteiros de calendário (em SP) até o dia do evento. */
export function daysUntilEvent(nowMs: number): number {
  const today = formatInTimeZone(nowMs, EVENT_TZ, "yyyy-MM-dd");
  const a = Date.UTC(
    Number(today.slice(0, 4)),
    Number(today.slice(5, 7)) - 1,
    Number(today.slice(8, 10)),
  );
  const b = Date.UTC(2026, 7, 22);
  return Math.round((b - a) / 86_400_000);
}

/**
 * Bloco efetivo da agenda do participante. Nos slots, ou é a trilha escolhida
 * (bloco real) ou um bloco virtual "Trilhas paralelas" com as opções.
 */
export type EffectiveBlock =
  | { kind: "block"; block: AgendaBlock }
  | {
      kind: "slot-group";
      slot: 1 | 2;
      start: string;
      end: string;
      title: string;
      options: AgendaBlock[];
    };

export type SlotChoices = { 1: AgendaBlock | null; 2: AgendaBlock | null };

export function buildEffectiveAgenda(choices: SlotChoices): EffectiveBlock[] {
  const out: EffectiveBlock[] = [];
  const seenSlots = new Set<number>();
  for (const block of AGENDA) {
    if (block.type === "track" && block.slot) {
      if (seenSlots.has(block.slot)) continue;
      seenSlots.add(block.slot);
      const chosen = choices[block.slot];
      if (chosen) {
        out.push({ kind: "block", block: chosen });
      } else {
        out.push({
          kind: "slot-group",
          slot: block.slot,
          start: SLOT_TIMES[block.slot].start,
          end: SLOT_TIMES[block.slot].end,
          title: "Trilhas paralelas",
          options: tracksForSlot(block.slot),
        });
      }
    } else {
      out.push({ kind: "block", block });
    }
  }
  return out;
}

export function effStart(b: EffectiveBlock): string {
  return b.kind === "block" ? b.block.start : b.start;
}
export function effEnd(b: EffectiveBlock): string {
  return b.kind === "block" ? b.block.end : b.end;
}
export function effTitle(b: EffectiveBlock): string {
  return b.kind === "block" ? b.block.title : b.title;
}
export function effId(b: EffectiveBlock): string {
  return b.kind === "block" ? b.block.id : `slot-group-${b.slot}`;
}

export type FocusKind = "current" | "next";
export type NowFocus = {
  focus: EffectiveBlock;
  focusKind: FocusKind;
  secondary: EffectiveBlock | null;
  secondaryKind: FocusKind | null;
};

/**
 * Regra dos 50%: na primeira metade do bloco atual, o foco é o atual;
 * na segunda metade, o foco vira o próximo (se existir). Em gap, foco no
 * próximo sem secundário. Último bloco: foco no atual sem secundário.
 */
export function getNowFocus(
  blocks: EffectiveBlock[],
  nowMs: number,
): NowFocus | null {
  const current =
    blocks.find(
      (b) => hmToMs(effStart(b)) <= nowMs && nowMs < hmToMs(effEnd(b)),
    ) ?? null;
  const next = blocks.find((b) => hmToMs(effStart(b)) > nowMs) ?? null;

  if (current) {
    const startMs = hmToMs(effStart(current));
    const endMs = hmToMs(effEnd(current));
    const mid = startMs + (endMs - startMs) / 2;
    if (nowMs < mid || !next) {
      return {
        focus: current,
        focusKind: "current",
        secondary: next,
        secondaryKind: next ? "next" : null,
      };
    }
    return {
      focus: next,
      focusKind: "next",
      secondary: current,
      secondaryKind: "current",
    };
  }
  if (next) {
    return { focus: next, focusKind: "next", secondary: null, secondaryKind: null };
  }
  return null;
}

/** Fração já decorrida de um bloco (0–1), para a barra de progresso. */
export function blockProgress(b: EffectiveBlock, nowMs: number): number {
  const start = hmToMs(effStart(b));
  const end = hmToMs(effEnd(b));
  return Math.min(1, Math.max(0, (nowMs - start) / (end - start)));
}

export function minutesUntil(hm: string, nowMs: number): number {
  return Math.max(0, Math.ceil((hmToMs(hm) - nowMs) / 60_000));
}

/** Formata um instante no fuso do evento. */
export function fmtInTz(ms: number, pattern: string): string {
  return formatInTimeZone(ms, EVENT_TZ, pattern);
}

/** Interpreta `?now=` (ex.: 2026-08-22T14:50) como horário de São Paulo. */
export function parseNowOverride(raw: string | null): number | null {
  if (!raw) return null;
  const m = raw.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(?::\d{2})?$/);
  if (!m) return null;
  const ms = fromZonedTime(`${m[1]}T${m[2]}:00`, EVENT_TZ).getTime();
  return Number.isNaN(ms) ? null : ms;
}
