import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { obterUsuario, type Usuario } from "@/lib/auth";
import { FAIXAS_PADRAO, type Faixas } from "@/lib/glicemia/classificar";
import { criarClienteServidor } from "@/lib/supabase/server";

export type Perfil = {
  nome_paciente: string | null;
  termos_aceitos_em: string | null;
};

/** Usuário logado + perfil (lido uma única vez por requisição). */
export const obterPerfil = cache(async (): Promise<{ usuario: Usuario; perfil: Perfil }> => {
  const usuario = await obterUsuario();
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("profiles")
    .select("nome_paciente, termos_aceitos_em")
    .eq("id", usuario.id)
    .maybeSingle();

  return {
    usuario,
    perfil: data ?? { nome_paciente: null, termos_aceitos_em: null },
  };
});

/**
 * Para as telas do app: exige login E termos aceitos.
 * Quem ainda não aceitou é levado para /boas-vindas.
 */
export async function exigirCadastroCompleto() {
  const dados = await obterPerfil();
  if (!dados.perfil.termos_aceitos_em) {
    redirect("/boas-vindas");
  }
  return dados;
}

/** Faixas-alvo do usuário (ou as padrão, se ainda não existirem). */
export const obterFaixas = cache(async (): Promise<Faixas> => {
  const usuario = await obterUsuario();
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("faixas_alvo")
    .select("limite_hipo_grave, limite_hipo, limite_hiper, limite_hiper_grave")
    .eq("user_id", usuario.id)
    .maybeSingle();
  return data ?? FAIXAS_PADRAO;
});
