import "server-only";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/server";

export type Usuario = {
  id: string;
  nome: string;
  email: string;
};

/**
 * Retorna o usuário logado ou redireciona para /entrar.
 * Use em Server Components (dentro de <Suspense>) e em Server Actions.
 */
export async function obterUsuario(): Promise<Usuario> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims?.sub) {
    redirect("/entrar");
  }

  const meta = (claims.user_metadata ?? {}) as Record<string, unknown>;
  return {
    id: claims.sub,
    nome: String(meta.full_name ?? meta.name ?? ""),
    email: String(claims.email ?? ""),
  };
}
