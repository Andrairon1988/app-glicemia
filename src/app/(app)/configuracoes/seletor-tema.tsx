"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const OPCOES = [
  { valor: "system", rotulo: "Automático", Icone: Monitor },
  { valor: "light", rotulo: "Claro", Icone: Sun },
  { valor: "dark", rotulo: "Escuro", Icone: Moon },
] as const;

// true só no navegador: o tema escolhido fica guardado no aparelho.
const useNoNavegador = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

export function SeletorTema() {
  const { theme, setTheme } = useTheme();
  const noNavegador = useNoNavegador();
  const atual = noNavegador ? (theme ?? "system") : null;

  return (
    <fieldset>
      <legend className="sr-only">Tema</legend>
      <div className="grid grid-cols-3 gap-2">
        {OPCOES.map(({ valor, rotulo, Icone }) => (
          <label
            key={valor}
            className={cn(
              "flex h-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border text-base has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
              atual === valor && "border-primary bg-muted font-semibold",
            )}
          >
            <input
              type="radio"
              name="tema"
              value={valor}
              checked={atual === valor}
              onChange={() => setTheme(valor)}
              className="sr-only"
            />
            <Icone aria-hidden="true" className="size-5" />
            {rotulo}
          </label>
        ))}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        &quot;Automático&quot; segue a configuração do seu celular ou computador. A escolha fica
        salva neste aparelho.
      </p>
    </fieldset>
  );
}
