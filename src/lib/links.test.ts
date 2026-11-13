import { describe, expect, it } from "vitest";
import { calcularExpiracao, statusLink } from "./links";

const agora = new Date("2026-11-13T12:00:00Z");

describe("statusLink", () => {
  it("ativo quando não tem validade e não foi desativado", () => {
    expect(statusLink({ expira_em: null, revogado_em: null }, agora)).toBe("ativo");
  });
  it("ativo antes de expirar", () => {
    expect(statusLink({ expira_em: "2026-11-14T00:00:00Z", revogado_em: null }, agora)).toBe("ativo");
  });
  it("expirado depois da data", () => {
    expect(statusLink({ expira_em: "2026-11-13T11:59:59Z", revogado_em: null }, agora)).toBe("expirado");
  });
  it("desativado tem prioridade sobre a validade", () => {
    expect(statusLink({ expira_em: "2027-01-01T00:00:00Z", revogado_em: "2026-11-10T00:00:00Z" }, agora)).toBe("desativado");
  });
});

describe("calcularExpiracao", () => {
  it("soma os dias escolhidos", () => {
    expect(calcularExpiracao("7", agora)).toBe("2026-11-20T12:00:00.000Z");
    expect(calcularExpiracao("90", agora)).toBe("2027-02-11T12:00:00.000Z");
  });
  it("sem validade devolve null", () => {
    expect(calcularExpiracao("sem", agora)).toBeNull();
  });
});
