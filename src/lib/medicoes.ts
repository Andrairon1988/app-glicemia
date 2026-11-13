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

/**
 * O Supabase devolve no máximo 1.000 linhas por consulta ("Max rows"). Para
 * listas que precisam vir completas (gráfico, exportação), buscamos em blocos.
 */
const BLOCO = 1000;

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

/** Início de amanhã (Brasília): limite superior dos períodos "até hoje". */
function inicioDeAmanha() {
  return inicioDoDia(somarDias(chaveDia(new Date()), 1));
}

/**
 * Lista as medições do usuário logado (mais recentes primeiro), paginadas.
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

  // Página além do fim (ex.: ?pagina=99, ou após excluir medições): o banco
  // responde "fora do intervalo". A tela volta para a primeira página.
  if (error?.code === "PGRST103") {
    return { medicoes: [] as Medicao[], total: 0, alemDoFim: true };
  }
  if (error) throw new Error("Não foi possível carregar as medições.");

  return { medicoes: (data ?? []) as Medicao[], total: count ?? 0, alemDoFim: false };
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
    .lt("medido_em", inicioDeAmanha())
    .order("medido_em", { ascending: false });
  if (error) throw new Error("Não foi possível carregar as medições.");
  return (data ?? []) as Medicao[];
}

/** Busca todas as linhas de uma consulta, em blocos de 1.000. */
async function emBlocos<T>(
  buscar: (de: number, ate: number) => PromiseLike<{ data: unknown[] | null; error: unknown }>,
): Promise<T[]> {
  const todas: T[] = [];
  for (let de = 0; ; de += BLOCO) {
    const { data, error } = await buscar(de, de + BLOCO - 1);
    if (error) throw new Error("Não foi possível carregar as medições.");
    const bloco = (data ?? []) as T[];
    todas.push(...bloco);
    if (bloco.length < BLOCO) return todas;
  }
}

/**
 * Todas as medições dos últimos `dias` dias (contando hoje), em ordem cronológica,
 * para o gráfico e os indicadores do Resumo e do relatório.
 */
export async function medicoesDoPeriodo(dias: number) {
  const usuario = await obterUsuario();
  const supabase = await criarClienteServidor();
  const desde = somarDias(chaveDia(new Date()), -(dias - 1));
  const ate = inicioDeAmanha();
  const medicoes = await emBlocos<Medicao>((de, fim) =>
    supabase
      .from("medicoes")
      .select(COLUNAS)
      .eq("user_id", usuario.id)
      .gte("medido_em", inicioDoDia(desde))
      .lt("medido_em", ate)
      .order("medido_em", { ascending: true })
      .order("id", { ascending: true })
      .range(de, fim),
  );
  return { medicoes, desde };
}

/** Todas as medições do usuário (exportação de dados / LGPD), em ordem cronológica. */
export async function todasMedicoes() {
  const usuario = await obterUsuario();
  const supabase = await criarClienteServidor();
  return emBlocos<Medicao & { criado_em: string; atualizado_em: string }>((de, fim) =>
    supabase
      .from("medicoes")
      .select(`${COLUNAS}, criado_em, atualizado_em`)
      .eq("user_id", usuario.id)
      .order("medido_em", { ascending: true })
      .order("id", { ascending: true })
      .range(de, fim),
  );
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
