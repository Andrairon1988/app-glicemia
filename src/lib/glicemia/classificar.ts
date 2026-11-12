/** Limites (em mg/dL) que separam as faixas de glicemia. */
export type Faixas = {
  limite_hipo_grave: number;
  limite_hipo: number;
  limite_hiper: number;
  limite_hiper_grave: number;
};

/** Padrões da Sociedade Brasileira de Diabetes (editáveis pelo usuário). */
export const FAIXAS_PADRAO: Faixas = {
  limite_hipo_grave: 54,
  limite_hipo: 70,
  limite_hiper: 180,
  limite_hiper_grave: 250,
};

export type Classe = "hipo_grave" | "hipo" | "meta" | "hiper" | "hiper_grave";

/**
 * Classifica um valor de glicemia:
 *   valor <  limite_hipo_grave  -> hipoglicemia grave
 *   valor <  limite_hipo        -> hipoglicemia
 *   valor <= limite_hiper       -> na meta
 *   valor <= limite_hiper_grave -> hiperglicemia
 *   acima disso                 -> hiperglicemia grave
 */
export function classificar(valor: number, faixas: Faixas = FAIXAS_PADRAO): Classe {
  if (valor < faixas.limite_hipo_grave) return "hipo_grave";
  if (valor < faixas.limite_hipo) return "hipo";
  if (valor <= faixas.limite_hiper) return "meta";
  if (valor <= faixas.limite_hiper_grave) return "hiper";
  return "hiper_grave";
}

export const INFO_CLASSE: Record<Classe, { rotulo: string; grave: boolean }> = {
  hipo_grave: { rotulo: "Hipoglicemia grave", grave: true },
  hipo: { rotulo: "Hipoglicemia", grave: false },
  meta: { rotulo: "Na meta", grave: false },
  hiper: { rotulo: "Hiperglicemia", grave: false },
  hiper_grave: { rotulo: "Hiperglicemia grave", grave: true },
};

/** Texto exibido quando um valor cai numa faixa grave. */
export function orientacaoGrave(classe: Classe): string | null {
  if (classe === "hipo_grave") {
    return "Glicemia muito baixa. Siga a orientação do seu médico para hipoglicemia (por exemplo, ingerir carboidrato de ação rápida). Se houver confusão, desmaio ou os sintomas não melhorarem, procure atendimento imediatamente (SAMU 192).";
  }
  if (classe === "hiper_grave") {
    return "Glicemia muito alta. Siga a orientação do seu médico e meça novamente em breve. Se houver vômitos, falta de ar, sonolência ou confusão, procure atendimento imediatamente (SAMU 192).";
  }
  return null;
}
