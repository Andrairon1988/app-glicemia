import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BotaoExcluirMedicao } from "@/components/botao-excluir-medicao";
import { MedicaoForm } from "@/components/medicao-form";
import { exigirCadastroCompleto } from "@/lib/dados";
import { formatarDataHora } from "@/lib/datas";
import { obterMedicao } from "@/lib/medicoes";

export const metadata: Metadata = { title: "Editar medição · Glicemia" };

// Telas com dados do usuário logado: sempre carregadas na hora do acesso
// (sem pré-carregamento), por isso ficam fora da validação de "navegação instantânea".
export const instant = false;

export default function EditarMedicaoPage({ params }: PageProps<"/medicoes/[id]/editar">) {
  return (
    <>
      <Link
        href="/medicoes"
        className="flex w-fit items-center gap-1 text-base font-medium underline underline-offset-4"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Histórico
      </Link>
      <h1 className="text-2xl font-bold">Editar medição</h1>
      <Suspense fallback={<p className="text-muted-foreground">Carregando…</p>}>
        <Conteudo params={params} />
      </Suspense>
    </>
  );
}

async function Conteudo({ params }: { params: PageProps<"/medicoes/[id]/editar">["params"] }) {
  await exigirCadastroCompleto();
  const { id } = await params;
  const medicao = await obterMedicao(id);
  if (!medicao) notFound();

  return (
    <>
      <MedicaoForm inicial={medicao} />
      <hr />
      <BotaoExcluirMedicao
        id={medicao.id}
        descricao={`${medicao.valor_mg_dl} mg/dL em ${formatarDataHora(medicao.medido_em)}`}
      />
    </>
  );
}
