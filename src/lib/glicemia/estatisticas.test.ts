import { describe, expect, it } from "vitest";
import { FAIXAS_PADRAO } from "./classificar";
import { calcularResumo, percentuaisInteiros } from "./estatisticas";

describe("percentuaisInteiros", () => {
  it("soma exatamente 100", () => {
    expect(percentuaisInteiros([1, 1, 1])).toEqual([34, 33, 33]);
    expect(percentuaisInteiros([2, 1]).reduce((a, b) => a + b)).toBe(100);
  });
  it("sem medições, tudo zero", () => {
    expect(percentuaisInteiros([0, 0])).toEqual([0, 0]);
  });
});

describe("calcularResumo", () => {
  const medicoes = [
    { valor_mg_dl: 50, momento: "madrugada" }, // hipo grave
    { valor_mg_dl: 65, momento: "jejum" }, // hipo
    { valor_mg_dl: 95, momento: "jejum" }, // meta
    { valor_mg_dl: 150, momento: "depois_almoco" }, // meta
    { valor_mg_dl: 210, momento: "depois_almoco" }, // hiper
    { valor_mg_dl: 300, momento: "depois_jantar" }, // hiper grave
  ] as const;

  const r = calcularResumo([...medicoes], FAIXAS_PADRAO);

  it("calcula média, mínimo, máximo e total", () => {
    expect(r.total).toBe(6);
    expect(r.media).toBe(145); // 870 / 6
    expect(r.minimo).toBe(50);
    expect(r.maximo).toBe(300);
  });

  it("distribui por faixa com percentuais que somam 100", () => {
    expect(r.porClasse.meta).toEqual({ quantidade: 2, percentual: 33 });
    expect(r.porClasse.hipo_grave.quantidade).toBe(1);
    const soma = Object.values(r.porClasse).reduce((a, c) => a + c.percentual, 0);
    expect(soma).toBe(100);
  });

  it("conta hipo e hiperglicemias, separando as graves", () => {
    expect(r.hipoglicemias).toEqual({ total: 2, graves: 1 });
    expect(r.hiperglicemias).toEqual({ total: 2, graves: 1 });
  });

  it("calcula a média por momento na ordem do dia", () => {
    expect(r.porMomento).toEqual([
      { momento: "jejum", media: 80, quantidade: 2 },
      { momento: "depois_almoco", media: 180, quantidade: 2 },
      { momento: "depois_jantar", media: 300, quantidade: 1 },
      { momento: "madrugada", media: 50, quantidade: 1 },
    ]);
  });

  it("lida com período sem medições", () => {
    const vazio = calcularResumo([], FAIXAS_PADRAO);
    expect(vazio.total).toBe(0);
    expect(vazio.media).toBeNull();
    expect(vazio.porMomento).toEqual([]);
  });

  it("usa as faixas personalizadas do usuário", () => {
    const rigida = { ...FAIXAS_PADRAO, limite_hiper: 140 };
    expect(calcularResumo([...medicoes], rigida).porClasse.meta.quantidade).toBe(1);
  });
});
