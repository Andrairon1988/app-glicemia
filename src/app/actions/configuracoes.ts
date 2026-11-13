"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { obterUsuario } from "@/lib/auth";
import { FAIXAS_PADRAO, type Faixas } from "@/lib/glicemia/classificar";
import { criarClienteServidor } from "@/lib/supabase/server";
import { faixasSchema, nomePacienteSchema } from "@/lib/validacao";

export type EstadoConfig = {
  ok?: boolean;
  mensagem?: string;
  erros?: Record<string, string[] | undefined>;
  /** Valores digitados, para não perder o que o usuário escreveu se houver erro. */
  valores?: Record<string, string>;
};

export async function salvarNomePaciente(
  _estado: EstadoConfig,
  formData: FormData,
): Promise<EstadoConfig> {
  const usuario = await obterUsuario();
  const nome = String(formData.get("nome_paciente") ?? "");
  const resultado = nomePacienteSchema.safeParse(nome);
  if (!resultado.success) {
    return {
      erros: { nome_paciente: resultado.error.issues.map((i) => i.message) },
      valores: { nome_paciente: nome },
    };
  }

  const supabase = await criarClienteServidor();
  const { error } = await supabase
    .from("profiles")
    .update({ nome_paciente: resultado.data })
    .eq("id", usuario.id);
  if (error) {
    return { mensagem: "Não foi possível salvar. Tente novamente.", valores: { nome_paciente: nome } };
  }

  revalidatePath("/", "layout");
  return { ok: true, mensagem: "Nome salvo." };
}

async function gravarFaixas(faixas: Faixas): Promise<boolean> {
  const usuario = await obterUsuario();
  const supabase = await criarClienteServidor();
  const { error } = await supabase
    .from("faixas_alvo")
    .update(faixas)
    .eq("user_id", usuario.id);
  if (error) return false;
  revalidatePath("/", "layout");
  return true;
}

export async function salvarFaixas(
  _estado: EstadoConfig,
  formData: FormData,
): Promise<EstadoConfig> {
  const valores = Object.fromEntries(
    Object.keys(FAIXAS_PADRAO).map((campo) => [campo, String(formData.get(campo) ?? "")]),
  );

  if (formData.get("acao") === "restaurar") {
    return (await gravarFaixas(FAIXAS_PADRAO))
      ? { ok: true, mensagem: "Faixas padrão restauradas." }
      : { mensagem: "Não foi possível salvar. Tente novamente.", valores };
  }

  const resultado = faixasSchema.safeParse(valores);
  if (!resultado.success) {
    return {
      mensagem: "Confira os valores destacados.",
      erros: z.flattenError(resultado.error).fieldErrors,
      valores,
    };
  }

  return (await gravarFaixas(resultado.data))
    ? { ok: true, mensagem: "Faixas salvas. As cores do histórico já usam os novos valores." }
    : { mensagem: "Não foi possível salvar. Tente novamente.", valores };
}
