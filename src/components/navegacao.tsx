"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, House, Plus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const ITENS = [
  { href: "/", rotulo: "Início", Icone: House },
  { href: "/medicoes/nova", rotulo: "Nova", Icone: Plus },
  { href: "/medicoes", rotulo: "Histórico", Icone: History },
  { href: "/configuracoes", rotulo: "Configurações", rotuloCurto: "Ajustes", Icone: Settings },
] as const;

// O endereço atual só é conhecido na hora do acesso: enquanto isso,
// a navegação aparece sem item destacado (fallback do Suspense).
export function NavegacaoTopo() {
  return (
    <Suspense fallback={<Topo pathname={null} />}>
      <ComEndereco Componente={Topo} />
    </Suspense>
  );
}

export function NavegacaoInferior() {
  return (
    <Suspense fallback={<Inferior pathname={null} />}>
      <ComEndereco Componente={Inferior} />
    </Suspense>
  );
}

function ComEndereco({
  Componente,
}: {
  Componente: (props: { pathname: string | null }) => React.ReactNode;
}) {
  return <Componente pathname={usePathname()} />;
}

/** Desktop: links no topo. */
function Topo({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
      {ITENS.map(({ href, rotulo, Icone }) => {
        const atual = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={atual ? "page" : undefined}
            className={cn(
              "flex h-11 items-center gap-2 rounded-lg px-3 text-base font-medium outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
              atual && "bg-muted",
            )}
          >
            <Icone aria-hidden="true" className="size-5" />
            {rotulo}
          </Link>
        );
      })}
    </nav>
  );
}

/** Celular: barra fixa embaixo, com áreas de toque grandes. */
function Inferior({ pathname }: { pathname: string | null }) {
  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {ITENS.map((item) => {
          const { href, Icone } = item;
          const rotulo = "rotuloCurto" in item ? item.rotuloCurto : item.rotulo;
          const atual = pathname === href;
          const destaque = href === "/medicoes/nova";
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={atual ? "page" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-0.5 text-sm outline-none focus-visible:bg-muted",
                  atual ? "font-semibold text-foreground" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center rounded-full",
                    destaque ? "size-9 bg-primary text-primary-foreground" : "size-7",
                  )}
                >
                  <Icone aria-hidden="true" className="size-5" />
                </span>
                {rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
