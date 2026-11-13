import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Share2 } from "lucide-react";
import { PainelResumo, SeletorPeriodo } from "@/components/resumo/painel-resumo";
import { lerDias } from "@/lib/periodos";
import { buttonVariants } from "@/components/ui/button";
import { exigirCadastroCompleto, obterFaixas } from "@/lib/dados";
import { medicoesDoPeriodo } from "@/lib/medicoes";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Resumo · Glicemia" };

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
  const dias = lerDias((await searchParams).dias);
  const [faixas, { medicoes, desde }] = await Promise.all([obterFaixas(), medicoesDoPeriodo(dias)]);
  const botao = cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 flex-1 text-base");

  return (
    <>
      <SeletorPeriodo dias={dias} href={(p) => `/resumo?dias=${p}`} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href={`/relatorio?dias=${dias}`} className={botao}>
          <FileText aria-hidden="true" className="size-5" />
          Relatório para o médico
        </Link>
        <Link href="/compartilhar" className={botao}>
          <Share2 aria-hidden="true" className="size-5" />
          Compartilhar com familiares
        </Link>
      </div>

      <PainelResumo
        medicoes={medicoes}
        faixas={faixas}
        dias={dias}
        desde={desde}
        rodapeGrafico={
          <Link
            href={`/medicoes?periodo=${dias}`}
            className="w-fit text-base font-medium underline underline-offset-4"
          >
            Ver estas medições em lista
          </Link>
        }
      />
    </>
  );
}
