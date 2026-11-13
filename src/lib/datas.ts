/**
 * Datas e horários do app. Tudo é exibido no horário de Brasília
 * (o app é só pt-BR; o Brasil não tem horário de verão desde 2019).
 */
export const FUSO = "America/Sao_Paulo";
const OFFSET = "-03:00";

const fmtHora = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO,
  hour: "2-digit",
  minute: "2-digit",
});

const fmtDataHora = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const fmtDiaSemana = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO,
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

// en-CA formata como AAAA-MM-DD
const fmtChave = new Intl.DateTimeFormat("en-CA", {
  timeZone: FUSO,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function formatarHora(iso: string | Date): string {
  return fmtHora.format(new Date(iso));
}

export function formatarDataHora(iso: string | Date): string {
  return fmtDataHora.format(new Date(iso)).replace(",", " às");
}

/** Dia (AAAA-MM-DD) no horário de Brasília. */
export function chaveDia(iso: string | Date): string {
  return fmtChave.format(new Date(iso));
}

/** Soma (ou subtrai) dias a uma chave AAAA-MM-DD. */
export function somarDias(chave: string, dias: number): string {
  const d = new Date(`${chave}T12:00:00${OFFSET}`);
  d.setUTCDate(d.getUTCDate() + dias);
  return chaveDia(d);
}

/** Início do dia (00:00 de Brasília) em ISO, para filtrar no banco. */
export function inicioDoDia(chave: string): string {
  return new Date(`${chave}T00:00:00${OFFSET}`).toISOString();
}

/** "Hoje", "Ontem" ou "quarta-feira, 12/11/2026". */
export function rotuloDia(chave: string, agora: Date = new Date()): string {
  const hoje = chaveDia(agora);
  if (chave === hoje) return "Hoje";
  if (chave === somarDias(hoje, -1)) return "Ontem";
  const texto = fmtDiaSemana.format(new Date(`${chave}T12:00:00${OFFSET}`));
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

const fmtCampo = new Intl.DateTimeFormat("en-CA", {
  timeZone: FUSO,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/**
 * Converte uma data para o campo <input type="datetime-local">, SEMPRE no
 * horário de Brasília (o mesmo usado em todas as telas), independentemente
 * do fuso do aparelho — assim quem está em Manaus, no Acre ou viajando vê
 * no formulário a mesma hora que aparece na lista.
 */
export function paraCampoDataHora(data: Date): string {
  const p = Object.fromEntries(fmtCampo.formatToParts(data).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/** Converte o valor do campo datetime-local (horário de Brasília) para ISO/UTC. */
export function campoParaISO(valor: string): string {
  return new Date(`${valor}:00${OFFSET}`).toISOString();
}

/** Hora e minuto em Brasília (para sugerir o momento da medição). */
export function horaMinutoBrasilia(data: Date): { hora: number; minuto: number } {
  const [hora, minuto] = paraCampoDataHora(data).slice(11).split(":").map(Number);
  return { hora, minuto };
}

/** Agrupa itens com data (medido_em) por dia de Brasília, mantendo a ordem recebida. */
export function agruparPorDia<T extends { medido_em: string }>(itens: T[]): [string, T[]][] {
  const grupos = new Map<string, T[]>();
  for (const item of itens) {
    const dia = chaveDia(item.medido_em);
    grupos.set(dia, [...(grupos.get(dia) ?? []), item]);
  }
  return [...grupos.entries()];
}
