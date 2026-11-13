import Link from "next/link";
import { BadgeFaixa } from "@/components/badge-faixa";
import { BarraFaixas } from "@/components/resumo/barra-faixas";
import { Secao } from "@/components/secao";
import { GraficoEvolucao, type PontoGrafico } from "@/components/resumo/grafico-evolucao";
import { formatarDataHora, inicioDoDia, somarDias } from "@/lib/datas";
import { classificar, type Faixas } from "@/lib/glicemia/classificar";
import { calcularResumo } from "@/lib/glicemia/estatisticas";
import { rotuloMomento, type Momento } from "@/lib/glicemia/momentos";
import { cn } from "@/lib/utils";

import { PERIODOS_RESUMO } from "@/lib/periodos";

type MedicaoResumo = { valor_mg_dl: number; medido_em: string; momento: Momento };

/** Seletor de período (7/14/30/90 dias) — uma linha acima dos gráficos. */
export function SeletorPeriodo({ dias, href }: { dias: number; href: (dias: number) => string }) {
  return (
    <nav aria-label="Período" className="grid grid-cols-4 gap-1 rounded-xl border p-1 print:hidden">
      {PERIODOS_RESUMO.map((p) => (
        <Link
          key={p}
          href={href(p)}
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
  );
}

/**
 * Indicadores + gráfico + média por momento. Usado no Resumo, no relatório
 * para o médico e na tela do familiar (link de compartilhamento).
 */
export function PainelResumo({
  medicoes,
  faixas,
  dias,
  desde,
  rodapeGrafico,
}: {
  medicoes: MedicaoResumo[];
  faixas: Faixas;
  dias: number;
  /** Primeiro dia do período (AAAA-MM-DD, horário de Brasília). */
  desde: string;
  rodapeGrafico?: React.ReactNode;
}) {
  const resumo = calcularResumo(medicoes, faixas);

  if (resumo.total === 0) {
    return (
      <section className="rounded-xl border p-6 text-center">
        <p className="text-base text-muted-foreground">Nenhuma medição nos últimos {dias} dias.</p>
      </section>
    );
  }

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
      <Secao titulo="Tempo na meta">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <span className="text-5xl font-bold tabular-nums">{resumo.porClasse.meta.percentual}%</span>
          <span className="text-base text-muted-foreground">
            das medições na meta ({faixas.limite_hipo}–{faixas.limite_hiper} mg/dL)
          </span>
        </div>
        <BarraFaixas resumo={resumo} />
      </Secao>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 print:grid-cols-6 print:gap-2">
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
        <p className="text-sm text-muted-foreground print:hidden">
          Cada ponto é uma medição, na cor da sua faixa. A área verde é a meta; as linhas
          tracejadas marcam os limites graves. Toque ou passe o mouse num ponto para ver os
          detalhes.
        </p>
        <GraficoEvolucao pontos={pontos} faixas={faixas} inicio={inicio} fim={fim} />
        {rodapeGrafico}
      </Secao>

      <Secao titulo="Média por momento">
        <table className="w-full text-base">
          <thead>
            <tr className="border-b text-left text-sm text-muted-foreground">
              <th scope="col" className="py-2 font-medium">Momento</th>
              <th scope="col" className="py-2 text-right font-medium">Média</th>
              <th scope="col" className="hidden py-2 text-right font-medium sm:table-cell print:table-cell">Medições</th>
            </tr>
          </thead>
          <tbody>
            {resumo.porMomento.map((m) => (
              <tr key={m.momento} className="border-b last:border-0">
                <th scope="row" className="py-3 pr-2 text-left font-normal print:py-1">
                  {rotuloMomento(m.momento)}
                  <span className="block text-sm text-muted-foreground sm:hidden print:hidden">
                    {m.quantidade} {m.quantidade === 1 ? "medição" : "medições"}
                  </span>
                </th>
                <td className="py-3 text-right print:py-1">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <span className="font-semibold tabular-nums">{m.media}</span>
                    <BadgeFaixa classe={classificar(m.media, faixas)} className="text-xs" />
                  </div>
                </td>
                <td className="hidden py-3 text-right tabular-nums text-muted-foreground sm:table-cell print:table-cell print:py-1">
                  {m.quantidade}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Secao>
    </>
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
    <div className="flex flex-col gap-1 rounded-xl border p-4 print:p-2">
      <span className="text-sm text-muted-foreground">{rotulo}</span>
      <span className="text-3xl font-bold tabular-nums print:text-xl">
        {valor ?? "—"}
        {unidade && valor !== null && (
          <span className="ml-1 text-sm font-normal text-muted-foreground">{unidade}</span>
        )}
      </span>
      {detalhe && <span className="text-sm text-muted-foreground">{detalhe}</span>}
    </div>
  );
}
