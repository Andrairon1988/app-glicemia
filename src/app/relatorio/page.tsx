import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { BadgeFaixa } from "@/components/badge-faixa";
import { PainelResumo, SeletorPeriodo, Secao } from "@/components/resumo/painel-resumo";
import { buttonVariants } from "@/components/ui/button";
import { exigirCadastroCompleto, obterFaixas } from "@/lib/dados";
import { chaveDia, formatarDataHora, rotuloDia } from "@/lib/datas";
import { classificar } from "@/lib/glicemia/classificar";
import { rotuloMomento } from "@/lib/glicemia/momentos";
import { medicoesDoPeriodo } from "@/lib/medicoes";
import { lerDias } from "@/lib/periodos";
import { AVISO_MEDICO } from "@/lib/textos";
import { cn } from "@/lib/utils";
import { BotaoImprimir } from "./botao-imprimir";

export const metadata: Metadata = { title: "Relatório de glicemia" };

/** Relatório para o médico: página pensada para papel A4 ("Imprimir" → "Salvar como PDF"). */
export default function RelatorioPage({ searchParams }: PageProps<"/relatorio">) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 print:max-w-none print:gap-3 print:p-0">
      <Suspense fallback={<p className="text-muted-foreground">Carregando…</p>}>
        <Conteudo searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

const fmtData = (chave: string) => chave.split("-").reverse().join("/");

async function Conteudo({ searchParams }: { searchParams: PageProps<"/relatorio">["searchParams"] }) {
  const { usuario, perfil } = await exigirCadastroCompleto();
  const dias = lerDias((await searchParams).dias, 30);
  const [faixas, { medicoes, desde }] = await Promise.all([obterFaixas(), medicoesDoPeriodo(dias)]);
  const hoje = chaveDia(new Date());

  return (
    <>
      {/* Barra de ações: não aparece no papel */}
      <div className="flex flex-col gap-3 print:hidden">
        <Link
          href={`/resumo?dias=${dias}`}
          className="flex w-fit items-center gap-1 text-base font-medium underline underline-offset-4"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Voltar ao Resumo
        </Link>
        <SeletorPeriodo dias={dias} href={(p) => `/relatorio?dias=${p}`} />
        <div className="flex flex-col gap-3 sm:flex-row">
          <BotaoImprimir />
          <a
            href={`/exportar/medicoes?dias=${dias}`}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 flex-1 text-base")}
          >
            <Download aria-hidden="true" className="size-5" />
            Baixar planilha (CSV)
          </a>
        </div>
        <p className="text-sm text-muted-foreground">
          Para gerar o PDF: toque em <strong>Imprimir / Salvar PDF</strong> e escolha{" "}
          <strong>Salvar como PDF</strong> como impressora.
        </p>
      </div>

      <header className="flex flex-col gap-1 border-b pb-4 print:pb-2">
        <h1 className="text-2xl font-bold print:text-xl">Relatório de glicemia</h1>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 text-base print:text-sm">
          <dt className="text-muted-foreground">Paciente</dt>
          <dd className="font-medium">{perfil.nome_paciente || usuario.nome}</dd>
          <dt className="text-muted-foreground">Período</dt>
          <dd>
            {fmtData(desde)} a {fmtData(hoje)} ({dias} dias)
          </dd>
          <dt className="text-muted-foreground">Meta</dt>
          <dd>
            {faixas.limite_hipo} a {faixas.limite_hiper} mg/dL (graves: abaixo de{" "}
            {faixas.limite_hipo_grave} e acima de {faixas.limite_hiper_grave})
          </dd>
          <dt className="text-muted-foreground">Gerado em</dt>
          <dd>{formatarDataHora(new Date())}</dd>
        </dl>
      </header>

      <PainelResumo medicoes={medicoes} faixas={faixas} dias={dias} desde={desde} />

      {medicoes.length > 0 && (
        <Secao titulo="Todas as medições do período">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th scope="col" className="py-1.5 pr-2 font-medium">Data</th>
                  <th scope="col" className="py-1.5 pr-2 font-medium">Hora</th>
                  <th scope="col" className="py-1.5 pr-2 font-medium">Momento</th>
                  <th scope="col" className="py-1.5 pr-2 text-right font-medium">mg/dL</th>
                  <th scope="col" className="py-1.5 pr-2 font-medium">Faixa</th>
                  <th scope="col" className="py-1.5 pr-2 font-medium">Medicamento</th>
                  <th scope="col" className="py-1.5 font-medium">Observação</th>
                </tr>
              </thead>
              <tbody>
                {[...medicoes].reverse().map((m) => {
                  const [data, hora] = formatarDataHora(m.medido_em).split(" às ");
                  return (
                    <tr key={m.id} className="border-b align-top last:border-0 print:break-inside-avoid">
                      <td className="py-1.5 pr-2 whitespace-nowrap" title={rotuloDia(chaveDia(m.medido_em))}>{data}</td>
                      <td className="py-1.5 pr-2 tabular-nums">{hora}</td>
                      <td className="py-1.5 pr-2">{rotuloMomento(m.momento)}</td>
                      <td className="py-1.5 pr-2 text-right font-semibold tabular-nums">{m.valor_mg_dl}</td>
                      <td className="py-1.5 pr-2">
                        <BadgeFaixa classe={classificar(m.valor_mg_dl, faixas)} className="px-1.5 text-xs" />
                      </td>
                      <td className="py-1.5 pr-2">{[m.medicamento, m.dose].filter(Boolean).join(" · ")}</td>
                      <td className="py-1.5">{m.observacao}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Secao>
      )}

      <p className="text-sm text-muted-foreground">
        Valores registrados manualmente pelo paciente no aplicativo Glicemia. {AVISO_MEDICO}
      </p>
    </>
  );
}
