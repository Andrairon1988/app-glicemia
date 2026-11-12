import { Suspense } from "react";
import type { Metadata } from "next";
import { MedicaoForm } from "@/components/medicao-form";
import { exigirCadastroCompleto } from "@/lib/dados";

export const metadata: Metadata = { title: "Nova medição · Glicemia" };

// Telas com dados do usuário logado: sempre carregadas na hora do acesso
// (sem pré-carregamento), por isso ficam fora da validação de "navegação instantânea".
export const instant = false;

export default function NovaMedicaoPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">Nova medição</h1>
      <Suspense fallback={<p className="text-muted-foreground">Carregando…</p>}>
        <Formulario />
      </Suspense>
    </>
  );
}

async function Formulario() {
  await exigirCadastroCompleto();
  return <MedicaoForm />;
}
