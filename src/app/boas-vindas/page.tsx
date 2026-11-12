import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { obterPerfil } from "@/lib/dados";
import { AVISO_MEDICO } from "@/lib/textos";
import { FormularioBoasVindas } from "./formulario";

export const metadata: Metadata = { title: "Boas-vindas · Glicemia" };

// Telas com dados do usuário logado: sempre carregadas na hora do acesso
// (sem pré-carregamento), por isso ficam fora da validação de "navegação instantânea".
export const instant = false;

export default function BoasVindasPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Boas-vindas!</h1>
        <p className="text-lg text-muted-foreground">
          Antes de começar, confirme alguns dados.
        </p>
      </div>

      <div
        role="note"
        className="rounded-lg border border-amber-500/50 bg-amber-50 p-4 text-base text-amber-950 dark:bg-amber-950/40 dark:text-amber-100"
      >
        <strong>Importante:</strong> {AVISO_MEDICO}
      </div>

      <Suspense fallback={<p className="text-muted-foreground">Carregando…</p>}>
        <Conteudo />
      </Suspense>
    </main>
  );
}

async function Conteudo() {
  const { usuario, perfil } = await obterPerfil();
  if (perfil.termos_aceitos_em) {
    redirect("/");
  }
  return <FormularioBoasVindas nomeInicial={perfil.nome_paciente ?? usuario.nome} />;
}
