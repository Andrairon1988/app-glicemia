import { describe, expect, it } from "vitest";
import { rotuloMomento, sugerirMomento } from "./momentos";

// Horários explícitos de Brasília: o resultado não depende do fuso do computador.
const as = (h: number, m = 0) =>
  new Date(`2026-01-01T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00-03:00`);

describe("sugerirMomento", () => {
  it.each([
    [3, 0, "madrugada"],
    [6, 30, "jejum"],
    [9, 0, "depois_cafe"],
    [11, 0, "antes_almoco"],
    [13, 0, "depois_almoco"],
    [19, 0, "antes_jantar"],
    [21, 0, "depois_jantar"],
    [23, 0, "antes_dormir"],
  ] as const)("%i:%i -> %s", (h, m, esperado) => {
    expect(sugerirMomento(as(h, m))).toBe(esperado);
  });
});

it("rotuloMomento traduz para português", () => {
  expect(rotuloMomento("antes_almoco")).toBe("Antes do almoço");
});
