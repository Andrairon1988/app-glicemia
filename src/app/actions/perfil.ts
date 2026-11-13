"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { obterUsuario } from "@/lib/auth";
import { criarClienteServidor } from "@/lib/supabase/server";
import { boasVindasSchema } from "@/lib/validacao";

export type EstadoFormulario = {
  erros?: Record<string, string[] | undefined>;
  mensagem?: string;
  /** Nome digitado, para não se perder quando houver erro. */
  nome_paciente?: string;
};

/** Primeiro acesso: grava o nome do paciente e o aceite dos termos. */
export async function concluirBoasVindas(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await obterUsuario();

  const nome = String(formData.get("nome_paciente") ?? "");
  const resultado = boasVindasSchema.safeParse({
    nome_paciente: nome,
    aceite: formData.get("aceite") ?? undefined,
  });
  if (!resultado.success) {
    return { erros: z.flattenError(resultado.error).fieldErrors, nome_paciente: nome };
  }

  const supabase = await criarClienteServidor();
  const { error } = await supabase
    .from("profiles")
    .update({
      nome_paciente: resultado.data.nome_paciente,
      termos_aceitos_em: new Date().toISOString(),
    })
    .eq("id", usuario.id);

  if (error) {
    return { mensagem: "Não foi possível salvar. Tente novamente.", nome_paciente: nome };
  }

  redirect("/");
}
