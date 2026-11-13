import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { BadgeFaixa } from "@/components/badge-faixa";
import { BarraFaixas } from "@/components/resumo/barra-faixas";
import { GraficoEvolucao, type PontoGrafico } from "@/components/resumo/grafico-evolucao";
import { exigirCadastroCompleto, obterFaixas } from "@/lib/dados";
import { formatarDataHora, inicioDoDia, somarDias } from "@/lib/datas";
import { classificar } from "@/lib/glicemia/classificar";
import { calcularResumo } from "@/lib/glicemia/estatisticas";
import { rotuloMomento } from "@/lib/glicemia/momentos";
import { medicoesDoPeriodo } from "@/lib/medicoes";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Resumo · Glicemia" };

const PERIODOS = [7, 14, 30, 90] as const;

export default function ResumoPage({ searchParams }: PageProps<"/resumo">) {
  return (
    <>
      <h1 className="text-2xl font-bold">Resumo</h1>
      <Suspense fallback={<p className="text-muted-foreground">Carregando…</p>}>
        <Conteudo searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Conteudo({ searchParams }: { searchParams: PageProps<"/resumo">["searchParams"] }) {
  await exigirCadastroCompleto();
  const sp = await searchParams;
  const pedido = Number(Array.isArray(sp.dias) ? sp.dias[0] : sp.dias);
  const dias = (PERIODOS as readonly number[]).includes(pedido) ? pedido : 14;

  const [faixas, { medicoes, desde }] = await Promise.all([obterFaixas(), medicoesDoPeriodo(dias)]);
  const resumo = calcularResumo(medicoes, faixas);

  const pontos: PontoGrafico[] = medicoes.map((m) => ({
    t: new Date(m.medido_em).getTime(),
    valor: m.valor_mg_dl,
    classe: classificar(m.valor_mg_dl, faixas),
    momento: rotuloMomento(m.momento),
    quando: formatarDataHora(m.medido_em),
  }));
  const inicio = new Date(inicioDoDia(desde)).getTime();
  const fim = new Date(inicioDoDia(somarDias(desde, dias))).getTime();

  return (
    <>
      {/* Filtro de período: uma linha acima dos gráficos */}
      <nav aria-label="Período" className="grid grid-cols-4 gap-1 rounded-xl border p-1">
        {PERIODOS.map((p) => (
          <Link
            key={p}
            href={`/resumo?dias=${p}`}
            aria-current={p === dias ? "page" : undefined}
            className={cn(
              "flex h-11 items-center justify-center rounded-lg text-base font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              p === dias ? "bg-primary text-primary-foreground" : "hover:bg-muted",
            )}
          >
            {p} dias
          </Link>
        ))}
      </nav>

      {resumo.total === 0 ? (
        <section className="rounded-xl border p-6 text-center">
          <p className="text-base text-muted-foreground">
            Nenhuma medição nos últimos {dias} dias. Registre medições para ver o resumo.
          </p>
        </section>
      ) : (
        <>
          <Secao titulo="Tempo na meta">
            <div className="flex flex-wrap items-baseline gap-x-3">
              <span className="text-5xl font-bold tabular-nums">{resumo.porClasse.meta.percentual}%</span>
              <span className="text-base text-muted-foreground">
                das medições na meta ({faixas.limite_hipo}–{faixas.limite_hiper} mg/dL)
              </span>
            </div>
            <BarraFaixas resumo={resumo} />
          </Secao>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Indicador rotulo="Média" valor={resumo.media} unidade="mg/dL" />
            <Indicador rotulo="Menor valor" valor={resumo.minimo} unidade="mg/dL" />
            <Indicador rotulo="Maior valor" valor={resumo.maximo} unidade="mg/dL" />
            <Indicador rotulo="Medições" valor={resumo.total} />
            <Indicador
              rotulo="Hipoglicemias"
              valor={resumo.hipoglicemias.total}
              detalhe={`${resumo.hipoglicemias.graves} grave${resumo.hipoglicemias.graves === 1 ? "" : "s"}`}
            />
            <Indicador
              rotulo="Hiperglicemias"
              valor={resumo.hiperglicemias.total}
              detalhe={`${resumo.hiperglicemias.graves} grave${resumo.hiperglicemias.graves === 1 ? "" : "s"}`}
            />
          </div>

          <Secao titulo="Evolução">
            <p className="text-sm text-muted-foreground">
              Cada ponto é uma medição, na cor da sua faixa. A área verde é a meta; as linhas
              tracejadas marcam os limites graves. Toque ou passe o mouse num ponto para ver os
              detalhes.
            </p>
            <GraficoEvolucao pontos={pontos} faixas={faixas} inicio={inicio} fim={fim} />
            <Link
              href={`/medicoes?periodo=${dias}`}
              className="w-fit text-base font-medium underline underline-offset-4"
            >
              Ver estas medições em lista
            </Link>
          </Secao>

          <Secao titulo="Média por momento">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th scope="col" className="py-2 font-medium">Momento</th>
                  <th scope="col" className="py-2 text-right font-medium">Média</th>
                  <th scope="col" className="hidden py-2 text-right font-medium sm:table-cell">Medições</th>
                </tr>
              </thead>
              <tbody>
                {resumo.porMomento.map((m) => (
                  <tr key={m.momento} className="border-b last:border-0">
                    <th scope="row" className="py-3 pr-2 text-left font-normal">
                      {rotuloMomento(m.momento)}
                      <span className="block text-sm text-muted-foreground sm:hidden">
                        {m.quantidade} {m.quantidade === 1 ? "medição" : "medições"}
                      </span>
                    </th>
                    <td className="py-3 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <span className="font-semibold tabular-nums">{m.media}</span>
                        <BadgeFaixa classe={classificar(m.media, faixas)} className="text-xs" />
                      </div>
                    </td>
                    <td className="hidden py-3 text-right tabular-nums text-muted-foreground sm:table-cell">
                      {m.quantidade}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Secao>
        </>
      )}
    </>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  const id = `secao-${titulo.toLowerCase().replace(/\W+/g, "-")}`;
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4 rounded-xl border p-5">
      <h2 id={id} className="text-xl font-semibold">
        {titulo}
      </h2>
      {children}
    </section>
  );
}

function Indicador({
  rotulo,
  valor,
  unidade,
  detalhe,
}: {
  rotulo: string;
  valor: number | null;
  unidade?: string;
  detalhe?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border p-4">
      <span className="text-sm text-muted-foreground">{rotulo}</span>
      <span className="text-3xl font-bold tabular-nums">
        {valor ?? "—"}
        {unidade && valor !== null && (
          <span className="ml-1 text-sm font-normal text-muted-foreground">{unidade}</span>
        )}
      </span>
      {detalhe && <span className="text-sm text-muted-foreground">{detalhe}</span>}
    </div>
  );
}
