import { Suspense } from "react";
import type { Metadata } from "next";
import { Eye, EyeOff } from "lucide-react";
import { Secao } from "@/components/secao";
import { obterUsuario } from "@/lib/auth";
import { exigirCadastroCompleto } from "@/lib/dados";
import { formatarDataHora } from "@/lib/datas";
import { statusLink, type StatusLink } from "@/lib/links";
import { criarClienteServidor } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { AcoesLink } from "./acoes-link";
import { FormularioLink } from "./formulario-link";

export const metadata: Metadata = { title: "Compartilhar · Glicemia" };

export default function CompartilharPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">Compartilhar com familiares</h1>
      <Suspense fallback={<p className="text-muted-foreground">Carregando…</p>}>
        <Conteudo />
      </Suspense>
    </>
  );
}

type Link = {
  id: string;
  nome: string;
  token: string;
  expira_em: string | null;
  revogado_em: string | null;
  ultimo_acesso_em: string | null;
  criado_em: string;
};

const ESTILO_STATUS: Record<StatusLink, { rotulo: string; classes: string }> = {
  ativo: { rotulo: "Ativo", classes: "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100" },
  expirado: { rotulo: "Expirado", classes: "border-border bg-muted text-muted-foreground" },
  desativado: { rotulo: "Desativado", classes: "border-border bg-muted text-muted-foreground" },
};

async function Conteudo() {
  await exigirCadastroCompleto();
  const usuario = await obterUsuario();
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("links_compartilhamento")
    .select("id, nome, token, expira_em, revogado_em, ultimo_acesso_em, criado_em")
    .eq("user_id", usuario.id)
    .order("criado_em", { ascending: false });
  const links = (data ?? []) as Link[];

  return (
    <>
      <Secao titulo="Como funciona">
        <ul className="flex flex-col gap-2 text-base">
          <li className="flex gap-2">
            <Eye aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
            <span>
              Quem recebe o link vê o <strong>resumo, o gráfico e as medições</strong> (valores,
              momentos e medicamentos), sem precisar criar conta. Não consegue alterar nada.
            </span>
          </li>
          <li className="flex gap-2">
            <EyeOff aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
            <span>
              Suas <strong>observações</strong> não são mostradas. Você pode{" "}
              <strong>desativar</strong> um link a qualquer momento.
            </span>
          </li>
        </ul>
        <p className="text-sm text-muted-foreground">
          Envie o link só para pessoas de confiança: qualquer pessoa com o endereço consegue ver
          os dados enquanto ele estiver ativo.
        </p>
      </Secao>

      <Secao titulo="Novo link">
        <FormularioLink />
      </Secao>

      <Secao titulo="Seus links">
        {links.length === 0 ? (
          <p className="text-base text-muted-foreground">Nenhum link criado ainda.</p>
        ) : (
          <ul className="flex flex-col divide-y">
            {links.map((link) => {
              const status = statusLink(link);
              return (
                <li key={link.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-semibold">{link.nome}</span>
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-sm font-medium",
                        ESTILO_STATUS[status].classes,
                      )}
                    >
                      {ESTILO_STATUS[status].rotulo}
                    </span>
                  </div>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
                    <dt>Criado em</dt>
                    <dd>{formatarDataHora(link.criado_em)}</dd>
                    <dt>{status === "expirado" ? "Expirou em" : "Expira em"}</dt>
                    <dd>{link.expira_em ? formatarDataHora(link.expira_em) : "Sem validade"}</dd>
                    {link.revogado_em && (
                      <>
                        <dt>Desativado em</dt>
                        <dd>{formatarDataHora(link.revogado_em)}</dd>
                      </>
                    )}
                    <dt>Último acesso</dt>
                    <dd>{link.ultimo_acesso_em ? formatarDataHora(link.ultimo_acesso_em) : "Ainda não acessado"}</dd>
                  </dl>
                  <AcoesLink id={link.id} nome={link.nome} token={link.token} ativo={status === "ativo"} />
                </li>
              );
            })}
          </ul>
        )}
      </Secao>
    </>
  );
}
