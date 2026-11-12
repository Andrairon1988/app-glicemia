"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Erro({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main
      role="alert"
      className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-10 text-center"
    >
      <h1 className="text-2xl font-bold">Algo deu errado</h1>
      <p className="text-base text-muted-foreground">
        Não foi possível carregar esta tela. Verifique sua conexão com a internet e tente
        novamente.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" className="h-12 text-base" onClick={() => reset()}>
          Tentar novamente
        </Button>
        <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 text-base")}>
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
