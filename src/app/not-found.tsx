import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NaoEncontrada() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-10 text-center">
      <h1 className="text-2xl font-bold">Página não encontrada</h1>
      <p className="text-base text-muted-foreground">
        O endereço pode estar errado, ou a medição foi excluída.
      </p>
      <Link href="/" className={cn(buttonVariants({ size: "lg" }), "h-12 text-base")}>
        Voltar ao início
      </Link>
    </main>
  );
}
