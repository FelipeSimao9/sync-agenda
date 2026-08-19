import { describe, expect, it } from "vitest";
import { blockById } from "@/data/agenda";
import {
  buildEffectiveAgenda,
  effId,
  getEventState,
  getNowFocus,
  hmToMs,
  parseNowOverride,
  type SlotChoices,
} from "./time";
import { fromZonedTime } from "date-fns-tz";

const at = (iso: string) =>
  fromZonedTime(iso, "America/Sao_Paulo").getTime();

const noChoices: SlotChoices = { 1: null, 2: null };
const withChoices: SlotChoices = {
  1: blockById("track-produtos-ia")!,
  2: blockById("track-fintech")!,
};

describe("getEventState", () => {
  it("pre-event antes do dia 22", () => {
    expect(getEventState(at("2026-08-21T10:00:00"))).toBe("pre-event");
    expect(getEventState(at("2026-08-21T23:59:00"))).toBe("pre-event");
  });
  it("starting-soon na madrugada do dia 22", () => {
    expect(getEventState(at("2026-08-22T00:00:00"))).toBe("starting-soon");
    expect(getEventState(at("2026-08-22T07:30:00"))).toBe("starting-soon");
  });
  it("live durante o evento", () => {
    expect(getEventState(at("2026-08-22T08:00:00"))).toBe("live");
    expect(getEventState(at("2026-08-22T18:29:00"))).toBe("live");
  });
  it("ended depois das 18:30", () => {
    expect(getEventState(at("2026-08-22T18:30:00"))).toBe("ended");
    expect(getEventState(at("2026-08-22T19:00:00"))).toBe("ended");
  });
});

describe("buildEffectiveAgenda", () => {
  it("sem escolhas, slots viram grupo virtual", () => {
    const eff = buildEffectiveAgenda(noChoices);
    const ids = eff.map(effId);
    expect(ids).toContain("slot-group-1");
    expect(ids).toContain("slot-group-2");
    const g1 = eff.find((b) => effId(b) === "slot-group-1");
    expect(g1?.kind === "slot-group" && g1.options.length).toBe(4);
  });
  it("com escolhas, slots viram a trilha escolhida", () => {
    const eff = buildEffectiveAgenda(withChoices);
    const ids = eff.map(effId);
    expect(ids).toContain("track-produtos-ia");
    expect(ids).toContain("track-fintech");
    expect(ids).not.toContain("slot-group-1");
    expect(ids).not.toContain("track-ecossistemas");
  });
});

describe("getNowFocus (regra dos 50%)", () => {
  const eff = buildEffectiveAgenda(withChoices);

  it("primeira metade: foco no atual, secundário no próximo (09:50)", () => {
    const f = getNowFocus(eff, at("2026-08-22T09:50:00"))!;
    expect(effId(f.focus)).toBe("painel-20");
    expect(f.focusKind).toBe("current");
    expect(effId(f.secondary!)).toBe("track-produtos-ia");
    expect(f.secondaryKind).toBe("next");
  });

  it("segunda metade: foco no próximo, secundário no atual (10:40)", () => {
    const f = getNowFocus(eff, at("2026-08-22T10:40:00"))!;
    expect(effId(f.focus)).toBe("track-produtos-ia");
    expect(f.focusKind).toBe("next");
    expect(effId(f.secondary!)).toBe("painel-20");
    expect(f.secondaryKind).toBe("current");
  });

  it("primeira metade do almoço: foco no almoço (12:20)", () => {
    const f = getNowFocus(eff, at("2026-08-22T12:20:00"))!;
    expect(effId(f.focus)).toBe("almoco");
    expect(f.focusKind).toBe("current");
  });

  it("gap: foco no próximo sem secundário (15:50)", () => {
    const f = getNowFocus(eff, at("2026-08-22T15:50:00"))!;
    expect(effId(f.focus)).toBe("coffee");
    expect(f.focusKind).toBe("next");
    expect(f.secondary).toBeNull();
  });

  it("último bloco na segunda metade: foco no atual sem secundário (18:20)", () => {
    const f = getNowFocus(eff, at("2026-08-22T18:20:00"))!;
    expect(effId(f.focus)).toBe("fechamento");
    expect(f.focusKind).toBe("current");
    expect(f.secondary).toBeNull();
  });

  it("depois do fim: null (19:00)", () => {
    expect(getNowFocus(eff, at("2026-08-22T19:00:00"))).toBeNull();
  });

  it("slot sem escolha vira grupo virtual no foco (11:10)", () => {
    const f = getNowFocus(buildEffectiveAgenda(noChoices), at("2026-08-22T11:10:00"))!;
    expect(effId(f.focus)).toBe("slot-group-1");
    expect(f.focusKind).toBe("current");
  });
});

describe("parseNowOverride", () => {
  it("aceita formato válido", () => {
    expect(parseNowOverride("2026-08-22T14:50")).toBe(
      at("2026-08-22T14:50:00"),
    );
  });
  it("rejeita lixo", () => {
    expect(parseNowOverride("banana")).toBeNull();
    expect(parseNowOverride(null)).toBeNull();
  });
});

describe("hmToMs", () => {
  it("11:00 SP = 14:00 UTC (BRT, UTC-3)", () => {
    expect(hmToMs("11:00")).toBe(Date.UTC(2026, 7, 22, 14, 0));
  });
});
