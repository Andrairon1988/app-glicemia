import { describe, expect, it } from "vitest";
import { classificar, FAIXAS_PADRAO, INFO_CLASSE, orientacaoGrave } from "./classificar";

describe("classificar (faixas padrão 54/70/180/250)", () => {
  it.each([
    [20, "hipo_grave"],
    [53, "hipo_grave"],
    [54, "hipo"],
    [69, "hipo"],
    [70, "meta"],
    [120, "meta"],
    [180, "meta"],
    [181, "hiper"],
    [250, "hiper"],
    [251, "hiper_grave"],
    [600, "hiper_grave"],
  ] as const)("%i mg/dL -> %s", (valor, esperado) => {
    expect(classificar(valor)).toBe(esperado);
  });
});

describe("classificar com faixas personalizadas", () => {
  const gestacional = {
    limite_hipo_grave: 54,
    limite_hipo: 65,
    limite_hiper: 140,
    limite_hiper_grave: 200,
  };

  it("respeita os limites definidos pelo usuário", () => {
    expect(classificar(66, gestacional)).toBe("meta");
    expect(classificar(141, gestacional)).toBe("hiper");
    expect(classificar(201, gestacional)).toBe("hiper_grave");
    // o mesmo valor muda de classe conforme a faixa
    expect(classificar(150, FAIXAS_PADRAO)).toBe("meta");
    expect(classificar(150, gestacional)).toBe("hiper");
  });
});

describe("informações das classes", () => {
  it("apenas as faixas graves têm orientação de alerta", () => {
    expect(INFO_CLASSE.hipo_grave.grave).toBe(true);
    expect(INFO_CLASSE.hiper_grave.grave).toBe(true);
    expect(orientacaoGrave("hipo_grave")).toMatch(/SAMU/);
    expect(orientacaoGrave("hiper_grave")).toMatch(/SAMU/);
    expect(orientacaoGrave("meta")).toBeNull();
    expect(orientacaoGrave("hipo")).toBeNull();
  });
});
