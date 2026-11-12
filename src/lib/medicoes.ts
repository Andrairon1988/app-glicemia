import "server-only";
import { obterUsuario } from "@/lib/auth";
import { chaveDia, inicioDoDia, somarDias } from "@/lib/datas";
import type { Momento } from "@/lib/glicemia/momentos";
import { criarClienteServidor } from "@/lib/supabase/server";

export type Medicao = {
  id: string;
  valor_mg_dl: number;
  medido_em: string;
  momento: Momento;
  medicamento: string | null;
  dose: string | null;
  observacao: string | null;
};

const COLUNAS = "id, valor_mg_dl, medido_em, momento, medicamento, dose, observacao";

export const POR_PAGINA = 30;

export const PERIODOS = [
  { valor: "7", rotulo: "Últimos 7 dias", dias: 7 },
  { valor: "14", rotulo: "Últimos 14 dias", dias: 14 },
  { valor: "30", rotulo: "Últimos 30 dias", dias: 30 },
  { valor: "90", rotulo: "Últimos 90 dias", dias: 90 },
  { valor: "tudo", rotulo: "Todo o período", dias: null },
] as const;

export type Filtros = {
  periodo: (typeof PERIODOS)[number]["valor"];
  momento: Momento | null;
  pagina: number;
};

/**
 * Lista as medições do usuário logado (mais recentes primeiro).
 * A segurança (RLS) já garante que só voltam as medições dele;
 * o filtro por user_id é uma segunda proteção.
 */
export async function listarMedicoes(filtros: Filtros) {
  const usuario = await obterUsuario();
  const supabase = await criarClienteServidor();

  let consulta = supabase
    .from("medicoes")
    .select(COLUNAS, { count: "exact" })
    .eq("user_id", usuario.id)
    .order("medido_em", { ascending: false });

  const periodo = PERIODOS.find((p) => p.valor === filtros.periodo);
  if (periodo?.dias) {
    const desde = somarDias(chaveDia(new Date()), -(periodo.dias - 1));
    consulta = consulta.gte("medido_em", inicioDoDia(desde));
  }
  if (filtros.momento) {
    consulta = consulta.eq("momento", filtros.momento);
  }

  const inicio = (filtros.pagina - 1) * POR_PAGINA;
  const { data, count, error } = await consulta.range(inicio, inicio + POR_PAGINA - 1);
  if (error) throw new Error("Não foi possível carregar as medições.");

  return { medicoes: (data ?? []) as Medicao[], total: count ?? 0 };
}

/** Medições de hoje (horário de Brasília). */
export async function medicoesDeHoje() {
  const usuario = await obterUsuario();
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("medicoes")
    .select(COLUNAS)
    .eq("user_id", usuario.id)
    .gte("medido_em", inicioDoDia(chaveDia(new Date())))
    .order("medido_em", { ascending: false });
  if (error) throw new Error("Não foi possível carregar as medições.");
  return (data ?? []) as Medicao[];
}

export async function ultimaMedicao() {
  const usuario = await obterUsuario();
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("medicoes")
    .select(COLUNAS)
    .eq("user_id", usuario.id)
    .order("medido_em", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as Medicao | null) ?? null;
}

export async function obterMedicao(id: string) {
  const usuario = await obterUsuario();
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("medicoes")
    .select(COLUNAS)
    .eq("user_id", usuario.id)
    .eq("id", id)
    .maybeSingle();
  return (data as Medicao | null) ?? null;
}
