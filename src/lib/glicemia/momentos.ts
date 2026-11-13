import { horaMinutoBrasilia } from "@/lib/datas";

export const MOMENTOS = [
  { valor: "jejum", rotulo: "Jejum" },
  { valor: "antes_cafe", rotulo: "Antes do café da manhã" },
  { valor: "depois_cafe", rotulo: "Depois do café da manhã" },
  { valor: "antes_almoco", rotulo: "Antes do almoço" },
  { valor: "depois_almoco", rotulo: "Depois do almoço" },
  { valor: "antes_jantar", rotulo: "Antes do jantar" },
  { valor: "depois_jantar", rotulo: "Depois do jantar" },
  { valor: "antes_dormir", rotulo: "Antes de dormir" },
  { valor: "madrugada", rotulo: "Madrugada" },
  { valor: "outro", rotulo: "Outro" },
] as const;

export type Momento = (typeof MOMENTOS)[number]["valor"];

export const VALORES_MOMENTO = MOMENTOS.map((m) => m.valor) as [Momento, ...Momento[]];

export function rotuloMomento(momento: Momento): string {
  return MOMENTOS.find((m) => m.valor === momento)?.rotulo ?? momento;
}

/** Sugere o momento da medição a partir da hora do dia em Brasília (o usuário pode trocar). */
export function sugerirMomento(data: Date): Momento {
  const { hora, minuto } = horaMinutoBrasilia(data);
  const minutos = hora * 60 + minuto;
  if (minutos < 5 * 60) return "madrugada";
  if (minutos < 8 * 60) return "jejum";
  if (minutos < 10 * 60) return "depois_cafe";
  if (minutos < 12 * 60) return "antes_almoco";
  if (minutos < 15 * 60) return "depois_almoco";
  if (minutos < 18 * 60) return "outro";
  if (minutos < 20 * 60) return "antes_jantar";
  if (minutos < 22 * 60) return "depois_jantar";
  return "antes_dormir";
}
