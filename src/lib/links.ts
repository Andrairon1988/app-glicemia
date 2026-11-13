/** Regras dos links de compartilhamento (sem acesso ao banco: fáceis de testar). */

export const VALIDADES = [
  { valor: "7", rotulo: "7 dias", dias: 7 },
  { valor: "30", rotulo: "30 dias", dias: 30 },
  { valor: "90", rotulo: "90 dias", dias: 90 },
  { valor: "sem", rotulo: "Sem validade", dias: null },
] as const;

export type Validade = (typeof VALIDADES)[number]["valor"];

export type LinkInfo = {
  expira_em: string | null;
  revogado_em: string | null;
};

export type StatusLink = "ativo" | "expirado" | "desativado";

export function statusLink(link: LinkInfo, agora: Date = new Date()): StatusLink {
  if (link.revogado_em) return "desativado";
  if (link.expira_em && new Date(link.expira_em) <= agora) return "expirado";
  return "ativo";
}

/** Data de expiração para uma validade escolhida (null = sem validade). */
export function calcularExpiracao(validade: Validade, agora: Date = new Date()): string | null {
  const dias = VALIDADES.find((v) => v.valor === validade)?.dias ?? null;
  if (dias === null) return null;
  return new Date(agora.getTime() + dias * 24 * 60 * 60 * 1000).toISOString();
}
