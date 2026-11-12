import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { sair } from "@/app/actions/auth";
import { exigirCadastroCompleto } from "@/lib/dados";

export default function InicioPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 px-4 py-10 text-center">
      <h1 className="text-3xl font-bold">Glicemia</h1>
      <Suspense fallback={<p className="text-muted-foreground">Carregando…</p>}>
        <Saudacao />
      </Suspense>
      <form action={sair}>
        <Button type="submit" variant="outline" size="lg">
          Sair
        </Button>
      </form>
    </main>
  );
}

async function Saudacao() {
  const { usuario, perfil } = await exigirCadastroCompleto();
  return (
    <p className="text-lg">
      Olá! Acompanhando a glicemia de{" "}
      <strong>{perfil.nome_paciente || usuario.nome}</strong>. Termos aceitos ✅
    </p>
  );
}
