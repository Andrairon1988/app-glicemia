import Link from "next/link";
import { LogOut } from "lucide-react";
import { sair } from "@/app/actions/auth";
import { NavegacaoInferior, NavegacaoTopo } from "@/components/navegacao";
import { Button } from "@/components/ui/button";

/** Moldura das telas logadas: cabeçalho + navegação (embaixo no celular, no topo no computador). */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-background focus:p-3"
      >
        Pular para o conteúdo
      </a>
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between gap-2 px-4">
          <Link href="/" className="text-xl font-bold">
            Glicemia
          </Link>
          <NavegacaoTopo />
          <form action={sair}>
            <Button type="submit" variant="ghost" size="lg" className="h-11 text-base">
              <LogOut aria-hidden="true" className="size-5" />
              Sair
            </Button>
          </form>
        </div>
      </header>

      <main
        id="conteudo"
        className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 pt-6 pb-28 md:pb-10"
      >
        {children}
      </main>

      <NavegacaoInferior />
    </>
  );
}
