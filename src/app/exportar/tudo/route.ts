import { obterPerfil, obterFaixas } from "@/lib/dados";
import { chaveDia } from "@/lib/datas";
import { todasMedicoes } from "@/lib/medicoes";
import { criarClienteServidor } from "@/lib/supabase/server";

/**
 * LGPD (portabilidade): baixa TODOS os dados do usuário num arquivo JSON —
 * conta, perfil, faixas, medições e links de compartilhamento.
 */
export async function GET() {
  const { usuario, perfil } = await obterPerfil();
  const supabase = await criarClienteServidor();
  const [faixas, medicoes, links] = await Promise.all([
    obterFaixas(),
    todasMedicoes(),
    supabase
      .from("links_compartilhamento")
      .select("nome, expira_em, revogado_em, ultimo_acesso_em, criado_em")
      .eq("user_id", usuario.id)
      .order("criado_em")
      .then((r) => r.data ?? []),
  ]);

  const dados = {
    exportado_em: new Date().toISOString(),
    aplicativo: "Glicemia — https://app-glicemia-ten.vercel.app",
    conta: { id: usuario.id, nome: usuario.nome, email: usuario.email },
    perfil,
    faixas_alvo_mg_dl: faixas,
    medicoes,
    links_compartilhamento: links,
  };

  return new Response(JSON.stringify(dados, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="meus-dados-glicemia-${chaveDia(new Date())}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
