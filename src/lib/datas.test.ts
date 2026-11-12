import { describe, expect, it } from "vitest";
import { chaveDia, formatarDataHora, formatarHora, inicioDoDia, rotuloDia, somarDias } from "./datas";

describe("datas no horário de Brasília", () => {
  it("usa o dia de Brasília, não o UTC", () => {
    // 01:30 UTC do dia 13 = 22:30 do dia 12 em Brasília
    expect(chaveDia("2026-11-13T01:30:00Z")).toBe("2026-11-12");
    expect(formatarHora("2026-11-13T01:30:00Z")).toBe("22:30");
  });

  it("formata data e hora em pt-BR", () => {
    expect(formatarDataHora("2026-11-12T17:05:00Z")).toBe("12/11/2026 às 14:05");
  });

  it("calcula o início do dia em Brasília", () => {
    expect(inicioDoDia("2026-11-12")).toBe("2026-11-12T03:00:00.000Z");
  });

  it("soma dias atravessando meses", () => {
    expect(somarDias("2026-11-30", 1)).toBe("2026-12-01");
    expect(somarDias("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("rotula hoje, ontem e outros dias", () => {
    const agora = new Date("2026-11-12T15:00:00Z");
    expect(rotuloDia("2026-11-12", agora)).toBe("Hoje");
    expect(rotuloDia("2026-11-11", agora)).toBe("Ontem");
    expect(rotuloDia("2026-11-09", agora)).toMatch(/^Segunda-feira, 09\/11\/2026$/);
  });
});
