import { describe, expect, it } from "vitest";
import { boasVindasSchema, faixasSchema, medicaoSchema } from "./validacao";

describe("medicaoSchema", () => {
  const base = { valor_mg_dl: "110", medido_em: "2026-11-12T10:30:00.000Z", momento: "jejum" };

  it("aceita uma medição válida e converte texto vazio em null", () => {
    const r = medicaoSchema.parse({ ...base, observacao: "  " });
    expect(r.valor_mg_dl).toBe(110);
    expect(r.observacao).toBeNull();
    expect(r.medicamento).toBeNull();
  });

  it.each(["19", "601", "12.5", "abc"])("rejeita valor %s", (valor) => {
    expect(medicaoSchema.safeParse({ ...base, valor_mg_dl: valor }).success).toBe(false);
  });

  it("rejeita momento desconhecido", () => {
    expect(medicaoSchema.safeParse({ ...base, momento: "lanche" }).success).toBe(false);
  });
});

describe("faixasSchema", () => {
  it("aceita limites em ordem crescente", () => {
    const r = faixasSchema.safeParse({
      limite_hipo_grave: 54,
      limite_hipo: 70,
      limite_hiper: 180,
      limite_hiper_grave: 250,
    });
    expect(r.success).toBe(true);
  });

  it("rejeita limites fora de ordem", () => {
    const r = faixasSchema.safeParse({
      limite_hipo_grave: 54,
      limite_hipo: 200,
      limite_hiper: 180,
      limite_hiper_grave: 250,
    });
    expect(r.success).toBe(false);
  });
});

describe("boasVindasSchema", () => {
  it("exige o aceite dos termos", () => {
    expect(boasVindasSchema.safeParse({ nome_paciente: "Ana" }).success).toBe(false);
    expect(boasVindasSchema.safeParse({ nome_paciente: "Ana", aceite: "on" }).success).toBe(true);
  });
});
