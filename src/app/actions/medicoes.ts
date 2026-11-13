"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { obterUsuario } from "@/lib/auth";
import { obterFaixas } from "@/lib/dados";
import { classificar, type Classe } from "@/lib/glicemia/classificar";
import { criarClienteServidor } from "@/lib/supabase/server";
import { medicaoSchema, type MedicaoEntrada } from "@/lib/validacao";

export type ResultadoMedicao =
  | { ok: true; id: string; classe: Classe; valor: number }
  | { ok: false; mensagem: string; erros?: Record<string, string[] | undefined> };

const idSchema = z.uuid();

async function salvar(id: string | null, entrada: MedicaoEntrada): Promise<ResultadoMedicao> {
  const usuario = await obterUsuario();

  const resultado = medicaoSchema.safeParse(entrada);
  if (!resultado.success) {
    return {
      ok: false,
      mensagem: "Confira os campos destacados.",
      erros: z.flattenError(resultado.error).fieldErrors,
    };
  }
  const dados = resultado.data;
  const supabase = await criarClienteServidor();

  const resposta = id
    ? await supabase
        .from("medicoes")
        .update(dados)
        .eq("id", id)
        .eq("user_id", usuario.id)
        .select("id")
        .maybeSingle()
    : await supabase
        .from("medicoes")
        .insert({ ...dados, user_id: usuario.id })
        .select("id")
        .single();

  if (resposta.error || !resposta.data) {
    return { ok: false, mensagem: "Não foi possível salvar a medição. Tente novamente." };
  }

  revalidatePath("/", "layout");
  const faixas = await obterFaixas();
  return {
    ok: true,
    id: resposta.data.id,
    classe: classificar(dados.valor_mg_dl, faixas),
    valor: dados.valor_mg_dl,
  };
}

export async function criarMedicao(entrada: MedicaoEntrada) {
  return salvar(null, entrada);
}

export async function atualizarMedicao(id: string, entrada: MedicaoEntrada) {
  if (!idSchema.safeParse(id).success) {
    return { ok: false, mensagem: "Medição inválida." } satisfies ResultadoMedicao;
  }
  return salvar(id, entrada);
}

export async function excluirMedicao(id: string): Promise<{ ok: boolean }> {
  const usuario = await obterUsuario();
  if (!idSchema.safeParse(id).success) return { ok: false };

  const supabase = await criarClienteServidor();
  const { error } = await supabase
    .from("medicoes")
    .delete()
    .eq("id", id)
    .eq("user_id", usuario.id);

  if (error) return { ok: false };
  revalidatePath("/", "layout");
  return { ok: true };
}
