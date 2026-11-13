import { classificar, type Classe, type Faixas } from "./classificar";
import { MOMENTOS, type Momento } from "./momentos";

export const ORDEM_CLASSES: Classe[] = ["hipo_grave", "hipo", "meta", "hiper", "hiper_grave"];

type MedicaoBasica = { valor_mg_dl: number; momento: Momento };

export type Resumo = {
  total: number;
  media: number | null;
  minimo: number | null;
  maximo: number | null;
  /** Quantidade e percentual (0–100, inteiro) de medições em cada faixa. */
  porClasse: Record<Classe, { quantidade: number; percentual: number }>;
  /** Hipoglicemias = hipo + hipo grave; hiperglicemias = hiper + hiper grave. */
  hipoglicemias: { total: number; graves: number };
  hiperglicemias: { total: number; graves: number };
  /** Média por momento (só momentos com medições), na ordem do dia. */
  porMomento: { momento: Momento; media: number; quantidade: number }[];
};

/** Percentuais inteiros que somam exatamente 100 (método do maior resto). */
export function percentuaisInteiros(quantidades: number[]): number[] {
  const total = quantidades.reduce((a, b) => a + b, 0);
  if (total === 0) return quantidades.map(() => 0);
  const brutos = quantidades.map((q) => (q / total) * 100);
  const inteiros = brutos.map(Math.floor);
  let falta = 100 - inteiros.reduce((a, b) => a + b, 0);
  const ordem = brutos
    .map((b, i) => ({ i, resto: b - Math.floor(b) }))
    .sort((a, b) => b.resto - a.resto);
  for (const { i } of ordem) {
    if (falta <= 0) break;
    inteiros[i]++;
    falta--;
  }
  // Em saúde, "0%" de hipoglicemia grave quando houve uma é enganoso: toda faixa
  // com ao menos 1 medição recebe no mínimo 1%, tirado da faixa com maior percentual.
  quantidades.forEach((q, i) => {
    if (q > 0 && inteiros[i] === 0) {
      const maior = inteiros.indexOf(Math.max(...inteiros));
      inteiros[maior]--;
      inteiros[i] = 1;
    }
  });
  return inteiros;
}

export function calcularResumo(medicoes: MedicaoBasica[], faixas: Faixas): Resumo {
  const total = medicoes.length;
  const contagem: Record<Classe, number> = { hipo_grave: 0, hipo: 0, meta: 0, hiper: 0, hiper_grave: 0 };
  const somaPorMomento = new Map<Momento, { soma: number; quantidade: number }>();
  let soma = 0;
  let minimo: number | null = null;
  let maximo: number | null = null;

  for (const m of medicoes) {
    soma += m.valor_mg_dl;
    minimo = minimo === null ? m.valor_mg_dl : Math.min(minimo, m.valor_mg_dl);
    maximo = maximo === null ? m.valor_mg_dl : Math.max(maximo, m.valor_mg_dl);
    contagem[classificar(m.valor_mg_dl, faixas)]++;
    const atual = somaPorMomento.get(m.momento) ?? { soma: 0, quantidade: 0 };
    somaPorMomento.set(m.momento, { soma: atual.soma + m.valor_mg_dl, quantidade: atual.quantidade + 1 });
  }

  const percentuais = percentuaisInteiros(ORDEM_CLASSES.map((c) => contagem[c]));
  const porClasse = Object.fromEntries(
    ORDEM_CLASSES.map((c, i) => [c, { quantidade: contagem[c], percentual: percentuais[i] }]),
  ) as Resumo["porClasse"];

  return {
    total,
    media: total ? Math.round(soma / total) : null,
    minimo,
    maximo,
    porClasse,
    hipoglicemias: { total: contagem.hipo + contagem.hipo_grave, graves: contagem.hipo_grave },
    hiperglicemias: { total: contagem.hiper + contagem.hiper_grave, graves: contagem.hiper_grave },
    porMomento: MOMENTOS.flatMap(({ valor }) => {
      const dados = somaPorMomento.get(valor);
      return dados
        ? [{ momento: valor, media: Math.round(dados.soma / dados.quantidade), quantidade: dados.quantidade }]
        : [];
    }),
  };
}
