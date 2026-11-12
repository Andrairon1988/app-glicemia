import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-3xl font-bold">Glicemia</h1>
      <p className="text-lg text-muted-foreground">
        Acompanhamento de glicemia. Em construção: Etapa 1 concluída.
      </p>
      <Button size="lg">Botão de teste</Button>
    </main>
  );
}
