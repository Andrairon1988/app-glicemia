/** Períodos disponíveis no Resumo, no relatório e na tela do familiar. */
export const PERIODOS_RESUMO = [7, 14, 30, 90] as const;

/** Lê "dias" da URL; qualquer valor fora da lista vira o padrão. */
export function lerDias(valor: string | string[] | null | undefined, padrao = 14): number {
  const n = Number(Array.isArray(valor) ? valor[0] : valor);
  return (PERIODOS_RESUMO as readonly number[]).includes(n) ? n : padrao;
}
