"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { obterUsuario } from "@/lib/auth";
import { calcularExpiracao, VALIDADES } from "@/lib/links";
import { criarClienteServidor } from "@/lib/supabase/server";

export type EstadoLink = {
  ok?: boolean;
  mensagem?: string;
  erros?: Record<string, string[] | undefined>;
  /** Valores digitados, para não se perderem quando houver erro. */
  valores?: { nome: string; validade: string };
};

const novoLinkSchema = z.object({
  nome: z.string().trim().min(1, "Informe para quem é o link.").max(60, "Use no máximo 60 caracteres."),
  validade: z.enum(VALIDADES.map((v) => v.valor) as ["7", "30", "90", "sem"], {
    error: "Escolha a validade.",
  }),
});

export async function criarLink(_estado: EstadoLink, formData: FormData): Promise<EstadoLink> {
  const usuario = await obterUsuario();
  const valores = {
    nome: String(formData.get("nome") ?? ""),
    validade: String(formData.get("validade") ?? "30"),
  };
  const resultado = novoLinkSchema.safeParse(valores);
  if (!resultado.success) {
    return { erros: z.flattenError(resultado.error).fieldErrors, valores };
  }

  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("links_compartilhamento").insert({
    user_id: usuario.id,
    nome: resultado.data.nome,
    // 32 caracteres aleatórios (192 bits): impossível de adivinhar.
    token: randomBytes(24).toString("base64url"),
    expira_em: calcularExpiracao(resultado.data.validade),
  });
  if (error) {
    return { mensagem: "Não foi possível criar o link. Tente novamente.", valores };
  }

  revalidatePath("/compartilhar");
  return { ok: true, mensagem: `Link para "${resultado.data.nome}" criado. Copie e envie abaixo.` };
}

const idSchema = z.uuid();

export async function desativarLink(id: string): Promise<{ ok: boolean }> {
  const usuario = await obterUsuario();
  if (!idSchema.safeParse(id).success) return { ok: false };
  const supabase = await criarClienteServidor();
  const { error } = await supabase
    .from("links_compartilhamento")
    .update({ revogado_em: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", usuario.id);
  revalidatePath("/compartilhar");
  return { ok: !error };
}

export async function excluirLink(id: string): Promise<{ ok: boolean }> {
  const usuario = await obterUsuario();
  if (!idSchema.safeParse(id).success) return { ok: false };
  const supabase = await criarClienteServidor();
  const { error } = await supabase
    .from("links_compartilhamento")
    .delete()
    .eq("id", id)
    .eq("user_id", usuario.id);
  revalidatePath("/compartilhar");
  return { ok: !error };
}

/** LGPD: exclui a conta do usuário logado e todos os seus dados. */
export async function excluirConta(confirmacao: unknown): Promise<{ ok: false; mensagem: string }> {
  await obterUsuario();
  // Server Actions podem ser chamadas com qualquer valor: valida o tipo antes de usar.
  const texto = z.string().safeParse(confirmacao);
  if (!texto.success || texto.data.trim().toUpperCase() !== "EXCLUIR") {
    return { ok: false, mensagem: 'Digite EXCLUIR para confirmar.' };
  }
  const supabase = await criarClienteServidor();
  const { error } = await supabase.rpc("excluir_minha_conta");
  if (error) {
    return { ok: false, mensagem: "Não foi possível excluir a conta. Tente novamente." };
  }
  await supabase.auth.signOut();
  redirect("/entrar?conta_excluida=1");
}
