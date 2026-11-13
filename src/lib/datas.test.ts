import { describe, expect, it } from "vitest";
import {
  agruparPorDia,
  campoParaISO,
  chaveDia,
  formatarDataHora,
  formatarHora,
  horaMinutoBrasilia,
  inicioDoDia,
  paraCampoDataHora,
  rotuloDia,
  somarDias,
} from "./datas";

describe("campo de data e hora do formulário (sempre em Brasília)", () => {
  it("preenche o campo com a hora de Brasília, mesmo de madrugada em UTC", () => {
    // 02:15 UTC do dia 13 = 23:15 do dia 12 em Brasília
    expect(paraCampoDataHora(new Date("2026-11-13T02:15:00Z"))).toBe("2026-11-12T23:15");
  });
  it("converte o valor digitado (Brasília) para UTC", () => {
    expect(campoParaISO("2026-11-12T07:00")).toBe("2026-11-12T10:00:00.000Z");
  });
  it("ida e volta preserva a hora", () => {
    const valor = "2026-03-01T00:05";
    expect(paraCampoDataHora(new Date(campoParaISO(valor)))).toBe(valor);
  });
  it("hora e minuto em Brasília", () => {
    expect(horaMinutoBrasilia(new Date("2026-11-13T10:42:00Z"))).toEqual({ hora: 7, minuto: 42 });
  });
});

describe("agruparPorDia", () => {
  it("agrupa pelo dia de Brasília mantendo a ordem", () => {
    const grupos = agruparPorDia([
      { medido_em: "2026-11-13T12:00:00Z" },
      { medido_em: "2026-11-13T01:00:00Z" }, // 22:00 do dia 12 em Brasília
      { medido_em: "2026-11-12T15:00:00Z" },
    ]);
    expect(grupos.map(([dia, itens]) => [dia, itens.length])).toEqual([
      ["2026-11-13", 1],
      ["2026-11-12", 2],
    ]);
  });
});

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
