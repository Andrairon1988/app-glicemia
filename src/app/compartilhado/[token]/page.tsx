import { Suspense } from "react";
import type { Metadata } from "next";
import { Eye } from "lucide-react";
import { BadgeFaixa } from "@/components/badge-faixa";
import { PainelResumo, SeletorPeriodo } from "@/components/resumo/painel-resumo";
import { Secao } from "@/components/secao";
import { agruparPorDia, chaveDia, formatarDataHora, formatarHora, rotuloDia, somarDias } from "@/lib/datas";
import { classificar, FAIXAS_PADRAO, type Faixas } from "@/lib/glicemia/classificar";
import { rotuloMomento, type Momento } from "@/lib/glicemia/momentos";
import { lerDias } from "@/lib/periodos";
import { criarClienteServidor } from "@/lib/supabase/server";
import { AVISO_MEDICO } from "@/lib/textos";

export const metadata: Metadata = {
  title: "Glicemia compartilhada",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

type MedicaoCompartilhada = {
  id: string;
  valor_mg_dl: number;
  medido_em: string;
  momento: Momento;
  medicamento: string | null;
  dose: string | null;
};

type DadosCompartilhados = {
  nome_link: string;
  expira_em: string | null;
  nome_paciente: string | null;
  faixas: Faixas | null;
  medicoes: MedicaoCompartilhada[];
};

/** Tela do familiar: somente leitura, sem login, acessada pelo link. */
export default function CompartilhadoPage({ params, searchParams }: PageProps<"/compartilhado/[token]">) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6">
      <Suspense fallback={<p className="text-muted-foreground">Carregando…</p>}>
        <Conteudo params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Conteudo({
  params,
  searchParams,
}: {
  params: PageProps<"/compartilhado/[token]">["params"];
  searchParams: PageProps<"/compartilhado/[token]">["searchParams"];
}) {
  const { token } = await params;
  const dias = lerDias((await searchParams).dias);

  // A função do banco só devolve dados se o link existir, não tiver expirado
  // e não tiver sido desativado. As observações nunca são incluídas.
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.rpc("dados_compartilhados", { p_token: token, p_dias: dias });
  const dados = data as DadosCompartilhados | null;

  if (error) {
    return (
      <section role="alert" className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
        <h1 className="text-2xl font-bold">Não foi possível carregar</h1>
        <p className="max-w-md text-base text-muted-foreground">
          Houve uma falha de conexão. Verifique a internet e tente novamente em instantes.
        </p>
      </section>
    );
  }

  if (!dados) {
    return (
      <section className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
        <h1 className="text-2xl font-bold">Link indisponível</h1>
        <p className="max-w-md text-base text-muted-foreground">
          Este link não existe, expirou ou foi desativado por quem o compartilhou. Peça um novo
          link, se for o caso.
        </p>
      </section>
    );
  }

  const faixas = dados.faixas ?? FAIXAS_PADRAO;
  const desde = somarDias(chaveDia(new Date()), -(dias - 1));
  const nome = dados.nome_paciente || "Paciente";

  return (
    <>
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Glicemia de {nome}</h1>
        <p className="flex items-start gap-2 rounded-lg border bg-muted p-3 text-base">
          <Eye aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <span>
            Visualização <strong>somente leitura</strong>, compartilhada com{" "}
            <strong>{dados.nome_link}</strong>.{" "}
            {dados.expira_em ? `Válida até ${formatarDataHora(dados.expira_em)}.` : ""}
          </span>
        </p>
      </header>

      <SeletorPeriodo dias={dias} href={(p) => `/compartilhado/${token}?dias=${p}`} />

      <PainelResumo medicoes={dados.medicoes} faixas={faixas} dias={dias} desde={desde} />

      {dados.medicoes.length > 0 && (
        <Secao titulo="Medições">
          {agruparPorDia([...dados.medicoes].reverse()).map(([dia, doDia]) => (
            <div key={dia} className="flex flex-col gap-1">
              <h3 className="text-base font-semibold">{rotuloDia(dia)}</h3>
              <ul className="divide-y rounded-xl border">
                {doDia.map((m) => (
                  <li key={m.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-3">
                    <time dateTime={m.medido_em} className="w-12 text-base tabular-nums text-muted-foreground">
                      {formatarHora(m.medido_em)}
                    </time>
                    <span className="text-xl font-bold tabular-nums">{m.valor_mg_dl}</span>
                    <BadgeFaixa classe={classificar(m.valor_mg_dl, faixas)} />
                    <span className="basis-full pl-15 text-sm text-muted-foreground sm:basis-auto sm:pl-0">
                      {rotuloMomento(m.momento)}
                      {(m.medicamento || m.dose) && ` · ${[m.medicamento, m.dose].filter(Boolean).join(" ")}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Secao>
      )}

      <p className="text-sm text-muted-foreground">{AVISO_MEDICO}</p>
    </>
  );
}
