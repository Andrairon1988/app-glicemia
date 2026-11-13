import { Suspense } from "react";
import type { Metadata } from "next";
import { BotaoEntrarGoogle } from "@/components/botao-entrar-google";
import { AVISO_MEDICO } from "@/lib/textos";

export const metadata: Metadata = { title: "Entrar · Glicemia" };

export default function EntrarPage({
  searchParams,
}: PageProps<"/entrar">) {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 px-4 py-10">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Glicemia</h1>
        <p className="text-lg text-muted-foreground">
          Registre e acompanhe suas medições de glicemia.
        </p>
      </div>

      <BotaoEntrarGoogle />
      <Suspense>
        <MensagemErro searchParams={searchParams} />
      </Suspense>

      <p className="text-center text-sm text-muted-foreground">{AVISO_MEDICO}</p>
    </main>
  );
}

async function MensagemErro({
  searchParams,
}: {
  searchParams: PageProps<"/entrar">["searchParams"];
}) {
  const { erro, conta_excluida } = await searchParams;
  if (conta_excluida) {
    return (
      <p role="status" className="rounded-lg border p-3 text-center text-base">
        Sua conta e todos os seus dados foram excluídos.
      </p>
    );
  }
  if (!erro) return null;
  return (
    <p role="alert" className="text-center text-sm font-medium text-destructive">
      Não foi possível concluir o login. Tente novamente.
    </p>
  );
}
